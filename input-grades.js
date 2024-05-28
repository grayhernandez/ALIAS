// student-details.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore, getDocs, getDoc, doc, collection } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

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

const db = getFirestore(app);

// Your path segments
const studentGradesCollection = 'studentGrades';
const studentId = window.location.search;
console.log(studentId);
const urlParams = new URLSearchParams(studentId);
const studentID = urlParams.get('studentID');
 // Replace with actual student ID
const semestralGradesCollection = 'semestralGrades';
const semesterId = 'tPdlLwW47Dk6VlCQO6Ax'; // Replace with actual semester ID
const courseCollection = 'firstSem'; // Adjust this based on your Firestore structure

// Create references

const semestralGradesCollectionRef = collection(db, studentGradesCollection, studentID, semestralGradesCollection);

console.log(await semestralInfo());
async function semestralInfo(){
  try{
      const semestralSnapshot = await getDocs(semestralGradesCollectionRef);
      let semestral = []
      for (const snap of semestralSnapshot.docs) {
        
        const docData = snap.data();
        console.log(docData);
        const semestralDoc = await doc(db, "studentGrades", studentID, semestralGradesCollection, docData.academicYearID);
        const semester = (await getDoc(semestralDoc)).data();

        const semestralData = {
          semesterID: semester.academicYearID,
          semesterName: semester.acadYearName,
          semestralStanding: semester.classStanding,
          semestralGwa: semester.gwa,
          semestralUnits: semester.totalUnits
      };
      semestral.push(semestralData);
    };
    
    return semestral;
    
  } catch (error) {
    console.error('Error getting semestral grades: ', error);
  }
}

async function getCourseGrades() {
  try {
    let semestralGrade = []
    const semesterCollection = await semestralInfo();

    for (const semester of semesterCollection) {
      const gradesCollectionRef = collection(db, studentGradesCollection, studentID, semestralGradesCollection, semester.semesterID, courseCollection);

      const gradesSnapshot = await getDocs(gradesCollectionRef);
      let grades = []
      for (const snap of gradesSnapshot.docs) {
        
        const docData = snap.data();
        const subjectDoc = await doc(db, "subjects", docData.subjectID);
        const subject = (await getDoc(subjectDoc)).data();
        const subjectGradeData = {
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          subjectUnit: subject.units,
          subjectFinalGrade: docData.finalGrade,
          subjectCompletionGrade: docData.completionGrade,
          subjectPrereq: subject.prerequisites
        };
        grades.push(subjectGradeData);
      };
      const semesterData = {
        semesterID: semester.semesterID,
        semesterName: semester.semesterName,
        semestralStanding: semester.semestralStanding,
        semestralGwa: semester.semestralGwa,
        semestralUnits: semester.semestralUnits,
        grades: grades
      };

      semestralGrade.push(semesterData);
      // semester, add grades
    }
    return semestralGrade;
  } catch (error) {
    console.error('Error getting course grades: ', error);
  }
}

// await getCourseGrades().then(grades => {
//   console.log('Course Grades:', grades);
await getCourseGrades().then(semester => displayCourseGrades(semester));
// });



// Function to display course grades in the table
function displayCourseGrades(semesters) {
  console.log({semesters})
  const container = document.getElementById('semester-name');
  container.innerHTML = ''; // Clear existing content

  semesters.forEach( semester =>{
    const semesterCell = document.createElement('h6');
    semesterCell.innerHTML = semester.semesterName || '';

    const container = document.getElementById('course-table');
    // container.innerHTML = ''; // Clear existing content
    semester.grades.forEach(grade => {
      const row = document.createElement('tr');
  
      const courseCodeCell = document.createElement('td');
      courseCodeCell.innerHTML = grade.subjectCode || '';
      row.appendChild(courseCodeCell);
  
      const courseTitleCell = document.createElement('td');
      courseTitleCell.innerHTML = grade.subjectName || '';
      row.appendChild(courseTitleCell);
  
      const unitsCell = document.createElement('td');
      unitsCell.innerHTML = grade.subjectUnit || '';
      row.appendChild(unitsCell);
  
      const finalGradeCell = document.createElement('td');
      finalGradeCell.innerHTML = grade.subjectFinalGrade || '';
      row.appendChild(finalGradeCell);
  
      const completionGradeCell = document.createElement('td');
      completionGradeCell.innerHTML = grade.subjectCompletionGradeompletionGrade || ''; 
      row.appendChild(completionGradeCell);
  
      const prerequisitesCell = document.createElement('td');
      prerequisitesCell.innerHTML = grade.prerequisites || '';
      row.appendChild(prerequisitesCell);
  
      container.appendChild(row);
    });
  });
}
  
  