const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');

function getFolderSizeMB(folderPath) {
  let totalBytes = 0;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        try {
          totalBytes += fs.statSync(fullPath).size;
        } catch (_) {}
      }
    }
  }

  try {
    walk(folderPath);
    return totalBytes / (1024 * 1024); // Convert to MB
  } catch (err) {
    return -1;
  }
}

function listPackageSizes() {
  if (!fs.existsSync(nodeModulesPath)) {
    console.error(`❌ node_modules folder not found in: ${nodeModulesPath}`);
    return;
  }

  const packages = fs.readdirSync(nodeModulesPath).filter(p => p !== '.bin');

  console.log(`📦 Package sizes in ${nodeModulesPath}:\n`);

  for (const pkg of packages) {
    const fullPath = path.join(nodeModulesPath, pkg);

    // Handle scoped packages like @aws-sdk/*
    if (pkg.startsWith('@')) {
      const scopedPkgs = fs.readdirSync(fullPath);
      for (const subPkg of scopedPkgs) {
        const scopedPath = path.join(fullPath, subPkg);
        const sizeMB = getFolderSizeMB(scopedPath);
        console.log(`  - ${pkg}/${subPkg}: ${sizeMB.toFixed(2)} MB`);
      }
    } else {
      const sizeMB = getFolderSizeMB(fullPath);
      console.log(`  - ${pkg}: ${sizeMB.toFixed(2)} MB`);
    }
  }
}

listPackageSizes();
