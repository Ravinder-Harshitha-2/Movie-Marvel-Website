import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Sign up function
document.getElementById("signupBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), { email: user.email });

        alert("Sign up successful!");
        window.location.href = "dashboard.html";
      } catch (error) {
        alert("Signup Error: " + error.message);
      }
    });
    
    // createUserWithEmailAndPassword(auth, email, password)
    // .then((userCredential) => {
    //     alert("Signup successful!");
    //     window.location.href = "dashboard.html"; // Redirect after signup
    //     })
    //     .catch((error) => {
    //         alert("Signup error: " + error.message);
    //         console.error(error);
    //     });
    // });