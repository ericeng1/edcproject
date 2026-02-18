import { supabase } from "./supabaseClient.js";

const makerSelect = document.getElementById("maker");
const categorySelect = document.getElementById("category");
const materialSelect = document.getElementById("material");

const addCategoryBtn = document.getElementById("add-category-btn");
const addMaterialBtn = document.getElementById("add-material-btn");

const form = document.getElementById("itemForm");
const status = document.getElementById("status");

// Helper to create <option>
function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

// ---------- LOAD DROPDOWNS ----------
async function loadDropdown(table, selectElement, displayFunc) {
  const { data, error } = await supabase.from(table).select("*").order("id");

  if (error) {
    console.error(`Error loading ${table}:`, error);
    return;
  }

  selectElement.innerHTML = ""; 
  selectElement.appendChild(createOption("", `-- Select ${table.slice(0, -1)} --`));

  data.forEach(row => {
    const text = displayFunc(row);
    selectElement.appendChild(createOption(row.id, text));
  });
}

// Initialize dropdowns
async function init() {
  await loadDropdown("brands", makerSelect, row => `${row.company || ""} ${row.first_name || ""} ${row.last_name || ""}`.trim());
  await loadDropdown("categories", categorySelect, row => row.name);
  await loadDropdown("materials", materialSelect, row => row.name);
}

init();

// ---------- ADD NEW CATEGORY/MATERIAL ----------
async function addNewEntry(table, selectElement, displayFunc) {
  let name = prompt(`Enter new ${table.slice(0, -1)} name:`).trim();
  if (!name) return;

  const { data, error } = await supabase.from(table).insert([{ name }]);
  if (error) return alert("Error: " + error.message);

  // Reload dropdown and select new item
  await loadDropdown(table, selectElement, displayFunc);
  const options = Array.from(selectElement.options);
  options[options.length - 1].selected = true;
}

// Button events
addCategoryBtn.addEventListener("click", () => addNewEntry("categories", categorySelect, row => row.name));
addMaterialBtn.addEventListener("click", () => addNewEntry("materials", materialSelect, row => row.name));

// ---------- FORM SUBMIT ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const item = {
    maker_id: makerSelect.value || null,
    category_id: categorySelect.value || null,
    material_id: materialSelect.value || null,
    born_on_date: document.getElementById("born_on_date").value || null,
    msrp: document.getElementById("msrp").value || null,
    size: document.getElementById("size").value || null,
    variant: document.getElementById("variant").value,
    extra: document.getElementById("extra").value,
    comments: document.getElementById("comments").value,
    image_url1: document.getElementById("image1").value,
    image_url2: document.getElementById("image2").value,
    image_url3: document.getElementById("image3").value,
  };

  const { error } = await supabase.from("items").insert([item]);

  if (error) {
    status.textContent = "Error: " + error.message;
    status.style.color = "red";
  } else {
    status.textContent = "Item saved!";
    status.style.color = "green";
    form.reset();
  }
});
