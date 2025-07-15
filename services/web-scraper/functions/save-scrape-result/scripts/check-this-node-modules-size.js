const fs = require('fs');
const path = require('path');

const NODE_MODULES_WARN_MB = 240;
const NODE_MODULES_LIMIT_MB = 250;

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
    return totalBytes / (1024 * 1024); // MB
  } catch (err) {
    return -1;
  }
}

function listPackageSizes() {
  if (!fs.existsSync(nodeModulesPath)) {
    console.error(`❌ node_modules folder not found in this function.`);
    return;
  }

  const packages = fs.readdirSync(nodeModulesPath).filter(p => p !== '.bin');

  const totalSize = getFolderSizeMB(nodeModulesPath);
  const status =
    totalSize > NODE_MODULES_LIMIT_MB
      ? '❌ TOO LARGE'
      : totalSize > NODE_MODULES_WARN_MB
      ? '⚠️ Near limit'
      : '';

  console.log(`📦 node_modules - Total size: ${totalSize.toFixed(2)} MB ${status}`);

  packages.sort().forEach(pkg => {
    const pkgPath = path.join(nodeModulesPath, pkg);

    if (pkg.startsWith('@')) {
      const scopedPkgs = fs.readdirSync(pkgPath);
      for (const subPkg of scopedPkgs) {
        const scopedPath = path.join(pkgPath, subPkg);
        const sizeMB = getFolderSizeMB(scopedPath);
        console.log(`  - ${pkg}/${subPkg}: ${sizeMB.toFixed(2)} MB`);
      }
    } else {
      const sizeMB = getFolderSizeMB(pkgPath);
      console.log(`  - ${pkg}: ${sizeMB.toFixed(2)} MB`);
    }
  });
}

listPackageSizes();
