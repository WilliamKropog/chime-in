# Chime-in Social App

A full-stack social media web application built with **Angular** (frontend) and **Firebase** (Authentication, Realtime Database, Hosting).

## 🚀 Live Demo

<https://chime-in-ded1f.web.app>

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

- **Prereqs**: Node **20** (see `functions/package.json` engines), npm

```bash
cd chime-in
npm run emulators
```

Then run the Angular app in another terminal:

```bash
cd chime-in
npm start
```

The app will automatically connect to local Firebase emulators (Auth/Firestore/Functions) when running on `localhost`.

To confirm registration is going to the emulator (not production), open the Emulator UI (`http://localhost:4000`) and check the **Authentication** tab—new users created in the app will appear there.
