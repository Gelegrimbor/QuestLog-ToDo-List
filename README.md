# QuestLog - A Gamified Todo List

This project is a gamified todo list application built with React, TypeScript, and Vite. It transforms ordinary tasks into epic quests to make productivity more engaging and fun.

## Features

- ✅ Task management with a gamified approach
- 🎮 Experience points (XP) system for completing tasks
- 🏆 Achievements and rewards
- 📊 Progress tracking and statistics
- 🌙 Dark/light mode
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS/SCSS modules (or your preferred styling solution)
- **State Management**: React Context API / Redux (choose one)
- **Routing**: React Router
- **Data Persistence**: Local Storage / Firebase (choose one)
- **Testing**: Vitest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Gelegrimbor/QuestLog-ToDo-List.git
   cd QuestLog-ToDo-List
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run test` - Run tests
- `npm run lint` - Lint the codebase
- `npm run format` - Format the codebase

## Project Structure

```
QuestLog-ToDo-List/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable React components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API services and utilities
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # Vite type declarations
├── .eslintrc.js            # ESLint configuration
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # Project documentation
```

## Expanding the ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
// .eslintrc.js
export default {
  extends: [
    // ...
    'eslintrc.configs.recommendedTypeChecked',
    // Or for stricter rules:
    'eslintrc.configs.strictTypeChecked',
    // Optionally, for stylistic rules:
    'eslintrc.configs.stylisticTypeChecked',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
};
```

## Deployment

Build your project for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be located in the `dist/` directory, ready to be deployed to your preferred hosting platform (Netlify, Vercel, GitHub Pages, etc.)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more details, please see our [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contact

- GitHub: [Gelegrimbor](https://github.com/Gelegrimbor)
