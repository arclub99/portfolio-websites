import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyAswtK8m7NwnNL4clpONl51v4CbcnmxSRc",

  authDomain: "porfolio-website-wordpress.firebaseapp.com",

  projectId: "porfolio-website-wordpress",

  storageBucket: "porfolio-website-wordpress.firebasestorage.app",

  messagingSenderId: "350648135827",

  appId: "1:350648135827:web:cba985de5b37e5425b9d66",

  measurementId: "G-L3SVLR9Z53"

}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);