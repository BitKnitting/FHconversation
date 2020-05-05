const path = require("path");

// Base file name
console.log(path.basename(__filename));

// Directory name
console.log(path.dirname(__filename));

// File extension
console.log(path.extname(__filename));

// Create path object
console.log(path.parse(__filename).base);

// Concatenate paths
console.log(path.join(__dirname, "test", "hello.html"));

// More examples

// get the path delimiter base on the current OS Environment
const platSpec = path.delimiter;

console.log(platSpec);

console.log(path.join(__dirname, "..", "locales"));
