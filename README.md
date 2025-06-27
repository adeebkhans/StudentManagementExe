# MERN to Electron Desktop App

This project demonstrates how to package a standard MERN (MongoDB, Express, React, Node.js) stack application into a cross-platform desktop application using Electron.

## Project Structure

The project is organized into three main parts: the Electron wrapper, the Express backend, and the React frontend.

```
student-enroll-app/
├── backend/         # Express.js backend server
├── frontend/        # React.js frontend (created with Vite)
├── main.js          # Electron main process entry point
├── package.json     # Root dependencies and build scripts
└── .gitignore       # Git ignore file
```

## Setup and Installation

Follow these steps to get the project running on your local machine.

**Prerequisites:**
*   Node.js and npm
*   MongoDB (local or a cloud instance like MongoDB Atlas)

**1. Clone the Repository**
```bash
git clone https://github.com/adeebkhans/StudentManagementExe
cd student-enroll-app
```

**2. Install Dependencies**
Install the necessary dependencies for the root, frontend, and backend.
```bash
# Install root dependencies (Electron, etc.)
npm install --save-dev electron electron-builder concurrently wait-on

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

**3. Configure Environment Variables**
Create a `.env` file inside the `backend` directory. This file is required to connect to your MongoDB database.
```
# e:\Open Source Projects\SSIP (exe)\backend\.env

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3009
```

## Available Scripts

### Development
To run the application in development mode with hot-reloading for both the frontend and backend:
```bash
npm run dev
```
This command concurrently starts the React frontend, the Express backend, and the Electron application.

### Production Build
To build the React app and package it into a distributable desktop application:
```bash
npm run build
```
This will first build the static frontend assets into `frontend/dist` and then use `electron-builder` to create an installer in the root `dist` folder.

## Key Concepts & Troubleshooting

Converting a web app to an Electron app involves a few critical configuration changes:

*   **Vite Base Path:** For Electron to correctly load your React app's files, the `base` property in `frontend/vite.config.js` must be set to `'./'`.
    ```javascript
    // vite.config.js
    export default defineConfig({
      base: './', // ✅ IMPORTANT for Electron to load local files
      // ...
    });
    ```

*   **React Router:** Use `HashRouter` instead of `BrowserRouter` in your React application. `BrowserRouter` relies on server-side routing capabilities that are not present in a `file://` based Electron environment.
    ```jsx
    import { HashRouter as Router, Routes, Route } from 'react-router-dom';
    ```

*   **Asset Paths:** When referencing images or other assets in your React components, use relative paths (e.g., `./logo.png`) instead of absolute paths (e.g., `/logo.png`). This ensures they are found correctly within the packaged Electron app.

*   **Debugging:** If you encounter issues, check the console output of the Electron app for error messages. Common problems include incorrect file paths, missing environment variables, or issues with native Node.js modules.
*   
*   **Run in Terminal:** If you encounter issues, try running app through the terminal. In dist\win-unpacked run ./myapp.exe then it will show logs of running the app
