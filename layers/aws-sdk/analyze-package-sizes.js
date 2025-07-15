const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const functionsDir = path.resolve(__dirname, 'functions'); // adjust if needed
const serverlessDir = path.resolve(__dirname, '.serverless');

const ZIP_LIMIT_MB = 50;
const ZIP_WARN_MB = 45;

const NODE_MODULES_LIMIT_MB = 250;
const NODE_MODULES_WARN_MB = 240;

function getFolderSizeMB(folderPath) {
  try {
    const sizeInBytes = execSync(`du -sb ${folderPath} | cut -f1`).toString().trim();
    return parseInt(sizeInBytes, 10) / (1024 * 1024); // Convert to MB
  } catch (err) {
    return -1;
  }
}

function getZipSizes() {
  if (!fs.existsSync(serverlessDir)) {
    console.warn(`⚠️  Folder ".serverless" not found. Run "sls package" first.`);
    return;
  }

  const zips = fs.readdirSync(serverlessDir).filter(file => file.endsWith('.zip'));
  console.log(`📦 Lambda Package .zip Files in .serverless:`);

  zips.forEach(zip => {
    const zipPath = path.join(serverlessDir, zip);
    const sizeMB = fs.statSync(zipPath).size / (1024 * 1024);
    const warning = sizeMB > ZIP_WARN_MB ? '⚠️' : '';
    const tooBig = sizeMB > ZIP_LIMIT_MB ? '❌ Too Large!' : '';
    console.log(`  - ${zip}: ${sizeMB.toFixed(2)} MB ${warning} ${tooBig}`);
  });

  console.log();
}

function getFunctionNodeModulesSizes() {
  if (!fs.existsSync(functionsDir)) {
    console.log('⚠️  No "functions" directory found.');
    return;
  }

  const funcs = fs.readdirSync(functionsDir).filter(name =>
    fs.statSync(path.join(functionsDir, name)).isDirectory()
  );

  console.log(`📂 node_modules Sizes Per Function:`);

  funcs.forEach(funcName => {
    const nmPath = path.join(functionsDir, funcName, 'node_modules');
    if (!fs.existsSync(nmPath)) {
      console.log(`  - ${funcName}/node_modules: Not found`);
      return;
    }

    const sizeMB = getFolderSizeMB(nmPath);
    const warning = sizeMB > NODE_MODULES_WARN_MB ? '⚠️' : '';
    const tooBig = sizeMB > NODE_MODULES_LIMIT_MB ? '❌ Too Large!' : '';
    console.log(`  - ${funcName}/node_modules: ${sizeMB.toFixed(2)} MB ${warning} ${tooBig}`);
  });
}

// Run checks
getZipSizes();
getFunctionNodeModulesSizes();