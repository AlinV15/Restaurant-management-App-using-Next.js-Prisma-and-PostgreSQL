const config = {
  plugins: {
    "@tailwindcss/postcss": {
      config: {
        theme: {
          extend: {
            keyframes: {
              spin: {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
              spinReverse: {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(-360deg)' },
              }
            },
            animation: {
              spin: 'spin 1s linear infinite',
              spinReverse: 'spinReverse 1s linear infinite',
            }
          }
        }
      }
    }
  }
};

export default config;