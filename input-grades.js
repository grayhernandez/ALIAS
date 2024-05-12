const dropdown = document.querySelector('.dropdown');
const dropdownButton = dropdown.querySelector('.dropdown-toggle');
const dropdownMenu = dropdown.querySelector('.dropdown-menu');
// Select all dropdowns with the class 'dropdown'
const dropdowns = document.querySelectorAll('.dropdown');

// Iterate over each dropdown
dropdowns.forEach(dropdown => {
    // Select the button and menu for the current dropdown
    const dropdownButton = dropdown.querySelector('.dropdown-toggle');
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');

    // Add event listener to the dropdown menu
    dropdownMenu.addEventListener('click', (event) => {
        const selectedItem = event.target.closest('.dropdown-item'); // Get the clicked dropdown item
        if (selectedItem) { // Check if a valid item is clicked
            dropdownButton.textContent = selectedItem.textContent; // Update button text with selected item content
        }
    });
});


// Set the default option as the initial text of the dropdown button

const addRowButtons = document.querySelectorAll('.add-row');
const courseTableBodies = document.querySelectorAll('.courseTableBody');

addRowButtons.forEach((addRowButton, index) => {
    addRowButton.addEventListener('click', () => {
        const courseTableBody = courseTableBodies[index];
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
        <td>
        <input type="text" class="form-control" name="courseCode">
    </td>
    <td>
        <input type="text" class="form-control" name="courseTitle">
    </td>
    <td>
        <input type="number" step="0.5" class="form-control"
            style="width: 75px; align-content: center;" min="0" name="units">
    </td>
    <td>
        <div class="dropdown">
            <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown">
                NO GRADE
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item">NO GRADE</a></li>
                <li><a class="dropdown-item">1.0</a></li>
                <li><a class="dropdown-item">1.25</a></li>
                <li><a class="dropdown-item">1.50</a></li>
                <li><a class="dropdown-item">1.75</a></li>
                <li><a class="dropdown-item">2.0</a></li>
                <li><a class="dropdown-item">2.25</a></li>
                <li><a class="dropdown-item">2.50</a></li>
                <li><a class="dropdown-item">2.75</a></li>
                <li><a class="dropdown-item">3.0</a></li>
                <li><a class="dropdown-item">4.0</a></li>
                <li><a class="dropdown-item">5.0</a></li>
                <li><a class="dropdown-item">INC</a></li>
                <li><a class="dropdown-item">DRP</a></li>
            </ul>
        </div>
    </td>
    <td>
        <div class="dropdown">
            <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown">
                NO GRADE
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item">NO GRADE</a></li>
                <li><a class="dropdown-item">1.0</a></li>
                <li><a class="dropdown-item">1.25</a></li>
                <li><a class="dropdown-item">1.50</a></li>
                <li><a class="dropdown-item">1.75</a></li>
                <li><a class="dropdown-item">2.0</a></li>
                <li><a class="dropdown-item">2.25</a></li>
                <li><a class="dropdown-item">2.50</a></li>
                <li><a class="dropdown-item">2.75</a></li>
                <li><a class="dropdown-item">3.0</a></li>
                <li><a class="dropdown-item">4.0</a></li>
                <li><a class="dropdown-item">5.0</a></li>
                <li><a class="dropdown-item">INC</a></li>
                <li><a class="dropdown-item">DRP</a></li>
            </ul>
        </div>
    </td>
    <td>
        <input type="text" class="form-control" name="prerequisites">
    </td>
            <td>
                <button class="btn btn-sm btn-danger remove-row">&times;</button>
            </td>
            
        `;
        courseTableBody.appendChild(newRow);
    });
});

// Add functionality to remove rows (optional)
courseTableBodies.forEach(courseTableBody => {
    courseTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-row')) {
            const rowToRemove = event.target.parentElement.parentElement;
            if (courseTableBody.children.length > 1) {
                courseTableBody.removeChild(rowToRemove);
            } else {
                alert("Please keep at least one row!");
            }
        }
    });
});



