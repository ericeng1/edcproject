
import { supabase } from "./supabaseClient.js";

const makerSelect = document.getElementById("maker");
const categorySelect = document.getElementById("category");
const materialSelect = document.getElementById("material");
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

  // Add default empty option
  selectElement.appendChild(createOption("", `-- Select ${table.slice(0, -1)} --`));

  data.forEach(row => {
    const displayText = displayFunc(row);
    selectElement.appendChild(createOption(row.id, displayText));
  });
}

// Load brands, categories, materials
async function init() {
  await loadDropdown("brands", makerSelect, row => {
    return `${row.company || ""} ${row.first_name || ""} ${row.last_name || ""}`.trim();
  });

  await loadDropdown("categories", categorySelect, row => row.name);

  await loadDropdown("materials", materialSelect, row => row.name);
}

init();

// ---------- Make Select Searchable ----------
function makeSearchable(selectElement) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Search ${selectElement.id}...`;
  input.className = "search-input";

  selectElement.parentNode.insertBefore(input, selectElement);

  input.addEventListener("input", () => {
    const filter = input.value.toLowerCase();
    Array.from(selectElement.options).forEach(option => {
      if (option.textContent.toLowerCase().includes(filter) || option.value === "") {
        option.style.display = "";
      } else {
        option.style.display = "none";
      }
    });
  });
}

// Make dropdowns searchable
makeSearchable(makerSelect);
makeSearchable(categorySelect);
makeSearchable(materialSelect);

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
