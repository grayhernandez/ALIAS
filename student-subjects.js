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
        displayCourseDetails(user.uid);
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
// async function semestralInfo(studentID) {
//     const semestralGradesCollectionRef = query(collection(db, `studentGrades/${studentID}/semestralGrades`), orderBy("acadYearName", "asc"));
//     const semestralSnapshot = await getDocs(semestralGradesCollectionRef);
//     const semestralData = semestralSnapshot.docs.map(doc => doc.data());
//     return semestralData;
// }

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
                subjectName: subjectData.subjectName,
                semestralUnits: semestral.totalUnits,
                subjectCode: subjectData.subjectCode,
                subjectUnit: subjectData.units,
                subjectGrade: gradeData.completionGrade || gradeData.finalGrade,        
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
    const headers = ['Course Code',  'Units', 'Prerequisites'];
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


function displaySemesterData(semesterData, index) {
    const totalUnitsCell = document.getElementById(`total-units-${index}`);
    const semesterNameCell = document.getElementById(`semester-${index}`);

    if (semesterData.length > 0) {
        totalUnitsCell.innerHTML = parseInt(semesterData[0].semestralUnits) || 'N/A';
        semesterNameCell.innerHTML = semesterData[0].semesterName || 'N/A';
    }

    const container = document.getElementById(`course-table-${index}`);
    container.innerHTML = ''; // Clear existing content

    semesterData.forEach(grade => {
        // if (grade.movedToNextSemester) return;  // Skip grades that were moved to the next semester

        const row = document.createElement('tr');

        const codeCell = document.createElement('td');
        codeCell.innerHTML = grade.subjectCode || '';
        if (grade.isRetake){
            codeCell.style.color = 'red';
            codeCell.style.fontWeight = 'bold';
        }
        row.appendChild(codeCell);

        const unitsCell = document.createElement('td');
        unitsCell.innerHTML = grade.subjectUnit || '';
        if (grade.isRetake){
            unitsCell.style.color = 'red';
            unitsCell.style.fontWeight = 'bold';
        }
        row.appendChild(unitsCell);
        
        const prerequisitesCell = document.createElement('td');
        prerequisitesCell.innerHTML = grade.subjectPrereq || '';
        if (grade.isRetake){
            prerequisitesCell.style.color = 'red';
            prerequisitesCell.style.fontWeight = 'bold';
        }
        row.appendChild(prerequisitesCell);

        container.appendChild(row);

    
    });
}

async function getNextSemesterID(prevSemID) {
    try {
        let nextSemester;
        const semesterRef = query(collection(db, `semesters`), orderBy("academicYearID", "asc"));
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
                        nextSemester = semester2
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

async function displayCourseDetails(studentID) {
    try {
        const gradesData = await getCourseGrades(studentID);

        let groupedData = {};
        let subsToRetake = [];

        for (const grade of gradesData) {
            if (!groupedData[grade.semesterID]) {
                groupedData[grade.semesterID] = [];
            }

            if ((grade.subjectGrade == 5) || (grade.subjectGrade == "DRP")) {
                const nextSem = await (getNextSemesterID(grade.semesterID));
                grade.isRetake = true;
                grade.semesterID = nextSem.academicYearID;
                grade.semesterName = nextSem.academicYearName;
                // Assume grade.semestralUnits should be updated accordingly
                grade.subjectGrade = 0;

                subsToRetake.push(grade);

        
            } else {
                groupedData[grade.semesterID].push(grade);
            }
        }

        for (const sub of subsToRetake) {
            if (!groupedData[sub.semesterID]) {
                groupedData[sub.semesterID] = [];
            }

            groupedData[sub.semesterID].push(sub);
        }


        renderGroupedData(groupedData);
    } catch (error) {
        console.error('Error displaying course grades:', error);
    }
}

// Function to render groupedData
function renderGroupedData(groupedData) {
    let index = 0;
    for (const semesterID in groupedData) {
        const semesterGrades = groupedData[semesterID];
        semesterGrades.sort((prev, curr) => {
            return prev.isRetake ? -1 : curr.isRetake ? 1 : 0;
        })
        if (semesterGrades.length > 0) {
            createSemesterContainer(index, semesterGrades[0].semesterName);
            displaySemesterData(semesterGrades, index);
            index++;
            
        }
    }
}
