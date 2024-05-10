const addRowButton = document.querySelector('.add-row');
const courseTableBody = document.getElementById('courseTableBody');

addRowButton.addEventListener('click', () => {
  const newRow = document.createElement('tr');

  // Add cells with input fields
  newRow.innerHTML = `
    <td><input type="text" class="form-control" name="courseCode"></td>
    <td><input type="text" class="form-control" name="courseTitle"></td>
    <td><input type="number" step="0.5" class="form-control" name="units"></td>
    <td><input type="number" step="0.25" class="form-control" name="finalGrade"></td>
    <td><textarea class="form-control" name="finalRemarks" rows="1"></textarea></td>
    <td><input type="number" step="0.25" class="form-control" name="completionGrade"></td>
    <td><textarea class="form-control" name="completionRemarks" rows="1"></textarea></td>
    <td><input type="text" class="form-control" name="prerequisites"></td>
    <td>
      <button class="btn btn-sm btn-danger remove-row">&times;</button>
    </td>
  `;

  courseTableBody.appendChild(newRow);
});

// Add functionality to remove rows (optional)
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
