import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '../components/ui');

const prefixMap = {
  'avatar-fallback.vue': 'UiAvatarFallback',
  'avatar-image.vue': 'UiAvatarImage',
  'avatar.vue': 'UiAvatar',
  'badge.vue': 'UiBadge',
  'button.vue': 'UiButton',
  'card-content.vue': 'UiCardContent',
  'card-description.vue': 'UiCardDescription',
  'card-footer.vue': 'UiCardFooter',
  'card-header.vue': 'UiCardHeader',
  'card-title.vue': 'UiCardTitle',
  'card.vue': 'UiCard',
  'dialog-content.vue': 'UiDialogContent',
  'dialog-description.vue': 'UiDialogDescription',
  'dialog-footer.vue': 'UiDialogFooter',
  'dialog-header.vue': 'UiDialogHeader',
  'dialog-title.vue': 'UiDialogTitle',
  'dialog.vue': 'UiDialog',
  'dropdown-menu-content.vue': 'UiDropdownMenuContent',
  'dropdown-menu-item.vue': 'UiDropdownMenuItem',
  'dropdown-menu-label.vue': 'UiDropdownMenuLabel',
  'dropdown-menu-separator.vue': 'UiDropdownMenuSeparator',
  'dropdown-menu.vue': 'UiDropdownMenu',
  'input.vue': 'UiInput',
  'label.vue': 'UiLabel',
  'progress.vue': 'UiProgress',
  'scroll-area.vue': 'UiScrollArea',
  'select.vue': 'UiSelect',
  'separator.vue': 'UiSeparator',
  'skeleton.vue': 'UiSkeleton',
  'table-body.vue': 'UiTableBody',
  'table-cell.vue': 'UiTableCell',
  'table-head.vue': 'UiTableHead',
  'table-header.vue': 'UiTableHeader',
  'table-row.vue': 'UiTableRow',
  'table.vue': 'UiTable',
  'tabs-content.vue': 'UiTabsContent',
  'tabs-list.vue': 'UiTabsList',
  'tabs-trigger.vue': 'UiTabsTrigger',
  'tabs.vue': 'UiTabs',
  'textarea.vue': 'UiTextarea',
  'tooltip.vue': 'UiTooltip'
};

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.vue')) return;
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace defineOptions name with Ui-prefixed component name to prevent recursion
  if (prefixMap[file]) {
    content = content.replace(/defineOptions\(\{\s*name:\s*['"][^'"]+['"]\s*\}\)/g, `defineOptions({ name: '${prefixMap[file]}' })`);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated name for ${file} -> ${prefixMap[file]}`);
  }
});
