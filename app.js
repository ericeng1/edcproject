import { supabase } from "./supabaseClient.js";

// -------- AUTH GATE --------
// Redirect to login if not signed in
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.href = "login.html";
}
const currentUser = session.user;

// Show logged-in user email + sign out button
const userBar   = document.getElementById("user-bar");
const userEmail = document.getElementById("user-email");
if (userBar)   userBar.style.display = "flex";
if (userEmail) userEmail.textContent = currentUser.email || "Signed in";

document.getElementById("signout-btn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});

// -------- DROPDOWNS --------
const makerSelect    = document.getElementById("maker");
const categorySelect = document.getElementById("category");
const materialSelect = document.getElementById("material");
const addCategoryBtn = document.getElementById("add-category-btn");
const addMaterialBtn = document.getElementById("add-material-btn");
const form           = document.getElementById("itemForm");
const status         = document.getElementById("status");

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

async function loadDropdown(table, selectElement, displayFunc) {
  const { data, error } = await supabase.from(table).select("*").order("id");
  if (error) { console.error(`Error loading ${table}:`, error); return; }
  selectElement.innerHTML = "";
  selectElement.appendChild(createOption("", `-- Select ${table.slice(0, -1)} --`));
  data.forEach(row => selectElement.appendChild(createOption(row.id, displayFunc(row))));
}

async function init() {
  await loadDropdown("brands",     makerSelect,    row => `${row.company || ""} ${row.first_name || ""} ${row.last_name || ""}`.trim());
  await loadDropdown("categories", categorySelect, row => row.name);
  await loadDropdown("materials",  materialSelect, row => row.name);
}

init();

// -------- ADD NEW CATEGORY / MATERIAL --------
async function addNewEntry(table, selectElement, displayFunc) {
  const name = prompt(`Enter new ${table.slice(0, -1)} name:`)?.trim();
  if (!name) return;
  const { error } = await supabase.from(table).insert([{ name }]);
  if (error) return alert("Error: " + error.message);
  await loadDropdown(table, selectElement, displayFunc);
  const options = Array.from(selectElement.options);
  options[options.length - 1].selected = true;
}

addCategoryBtn.addEventListener("click", () => addNewEntry("categories", categorySelect, row => row.name));
addMaterialBtn.addEventListener("click", () => addNewEntry("materials",  materialSelect, row => row.name));

// -------- IMAGE PREVIEWS --------
["image1","image2","image3","image4","image5","image6","image7","image8","image9","image10"].forEach((id, i) => {
  document.getElementById(id).addEventListener("change", (e) => {
    const file    = e.target.files[0];
    const preview = document.getElementById(`preview${i + 1}`);
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
// Stored under <user_id>/<filename> so folder-scoped storage policies work
const BUCKET = "item-images";

async function uploadImage(file) {
  if (!file) return null;
  const filename = `${currentUser.id}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// -------- FORM SUBMIT --------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector(".submit-btn");
  submitBtn.disabled = true;
  status.textContent = "Uploading images...";
  status.style.color = "#2d6cdf";

  try {
    const [url1,url2,url3,url4,url5,url6,url7,url8,url9,url10] = await Promise.all([
      uploadImage(document.getElementById("image1").files[0]  || null),
      uploadImage(document.getElementById("image2").files[0]  || null),
      uploadImage(document.getElementById("image3").files[0]  || null),
      uploadImage(document.getElementById("image4").files[0]  || null),
      uploadImage(document.getElementById("image5").files[0]  || null),
      uploadImage(document.getElementById("image6").files[0]  || null),
      uploadImage(document.getElementById("image7").files[0]  || null),
      uploadImage(document.getElementById("image8").files[0]  || null),
      uploadImage(document.getElementById("image9").files[0]  || null),
      uploadImage(document.getElementById("image10").files[0] || null),
    ]);

    status.textContent = "Saving item...";

    const item = {
      user_id:      currentUser.id,
      is_private:   document.getElementById("is_private").checked,
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
      image_url4:   url4,
      image_url5:   url5,
      image_url6:   url6,
      image_url7:   url7,
      image_url8:   url8,
      image_url9:   url9,
      image_url10:  url10,
    };

    const { error } = await supabase.from("items").insert([item]);

    if (error) {
      status.textContent = "Error saving item: " + error.message;
      status.style.color = "red";
    } else {
      status.textContent = "Item saved!";
      status.style.color = "green";
      form.reset();
      ["preview1","preview2","preview3","preview4","preview5","preview6","preview7","preview8","preview9","preview10"].forEach(id => {
        const el = document.getElementById(id);
        el.src = ""; el.style.display = "none";
      });
    }
  } catch (err) {
    status.textContent = err.message;
    status.style.color = "red";
  } finally {
    submitBtn.disabled = false;
  }
});
