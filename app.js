import { supabase } from "./supabaseClient.js";

const makerSelect = document.getElementById("maker");
const categorySelect = document.getElementById("category");
const materialSelect = document.getElementById("material");

const makerSearch = document.getElementById("maker-search");
const categorySearch = document.getElementById("category-search");
const materialSearch = document.getElementById("material-search");

const form = document.getElementById("itemForm");
const status = document.getElementById("status");

// Helper to create <option>
function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

// Load dropdown with display text
async function loadDropdown(table, selectElement, displayFunc) {
  const { data, error } = await supabase.from(table).select("*").order("id");

  if (error) {
    console.error(`Error loading ${table}:`, error);
    return;
  }

  selectElement.innerHTML = ""; // Clear existing
  selectElement.appendChild(createOption("", `-- Select ${table.slice(0, -1)} --`));

  data.forEach(row => {
    const text = displayFunc(row);
    selectElement.appendChild(createOption(row.id, text));
  });
}

// Load all dropdowns
async function init() {
  await loadDropdown("brands", makerSelect, row => `${row.company || ""} ${row.first_name || ""} ${row.last_name || ""}`.trim());
  await loadDropdown("categories", categorySelect, row => row.name);
  await loadDropdown("materials", materialSelect, row => row.name);
}

init();

// Searchable dropdowns
function makeSearchable(searchInput, selectElement) {
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    Array.from(selectElement.options).forEach(option => {
      option.style.display = option.textContent.toLowerCase().includes(filter) || option.value === "" ? "" : "none";
    });
  });
}

makeSearchable(makerSearch, makerSelect);
makeSearchable(categorySearch, categorySelect);
makeSearchable(materialSearch, materialSelect);

// Form submit
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
