// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4A90E2',   // Soft Blue (brand.light)
          DEFAULT: '#357ABD', // Primary (brand.DEFAULT)
          dark: '#2A5CA0',    // Primary dark (brand.dark)
        },
        secondary: {
          DEFAULT: '#016e55', // Teal Green
          dark: '#3AB89F',    // Slightly darker variant
        },
        accent: {
          DEFAULT: '#F5A623', // Golden Yellow
          dark: '#D4A21A',    // Darker shade
        },
        offwhite: '#FAFAFA',   // Neutral background
        text: '#333333',       // Charcoal Gray for body text
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      boxShadow: {
        'lg-soft': '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      }
    }
  },
  plugins: [],
}
