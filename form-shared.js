/**
 * form-shared.js
 * Shared logic for brand-centric forms:
 *  - Auth gate
 *  - Progressive image upload (upload on select, not on submit)
 *  - Draft persistence to localStorage
 *  - Haptic + visual feedback
 *  - Two-step flow (step 1: essentials, step 2: optional details)
 *  - Final DB insert
 */

import { supabase } from "./supabaseClient.js";

const BUCKET   = "item-images";
const MAX_PHOTOS = 10;

// ── AUTH ─────────────────────────────────────────────────────────────────────
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { window.location.href = "login.html"; return null; }
  return session.user;
}

// ── HAPTIC FEEDBACK ───────────────────────────────────────────────────────────
export function haptic(style = "light") {
  if ("vibrate" in navigator) {
    const patterns = { light: [10], medium: [20], success: [10, 60, 10], error: [40, 30, 40] };
    navigator.vibrate(patterns[style] || patterns.light);
  }
}

// ── VISUAL TOAST ──────────────────────────────────────────────────────────────
let toastTimer = null;

export function showToast(msg, type = "info") {
  let toast = document.getElementById("shared-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "shared-toast";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "calc(24px + env(safe-area-inset-bottom))",
      left: "50%",
      transform: "translateX(-50%) translateY(20px)",
      padding: "12px 20px",
      borderRadius: "40px",
      fontSize: "14px",
      fontFamily: "'Lato', sans-serif",
      fontWeight: "400",
      letterSpacing: "0.02em",
      zIndex: "9999",
      pointerEvents: "none",
      transition: "opacity 0.25s ease, transform 0.25s ease",
      opacity: "0",
      whiteSpace: "nowrap",
      maxWidth: "90vw",
      textAlign: "center",
    });
    document.body.appendChild(toast);
  }

  const themes = {
    info:    { bg: "#1e2a36", color: "#8dbbd1", border: "1px solid rgba(141,187,209,0.25)" },
    success: { bg: "#1a2e22", color: "#5fa87a", border: "1px solid rgba(95,168,122,0.3)" },
    error:   { bg: "#2e1a1a", color: "#c07070", border: "1px solid rgba(192,112,112,0.3)" },
    upload:  { bg: "#2a2108", color: "#c8964a", border: "1px solid rgba(200,150,74,0.3)" },
  };

  const theme = themes[type] || themes.info;
  toast.textContent = msg;
  Object.assign(toast.style, { background: theme.bg, color: theme.color, border: theme.border });

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
  }, type === "success" ? 3000 : 2200);
}

// ── DRAFT SAVE / RESTORE ──────────────────────────────────────────────────────
export function saveDraft(draftKey, data) {
  try {
    localStorage.setItem(draftKey, JSON.stringify({ ...data, _saved: Date.now() }));
  } catch {}
}

export function loadDraft(draftKey) {
  try {
    const raw = localStorage.getItem(draftKey);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDraft(draftKey) {
  try { localStorage.removeItem(draftKey); } catch {}
}

// ── PROGRESSIVE UPLOAD ────────────────────────────────────────────────────────
/**
 * Uploads a single file immediately on selection.
 * Returns the public URL, or throws on error.
 */
export async function uploadFileNow(file, userId) {
  const ext      = file.name.split(".").pop();
  const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// ── PROGRESSIVE IMAGE INPUT MANAGER ──────────────────────────────────────────
/**
 * Attaches progressive upload behaviour to a file input + preview container.
 *
 * @param {object} opts
 *   inputEl      — <input type="file" multiple accept="image/*">
 *   previewEl    — container div for thumbnails
 *   userId       — current user id
 *   onUrlsChange — callback(urls: string[]) called whenever url list changes
 *   draftKey     — key for auto-saving upload urls to localStorage
 */
export function initProgressiveUpload({ inputEl, previewEl, userId, onUrlsChange, draftKey }) {
  let urls = []; // uploaded public URLs in order

  function render() {
    previewEl.innerHTML = "";

    urls.forEach((url, i) => {
      const wrap = document.createElement("div");
      wrap.className = "thumb-wrap";

      const img = document.createElement("img");
      img.src = url;
      img.className = "thumb-img";
      img.alt = "";

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "thumb-rm";
      rm.innerHTML = "✕";
      rm.setAttribute("aria-label", "Remove photo");
      rm.addEventListener("click", () => {
        urls.splice(i, 1);
        render();
        onUrlsChange(urls);
      });

      wrap.appendChild(img);
      wrap.appendChild(rm);
      previewEl.appendChild(wrap);
    });

    // Add-more tile if under limit
    if (urls.length < MAX_PHOTOS) {
      const addTile = document.createElement("div");
      addTile.className = "thumb-add-tile";
      addTile.innerHTML = `<span class="plus-icon">＋</span><span class="add-label">${MAX_PHOTOS - urls.length} left</span>`;
      addTile.addEventListener("click", () => { inputEl.value = ""; inputEl.click(); });
      previewEl.appendChild(addTile);
    }

    // Count badge
    if (urls.length > 0) {
      const count = document.createElement("p");
      count.className = "photo-count";
      count.textContent = `${urls.length} / ${MAX_PHOTOS} photo${urls.length !== 1 ? "s" : ""}`;
      previewEl.appendChild(count);
    }
  }

  inputEl.addEventListener("change", async () => {
    const files = Array.from(inputEl.files).slice(0, MAX_PHOTOS - urls.length);
    if (!files.length) return;
    inputEl.value = "";

    for (const file of files) {
      // Optimistic: show loading thumb immediately
      const loadingId = `loading-${Date.now()}-${Math.random()}`;
      const wrap = document.createElement("div");
      wrap.className = "thumb-wrap loading";
      wrap.id = loadingId;
      wrap.innerHTML = `<div class="thumb-spinner"></div>`;
      // Insert before add tile
      const addTile = previewEl.querySelector(".thumb-add-tile");
      if (addTile) previewEl.insertBefore(wrap, addTile);
      else previewEl.appendChild(wrap);

      haptic("light");
      showToast("Uploading photo…", "upload");

      try {
        const url = await uploadFileNow(file, userId);
        urls.push(url);
        onUrlsChange(urls);
        // Save urls to draft immediately
        if (draftKey) {
          const existing = loadDraft(draftKey) || {};
          saveDraft(draftKey, { ...existing, uploadedUrls: urls });
        }
        haptic("success");
        showToast("Photo uploaded ✓", "success");
      } catch (err) {
        haptic("error");
        showToast("Upload failed — check connection", "error");
      } finally {
        document.getElementById(loadingId)?.remove();
        render();
      }
    }
  });

  // Expose method to set initial urls (for draft restore)
  return {
    setUrls(initial) { urls = [...initial]; render(); onUrlsChange(urls); },
    getUrls()        { return [...urls]; },
    render,
  };
}

// ── DB INSERT ─────────────────────────────────────────────────────────────────
export async function saveItem({ makerId, step1, step2, imageUrls, userId }) {
  const imageFields = {};
  for (let i = 0; i < MAX_PHOTOS; i++) {
    imageFields[`image_url${i + 1}`] = imageUrls[i] ?? null;
  }

  const item = {
    user_id:      userId,
    maker_id:     makerId,
    is_private:   step1.is_private || false,
    category_id:  step1.category_id || null,
    material_id:  step1.material_id || null,
    born_on_date: step2?.born_on_date || null,
    msrp:         step2?.msrp        || null,
    size:         step2?.size        || null,
    variant:      step2?.variant     || null,
    extra:        step2?.extra       || null,
    comments:     step2?.comments    || null,
    ...imageFields,
  };

  const { error } = await supabase.from("items").insert([item]);
  if (error) throw new Error(error.message);
}
