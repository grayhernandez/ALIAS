// Import necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getFirestore, getDocs, getDoc, doc, collection, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

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

// Helper function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Retrieve dynamic IDs from URL
const studentID = getQueryParam('studentID');
const academicYearID = getQueryParam('academicYearID');
const subjectGradeID = getQueryParam('subjectGradeID');
const courseCollection = 'subjectRecords'; // Adjust this based on your Firestore structure

console.log('Student ID:', studentID);
console.log('Academic Year ID:', academicYearID);
console.log('Subject Grade ID:', subjectGradeID);
console.log('subjectRecords:', courseCollection);

// Fetch semestral information
async function semestralInfo() {
    const semestralGradesCollectionRef = collection(db, `studentGrades/${studentID}/semestralGrades`);
    const semestralSnapshot = await getDocs(semestralGradesCollectionRef);
    const semestralData = semestralSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
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

// Fetch next semester ID
async function getNextSemesterID(prevSemID) {
    try {
        let nextSemester;
        const semesterRef = query(collection(db, `semesters`), orderBy("sequenceNum", "asc"));
        const semesterSnapshot = await getDocs(semesterRef);
        const semesterData = semesterSnapshot.docs.map(doc => doc.data());

        let currentYear = 0;
        let currentSemNum = 0;

        for (let semester of semesterData) {
            if (semester.academicYearID == prevSemID) {
                currentYear = semester.yearLevel + 1;
                currentSemNum = semester.semNumber;

                for (let semester2 of semesterData) {
                    if (semester2.yearLevel == currentYear && semester2.semNumber == currentSemNum) {
                        nextSemester = semester2;
                        return nextSemester;
                    }
                }
            }
        }
        return nextSemester;

    } catch (error) {
        console.log("Error: ", error);
    }
};

async function getSemester(semesterID) {
    try {
        const semesterRef = query(collection(db, `semesters`), orderBy("sequenceNum", "asc"));
        const semesterSnapshot = await getDocs(semesterRef);
        const semesterData = semesterSnapshot.docs.map(doc => doc.data());

        for (let semester of semesterData) {
            if (semester.academicYearID == semesterID) {
                return semester;
            }
        }

        return null;

    } catch (error) {
        console.log("Error: ", error);
    }
};

// Fetch course grades
async function getCourseGrades(semestralData) {
    let allGrades = [];

    for (const semestral of semestralData) {
        const gradesCollectionRef = collection(db, `studentGrades/${studentID}/semestralGrades/${semestral.id}/${courseCollection}`);
        const gradesSnapshot = await getDocs(gradesCollectionRef);

        for (const docSnap of gradesSnapshot.docs) {
            const gradeData = docSnap.data();
            const subjectDoc = await getDoc(doc(db, "subjects", gradeData.subjectID));
            const subjectData = subjectDoc.data();

            const prerequisiteCodes = await getPrerequisiteCodes(subjectData.prerequisiteIDs);

            allGrades.push({
                semesterID: semestral.id,
                semesterSequence: semestral.sequenceNum,
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
    container.className = 'container-fluid semester-container';
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

// Function to display course grades for a specific semester
function displaySemesterData(semesterData, index) {
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
        if (grade.subjectFinalGrade == 5 || grade.subjectCompletionGrade == 5 || grade.subjectFinalGrade == 'DRP' || grade.subjectCompletionGrade == 'DRP') {
            if (!grade.toRetake) {
                const noteRow = document.createElement('tr');
                const noteCell = document.createElement('td');
                noteCell.colSpan = 6; // Span across all table columns
                noteCell.innerHTML = `Note: You need to retake ${grade.subjectCode}.`;
                noteCell.style.color = 'red';
                noteCell.style.fontWeight = 'bold';
                noteRow.appendChild(noteCell);
                container.appendChild(noteRow);
            }
        } else if (grade.subjectFinalGrade == 'INC' && grade.subjectCompletionGrade != null) {
            const noteRow = document.createElement('tr');
            const noteCell = document.createElement('td');
            noteCell.colSpan = 6; // Span across all table columns
            noteCell.innerHTML = `Note: You have complied your remaining credits for ${grade.subjectCode}.`;
            noteCell.style.color = 'green';
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
        completionGradeCell.innerHTML = grade.subjectCompletionGrade || '';
        row.appendChild(completionGradeCell);

        const prerequisitesCell = document.createElement('td');
        prerequisitesCell.innerHTML = grade.subjectPrereq || '';
        row.appendChild(prerequisitesCell);

        container.appendChild(row);
    });
}

// Combine both functions and display data for multiple semesters
async function displayCourseGrades() {
    try {
        const semestralData = await semestralInfo();
        const gradesData = await getCourseGrades(semestralData);

        let groupedData = {};
        const subsToRetake = [];

        for (const grade of gradesData) {
            if (!groupedData[grade.semesterID]) {
                groupedData[grade.semesterID] = [];
            }

            groupedData[grade.semesterID].push(grade);

            if (grade.subjectFinalGrade == 5 || 
                grade.subjectCompletionGrade == 5 || 
                grade.subjectFinalGrade == 'DRP' || 
                grade.subjectCompletionGrade == 'DRP') {
                let newGrade = grade;
                const nextSem = await (getNextSemesterID(newGrade.semesterID));
                subsToRetake.push({...newGrade, semesterID: nextSem.academicYearID, semesterName: nextSem.academicYearName, toRetake: false, subjectFinalGrade: null, subjectCompletionGrade: null});
            }
        }
        for (const sub of subsToRetake) {
            if (!groupedData[sub.semesterID]) {
                groupedData[sub.semesterID] = [];
            }

            groupedData[sub.semesterID].push(sub);
        }

        // Display each semester using Object.entries to iterate over groupedData
        let index = 0;
        for (const semesterID in groupedData) {
            const semesterGrades = groupedData[semesterID];
            semesterGrades.sort((prev, curr) => {
                return prev.toRetake ? -1 : curr.toRetake ? 1 : 0;
            });
            if (semesterGrades.length > 0) {
                createSemesterContainer(index, semesterGrades[0].semesterName);
                displaySemesterData(semesterGrades, index,semestralData);
                index++;
            }
        }
    } catch (error) {
        console.error('Error displaying course grades:', error);
    }
}

// Load and display course grades on page load
document.addEventListener('DOMContentLoaded', displayCourseGrades);
