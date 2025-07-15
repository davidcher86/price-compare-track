const fs = require('fs');
const path = require('path');

const SERVERLESS_FOLDER = path.resolve(__dirname, '..', '.serverless');
const ZIP_WARN_MB = 45;  // AWS Lambda direct upload soft warning (limit is 50MB zipped)
const ZIP_HARD_LIMIT_MB = 50;

function checkZipSizes() {
  if (!fs.existsSync(SERVERLESS_FOLDER)) {
    console.error(`❌ .serverless folder not found. Run "sls package" first.`);
    return;
  }

  const files = fs.readdirSync(SERVERLESS_FOLDER).filter(f => f.endsWith('.zip'));

  if (files.length === 0) {
    console.log(`ℹ️ No .zip files found in .serverless folder.`);
    return;
  }

  console.log(`📦 Packaged Lambda .zip files in .serverless:\n`);

  files.forEach(file => {
    const filePath = path.join(SERVERLESS_FOLDER, file);
    const stats = fs.statSync(filePath);
    const sizeMB = stats.size / (1024 * 1024);

    let status = '';
    if (sizeMB > ZIP_HARD_LIMIT_MB) {
      status = '❌ TOO LARGE (over 50MB zipped)';
    } else if (sizeMB > ZIP_WARN_MB) {
      status = '⚠️ Near AWS limit';
    }

    console.log(`  - ${file}: ${sizeMB.toFixed(2)} MB ${status}`);
  });
}

checkZipSizes();
