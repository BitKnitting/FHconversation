// This utility code takes in text generated from the Sketch plugin
// and creates a json file of intents + text + chips.

const fs = require("fs");
const path = require("path");

const string_to_add = (line) => line.substr(line.indexOf(":") + 1);

let text = [];
const filename = __dirname + "/test.txt";

fs.readFileSync(filename)
  .toString()
  .split("\n")
  .forEach(function (line, index, arr) {
    // Text lines will be put into file.
    if (line.toUpperCase().startsWith("T:")) {
      text.push(string_to_add(line));
    }
  });

fn = path.join(__dirname, "..", "locales") + "/en.json";
fs.writeFileSync(fn, "{\n");

text.forEach((line, i) =>
  text.length - 1 == i
    ? fs.appendFileSync(fn, line + "\n")
    : fs.appendFileSync(fn, line + ",\n")
);
fs.appendFileSync(fn, "\n}");
