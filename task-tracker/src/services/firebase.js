// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBJze4Kw0NEcQ_81TuPONPUafDUEScEe5A",
    authDomain: "task-nest-ca9cb.firebaseapp.com",
    projectId: "task-nest-ca9cb",
    storageBucket: "task-nest-ca9cb.firebasestorage.app",
    messagingSenderId: "187424422202",
    appId: "1:187424422202:web:09da9caeb2eb151132b803",
    measurementId: "G-L2Q6C0LLG2"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };
