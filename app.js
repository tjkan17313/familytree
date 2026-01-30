let familyTree = [];
let nextId = 1; // ID counter

// DOM elements
const nameInput = document.getElementById("nameInput");
const genderInput = document.getElementById("genderInput");
const relationInput = document.getElementById("relationInput");
const relativeInput = document.getElementById("relativeInput");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const hierarchyBtn = document.getElementById("hierarchyBtn");

// Load JSON from data.json
async function loadFamilyTree() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error("Failed to fetch data.json");
    const data = await response.json();

    familyTree = data.map((person, idx) => ({
      id: idx + 1,
      name: person.name || "Unknown",
      gender: person.gender || "Unknown",
      relation: person.relation || "Unknown",
      relative: person.relative || "Unknown"
    }));

    renderTable();
    populateRelativeOptions();
  } catch (err) {
    console.error("Error loading data.json:", err);
  }
}

// Render table
function renderTable() {
  const tbody = document.querySelector("#familyTable tbody");
  tbody.innerHTML = "";
  familyTree.forEach(person => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${person.id}</td>
      <td>${person.name}</td>
      <td>${person.gender}</td>
      <td>${person.relation}</td>
      <td>${person.relative}</td>
    `;
    tbody.appendChild(row);
  });
}

// Populate relative dropdown
function populateRelativeOptions() {
  relativeInput.innerHTML = '<option value="">Select Relative</option>';
  familyTree.forEach(person => {
    const opt = document.createElement("option");
    opt.value = person.name;
    opt.textContent = person.name;
    relativeInput.appendChild(opt);
  });
}

// Add new member
addBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const gender = genderInput.value;
  const relation = relationInput.value;
  const relative = relativeInput.value;

  if (!name || !gender || !relation || !relative) {
    alert("Please fill all fields including gender, relation, and relative.");
    return;
  }

  const newMember = {
    id: nextId++,
    name,
    gender,
    relation,
    relative
  };
  familyTree.push(newMember);

  renderTable();
  populateRelativeOptions();
  console.log("Added Member:", newMember);

  nameInput.value = "";
  genderInput.value = "";
  relationInput.value = "";
  relativeInput.value = "";
});

// Show JSON in a new window
saveBtn.addEventListener("click", () => {
  const jsonStr = JSON.stringify(familyTree, null, 2);
  const win = window.open("", "Family JSON", "width=600,height=600,scrollbars=yes");
  win.document.write("<pre>" + jsonStr + "</pre>");
  win.document.title = "Family Tree JSON";
});

// Show hierarchy in a new window
hierarchyBtn.addEventListener("click", () => {
  const hierarchyText = familyTree.map(person =>
    `${person.name} (${person.gender}) - ${person.relation} ${person.relative}`
  ).join("\n");

  const win = window.open("", "Family Hierarchy", "width=500,height=600,scrollbars=yes");
  win.document.write("<pre>" + hierarchyText + "</pre>");
  win.document.title = "Family Hierarchy";
});

// Initial load
loadFamilyTree();
