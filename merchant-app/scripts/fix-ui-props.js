import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '../components/ui');

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.vue')) return;
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  let updated = false;

  if (content.includes('props.class') && !content.includes('defineProps')) {
    content = content.replace(/<script setup lang="ts">/g, "<script setup lang=\"ts\">\nimport { cn } from '~/utils/cn'\n\nconst props = defineProps<{\n  class?: string\n}>()\n");
    updated = true;
  }

  if (content.includes('cn(') && !content.includes('import { cn }') && !content.includes("from '~/utils/cn'")) {
    content = content.replace(/<script setup lang="ts">/g, "<script setup lang=\"ts\">\nimport { cn } from '~/utils/cn'\n");
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed:', file);
  }
});
