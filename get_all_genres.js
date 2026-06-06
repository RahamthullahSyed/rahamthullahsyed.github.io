const fs = require('fs');

const packages = [
  "com.play.tictactoe_ultimate",
  "com.learn.multiplicationmaster",
  "com.play.snakesvsladders",
  "com.play.magicsquare15",
  "com.play.tictactoe_2playerxoxochallenge",
  "com.play.arrowpuzzle",
  "com.play.pipelinkpuzzle",
  "com.sssgames.nut.color.sort.puzzle",
  "com.planning.mytimetable",
  "com.play.digitalpipelink",
  "com.play.digitalhockey",
  "com.play.snakepuzzle",
  "com.play.colorliquidsortpuzzle",
  "com.play.digitalsnake",
  "com.sss.snakesladderscardflip",
  "com.tool.reservoirinflowscalculator",
  "com.awareness.sip4future",
  "com.sssgames.galaxy_shooter_space_attack",
  "com.play.gravitydunk",
  "com.play.aerochallenge"
];

async function run() {
  console.log("Fetching play store categories for all 20 apps...");
  const results = {};
  
  for (const pkg of packages) {
    const url = `https://play.google.com/store/apps/details?id=${pkg}`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await res.text();
      
      // Parse category via itemProp applicationCategory
      let category = "";
      const itemPropMatch = html.match(/<meta[^>]*itemProp="applicationCategory"[^>]*content="([^"]+)"/i);
      if (itemPropMatch) {
        category = itemPropMatch[1];
      }
      
      // Parse JSON-LD as fallback or check
      let ldCategory = "";
      const ldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
      if (ldMatch) {
        try {
          const data = JSON.parse(ldMatch[1]);
          ldCategory = data.applicationCategory;
        } catch (e) {}
      }

      // Find any category links
      const categoryLinks = [];
      const linkRegex = /\/store\/apps\/category\/([a-zA-Z0-9_-]+)/g;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        if (!categoryLinks.includes(match[1])) {
          categoryLinks.push(match[1]);
        }
      }
      
      console.log(`${pkg}: itemProp=${category} | ld=${ldCategory} | links=${categoryLinks.join(',')}`);
      results[pkg] = {
        itemProp: category,
        ldCategory: ldCategory,
        links: categoryLinks
      };
      
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Error ${pkg}:`, err.message);
    }
  }
  
  fs.writeFileSync('scraped_categories.json', JSON.stringify(results, null, 2));
  console.log("Done! Saved to scraped_categories.json");
}

run();
