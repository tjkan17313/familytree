let data = { members: [] };
let idCounter = 1;

// DOM elements
const memberName = document.getElementById("memberName");
const memberGender = document.getElementById("memberGender");
const addMemberBtn = document.getElementById("addMemberBtn");
const deleteMemberDropdown = document.getElementById("deleteMemberDropdown");
const deleteMemberBtn = document.getElementById("deleteMemberBtn");
const relA = document.getElementById("relA");
const relB = document.getElementById("relB");
const relType = document.getElementById("relType");
const addRelBtn = document.getElementById("addRelBtn");
const deleteRelDropdown = document.getElementById("deleteRelDropdown");
const deleteRelBtn = document.getElementById("deleteRelBtn");
const refreshBtn = document.getElementById("refreshBtn");
const showJsonBtn = document.getElementById("showJsonBtn");
const showTreeBtn = document.getElementById("showTreeBtn");
const showMembersBtn = document.getElementById("showMembersBtn");
const saveJsonBtn = document.getElementById("saveJsonBtn");
const loadJsonFile = document.getElementById("loadJsonFile");
const loadJsonBtn = document.getElementById("loadJsonBtn");
const relationshipList = document.getElementById("relationshipList");

// --------------------
// Initialize
// --------------------
window.onload = () => {
    refreshDropdowns();
    displayRelationships();
    populateDeleteRelationshipDropdown();
};

// --------------------
// Event listeners
// --------------------
addMemberBtn.onclick = () => {
    const name = memberName.value.trim();
    const gender = memberGender.value;
    if (!name) return alert("Enter a name");

    data.members.push({ id: "p" + idCounter++, name, gender, relations: [] });
    memberName.value = "";

    refreshDropdowns();
    displayRelationships();
    populateDeleteRelationshipDropdown();
    saveData();
};

deleteMemberBtn.onclick = () => {
    const id = deleteMemberDropdown.value;
    if (!id) return alert("Select a member");

    data.members = data.members.filter(m => m.id !== id);
    data.members.forEach(m => m.relations = m.relations.filter(r => r.target !== id));

    refreshDropdowns();
    displayRelationships();
    populateDeleteRelationshipDropdown();
    saveData();
};

addRelBtn.onclick = () => {
    const a = relA.value;
    const b = relB.value;
    const type = relType.value;

    if (!a || !b) return alert("Select both members");
    if (a === b) return alert("Cannot relate to self");

    const memA = data.members.find(m => m.id === a);
    const memB = data.members.find(m => m.id === b);
    if (!memA || !memB) return alert("Members not found");

    if (memA.relations.some(r => r.type === type && r.target === b)) return alert("Relationship exists");

    memA.relations.push({ type, target: b });

    if (type === "spouse" && !memB.relations.some(r => r.type === "spouse" && r.target === a)) {
        memB.relations.push({ type: "spouse", target: a });
    }

    refreshDropdowns();
    displayRelationships();
    populateDeleteRelationshipDropdown();
    saveData();
};

deleteRelBtn.onclick = () => {
    const value = deleteRelDropdown.value;
    if (!value) return alert("Select a relationship");

    const [a, type, b] = value.split("|");
    const memA = data.members.find(m => m.id === a);
    const memB = data.members.find(m => m.id === b);

    if (!memA) return;

    memA.relations = memA.relations.filter(r => !(r.type === type && r.target === b));
    if (type === "spouse" && memB) {
        memB.relations = memB.relations.filter(r => !(r.type === "spouse" && r.target === a));
    }

    refreshDropdowns();
    displayRelationships();
    populateDeleteRelationshipDropdown();
    saveData();
};

// --------------------
// Refresh Button Reloads from saved JSON
// --------------------
refreshBtn.onclick = () => {
    const stored = localStorage.getItem("familyTree");
    if (stored) {
        try {
            const jsonData = JSON.parse(stored);
            if (jsonData.members && Array.isArray(jsonData.members)) {
                data = jsonData;
                const ids = data.members.map(m => parseInt(m.id.replace("p",""))).filter(n => !isNaN(n));
                idCounter = ids.length ? Math.max(...ids) + 1 : 1;
            }
        } catch (err) {
            console.error("Error loading from localStorage:", err);
        }
    }

    refreshDropdowns();
    displayRelationships();
    populateDeleteRelationshipDropdown();
    alert("Relationship data refreshed from saved JSON!");
};

// --------------------
// Show JSON, Members, and Load JSON
// --------------------
showJsonBtn.onclick = () => {
    const w = window.open("", "_blank");
    if (!w) return alert("Popup blocked");
    w.document.write("<pre>" + JSON.stringify(data, null, 2) + "</pre>");
    w.document.title = "Family Tree JSON";
};

showMembersBtn.onclick = () => {
    const w = window.open("", "_blank");
    if (!w) return alert("Popup blocked");

    if (data.members.length === 0) {
        w.document.write("<p>No members to display.</p>");
        return;
    }

    const sortedMembers = [...data.members].sort((a, b) => a.name.localeCompare(b.name));

    let html = "<h2>Family Members (Sorted by Name)</h2><ul>";
    sortedMembers.forEach(m => {
        html += `<li>${m.name} (${m.id}) — ${m.gender}</li>`;
    });
    html += "</ul>";

    w.document.write(html);
    w.document.title = "Members List";
};

// --------------------
// Save JSON to Local File (Backup) with Timestamp
// --------------------
saveJsonBtn.onclick = () => {
    if (!data.members.length) return alert("No data to save");

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const now = new Date();
    const pad = n => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    a.download = `family_tree_${timestamp}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`JSON data saved as ${a.download}`);
};

// --------------------
// Load JSON from local file
// --------------------
loadJsonBtn.onclick = () => {
    if (!loadJsonFile.files || !loadJsonFile.files[0]) {
        return alert("Select a JSON file first");
    }

    const file = loadJsonFile.files[0];
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const jsonData = JSON.parse(e.target.result);

            if (!jsonData.members || !Array.isArray(jsonData.members)) {
                return alert("Invalid JSON format");
            }

            data = jsonData;

            const ids = data.members.map(m => parseInt(m.id.replace("p",""))).filter(n => !isNaN(n));
            idCounter = ids.length ? Math.max(...ids) + 1 : 1;

            refreshDropdowns();
            displayRelationships();
            populateDeleteRelationshipDropdown();
            saveData();

            alert("JSON data loaded successfully!");
        } catch (err) {
            alert("Error parsing JSON: " + err.message);
        }
    };
    reader.readAsText(file);
};

// --------------------
// Refresh dropdowns and relationship list
// --------------------
function refreshDropdowns() {
    [relA, relB, deleteMemberDropdown].forEach(select => select.innerHTML = "");

    if (data.members.length === 0) {
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "-- no members --";
        [relA, relB, deleteMemberDropdown].forEach(select => select.appendChild(empty.cloneNode(true)));
        return;
    }

    data.members.forEach(m => {
        const optA = document.createElement("option");
        optA.value = m.id;
        optA.textContent = `${m.name} (${m.id})`;
        relA.appendChild(optA);

        const optB = optA.cloneNode(true);
        relB.appendChild(optB);

        const optDel = optA.cloneNode(true);
        deleteMemberDropdown.appendChild(optDel);
    });
}

function displayRelationships() {
    relationshipList.innerHTML = "";
    data.members.forEach(m => {
        if (!m.relations.length) return;
        const div = document.createElement("div");
        div.innerHTML = `<b>${m.name} (${m.id})</b><br>`;
        m.relations.forEach(r => {
            const target = data.members.find(x => x.id === r.target);
            if (target) div.innerHTML += `— ${r.type} → ${target.name} (${target.id})<br>`;
        });
        relationshipList.appendChild(div);
    });
}

function populateDeleteRelationshipDropdown() {
    deleteRelDropdown.innerHTML = "";

    let hasRel = false;
    data.members.forEach(m => {
        m.relations.forEach(r => {
            const target = data.members.find(x => x.id === r.target);
            if (target) {
                hasRel = true;
                const option = document.createElement("option");
                option.value = `${m.id}|${r.type}|${r.target}`;
                option.textContent = `${m.name} — ${r.type} → ${target.name}`;
                deleteRelDropdown.appendChild(option);
            }
        });
    });

    if (!hasRel) {
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "-- no relationships --";
        deleteRelDropdown.appendChild(empty);
    }
}

// --------------------
// Show Tree (Indented Text Hierarchy)
// --------------------
showTreeBtn.onclick = () => {
    const w = window.open("", "_blank");
    if (!w) return alert("Popup blocked");

    if (data.members.length === 0) {
        w.document.write("<p>No members to display.</p>");
        return;
    }

    // Build a parent → children map
    const parentMap = {};
    data.members.forEach(m => {
        m.relations.forEach(r => {
            if (r.type === "father" || r.type === "mother") {
                if (!parentMap[r.target]) parentMap[r.target] = [];
                parentMap[r.target].push(m.id);
            }
        });
    });

    // Find root members (no one is their parent)
    const allChildIds = new Set();
    Object.values(parentMap).forEach(arr => arr.forEach(id => allChildIds.add(id)));
    const roots = data.members.filter(m => !allChildIds.has(m.id));

    // Recursive function to build text tree
    function buildTextTree(id, prefix = "") {
        const member = data.members.find(m => m.id === id);
        if (!member) return "";

        let line = `${prefix}→ ${member.name} (${member.id})`;
        const spouses = member.relations
            .filter(r => r.type === "spouse")
            .map(r => data.members.find(m => m.id === r.target))
            .filter(Boolean)
            .map(s => s.name + ` (${s.id})`);
        if (spouses.length) line += " 💍 " + spouses.join(", ");

        line += "\n";

        const children = parentMap[id] || [];
        children.forEach((childId, idx) => {
            const isLast = idx === children.length - 1;
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            line += buildTextTree(childId, newPrefix);
        });

        return line;
    }

    let treeText = "";
    roots.forEach(root => {
        treeText += buildTextTree(root.id);
    });

    w.document.write("<pre>" + treeText + "</pre>");
    w.document.title = "Family Tree Hierarchy";
};

// --------------------
// Save data to localStorage
// --------------------
function saveData() {
    localStorage.setItem("familyTree", JSON.stringify(data));
}
