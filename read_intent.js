// This utility reads in the FHconversation dictionaries
// and returns the one the requester is looking for.
const fs = require("fs");

exports.read_intent = (intent_name) => {
  const filename = __dirname + "/design/FHconversation.json";

  try {
    const jsonString = fs.readFileSync(filename);
    intents = JSON.parse(jsonString);
  } catch (err) {
    console.log(err);
  }
  for (let dict of intents) {
    if (dict["intent"] == intent_name) {
      return dict;
    }
  }
  // Couldn't find a match for intent_name.
  return {};
};
