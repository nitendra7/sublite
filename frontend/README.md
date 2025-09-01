# SubLite Frontend

A modern React application built with Vite for managing subscriptions.

## Migration from Create React App (CRA) to Vite

This project has been successfully migrated from Create React App to Vite for improved development experience and faster build times.

### What Changed

- **Build Tool**: CRA → Vite
- **Entry Point**: `src/index.js` → `src/main.jsx`
- **HTML Template**: `public/index.html` → `index.html` (root)
- **Scripts**: Updated to use Vite commands
- **Dependencies**: Removed CRA-specific packages, added Vite ecosystem

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Development

```bash
npm run dev
```

The development server will start on `http://localhost:3000`

### Building

```bash
npm run build
```

Builds the app for production in the `dist` folder.

### Features

- React 19
- Tailwind CSS
- Radix UI components
- React Router
- JWT authentication
- Razorpay integration

### Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── context/       # React context providers
│   ├── lib/           # Utility libraries
│   ├── utils/         # Helper functions
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Vite entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # Vite HTML template
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js  # PostCSS configuration
```

## Benefits of Vite Migration

1. **Faster Development**: Hot Module Replacement (HMR) is significantly faster
2. **Quick Builds**: Production builds are much faster than CRA
3. **Modern Tooling**: Uses ES modules and modern bundling techniques
4. **Better DX**: Improved error messages and debugging experience
5. **Smaller Bundle**: More efficient bundling and tree-shaking
