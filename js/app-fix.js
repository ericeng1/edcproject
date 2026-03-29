// Add this null-check wrapper for all DOM operations
const safeSetInnerHTML = (elementId, content) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = content;
    return true;
  }
  console.warn(`Element #${elementId} not found`);
  return false;
};

const safeSetContent = (elementId, content) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = content;
    return true;
  }
  console.warn(`Element #${elementId} not found`);
  return false;
};

// Export for use in other scripts
window.safeSetInnerHTML = safeSetInnerHTML;
window.safeSetContent = safeSetContent;
