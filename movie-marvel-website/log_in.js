import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
        
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCKAGAZLcFNTsfZ23yUIGKv7T1y6jaMWKA",
    authDomain: "moviewebsite-2ce81.firebaseapp.com",
    projectId: "moviewebsite-2ce81",
    storageBucket: "moviewebsite-2ce81.firebasestorage.app",
    messagingSenderId: "978355164474",
    appId: "1:978355164474:web:a038a7444020746ba76c03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

document.getElementById("loginBtn").addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        alert("Login successful!");
        window.location.href = "dashboard.html";
    })
    .catch((error) => {
        alert("Login error" + error.message);
    });
});