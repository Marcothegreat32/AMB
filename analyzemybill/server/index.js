// server/index.js

// 0. Core imports & env setup
const path = require('path');
const env = process.env.NODE_ENV || 'development';

// 1. Load & validate environment variables
require('dotenv').config({
  path: path.resolve(__dirname, `.env.${env}`)
});
require('dotenv-safe').config({
  example: path.resolve(__dirname, '.env.example'),
  path: path.resolve(__dirname, `.env.${env}`),
  allowEmptyValues: false
});

// 2. Validate absolutely required env vars
[
  'OPENAI_API_KEY',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RECAPTCHA_SECRET_KEY',
  'SENDGRID_API_KEY',
  'SUPPORT_EMAIL',
  'FRONTEND_URL'
].forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
});

// 3. Other imports
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const { promises: fsPromises } = fs;
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, Subscription } = require('./db');
const { celebrate, Joi, Segments, errors } = require('celebrate');
const xss = require('xss');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fetch = require('node-fetch');

// 4. Initialize Express
const app = express();

// 5. Security: disable powered-by, trust proxy, enforce HTTPS
app.disable('x-powered-by');

// Only trust-forwarded-proto & enforce HTTPS in production
if (env === 'production') {
  app.enable('trust proxy');

  // Redirect any HTTP → HTTPS
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    }
    // preserve path & query
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  });
}

// 6. Secure headers via Helmet
app.use(helmet());
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      connectSrc: ["'self'", 'api.openai.com', 'checkout.stripe.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  })
);

// 7. CORS
app.use(cors());

// 8. Webhook endpoints need raw body
app.post(
  '/api/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Stripe subscription events...
    if (event.type === 'checkout.session.completed') {
      const sess = event.data.object;
      const sub = await stripe.subscriptions.retrieve(sess.subscription);
      await Subscription.upsert({
        userId: sess.metadata.userId,
        stripeCustomerId: sess.customer,
        stripeSubscriptionId: sess.subscription,
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000)
      });
    }
    if (['invoice.payment_failed', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
      const subObj = event.data.object;
      const record = await Subscription.findOne({ where: { stripeSubscriptionId: subObj.id } });
      if (record) {
        await record.update({
          status: subObj.status,
          currentPeriodStart: new Date(subObj.current_period_start * 1000),
          currentPeriodEnd: new Date(subObj.current_period_end * 1000)
        });
      }
    }

    res.json({ received: true });
  }
);

app.post(
  '/api/sendgrid-events',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    let events;
    try {
      events = JSON.parse(req.body.toString('utf8'));
    } catch (e) {
      console.error('Invalid SendGrid payload', e);
      return res.status(400).end();
    }

    for (const ev of events) {
      if (['bounce', 'dropped', 'spamreport'].includes(ev.event)) {
        console.log(`Handling bounce/spam for ${ev.email}`);
        await User.update({ emailBounced: true }, { where: { email: ev.email } });
      }
    }

    res.json({ received: true });
  }
);

// 9. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 10. Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many attempts, try again later.'
});
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests, please try again later.',
  skip: req => ['/api/login', '/api/register'].includes(req.path)
});
app.use(globalLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// 11. Prepare directories for vault & uploads
const vaultDir = path.join(__dirname, 'vault');
const vaultIndex = path.join(vaultDir, 'index.json');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(vaultIndex)) fs.writeFileSync(vaultIndex, JSON.stringify([], null, 2));

// 12. Vault lock helper
let vaultLock = false;
async function withVaultLock(fn) {
  while (vaultLock) await new Promise(r => setTimeout(r, 10));
  vaultLock = true;
  try {
    return await fn();
  } finally {
    vaultLock = false;
  }
}

// 13. JWT helper
function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// 14. Multer setup (PDF/images ≤10MB)
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// 15. OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 16. Auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  try {
    req.user = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(401);
  }
}

// 17. Healthcheck
app.get('/health', (_req, res) => res.sendStatus(200));

// 18. AUTH ROUTES

// 18.a Register
app.post(
  '/api/register',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      name: Joi.string().max(100).allow('').required()
    })
  }),
  async (req, res, next) => {
    try {
      const email = xss(req.body.email);
      const pw = xss(req.body.password);
      const name = xss(req.body.name);

      const hash = await bcrypt.hash(pw, 10);
      const user = await User.create({ email, passwordHash: hash, name });
      const token = createToken(user);
      res.json({ token, user: { id: user.id, email, name } });
    } catch (err) {
      next(err);
    }
  }
);

// 18.b Login
app.post(
  '/api/login',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),
  async (req, res, next) => {
    try {
      const email = xss(req.body.email);
      const pw = xss(req.body.password);

      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(pw, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = createToken(user);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      next(err);
    }
  }
);

// 19. PROFILE ROUTES
app.get('/api/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'email', 'name', 'createdAt'] });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});
app.put(
  '/api/profile',
  authenticate,
  celebrate({ [Segments.BODY]: Joi.object({ name: Joi.string().max(100).allow('').required() }) }),
  async (req, res, next) => {
    try {
      const name = xss(req.body.name);
      await User.update({ name }, { where: { id: req.user.id } });
      const updated = await User.findByPk(req.user.id, { attributes: ['id', 'email', 'name', 'createdAt'] });
      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  }
);

// 20. SUBSCRIPTION & STRIPE ROUTES
// ... your existing /api/create-checkout-session, /api/subscription, /api/create-portal-session ...

// 21. AI Chat, Vault, Letter, and other routes
// ... your existing /api/chat, /api/vault, /api/vault-policy, etc. ...

// 22. Contact Us
app.post(
  '/api/contact',
  celebrate({
    [Segments.BODY]: Joi.object({
      name: Joi.string().max(100).required(),
      email: Joi.string().email().required(),
      subject: Joi.string().max(150).required(),
      message: Joi.string().max(2000).required(),
      recaptchaToken: Joi.string().required(),
      company: Joi.string().allow('').max(100)
    })
  }),
  async (req, res, next) => {
    if (req.body.company) {
      return res.status(400).json({ error: 'Spam detected' });
    }
    try {
      const verification = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.recaptchaToken}`
        }
      ).then(r => r.json());

      if (!verification.success || verification.score < 0.5) {
        return res.status(400).json({ error: 'reCAPTCHA validation failed' });
      }

      const name = xss(req.body.name);
      const email = xss(req.body.email);
      const subject = xss(req.body.subject);
      const message = xss(req.body.message);

      await sgMail.send({
        to: process.env.SUPPORT_EMAIL,
        from: process.env.SUPPORT_EMAIL,
        replyTo: email,
        subject: `[Contact Us] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>Name</strong>: ${name}</p><p><strong>Email</strong>: ${email}</p><p>${message.replace(/\n/g, '<br/>')}</p>`
      });

      res.json({ success: true, message: 'Your message has been sent.' });
    } catch (err) {
      console.error('Contact error:', err);
      next(err);
    }
  }
);

// 23. Error handling
app.use(errors());
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// 24. Start server
const PORT = process.env.PORT || 3001;
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB sync failed:', err);
    process.exit(1);
  });
