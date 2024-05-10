import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth,  GoogleAuthProvider,signInWithPopup, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyBsU_QwNM86gVXWmcdURPCIcCL2lpYWyYA",
    authDomain: "alias-c48c4.firebaseapp.com",
    databaseURL: "https://alias-c48c4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "alias-c48c4",
    storageBucket: "alias-c48c4.appspot.com",
    messagingSenderId: "843707374814",
    appId: "1:843707374814:web:8b005fde97e9eca6b7764f",
    measurementId: "G-QCTP5MH8K9"
  };


// initialize firebase
const app = initializeApp(firebaseConfig);

// auth services
const provider = new GoogleAuthProvider();
const auth = getAuth();

// db services
const db = getFirestore(app);

async function signIn() {
  signInWithPopup(auth, provider)
    .then((result) => {
      // The signed-in user info.
      const user = result.user;
      console.log(user);

      // Add user to the database
      const documentRef = doc(db, "users", user.uid);
      getDoc(documentRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.type === "faculty" || userData.type === "admin") {
            // Adviser, faculty, or admin is logged in, prevent student login
            alert("You are not allowed to login as a student.");
            return;
          } else {
            alert("successfully logged in");
            setDoc(documentRef, {
              id: user.uid,
              name: user.displayName,
              email: user.email,
              image: user.photoURL
            }, {merge: true}).then(() => window.location.href = "student-dashboard.html");
          }
        } else {
          alert("user not found");
        }
      }).catch((error) => {
        console.error("Error checking user role:", error);
        alert("An error occurred. Please try again later.");
      });
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email; // Accessing 'email' directly
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
}

document.getElementById("student-login").addEventListener("click", signIn);