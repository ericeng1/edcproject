import { supabase } from "./supabaseClient.js";

const makerSelect = document.getElementById("maker");
const categorySelect = document.getElementById("category");
const materialSelect = document.getElementById("material");
const form = document.getElementById("itemForm");
const status = document.getElementById("status");

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

// ---------- LOAD BRANDS ----------
async function loadBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("company");

  if (error) {
    console.error(error);
    return;
  }

  makerSelect.appendChild(createOption("", "-- Select Brand --"));

  data.forEach(brand => {
    const name = `${brand.company || ""} ${brand.first_name || ""} ${brand.last_name || ""}`.trim();
    makerSelect.appendChild(createOption(brand.id, name));
  });
}

// ---------- LOAD CATEGORIES ----------
async function loadCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  categorySelect.appendChild(createOption("", "-- Select Category --"));

  data.forEach(cat => {
    categorySelect.appendChild(createOption(cat.id, cat.name));
  });
}

// ---------- LOAD MATERIALS ----------
async function loadMaterials() {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  materialSelect.appendChild(createOption("", "-- Select Material --"));

  data.forEach(mat => {
    materialSelect.appendChild(createOption(mat.id, mat.name));
  });
}

// ---------- INIT ----------
async function init() {
  await loadBrands();
  await loadCategories();
  await loadMaterials();
}

init();

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
