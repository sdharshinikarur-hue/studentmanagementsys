// Student Management System - frontend logic
// Talks to the Django REST Framework API defined in backend/studentms/students/

const API_BASE_URL = "http://127.0.0.1:8000/api/students/";

const form = document.getElementById("student-form");
const idField = document.getElementById("student-id");
const firstNameField = document.getElementById("first_name");
const lastNameField = document.getElementById("last_name");
const emailField = document.getElementById("email");
const courseField = document.getElementById("course");
const ageField = document.getElementById("age");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formMessage = document.getElementById("form-message");

const tableBody = document.getElementById("student-table-body");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const searchBox = document.getElementById("search-box");

let searchDebounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchStudents();
});

form.addEventListener("submit", handleFormSubmit);
cancelBtn.addEventListener("click", resetForm);
searchBox.addEventListener("input", () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => fetchStudents(searchBox.value.trim()), 300);
});

// ---------- READ ----------
async function fetchStudents(search = "") {
  loadingState.classList.remove("hidden");
  emptyState.classList.add("hidden");

  try {
    const url = search
      ? `${API_BASE_URL}?search=${encodeURIComponent(search)}`
      : API_BASE_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    const students = Array.isArray(data) ? data : data.results || [];
    renderStudents(students);
  } catch (err) {
    tableBody.innerHTML = "";
    emptyState.textContent = `Could not load students. Is the backend running at ${API_BASE_URL}?`;
    emptyState.classList.remove("hidden");
    console.error("Fetch students failed:", err);
  } finally {
    loadingState.classList.add("hidden");
  }
}

function renderStudents(students) {
  tableBody.innerHTML = "";

  if (!students.length) {
    emptyState.textContent = "No students found.";
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  students.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(student.first_name)}</td>
      <td>${escapeHtml(student.last_name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${escapeHtml(String(student.age))}</td>
      <td>${escapeHtml(student.enrollment_date || "")}</td>
      <td class="row-actions">
        <button class="edit-btn" data-id="${student.id}">Edit</button>
        <button class="delete-btn" data-id="${student.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", () => loadStudentIntoForm(btn.dataset.id))
  );
  tableBody.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => deleteStudent(btn.dataset.id))
  );
}

// ---------- CREATE / UPDATE ----------
async function handleFormSubmit(event) {
  event.preventDefault();
  clearErrors();

  if (!validateForm()) return;

  const payload = {
    first_name: firstNameField.value.trim(),
    last_name: lastNameField.value.trim(),
    email: emailField.value.trim(),
    course: courseField.value.trim(),
    age: Number(ageField.value),
  };

  const editingId = idField.value;
  const isEditing = Boolean(editingId);
  const url = isEditing ? `${API_BASE_URL}${editingId}/` : API_BASE_URL;
  const method = isEditing ? "PUT" : "POST";

  submitBtn.disabled = true;
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      showFieldErrors(data);
      showMessage("Please fix the errors above.", "error");
      return;
    }

    showMessage(
      isEditing ? "Student updated successfully." : "Student added successfully.",
      "success"
    );
    resetForm();
    fetchStudents(searchBox.value.trim());
  } catch (err) {
    showMessage("Network error: could not reach the backend.", "error");
    console.error("Save student failed:", err);
  } finally {
    submitBtn.disabled = false;
  }
}

async function loadStudentIntoForm(id) {
  try {
    const response = await fetch(`${API_BASE_URL}${id}/`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const student = await response.json();

    idField.value = student.id;
    firstNameField.value = student.first_name;
    lastNameField.value = student.last_name;
    emailField.value = student.email;
    courseField.value = student.course;
    ageField.value = student.age;

    formTitle.textContent = "Edit Student";
    submitBtn.textContent = "Update Student";
    cancelBtn.classList.remove("hidden");
    clearErrors();
    showMessage("", "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showMessage("Could not load that student's details.", "error");
    console.error("Load student failed:", err);
  }
}

// ---------- DELETE ----------
async function deleteStudent(id) {
  const confirmed = window.confirm("Delete this student? This cannot be undone.");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}${id}/`, { method: "DELETE" });
    if (!response.ok && response.status !== 204) {
      throw new Error(`Server returned ${response.status}`);
    }
    fetchStudents(searchBox.value.trim());
  } catch (err) {
    alert("Could not delete this student. Please try again.");
    console.error("Delete student failed:", err);
  }
}

// ---------- Client-side validation ----------
function validateForm() {
  let valid = true;

  if (!firstNameField.value.trim()) {
    setFieldError("first_name", "First name is required.");
    valid = false;
  }
  if (!lastNameField.value.trim()) {
    setFieldError("last_name", "Last name is required.");
    valid = false;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailField.value.trim())) {
    setFieldError("email", "Enter a valid email address.");
    valid = false;
  }
  if (!courseField.value.trim()) {
    setFieldError("course", "Course is required.");
    valid = false;
  }
  const age = Number(ageField.value);
  if (!ageField.value || age < 15 || age > 100) {
    setFieldError("age", "Age must be between 15 and 100.");
    valid = false;
  }

  return valid;
}

function showFieldErrors(errorData) {
  Object.entries(errorData || {}).forEach(([field, messages]) => {
    const message = Array.isArray(messages) ? messages.join(" ") : String(messages);
    setFieldError(field, message);
  });
}

function setFieldError(field, message) {
  const el = document.getElementById(`err-${field}`);
  if (el) el.textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `message ${type || ""}`.trim();
}

function resetForm() {
  form.reset();
  idField.value = "";
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelBtn.classList.add("hidden");
  clearErrors();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
