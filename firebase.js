import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDR4XRHZRS7Fgz40Ycma85XnFsGCDc7WrE",
  authDomain: "linkvault-75187.firebaseapp.com",
  projectId: "linkvault-75187",
  storageBucket: "linkvault-75187.firebasestorage.app",
  messagingSenderId: "276493728498",
  appId: "1:276493728498:web:78f79598e56409c4312e6b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };