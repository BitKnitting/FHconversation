// This utility code takes in text generated from the Sketch plugin
// and creates a json file of intents + text + chips.

const fs = require("fs");

const is_dict_empty = (obj) => Object.keys(obj).length == 0;

const string_to_add = (line) => line.substr(line.indexOf(":") + 1);

// const text_lines = fs.readFileSync('FHconversation.txt','utf8');
let intents = [];
let dict = {};
let chips = [];
let table = [];
let text = [];
const filename = __dirname + "/FHconversation.txt";
//* tBD: We assume the table ui is sorted on the second column - which is a
// number since the only table ui is when readings are compared.  SO this
// is really not flexible.  It works for this one case.
const compareSecondColumn = (a, b) => {
  if (a[1] === b[1]) {
    return 0;
  } else {
    return a[1] < b[1] ? -1 : 1;
  }
};
fs.readFileSync(filename)
  .toString()
  .split("\n")
  .forEach(function (line, index, arr) {
    // Intent line will be the first line of an intent fulfillment.
    if (line.toUpperCase().startsWith("I:")) {
      // If this is the first intent, there is nothing to push.
      if (!is_dict_empty(dict)) {
        // Up to this point have been collecting lines that start with C:
        dict["chips"] = chips;
        dict["table"] = table;
        dict["text"] = text;
        dict["table"].sort(compareSecondColumn);
        intents.push(dict);
        dict = {};
        chips = [];
        table = [];
        text = [];
      }
      dict["intent"] = string_to_add(line);
    }
    if (line.toUpperCase().startsWith("T:")) {
      text.push(string_to_add(line));
    }
    //
    // T0 is the conversation if this is the first
    // time the guest is coming to this intent.
    if (line.toUpperCase().startsWith("T0:")) {
      dict["T0"] = string_to_add(line);
    }
    if (line.toUpperCase().startsWith("C:")) {
      chips.push(string_to_add(line));
    }
    if (line.toUpperCase().startsWith("TA:")) {
      line_to_parse = string_to_add(line);
      let row = line_to_parse.split(",");
      row[1] = parseFloat(row[1]);
      // let row = ["row 1 item 1", "row 1 item 2"];
      table.push(row);
    }
  });
dict["chips"] = chips;
dict["table"] = table;
dict["table"].sort(compareSecondColumn);
dict["text"] = text;
// The Json file is an array of intents.
intents.push(dict);
// Write the intents to a json file.
fs.writeFileSync(
  filename.replace(".txt", ".json"),
  JSON.stringify(intents, null, 4)
);
