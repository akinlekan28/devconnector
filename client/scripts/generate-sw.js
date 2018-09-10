const manifest = require("../build/asset-manifest.json");
const fs = require("fs");
const swPath = "build/service-worker.js";
const urlsCSV = Object.keys(manifest)
  .filter(k => !k.includes(".map"))
  .map(k => manifest[k]);

fs.readFile(swPath, "utf8", (err, data) => {
  if (err) { return console.log("Error trying to read SW file", err); }

  const result = data.replace("%MANIFESTURLS%", JSON.stringify(urlsCSV));

  fs.writeFile(swPath, result, "utf8", err => {
    if (err) { return console.log("Error trying to write SW file", err); }
  });
});