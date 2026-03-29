/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NAVIGATION.JS - Unified Navigation System
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Centralized navigation logic that was previously scattered across
 * 20+ inline <script> blocks in HTML files.
 * 
 * Usage: Add to <head> or before </body> of all pages:
 *   <script src="js/navigation.js" defer></script>
 * 
 * Features:
 * - Automatic back button handling
 * - Signout button integration
 * - Mobile menu toggle
 * - Active link highlighting
 * - Theme switching (if using theme.js)
 * ═════════════════════════════════════════════════════════════════════════ */

class NavigationManager {
  constructor() {
    this.backBtn = document.getElementById('back-btn');
    this.backLink = document.getElementById('back-link');
    this.signoutBtn = document.getElementById('signout-btn');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.logo = document.querySelector('.logo');
    this.topbar = document.querySelector('.topbar');

    this.init();
  }

  /**
   * Initialize all navigation features
   */
  init() {
    this.setupBackNavigation();
    this.setupSignout();
    this.highlightActiveLink();
    this.setupMobileMenu();
    this.setupLogoNavigation();
  }

  /**
   * Setup back button/link functionality
   * Falls back to document.referrer if history is unavailable
   */
  setupBackNavigation() {
    const handleBackClick = (e) => {
      e.preventDefault();
      
      // If we have history, go back
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Fallback: go to home or a sensible default
        const fallbackUrl = this.getFallbackUrl();
        window.location.href = fallbackUrl;
      }
    };

    if (this.backBtn) {
      this.backBtn.addEventListener('click', handleBackClick);
      // Enhance hover state
      this.backBtn.style.cursor = 'pointer';
    }

    if (this.backLink) {
      this.backLink.addEventListener('click', handleBackClick);
      this.backLink.style.cursor = 'pointer';
    }
  }

  /**
   * Determine fallback URL based on current page context
   */
  getFallbackUrl() {
    const currentPath = window.location.pathname;
    
    // If on a form page (form-*.html), go to dashboard
    if (currentPath.includes('form-')) return 'dashboard.html';
    
    // If on item detail or edit, go to my-items
    if (currentPath.includes('item') || currentPath.includes('edit')) return 'my-items.html';
    
    // Default to home
    return 'home.html';
  }

  /**
   * Setup signout button - requires auth integration
   * This assumes your auth.js or app.js handles the actual signout
   */
  setupSignout() {
    if (!this.signoutBtn) return;

    this.signoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      try {
        // Call signout function from your auth system
        if (window.supabaseSignout) {
          await window.supabaseSignout();
        } else if (window.handleSignout) {
          await window.handleSignout();
        } else {
          // Fallback: clear local storage and redirect
          console.warn('No signout handler found. Clearing local data and redirecting...');
          localStorage.clear();
          window.location.href = 'login.html';
        }
      } catch (error) {
        console.error('Signout error:', error);
        // Still redirect even if error
        window.location.href = 'login.html';
      }
    });

    // Add visual feedback
    this.signoutBtn.style.cursor = 'pointer';
  }

  /**
   * Highlight the current page's nav link as active
   */
  highlightActiveLink() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';

    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Remove existing active class
      link.classList.remove('active');

      // Add active class if this is the current page
      if (href && (href === currentFile || href.includes(currentFile))) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Setup mobile menu toggle (if using hamburger menu)
   */
  setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.topbar-nav');

    if (!hamburger || !navLinksContainer) return;

    hamburger.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
      hamburger.classList.toggle('active');
    });

    // Close menu when a link is clicked
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }

  /**
   * Setup logo click to always go to home
   * (Usually logo href is already set, but this ensures consistency)
   */
  setupLogoNavigation() {
    if (!this.logo) return;

    // Ensure logo links to home
    if (!this.logo.getAttribute('href')) {
      this.logo.setAttribute('href', 'home.html');
      this.logo.style.cursor = 'pointer';
    }
  }

  /**
   * Public method: Navigate to a specific page
   */
  navigateTo(path) {
    window.location.href = path;
  }

  /**
   * Public method: Get current active nav link
   */
  getActiveLink() {
    return document.querySelector('.nav-link.active');
  }

  /**
   * Public method: Update topbar visibility (useful for dynamic pages)
   */
  setTopbarVisible(visible) {
    if (!this.topbar) return;
    this.topbar.style.display = visible ? 'flex' : 'none';
  }
}

/**
 * ───────────────────────────────────────────────────────────────────────────
 * INITIALIZATION
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Initialize on DOM ready
 */

// Wait for DOM to load if not already
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
  });
} else {
  new NavigationManager();
}

// Export for use in other scripts (if using modules)
if (typeof window !== 'undefined') {
  window.NavigationManager = NavigationManager;
}

/**
 * ───────────────────────────────────────────────────────────────────────────
 * UTILITY FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────
 */

/**
 * Global helper: Check if user is authenticated
 * (Depends on your auth system)
 */
function isUserAuthenticated() {
  // Adjust based on your auth system
  return !!localStorage.getItem('supabase.auth.token') ||
         !!sessionStorage.getItem('auth_token') ||
         !!window.currentUser;
}

/**
 * Global helper: Get current user info
 * (Depends on your auth system)
 */
function getCurrentUser() {
  // Adjust based on your auth system
  try {
    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
      return JSON.parse(token);
    }
  } catch (e) {
    // Token not valid JSON
  }
  return null;
}

/**
 * Global helper: Navigate to login if not authenticated
 * Useful for protected pages
 */
function requireAuthentication() {
  if (!isUserAuthenticated()) {
    window.location.href = 'login.html';
  }
}

/**
 * Global helper: Update user email in topbar
 */
function updateTopbarUserEmail(email) {
  const emailElement = document.getElementById('user-email');
  if (emailElement) {
    emailElement.textContent = email;
  }
}

/**
 * Global helper: Set topbar variant
 * @param {string} variant - 'authenticated', 'with-back', 'minimal', or 'default'
 */
function setTopbarVariant(variant) {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  // Remove all variant classes
  topbar.classList.remove(
    'topbar-authenticated',
    'topbar-with-back',
    'topbar-minimal'
  );

  // Add new variant if specified
  if (variant && variant !== 'default') {
    topbar.classList.add(`topbar-${variant}`);
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * INTEGRATION WITH AUTH SYSTEM
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * If using Supabase, set up listener for auth state changes:
 */

if (typeof supabase !== 'undefined') {
  // Watch for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    const emailElement = document.getElementById('user-email');
    
    if (session) {
      // User is logged in
      if (emailElement) {
        updateTopbarUserEmail(session.user.email);
      }
    } else {
      // User is logged out
      if (emailElement) {
        emailElement.textContent = '';
      }
    }
  });
}

/**
 * ═════════════════════════════════════════════════════════════════════════ */
