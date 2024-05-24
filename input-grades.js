import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth services
const auth = getAuth();

// DB services
const db = getFirestore(app);

// Check user authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayStudentInfo();
    } else {
        window.location.href = "advisory-list.html";
    }
});

async function displayStudentInfo() {
    try {
        const studentInfoRef = collection(db, "students");
        const querySnapshot = await getDocs(studentInfoRef);

        const container = document.getElementById("student-info-table");
        container.innerHTML = ''; // Clear existing content

        querySnapshot.forEach(async (studentDoc) => {
            const data = studentDoc.data();
            console.log(data);

            const degreeProgramID = data.degreeProgramID;
            const degreeProgramRef = doc(db, "degrees", degreeProgramID);

            const degreeProgramSnapshot = await getDoc(degreeProgramRef);
            const degreeProgramData = degreeProgramSnapshot.data();
            console.log(degreeProgramData);

            const studentRow = document.createElement("tr");

            const studentNameCell = document.createElement("td");
            studentNameCell.innerHTML = data.studentName;
            studentRow.appendChild(studentNameCell);

            const studentNumberCell = document.createElement("td");
            studentNumberCell.innerHTML = data.studentNumber;
            studentRow.appendChild(studentNumberCell);

            const studentDegProgCell = document.createElement("td");
            studentDegProgCell.innerHTML = degreeProgramData.degreeName;
            studentRow.appendChild(studentDegProgCell);

            const studentYearCell = document.createElement("td");
            studentYearCell.innerHTML = data.yearLevel;
            studentRow.appendChild(studentYearCell);

            // Append the studentRow to the container
            container.appendChild(studentRow);
        });
    } catch (err) {
        console.error(err);
    }
}
