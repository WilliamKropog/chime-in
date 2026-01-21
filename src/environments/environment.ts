export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDQwoSx3sAI1QyzdVUhE_y-MdVJYkj2SZs",
    authDomain: "chime-in-ded1f.firebaseapp.com",
    projectId: "chime-in-ded1f",
    storageBucket: "chime-in-ded1f.appspot.com",
    messagingSenderId: "756259458639",
    appId: "1:756259458639:web:965d981d2acb017bece43a",
    measurementId: "G-3JWKCDRMFD",
  },
  emulators: {
    auth: { host: "localhost", port: 9099 },
    firestore: { host: "localhost", port: 8080 },
    functions: { host: "localhost", port: 5001 },
    storage: { host: "localhost", port: 9199 },
  },
};