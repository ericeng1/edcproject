# 📋 Brand-Scoped Categories Deployment Checklist

Print this page and check off each item as you complete it.

---

## Pre-Deployment (5 min)

- [ ] Read README.md to understand what you're deploying
- [ ] Read QUICK_REFERENCE.md to understand the changes
- [ ] Backup current project files
  - [ ] form-shared.js (save old version)
  - [ ] form-atwood.html (save old version)
  - [ ] form-horton.html (save old version)
  - [ ] form-steelflame.html (save old version)
  - [ ] form-zachwoods.html (save old version)
- [ ] Review database: confirm `brand_categories` table exists with rows

---

## Code Replacement (5 min)

Replace these files in your project directory:

- [ ] Copy new form-shared.js to your project
- [ ] Copy new form-atwood.html to your project
- [ ] Copy new form-horton.html to your project
- [ ] Copy new form-steelflame.html to your project
- [ ] Copy new form-zachwoods.html to your project

---

## Local Testing (10 min)

Open local development server (e.g., `python -m http.server`):

### Test 1: Category Loading - Atwood
- [ ] Navigate to form-atwood.html
- [ ] Observe category chips load
- [ ] Verify seeing exactly 5 categories:
  - [ ] Knife
  - [ ] Pry bar
  - [ ] Bead
  - [ ] Spinner
  - [ ] Tool
- [ ] ✅ PASS / ❌ FAIL (Document failure)

### Test 2: Category Loading - Horton
- [ ] Navigate to form-horton.html
- [ ] Observe category chips load
- [ ] Verify seeing exactly 3 categories:
  - [ ] Pry bar
  - [ ] Bead
  - [ ] Patch
- [ ] ✅ PASS / ❌ FAIL (Document failure)

### Test 3: Category Loading - Steel Flame
- [ ] Navigate to form-steelflame.html
- [ ] Observe category chips load
- [ ] Verify seeing exactly 4 categories:
  - [ ] Tag
  - [ ] Spinner
  - [ ] Bead
  - [ ] Pendant
- [ ] ✅ PASS / ❌ FAIL (Document failure)

### Test 4: Category Loading - Zach Woods
- [ ] Navigate to form-zachwoods.html
- [ ] Observe category chips load
- [ ] Verify seeing exactly 8 categories:
  - [ ] WMD Tag
  - [ ] Tag
  - [ ] Knife
  - [ ] Pry bar
  - [ ] Bead
  - [ ] Falcon
  - [ ] Spinner
  - [ ] Carabiner
- [ ] ✅ PASS / ❌ FAIL (Document failure)

### Test 5: Materials Load Globally
- [ ] On any form, observe materials chips
- [ ] Verify materials are the same across all forms
- [ ] ✅ PASS / ❌ FAIL (Document failure)

### Test 6: Add New Category - Atwood
- [ ] On form-atwood.html, click "+ Add Category"
- [ ] Enter test name: "Test Category XYZ"
- [ ] Confirm dialog appears
- [ ] Click "Add"
- [ ] Observe new category appears in Atwood's list
- [ ] Reload page
- [ ] Verify new category still visible in Atwood's list
- [ ] ✅ PASS / ❌ FAIL (Document failure)

### Test 7: Add Same Category - Horton
- [ ] On form-horton.html, click "+ Add Category"
- [ ] Enter same test name: "Test Category XYZ"
- [ ] Confirm dialog appears
- [ ] Click "Add"
- [ ] Observe category appears in Horton's list
- [ ] Reload page
- [ ] Verify category visible in Horton's list
- [ ] Verify NOT visible in other brand forms
- [ ] ✅ PASS / ❌ FAIL (Document failure)

### Test 8: Browser Hard Refresh
- [ ] Hard refresh form-atwood.html (Cmd+Shift+R or Ctrl+Shift+R)
- [ ] Verify categories still correct
- [ ] Hard refresh form-horton.html
- [ ] Verify categories still correct
- [ ] Hard refresh form-steelflame.html
- [ ] Verify categories still correct
- [ ] Hard refresh form-zachwoods.html
- [ ] Verify categories still correct
- [ ] ✅ PASS / ❌ FAIL (Document failure)

---

## Browser Console Check (2 min)

- [ ] Open browser DevTools (F12)
- [ ] Navigate to each form
- [ ] Check Console tab for any errors
- [ ] Expected: No errors or warnings related to categories
- [ ] ✅ PASS / ❌ FAIL (Document failures)

---

## Staging Deployment (Optional but Recommended)

- [ ] Deploy files to staging environment
- [ ] Repeat "Local Testing" steps above on staging
- [ ] All tests pass on staging: ✅
- [ ] Team review staging: ✅

---

## Production Deployment (5 min)

- [ ] Notify team of deployment
- [ ] Deploy files to production:
  - [ ] form-shared.js
  - [ ] form-atwood.html
  - [ ] form-horton.html
  - [ ] form-steelflame.html
  - [ ] form-zachwoods.html
- [ ] Verify files deployed successfully
- [ ] CDN cache cleared (if applicable): ✅

---

## Post-Deployment Verification (5 min)

Navigate to production website:

### Quick Smoke Test
- [ ] Open form-atwood.html on production
- [ ] See 5 categories? ✅
- [ ] Open form-horton.html on production
- [ ] See 3 categories (different from Atwood)? ✅
- [ ] Open form-steelflame.html on production
- [ ] See 4 categories (different from others)? ✅
- [ ] Open form-zachwoods.html on production
- [ ] See 8 categories (different from others)? ✅

### Full Smoke Test
- [ ] Load each form, scroll through categories
- [ ] Try adding a test category on each form
- [ ] Verify test category appears only in correct brand
- [ ] Test in incognito window (fresh cache)
- [ ] Test on mobile device/responsive mode

### Monitoring
- [ ] Check production error logs for issues
- [ ] Monitor user feedback channels
- [ ] Watch for support tickets

---

## Rollback Plan (If Needed)

**Only if tests fail and you can't fix immediately:**

- [ ] Restore backed-up files:
  - [ ] Old form-shared.js
  - [ ] Old form-atwood.html
  - [ ] Old form-horton.html
  - [ ] Old form-steelflame.html
  - [ ] Old form-zachwoods.html
- [ ] Deploy rollback to production
- [ ] Verify categories load globally again
- [ ] Document what went wrong
- [ ] Schedule follow-up investigation

---

## Post-Deployment Tasks

- [ ] Update team documentation (if any)
- [ ] Update team knowledge base
- [ ] Archive old backups (or keep for rollback window: ______ days)
- [ ] Close related tickets/PRs
- [ ] Celebrate! 🎉

---

## Troubleshooting Notes

**If Test X fails, document here:**

```
Test: _________________
Error: _________________
Solution Attempted: _________________
Result: _________________
Escalate to: _________________
```

---

## Sign-Off

- **Deployed by:** _________________ **Date:** _______
- **Tested by:** _________________ **Date:** _______
- **Approved by:** _________________ **Date:** _______

---

## Notes Section

```
General notes about deployment:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Quick Reference (Copy to Phone/Print)

**If something breaks:**
1. Check browser console for errors
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Check Supabase logs for query errors
4. Verify BRAND_ID constant in form file
5. Contact: _________________

**Expected after deployment:**
- Atwood form → 5 categories
- Horton form → 3 categories
- Steel Flame form → 4 categories
- Zach Woods form → 8 categories

---

**Deployment Status:** [ ] In Progress [ ] Complete [ ] Rolled Back

**Date Completed:** ________________________

**Final Notes:** ________________________________________________________________
