const intent_json = require("./read_intent.js");
welcome = intent_json.read_intent("default_welcome_back");
console.log(welcome["chips"]);
