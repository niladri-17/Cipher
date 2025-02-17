// navigateUtils.js
let globalNavigate = null;

// Set the global navigate function
export const setNavigate = (navigate) => {
  globalNavigate = navigate;
};

// Navigate using the global function, accepting options
export const navigate = (path, options = {}) => {
  if (globalNavigate) {
    globalNavigate(path, options); // Pass options here
  } else {
    window.location.href = path; // Fallback if navigate isn't available
  }
};
