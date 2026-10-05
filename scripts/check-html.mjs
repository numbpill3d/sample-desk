import { readFileSync, readdirSync } from 'node:fs';

let failures = 0;
const htmlFiles = readdirSync('.').filter((name) => name.endsWith('.html'));

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));

  for (const match of html.matchAll(/\bhref=["']#([^"']+)["']/gi)) {
    if (!ids.has(match[1])) {
      console.error(`${file}: missing target for #${match[1]}`);
      failures += 1;
    }
  }

  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    if (!match[1].trim()) continue;
    try {
      new Function(match[1]);
    } catch (error) {
      console.error(`${file}: inline JavaScript does not parse: ${error.message}`);
      failures += 1;
    }
  }
}

if (failures) process.exitCode = 1;
else console.log(`Checked ${htmlFiles.length} HTML files: anchors and inline JavaScript are valid.`);
