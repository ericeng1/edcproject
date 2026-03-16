import { supabase } from "./supabaseClient.js";

const makerSelect = document.getElementById("maker");
const categorySelect = document.getElementById("category");
const materialSelect = document.getElementById("material");

const addCategoryBtn = document.getElementById("add-category-btn");
const addMaterialBtn = document.getElementById("add-material-btn");

const form = document.getElementById("itemForm");
const status = document.getElementById("status");

// -------- IMAGE PREVIEWS --------
["image1", "image2", "image3"].forEach((id, i) => {
  const input = document.getElementById(id);
  const preview = document.getElementById(`preview${i + 1}`);
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  });
});

// -------- UPLOAD IMAGE TO SUPABASE STORAGE --------
// Bucket name: "item-images" — make sure this matches what you created in Supabase
const BUCKET = "item-images";

async function uploadImage(file) {
  if (!file) return null;

  // Unique filename: timestamp + original name to avoid collisions
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Upload error:", error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  // Get the public URL for the uploaded file
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// -------- HELPER: create <option> --------
function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

// -------- LOAD DROPDOWNS --------
async function loadDropdown(table, selectElement, displayFunc) {
  const { data, error } = await supabase.from(table).select("*").order("id");

  if (error) {
    console.error(`Error loading ${table}:`, error);
    return;
  }

  selectElement.innerHTML = "";
  selectElement.appendChild(createOption("", `-- Select ${table.slice(0, -1)} --`));

  data.forEach(row => {
    selectElement.appendChild(createOption(row.id, displayFunc(row)));
  });
}

async function init() {
  await loadDropdown("brands", makerSelect, row => `${row.company || ""} ${row.first_name || ""} ${row.last_name || ""}`.trim());
  await loadDropdown("categories", categorySelect, row => row.name);
  await loadDropdown("materials", materialSelect, row => row.name);
}

init();

// -------- ADD NEW CATEGORY/MATERIAL --------
async function addNewEntry(table, selectElement, displayFunc) {
  let name = prompt(`Enter new ${table.slice(0, -1)} name:`).trim();
  if (!name) return;

  const { error } = await supabase.from(table).insert([{ name }]);
  if (error) return alert("Error: " + error.message);

  await loadDropdown(table, selectElement, displayFunc);
  const options = Array.from(selectElement.options);
  options[options.length - 1].selected = true;
}

addCategoryBtn.addEventListener("click", () => addNewEntry("categories", categorySelect, row => row.name));
addMaterialBtn.addEventListener("click", () => addNewEntry("materials", materialSelect, row => row.name));

// -------- FORM SUBMIT --------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector(".submit-btn");
  submitBtn.disabled = true;
  status.textContent = "Uploading images...";
  status.style.color = "#2d6cdf";

  try {
    // Upload all three images in parallel (nulls are skipped inside uploadImage)
    const [url1, url2, url3] = await Promise.all([
      uploadImage(document.getElementById("image1").files[0] || null),
      uploadImage(document.getElementById("image2").files[0] || null),
      uploadImage(document.getElementById("image3").files[0] || null),
    ]);

    status.textContent = "Saving item...";

    const item = {
      maker_id:     makerSelect.value || null,
      category_id:  categorySelect.value || null,
      material_id:  materialSelect.value || null,
      born_on_date: document.getElementById("born_on_date").value || null,
      msrp:         document.getElementById("msrp").value || null,
      size:         document.getElementById("size").value || null,
      variant:      document.getElementById("variant").value,
      extra:        document.getElementById("extra").value,
      comments:     document.getElementById("comments").value,
      image_url1:   url1,
      image_url2:   url2,
      image_url3:   url3,
    };

    const { error } = await supabase.from("items").insert([item]);

    if (error) {
      status.textContent = "Error saving item: " + error.message;
      status.style.color = "red";
    } else {
      status.textContent = "Item saved!";
      status.style.color = "green";
      form.reset();
      // Clear previews after reset
      ["preview1", "preview2", "preview3"].forEach(id => {
        const el = document.getElementById(id);
        el.src = "";
        el.style.display = "none";
      });
    }
  } catch (err) {
    status.textContent = err.message;
    status.style.color = "red";
  } finally {
    submitBtn.disabled = false;
  }
});
