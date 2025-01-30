// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvDq4KG-BZlQA3IPEZoZlGBpoombsmgI4",
  authDomain: "pizarra-colaborativa-deka.firebaseapp.com",
  projectId: "pizarra-colaborativa-deka",
  storageBucket: "pizarra-colaborativa-deka.firebasestorage.app",
  messagingSenderId: "529896699468",
  appId: "1:529896699468:web:c8727220d9942242d7e6e9",
  measurementId: "G-N2BBNBKQSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
