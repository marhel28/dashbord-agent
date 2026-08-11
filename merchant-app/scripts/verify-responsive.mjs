import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Colors for CLI output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let totalErrors = 0;
let totalWarnings = 0;
let totalPassed = 0;

function logPass(rule, msg) {
  console.log(`${GREEN}✔ PASS:${RESET} [${BOLD}${rule}${RESET}] ${msg}`);
  totalPassed++;
}

function logFail(rule, msg) {
  console.log(`${RED}✖ FAIL:${RESET} [${BOLD}${rule}${RESET}] ${msg}`);
  totalErrors++;
}

function logWarn(rule, msg) {
  console.log(`${YELLOW}⚠ WARN:${RESET} [${BOLD}${rule}${RESET}] ${msg}`);
  totalWarnings++;
}

// 1. Signature Theme Tokens
const REQUIRED_TOKENS = [
  '--wp-gold',
  '--wp-gold-light',
  '--wp-gold-dark',
  '--wp-navy',
  '--wp-surface',
  '--wp-bg',
  '--wp-text',
  '--wp-text-secondary',
  '--wp-border',
  '--wp-success',
  '--wp-warning',
  '--wp-error'
];

/**
 * Helper to recursively discover files matching extension
 */
function getFiles(dir, ext = '.vue') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  }
  return results;
}

/**
 * RULE 1: Theme Token Preservation (assets/css/main.css)
 */
function verifyThemeTokens() {
  console.log(`\n${CYAN}--- [Rule 1] Theme Token Preservation ---${RESET}`);
  const cssPath = path.join(ROOT_DIR, 'assets', 'css', 'main.css');
  if (!fs.existsSync(cssPath)) {
    logFail('Theme Tokens', `assets/css/main.css not found`);
    return;
  }

  const rawContent = fs.readFileSync(cssPath, 'utf8');
  // Strip CSS comments (/* ... */) before checking theme tokens
  const content = rawContent.replace(/\/\*[\s\S]*?\*\//g, '');

  let missing = [];
  for (const token of REQUIRED_TOKENS) {
    if (!content.includes(token)) {
      missing.push(token);
    }
  }

  if (missing.length === 0) {
    logPass('Theme Tokens', `assets/css/main.css contains all 12 Warung Pintar signature CSS design tokens.`);
  } else {
    logFail('Theme Tokens', `assets/css/main.css is missing required tokens: ${missing.join(', ')}`);
  }

  // Verify dark mode overrides
  if (content.includes('.dark-mode') || content.includes('.dark')) {
    logPass('Theme Tokens', `assets/css/main.css contains dark mode theme overrides.`);
  } else {
    logFail('Theme Tokens', `assets/css/main.css missing dark mode theme overrides (.dark-mode, .dark).`);
  }
}

/**
 * RULE 2: Breakpoint Lock & Mobile Layout Shell (layouts/default.vue)
 */
function verifyLayoutShell() {
  console.log(`\n${CYAN}--- [Rule 2] Breakpoint Lock & Layout Shell (768px / md:) ---${RESET}`);
  const layoutPath = path.join(ROOT_DIR, 'layouts', 'default.vue');
  if (!fs.existsSync(layoutPath)) {
    logFail('Layout Shell', `layouts/default.vue not found`);
    return;
  }

  const content = fs.readFileSync(layoutPath, 'utf8');

  // Check 768px breakpoint lock (`md:`) vs non-`md:` (lg:, xl:, 2xl:) in default layout shell
  const asideClassMatch = content.match(/<aside[^>]*class=["']([^"']+)["']/);
  const headerClassMatches = [...content.matchAll(/<header[^>]*class=["']([^"']+)["']/g)].map(m => m[1]);
  const navClassMatches = [...content.matchAll(/<nav[^>]*class=["']([^"']+)["']/g)].map(m => m[1]);

  let breakpointErrors = [];

  if (!asideClassMatch) {
    breakpointErrors.push('Missing <aside> element in layouts/default.vue');
  } else {
    const asideClasses = asideClassMatch[1].split(/\s+/);
    const hasMdDisplay = asideClasses.includes('md:flex') || asideClasses.includes('md:block');
    const hasInvalidBp = asideClasses.some(c => /^(lg|xl|2xl):(flex|block|grid|hidden)$/.test(c));
    if (!hasMdDisplay || hasInvalidBp) {
      breakpointErrors.push('<aside> must use md:flex for 768px desktop visibility and avoid lg:, xl:, 2xl:');
    }
  }

  if (headerClassMatches.length === 0) {
    breakpointErrors.push('Missing <header> elements in layouts/default.vue');
  } else {
    for (const hClassStr of headerClassMatches) {
      const hClasses = hClassStr.split(/\s+/);
      const hasInvalidBp = hClasses.some(c => /^(lg|xl|2xl):(flex|block|grid|hidden)$/.test(c));
      if (hasInvalidBp) {
        breakpointErrors.push('<header> uses invalid breakpoint class (lg:, xl:, or 2xl:)');
      }
      // Check mobile header (not hidden on base)
      if (!hClasses.includes('hidden') && !hClasses.includes('md:hidden')) {
        breakpointErrors.push('Mobile <header> must specify md:hidden');
      }
      // Check desktop header (hidden on base)
      if (hClasses.includes('hidden') && (!hClasses.includes('md:flex') && !hClasses.includes('md:block'))) {
        breakpointErrors.push('Desktop <header> must specify md:flex or md:block');
      }
    }
  }

  for (const nClassStr of navClassMatches) {
    const nClasses = nClassStr.split(/\s+/);
    if (nClasses.some(c => /^(lg|xl|2xl):(flex|block|grid|hidden)$/.test(c))) {
      breakpointErrors.push('<nav> uses invalid breakpoint class (lg:, xl:, or 2xl:)');
    }
  }

  if (breakpointErrors.length > 0) {
    logFail('Breakpoint Lock', `layouts/default.vue failed strict 768px (md:) breakpoint lock check: ${breakpointErrors.join('; ')}`);
  } else {
    logPass('Breakpoint Lock', `layouts/default.vue correctly uses 768px (md:) breakpoint lock for responsive layout.`);
  }

  // Check Mobile Bottom Navigation Bar presence
  const mobileNavCompPath = path.join(ROOT_DIR, 'components', 'MobileBottomNav.vue');
  const hasMobileNavComp = fs.existsSync(mobileNavCompPath);

  const hasBottomNav = /<nav[^>]*class=["'][^"']*\bfixed\b[^"']*\bbottom-0\b[^"']*["']/.test(content) ||
                       /<MobileBottomNav\b/.test(content) ||
                       hasMobileNavComp;

  if (hasBottomNav) {
    logPass('Mobile Bottom Nav', `Mobile bottom navigation bar is present.`);
  } else {
    logFail('Mobile Bottom Nav', `layouts/default.vue is missing a fixed bottom navigation bar container or <MobileBottomNav> component.`);
  }

  // Check Mobile Bottom Nav item count, link validity, and duplicate items
  let navHtml = null;
  if (hasMobileNavComp) {
    navHtml = fs.readFileSync(mobileNavCompPath, 'utf8');
  } else {
    const navMatch = content.match(/<nav[^>]*class=["'][^"']*\bbottom-0\b[\s\S]*?<\/nav>/);
    if (navMatch) {
      navHtml = navMatch[0];
    }
  }

  if (navHtml) {
    const linkMatches = navHtml.match(/<NuxtLink\b/g);
    const linkCount = linkMatches ? linkMatches.length : 0;
    const hasDuplicateProfil = (navHtml.match(/Profil/g) || []).length > 1;

    // Check duplicate routes (e.g. multiple links pointing to same route)
    const routes = [...navHtml.matchAll(/to=["']([^"']+)["']/g)].map(m => m[1]);
    const routeCounts = {};
    let hasDuplicateRoutes = false;
    for (const r of routes) {
      routeCounts[r] = (routeCounts[r] || 0) + 1;
      if (routeCounts[r] > 1) {
        hasDuplicateRoutes = true;
      }
    }

    if (hasDuplicateProfil || hasDuplicateRoutes || linkCount > 5) {
      logFail('Mobile Bottom Nav', `Mobile bottom nav has ${linkCount} items (expected max 5 items with "Lainnya" drawer). Duplicate Profil/route links detected.`);
    } else {
      logPass('Mobile Bottom Nav', `Mobile bottom nav has optimal 5-item menu structure.`);
    }
  }

  // Check mobile main container bottom padding (pb-16 / pb-20)
  const hasBottomPadding = /pb-16|pb-20|pb-\[80px\]/.test(content);
  if (hasBottomPadding) {
    logPass('Mobile Content Padding', `layouts/default.vue content container has mobile bottom padding (pb-16/pb-20) to clear fixed bottom nav.`);
  } else {
    logFail('Mobile Content Padding', `layouts/default.vue main container lacks pb-16/pb-20 bottom padding to prevent bottom nav occlusion.`);
  }

  // Check Floating Action Button (Telegram FAB) bottom offset
  const hasFabOffset = /bottom-20|bottom-24|bottom:\s*['"]?80px['"]?/.test(content);
  if (hasFabOffset) {
    logPass('FAB Positioning', `layouts/default.vue Telegram FAB has mobile offset >= 80px (bottom-20).`);
  } else {
    logFail('FAB Positioning', `layouts/default.vue Telegram FAB should specify bottom-20 (80px) to clear bottom nav bar.`);
  }
}

/**
 * RULE 3: Table-to-Card Dual Rendering Assertion
 */
function verifyTableDualRendering() {
  console.log(`\n${CYAN}--- [Rule 3] Table-to-Card Dual Rendering Pattern ---${RESET}`);
  const pagesDir = path.join(ROOT_DIR, 'pages');
  const pageFiles = getFiles(pagesDir, '.vue');

  const primaryTablePages = ['index.vue', 'inventory.vue', 'sales-report.vue'];

  for (const file of pageFiles) {
    const relativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const fileName = path.basename(file);
    const content = fs.readFileSync(file, 'utf8');

    const hasTableTag = /<table\b/.test(content);
    if (hasTableTag) {
      // 1. Check if Desktop Table is wrapped in responsive hide class using strict md: breakpoint
      const hasDesktopTableHide = (
        /class=["'][^"']*\bhidden\b[^"']*\bmd:(block|table|flex|grid)\b[^"']*["'][^>]*>[\s\S]*?<table/.test(content) ||
        /class=["'][^"']*\bmd:(block|table|flex|grid)\b[^"']*\bhidden\b[^"']*["'][^>]*>[\s\S]*?<table/.test(content) ||
        /<table[^>]*class=["'][^"']*\bhidden\b[^"']*\bmd:/.test(content) ||
        /<table[^>]*class=["'][^"']*\bmd:[^"']*\bhidden\b/.test(content)
      );

      // 2. Check if Mobile Card View exists (md:hidden)
      const hasMobileCardView = (
        /class=["'][^"']*\b(block|flex|grid|space-y-\d+)\b[^"']*\bmd:hidden\b/.test(content) ||
        /class=["'][^"']*\bmd:hidden\b[^"']*\b(block|flex|grid|space-y-\d+)\b/.test(content) ||
        /<(Inventory|Transaction|Sales|Order|Product)CardView\b/.test(content) ||
        /v-for="[^"]+"[^>]*class=["'][^"']*\bmd:hidden\b/.test(content) ||
        /class=["'][^"']*\bmd:hidden\b/.test(content)
      );

      // 3. Reject legacy lg:, xl:, 2xl: breakpoints used for table/card toggling
      const hasLegacyBpInTable = /class=["'][^"']*\b(lg|xl|2xl):(hidden|block|table|flex|grid)\b[^"']*["'][^>]*>[\s\S]*?<table/.test(content) ||
                                 /<table[^>]*class=["'][^"']*\b(lg|xl|2xl):/.test(content);
      const hasLegacyBpInCards = /class=["'][^"']*\b(lg|xl|2xl):hidden\b/.test(content);

      const isValidDualRendering = hasDesktopTableHide && hasMobileCardView && !hasLegacyBpInTable && !hasLegacyBpInCards;

      if (isValidDualRendering) {
        logPass('Table Dual-Rendering', `${relativePath} implements table-to-card dual rendering (hidden md:block table + block md:hidden cards).`);
      } else {
        if (primaryTablePages.includes(fileName)) {
          logFail('Table Dual-Rendering', `${relativePath} contains desktop table without strict 768px (md:) dual rendering pair (Desktop Table Hide: ${hasDesktopTableHide}, Mobile Cards: ${hasMobileCardView}, Has Legacy lg/xl/2xl: ${hasLegacyBpInTable || hasLegacyBpInCards}).`);
        } else {
          logFail('Table Dual-Rendering', `${relativePath} contains table missing responsive hiding or mobile card alternative (strictly using md:).`);
        }
      }
    }
  }
}

/**
 * Helper to check if an element with fixed width is protected by overflow-x-auto or desktop hide
 */
function isElementProtectedFromOverflow(content, matchIndex) {
  const beforeMatch = content.slice(0, matchIndex);
  const lastOpenAngle = beforeMatch.lastIndexOf('<');
  const afterMatch = content.slice(matchIndex);
  const nextCloseAngle = afterMatch.indexOf('>');

  if (lastOpenAngle !== -1 && nextCloseAngle !== -1) {
    const fullTag = content.slice(lastOpenAngle, matchIndex + nextCloseAngle + 1);
    if (/overflow-x-auto/.test(fullTag) || /\bhidden\b[^"']*?\b(md|lg|xl|2xl):/.test(fullTag) || /\b(md|lg|xl|2xl):[^"']*?\bhidden\b/.test(fullTag) || /\b(md|lg|xl|2xl):hidden\b/.test(fullTag)) {
      return true;
    }
  }

  let pos = lastOpenAngle;
  let depth = 0;
  const voidTags = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source']);

  while (pos > 0) {
    const prevClose = content.lastIndexOf('>', pos - 1);
    if (prevClose === -1) break;
    const prevOpen = content.lastIndexOf('<', prevClose);
    if (prevOpen === -1) break;

    const tagContent = content.slice(prevOpen + 1, prevClose).trim();
    pos = prevOpen;

    if (!tagContent || tagContent.startsWith('!') || tagContent.startsWith('?')) continue;

    if (tagContent.startsWith('/')) {
      depth++;
      continue;
    }

    if (tagContent.endsWith('/')) {
      continue;
    }

    const tagNameMatch = tagContent.match(/^([a-zA-Z0-9-]+)/);
    if (tagNameMatch) {
      const tagName = tagNameMatch[1].toLowerCase();
      if (voidTags.has(tagName)) continue;
    }

    if (depth > 0) {
      depth--;
    } else {
      if (/overflow-x-auto/.test(tagContent) || /\bhidden\b[^"']*?\b(md|lg|xl|2xl):/.test(tagContent) || /\b(md|lg|xl|2xl):[^"']*?\bhidden\b/.test(tagContent) || /\b(md|lg|xl|2xl):hidden\b/.test(tagContent)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * RULE 4: Horizontal Overflow Risk & Grid Responsive Column Check
 */
function verifyOverflowPrevention() {
  console.log(`\n${CYAN}--- [Rule 4] Overflow Prevention & Grid Responsiveness ---${RESET}`);
  const pagesDir = path.join(ROOT_DIR, 'pages');
  const componentsDir = path.join(ROOT_DIR, 'components');
  const vueFiles = [...getFiles(pagesDir, '.vue'), ...getFiles(componentsDir, '.vue')];

  for (const file of vueFiles) {
    const relativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    // 1. Check for fixed pixel widths exceeding 320px without overflow-x-auto or desktop hide wrapper (Scoped per element)
    const fixedWidthRegex = /\b(w|min-w)-\[(\d{3,4})px\]/g;
    let fwMatch;
    while ((fwMatch = fixedWidthRegex.exec(content)) !== null) {
      const num = parseInt(fwMatch[2], 10);
      if (num > 320) {
        const isProtected = isElementProtectedFromOverflow(content, fwMatch.index);
        if (!isProtected) {
          logFail('Overflow Prevention', `${relativePath} contains fixed width ${fwMatch[0]} without overflow-x-auto or desktop hide container.`);
          break;
        }
      }
    }

    // 2. Check for grid multi-column definitions without mobile base column (Scoped per class attribute)
    const classAttrRegex = /class=["']([^"']+)["']/g;
    let classMatch;

    while ((classMatch = classAttrRegex.exec(content)) !== null) {
      const classStr = classMatch[1];
      const classList = classStr.split(/\s+/);

      const unPrefixedMultiCols = classList.filter(c => /^grid-cols-([3-9]|1[0-2])$/.test(c));

      if (unPrefixedMultiCols.length > 0) {
        const hasMobileBase = classList.includes('grid-cols-1') || classList.includes('grid-cols-2');
        const isHiddenOnMobile = classList.includes('hidden') && classList.some(c => /^(md|lg|xl|2xl):/.test(c));

        if (!hasMobileBase && !isHiddenOnMobile) {
          logFail('Grid Responsiveness', `${relativePath} specifies multi-column layout (${unPrefixedMultiCols.join(', ')}) without mobile single/double column fallback on the same element.`);
          break;
        }
      }
    }
  }
}

/**
 * MAIN EXECUTION
 */
console.log(`${CYAN}${BOLD}=====================================================${RESET}`);
console.log(`${CYAN}${BOLD}  Merchant App Responsive Verification Test Suite  ${RESET}`);
console.log(`${CYAN}${BOLD}=====================================================${RESET}`);

verifyThemeTokens();
verifyLayoutShell();
verifyTableDualRendering();
verifyOverflowPrevention();

console.log(`\n${CYAN}${BOLD}=====================================================${RESET}`);
console.log(`${CYAN}${BOLD}  VERIFICATION SUMMARY  ${RESET}`);
console.log(`${CYAN}${BOLD}=====================================================${RESET}`);
console.log(`  Passed Assertions:  ${GREEN}${totalPassed}${RESET}`);
console.log(`  Warnings:           ${YELLOW}${totalWarnings}${RESET}`);
console.log(`  Failures / Errors:  ${RED}${totalErrors}${RESET}`);
console.log(`${CYAN}${BOLD}=====================================================${RESET}\n`);

if (totalErrors > 0) {
  console.log(`${RED}${BOLD}✖ Responsive Verification Suite Failed with ${totalErrors} error(s).${RESET}`);
  console.log(`${YELLOW}Note: Baseline failures on unimplemented features are expected prior to M2-M4 implementation.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✔ All Responsive Assertions Passed Successfully!${RESET}\n`);
  process.exit(0);
}
