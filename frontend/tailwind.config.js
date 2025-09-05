module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.25s ease-in-out',
        fadeOut: 'fadeOut 0.25s ease-in-out',
        slideInFromTop: 'slideInFromTop 0.25s ease-out',
        slideOutToTop: 'slideOutToTop 0.25s ease-in',
        slideInFromBottom: 'slideInFromBottom 0.25s ease-out',
        slideOutToBottom: 'slideOutToBottom 0.25s ease-in',
        zoomIn: 'zoomIn 0.25s ease-out',
        zoomOut: 'zoomOut 0.25s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-10%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideOutToTop: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-10%)' },
        },
        slideInFromBottom: {
          '0%': { transform: 'translateY(10%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideOutToBottom: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(10%)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
      },
    },
  },
  plugins: [],
}