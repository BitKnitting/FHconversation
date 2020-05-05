`use strict`;
const { dialogflow, SimpleResponse } = require("actions-on-google");
const path = require("path");
const i18n = require("i18n");

i18n.configure({
  directory: path.join(__dirname, "/locales"),
  objectNotation: true,
});
// Instantiate the Dialogflow client.
const app = dialogflow({
  debug: true,
  clientId:
    "434450954455-6nrg01cnpup2g8j5mlkn9v05rd2b3e09.apps.googleusercontent.com",
});

const speakPrefix = "<speak> ";
const speakSuffix = " </speak>";

/** Handles the Default Welcome intent. */
app.intent("Default Welcome Intent", (conv) => {
  if (conv.user.last.seen) {
    // Our guest has had a conversation with us before.
    const messageText = i18n.__("WELCOME_BACK_TEXT");
    const messageSpeech =
      speakPrefix + i18n.__("WELCOME_BACK_SPEECH") + speakSuffix;
    conv.ask(
      new SimpleResponse({
        speech: messageSpeech,
        text: messageText,
      })
    );
  } else {
    // This is the first time our guest is visiting us.
    const messageText = i18n.__("WELCOME_NEW_TEXT");
    const messageSpeech =
      speakPrefix + i18n.__("WELCOME_NEW_SPEECH") + speakSuffix;
    conv.ask(
      new SimpleResponse({
        speech: messageSpeech,
        text: messageText,
      })
    );
  }
});
module.exports = app;
