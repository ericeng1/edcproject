import { supabase } from "./supabaseClient.js";

const makerSelect = document.getElementById("maker");
const categorySelect = document.getElementById("category");
const materialSelect = document.getElementById("material");
const form = document.getElementById("itemForm");
const status = document.getElementById("status");

async function loadDropdown(table, selectElement) {
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(row => {
    const option = document.createElement("option");
    option.value = row.id;
    option.textContent = row.name || row.company || row.first_name;
    selectElement.appendChild(option);
  });
}

async function init() {
  await loadDropdown("brands", makerSelect);
  await loadDropdown("categories", categorySelect);
  await loadDropdown("materials", materialSelect);
}

init();

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
