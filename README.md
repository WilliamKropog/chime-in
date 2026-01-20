# Chime-in Social App

A full-stack social media web application built with **Angular** (frontend) and **Firebase** (Authentication, Realtime Database, Hosting).

## 🚀 Live Demo

<https://chimein--chime-in-ded1f.us-central1.hosted.app>

## 🔧 Tech Stack

- Angular • TypeScript • HTML • CSS
- Firebase Authentication • Realtime Database • Cloud Functions
- Git & GitHub • Responsive UI

## ✨ Features

- Email/password sign up & login
- Create posts, like, and comment
- Real-time updates via Firebase
- Mobile-friendly, responsive design

## 📸 Screenshots

_(Add 1–2 images: auth screen, feed, post composer)_

## 🛠️ Getting Started

```bash
git clone https://github.com/WilliamKropog/chime-in.git
cd chime-in
npm install
npm start
```

## 🧪 Local development

### Run the Angular app (frontend)

- **Prereqs**: Node **20+** (Angular 20), npm

```bash
cd chime-in
npm install
npm start
```

Then open `http://localhost:4200`.

### (Optional) Run Cloud Functions locally (Firebase emulator)

- **Prereqs**: Node **18** (see `functions/package.json` engines), npm

```bash
cd chime-in/functions
npm install
npx firebase-tools emulators:start --only functions
```

Note: the Angular app is currently configured to call the **deployed** Cloud Functions. If you want the UI to hit the local emulator instead, you’ll need to wire up `connectFunctionsEmulator(...)` in `src/app/app.module.ts` for non-production builds.
