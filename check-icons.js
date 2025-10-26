const fs = require('fs');
const path = require('path');

const componentsDir = './src/components';

function checkIcons(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      checkIcons(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const iconMatches = content.match(/([A-Z][a-zA-Z]+)\s*{/g);
      if (iconMatches) {
        const iconsUsed = [...new Set(iconMatches.map(match => match.replace(/\s*{/, '')))];
        const imports = content.match(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/);
        if (imports) {
          const importedIcons = imports[1].split(',').map(i => i.trim());
          for (const icon of iconsUsed) {
            if (!importedIcons.includes(icon)) {
              console.log(`⚠️  ${filePath} usa ${icon} pero no está importado`);
            }
          }
        }
      }
    }
  });
}

checkIcons(componentsDir);