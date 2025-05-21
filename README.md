# AnalyzeMyBill

## Setup

### Prerequisites
- Node.js >= 16
- Yarn or npm
- Docker (optional)

### Environment
Copy `.env.example` to `.env.development`, `.env.staging`, and `.env.production` and fill in your credentials.

### Development

#### Server
```bash
cd server
npm install
npm run dev
```

#### Client
```bash
cd analyzemybill
npm install
npm start
```

### Docker
```bash
docker-compose up --build
```

## CI/CD
GitHub Actions workflow is configured in `.github/workflows/ci.yml`.
