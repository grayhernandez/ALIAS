// Import necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getFirestore, getDocs, getDoc, doc, collection, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { onAuthStateChanged, getAuth } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

// Firebase configuration
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

const auth = getAuth();

// Load and display course grades on auth load
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayCourseGrades(user.uid);
    }
});

// Helper function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const academicYearID = getQueryParam('academicYearID');
const subjectGradeID = getQueryParam('subjectGradeID');
const courseCollection = 'subjectRecords'; // Adjust this based on your Firestore structure

console.log('Academic Year ID:', academicYearID);
console.log('Subject Grade ID:', subjectGradeID);
console.log('subjectRecords:', courseCollection);

// Fetch semestral information in correct order
async function semestralInfo(studentID) {
    const semestralGradesCollectionRef = query(collection(db, `studentGrades/${studentID}/semestralGrades`), orderBy("acadYearName", "asc"));
    const semestralSnapshot = await getDocs(semestralGradesCollectionRef);
    const semestralData = semestralSnapshot.docs.map(doc => doc.data());
    return semestralData;
}

// Fetch prerequisite codes
async function getPrerequisiteCodes(prerequisiteIDs) {
    const prerequisiteCodes = [];
    if (Array.isArray(prerequisiteIDs)) {
        for (const prereqID of prerequisiteIDs) {
            const prereqDoc = await getDoc(doc(db, "subjects", prereqID));
            if (prereqDoc.exists()) {
                const prereqData = prereqDoc.data();
                prerequisiteCodes.push(prereqData.subjectCode);
            }
        }
    }
    return prerequisiteCodes;
}

// Fetch course grades
async function getCourseGrades(studentID) {
    let allGrades = [];

    const semestralGradesCollectionRef = query(collection(db, `studentGrades/${studentID}/semestralGrades`), orderBy("acadYearName", "asc"));
    const semestralSnapshot = await getDocs(semestralGradesCollectionRef);
    const semestralData = semestralSnapshot.docs.map(doc => doc.data());

    for (const semestral of semestralData) {
        const gradesCollectionRef = collection(db, `studentGrades/${studentID}/semestralGrades/${semestral.academicYearID}/${courseCollection}`);
        const gradesSnapshot = await getDocs(gradesCollectionRef);

        for (const docSnap of gradesSnapshot.docs) {
            const gradeData = docSnap.data();
            const subjectDoc = await getDoc(doc(db, "subjects", gradeData.subjectID));
            const subjectData = subjectDoc.data();

            const prerequisiteCodes = await getPrerequisiteCodes(subjectData.prerequisiteIDs);

            allGrades.push({
                semesterID: semestral.academicYearID,
                semesterName: semestral.acadYearName,
                semestralStanding: semestral.classStanding,
                semestralGwa: semestral.gwa,
                semestralUnits: semestral.totalUnits,
                subjectCode: subjectData.subjectCode,
                subjectName: subjectData.subjectName,
                subjectUnit: subjectData.units,
                subjectFinalGrade: gradeData.finalGrade,
                subjectCompletionGrade: gradeData.completionGrade,
                subjectPrereq: prerequisiteCodes.join(', ') // Join multiple prerequisite codes
            });
        }
    }
    return allGrades;
}

// Function to create and display semester data
function createSemesterContainer(index, semesterName) {
    const container = document.createElement('div');
    container.className = 'container-fluid';
    container.style = 'width: 100% auto; font-size: 15px;';

    const row = document.createElement('div');
    row.className = 'row m-0';

    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = 'card h-1000';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.id = `semester-name-${index}`;

    const semesterHeader = document.createElement('h6');
    semesterHeader.id = `semester-${index}`;
    semesterHeader.className = 'd-flex align-items-center mb-3';
    semesterHeader.style = 'font-style: italic;';
    semesterHeader.innerText = semesterName;

    const courseTable = document.createElement('table');
    courseTable.className = 'course-table';
    courseTable.style = 'width: 100% auto; text-align: center;';

    const tableHeaderRow = document.createElement('tr');
    const headers = ['Course Code', 'Course Title', 'Units', 'Final Grade', 'Completion Grade', 'Prerequisites'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.innerText = headerText;
        tableHeaderRow.appendChild(th);
    });
    courseTable.appendChild(tableHeaderRow);

    const tableBody = document.createElement('tbody');
    tableBody.id = `course-table-${index}`;
    tableBody.className = 'p-3 center';
    courseTable.appendChild(tableBody);

    const classStandingTable = document.createElement('table');
    classStandingTable.id = `class-standing-table-${index}`;

    const rows = [
        { label: 'Total Number of Units:', id: `total-units-${index}` },
        { label: 'Class Standing:', id: `class-standing-${index}` },
        { label: 'GWA:', id: `gwa-${index}` }
    ];

    rows.forEach(row => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.innerText = row.label;
        const td = document.createElement('td');
        td.id = row.id;
        tr.appendChild(th);
        tr.appendChild(td);
        classStandingTable.appendChild(tr);
    });

    cardBody.appendChild(semesterHeader);
    cardBody.appendChild(courseTable);
    cardBody.appendChild(classStandingTable);
    card.appendChild(cardBody);
    col.appendChild(card);
    row.appendChild(col);
    container.appendChild(row);
    document.body.appendChild(container);
}

function moveSubjectToNextSemester(grade, semestralData) {
    const currentSemesterID = grade.semesterID;
    const currentSemesterIndex = semestralData.findIndex(semester => semester.academicYearID === currentSemesterID);

    // Find the next semester
    const nextSemesterIndex = currentSemesterIndex + 1;
    if (nextSemesterIndex < semestralData.length) {
        if (!semestralData[nextSemesterIndex].grades) {
            semestralData[nextSemesterIndex].grades = [];
        }
        semestralData[nextSemesterIndex].grades.push(grade);
        grade.movedToNextSemester = true;  // Add a flag to the grade to mark it as moved
    }
}

function displaySemesterData(semesterData, index, semestralData) {
    const totalUnitsCell = document.getElementById(`total-units-${index}`);
    const classStandingCell = document.getElementById(`class-standing-${index}`);
    const gwaCell = document.getElementById(`gwa-${index}`);
    const semesterNameCell = document.getElementById(`semester-${index}`);

    if (semesterData.length > 0) {
        totalUnitsCell.innerHTML = semesterData[0].semestralUnits || 'N/A';
        classStandingCell.innerHTML = semesterData[0].semestralStanding || 'N/A';
        gwaCell.innerHTML = semesterData[0].semestralGwa || 'N/A';
        semesterNameCell.innerHTML = semesterData[0].semesterName || 'N/A';
    }

    const container = document.getElementById(`course-table-${index}`);
    container.innerHTML = ''; // Clear existing content

    semesterData.forEach(grade => {
        if (grade.movedToNextSemester) return;  // Skip grades that were moved to the next semester

        const row = document.createElement('tr');

        const codeCell = document.createElement('td');
        codeCell.innerHTML = grade.subjectCode || '';
        row.appendChild(codeCell);

        const titleCell = document.createElement('td');
        titleCell.innerHTML = grade.subjectName || '';
        row.appendChild(titleCell);

        const unitsCell = document.createElement('td');
        unitsCell.innerHTML = grade.subjectUnit || '';
        row.appendChild(unitsCell);

        const finalGradeCell = document.createElement('td');
        finalGradeCell.innerHTML = grade.subjectFinalGrade || '';
        row.appendChild(finalGradeCell);

        const completionGradeCell = document.createElement('td');
        completionGradeCell.innerHTML = grade.subjectCompletionGrade || '';
        row.appendChild(completionGradeCell);

        const prerequisitesCell = document.createElement('td');
        prerequisitesCell.innerHTML = grade.subjectPrereq || '';
        row.appendChild(prerequisitesCell);

        container.appendChild(row);

        // Check if finalGrade or completionGrade is 5 or 'DRP' and add a note if necessary
        if (grade.subjectFinalGrade == 5 || grade.subjectCompletionGrade == 5 || grade.subjectFinalGrade == 'DRP' || grade.subjectCompletionGrade == 'DRP') {
            const noteRow = document.createElement('tr');
            const noteCell = document.createElement('td');
            noteCell.colSpan = 6; // Span across all table columns
            noteCell.innerHTML = `Note: You need to retake ${grade.subjectCode}.`;
            noteCell.style.color = 'red';
            noteCell.style.fontWeight = 'bold';
            noteRow.appendChild(noteCell);
            container.appendChild(noteRow);

            // Move subject to the next semester
            moveSubjectToNextSemester(grade, semestralData);

        } else if (grade.subjectFinalGrade == 'INC' && grade.subjectCompletionGrade != null) {
            const noteRow = document.createElement('tr');
            const noteCell = document.createElement('td');
            noteCell.colSpan = 6; // Span across all table columns
            noteCell.innerHTML = `Note: You have complied your remaining credits for ${grade.subjectCode}.`;
            noteCell.style.color = 'red';
            noteCell.style.fontWeight = 'bold';
            noteRow.appendChild(noteCell);
            container.appendChild(noteRow);

        } else if (grade.subjectFinalGrade == 'INC') {
            const noteRow = document.createElement('tr');
            const noteCell = document.createElement('td');
            noteCell.colSpan = 6; // Span across all table columns
            noteCell.innerHTML = `Note: You have one year to comply your remaining credits for ${grade.subjectCode}.`;
            noteCell.style.color = 'red';
            noteCell.style.fontWeight = 'bold';
            noteRow.appendChild(noteCell);
            container.appendChild(noteRow);
        }
    });
}

async function displayCourseGrades(studentID) {
    try {
        const semestralData = await semestralInfo(studentID);
        const gradesData = await getCourseGrades(studentID);

        // Group grades by semester
        const groupedData = gradesData.reduce((acc, grade) => {
            if (!acc[grade.semesterID]) {
                acc[grade.semesterID] = [];
            }
            acc[grade.semesterID].push(grade);
            return acc;
        }, {});

        // Display each semester
        let index = 0;
        for (const semesterID in groupedData) {
            const semesterGrades = groupedData[semesterID];
            if (semesterGrades.length > 0) {
                createSemesterContainer(index, semesterGrades[0].semesterName);
                displaySemesterData(semesterGrades, index, semestralData);
                index++;
            }
        }

        // Display the grades moved to the next semesters
        for (let i = 0; i < semestralData.length; i++) {
            if (semestralData[i].grades) {
                createSemesterContainer(index, semestralData[i].acadYearName);
                displaySemesterData(semestralData[i].grades, index, semestralData);
                index++;
            }
        }
    } catch (error) {
        console.error('Error displaying course grades:', error);
    }
}
