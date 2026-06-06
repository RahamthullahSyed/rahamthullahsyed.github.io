const fs = require('fs');

function run() {
  const html = fs.readFileSync('dev_page.html', 'utf8');
  
  // We want to segment the HTML into blocks for each app details link.
  // Google Play Developer page HTML contains blocks containing "/store/apps/details?id=PACKAGE"
  // Let's find all detail links and their character indices.
  const packageRegex = /\/store\/apps\/details\?id=([a-zA-Z0-9._-]+)/g;
  let match;
  const occurrences = [];
  while ((match = packageRegex.exec(html)) !== null) {
    occurrences.push({
      pkg: match[1],
      index: match.index
    });
  }
  
  console.log(`Found ${occurrences.length} detail link occurrences.`);
  
  // Group by unique packages and track their positions
  const packagesMap = {};
  occurrences.forEach(occ => {
    if (!packagesMap[occ.pkg]) {
      packagesMap[occ.pkg] = [];
    }
    packagesMap[occ.pkg].push(occ.index);
  });
  
  // For each package, let's look at the HTML content around its occurrences
  // Typically, the images for a package card appear within a few thousand characters of its details link.
  const results = {};
  
  for (const pkg of Object.keys(packagesMap)) {
    const indices = packagesMap[pkg];
    // Find the first index and scan 4000 characters before and after it.
    const startScan = Math.max(0, indices[0] - 2000);
    const endScan = Math.min(html.length, indices[0] + 5000);
    const slice = html.substring(startScan, endScan);
    
    // Find all googleusercontent image URLs in this slice
    const imgRegex = /(https:\/\/play-lh\.googleusercontent\.com\/[a-zA-Z0-9_=-]+)/g;
    let imgMatch;
    const foundImages = [];
    while ((imgMatch = imgRegex.exec(slice)) !== null) {
      const cleanUrl = imgMatch[1].split('=')[0];
      if (!foundImages.includes(cleanUrl)) {
        foundImages.push(cleanUrl);
      }
    }
    
    results[pkg] = foundImages;
    console.log(`Package: ${pkg}`);
    foundImages.forEach((url, i) => {
      console.log(`  Img ${i}: ${url}`);
    });
  }
}

run();
