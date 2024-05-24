import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth,  onAuthStateChanged  } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js'

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
const auth = getAuth();

// db services
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      getUserData(uid);
    } else {
      window.location.href = "login.html";
    }
  });


function getUserData(facultyID) {
    const userRef = doc(db, "faculty", facultyID);

    getDoc(userRef).then((result) => {
        if (result.exists()) {
            const data = result.data();
            console.log(data);

            
            document.getElementById("full-name").innerHTML = data.facultyName;
            document.getElementById("employee-num").innerHTML = data.employeeID;
            document.getElementById("faculty-unit").innerHTML = data.facultyUnit;
            document.getElementById("designation").innerHTML = data.departmentName;
            
            // document.getElementById("expected-year").innerHTML = data.expectedYear;
            // document.getElementById("current-standing").innerHTML = data.currentStanding;
          } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
          }
    }).catch((err) => console.error(err));
}

