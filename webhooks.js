`use strict`;
const { dialogflow, Suggestions, SignIn, Table } = require("actions-on-google");
const intent_json = require("./read_intent.js");

// Instantiate the Dialogflow client.
const app = dialogflow({
  debug: true,
  clientId:
    "434450954455-6nrg01cnpup2g8j5mlkn9v05rd2b3e09.apps.googleusercontent.com",
});
//************************************************************************** */
// Maintain where our guest is in the conversation.  I was thinking the context
// within Dialogflow should give me what I want regarding where we are in the
// conversation.  However, there are several intents where the state matters
// based on how many times the guest has returned as well as whether we have
// their email.
const conv_states = {
  WELCOME: {
    DEFAULT_WELCOME: "welcome",
    DEFAULT_WELCOME_BACK: "welcome.back",
    DEFAULT_WELCOME_GOT_EMAIL: "welcome.gotemail",
    DEFAULT_WELCOME_MONITOR: "welcome.monitor",
  },
};
let conv_state = conv_states.WELCOME.DEFAULT_WELCOMEv;
//************************************************************************** */
// HELPER FUNCTIONS
//************************************************************************** */
const random_text = (text_list) =>
  text_list[Math.floor(Math.random() * text_list.length)];
//************************************************************************** */
// HANDLE INTENTS
//************************************************************************** */
// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent("Default Welcome Intent", (conv) => {
  console.log(">> DEFAULT WELCOME INTENT <<");
  // If we have already gotten guest info, we don't need a welcome..
  try {
    // If the email is there, the guest has already gone through us
    // asking for permission to getting profile information.  So we
    // don't need to repeat that interaction.
    email = conv.user.profile.payload.email;
    first_name = conv.user.profile.payload.first_name;
    last_name = conv.user.profile.payload.given_name;

    // Instead of starting with a default welcome, we start with monitor information.
    // and ask if the guest wants to compare with the rest of the class.
    const welcome_monitor = intent_json.read_intent("default_welcome_monitor");
    if (conv_state == conv_states.WELCOME.DEFAULT_WELCOME_GOT_EMAIL) {
      conv.ask(welcome_monitor["T0"]);
    } else {
      conv.ask(random_text(welcome_monitor["text"]));
    }
    if (conv.screen) {
      conv.ask(new Suggestions(welcome_monitor["chips"]));
    }
    conv_state = conv_states.WELCOME.DEFAULT_WELCOME_MONITOR;
  } catch (e) {
    console.log("***");
    console.log(e);
    // Start the conversation to get guest info on whether this guest
    // has previously started a conversation with us.
    let welcome = {};
    if (conv.user.last.seen) {
      conv_state = conv_states.WELCOME.DEFAULT_WELCOME_BACK;
      welcome = intent_json.read_intent("default_welcome_back");
      conv.ask(random_text(welcome["text"]));
    } else {
      // This is the first time the guest has started a FHconversation.
      conv_state = conv_states.WELCOME.DEFAULT_WELCOME;
      welcome = intent_json.read_intent("Default Welcome");
      conv.ask(random_text(welcome["text"]));
    }
    if (conv.screen) {
      conv.ask(new Suggestions(welcome["chips"]));
    }
  }
});
//************************************************************************** */
// Our guest wants to start the class.  Ask permission to get their email.
app.intent("get_email", (conv) => {
  console.log(">> GET_EMAIL <<");
  const get_email = intent_json.read_intent("get_email");
  conv.ask(random_text(get_email["text"]));
  conv.ask(new Suggestions(get_email["chips"]));
});
//************************************************************************** */
// Handling the "signin helper" to get the guest's email.
app.intent("signin", (conv) => {
  console.log(">> SIGNIN <<");
  conv.ask(new SignIn());
});

app.intent("signin_handler", (conv, params, signin) => {
  console.log(">> SIGNIN_HANDLER <<");
  if (signin.status !== "OK") {
    return conv.ask("You need to sign in before using the app.");
  }
  // const access = conv.user.access.token;
  // possibly do something with access token

  const payload = conv.user.profile.payload;
  console.log(">>");
  console.log(payload);
  return conv.ask("Great! Thanks for signing in.");
});
//************************************************************************** */
// We're showing our guest the average amount of daily electricity they use.  Then
// asking if they want to compare with others in the class.
app.intent("compare_readings", (conv) => {
  console.log(">> COMPARE_READINGS <<");
  const compare_readings = intent_json.read_intent("compare_readings");
  conv.ask(random_text(compare_readings["text"]));
  if (conv.screen) {
    conv.ask(
      new Table({
        dividers: true,
        columns: ["Student", "Daily Avg. kWh"],
        rows: compare_readings["table"],
      })
    );
    conv.ask(new Suggestions(compare_readings["chips"]));
  }
});
app.intent("info", (conv) => {
  console.log(`>>info<<`);
  const conv_text = intent_json.read_intent("info");
  conv.ask(random_text(conv_text["text"]));
  if (conv.screen) {
    conv.ask(new Suggestions(conv_text["chips"]));
  }
});
app.intent("exit", (conv) => {
  console.log(`>>exit<<`);
  const conv_text = intent_json.read_intent("exit");
  conv.ask(random_text(conv_text["text"]));
  if (conv.screen) {
    conv.ask(new Suggestions(conv_text["chips"]));
  }
});
app.intent("activity", (conv) => {
  console.log(`>>activity<<`);
  const conv_text = intent_json.read_intent("activity");
  conv.ask(random_text(conv_text["text"]));
  if (conv.screen) {
    conv.ask(new Suggestions(conv_text["chips"]));
  }
});

app.intent("Default Fallback Intent", (conv) => {
  console.log(">> DEFAULT_FALLBACK <<");
  console.log("**> CONVERSATION STATE: " + conv_state);
  let end_conv = false;
  let default_conv = {};
  switch (conv_state) {
    case conv_states.WELCOME.DEFAULT_WELCOME_MONITOR:
      default_conv = intent_json.read_intent(
        "default_welcome_monitor_fallback"
      );
      break;
    default:
      default_conv["text"] =
        "I'm totally confused and probably frustrating you.  I'm going to end the conversation. ";
      default_conv["chips"] = [];
      end_conv = true;
  }
  conv.ask(conv.ask(random_text(default_conv["text"])));
  if (conv.screen) {
    conv.ask(new Suggestions(default_conv["chips"]));
  }
  if (end_conv) {
    conv.close("Hope to talk with you again!");
  }
});

module.exports = app;
