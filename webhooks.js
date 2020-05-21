`use strict`;
const {
  dialogflow,
  SimpleResponse,
  SignIn,
  Suggestions,
} = require("actions-on-google");
const path = require("path");
const i18n = require("i18n");
const chalk = require("chalk");

const log = console.log;
//************************************ */
// Used for suggestion chips.
const intentValue = {
  INFO: 0,
  IMPACT: 1,
  use: 2,
  activity: 3,
  rank: 4,
};

//************************************ */
// colors used for logging.
// Beginning of intent
const boi = chalk.black.bgYellow.bold;
// Messages
const msg = chalk.yellowBright.bold;
const info = chalk.greenBright.bold;
//************************************ */
i18n.configure({
  directory: path.join(__dirname, "/locales"),
  objectNotation: true,
});
// Instantiate the Dialogflow client.
// We need the guest's email to link with their monitor.
// Go to console.actions.google.com -> account linking to see the clientId.
const app = dialogflow({
  debug: true,
  clientId:
    "434450954455-6nrg01cnpup2g8j5mlkn9v05rd2b3e09.apps.googleusercontent.com",
});

const speakPrefix = "<speak> ";
const speakSuffix = " </speak>";

/** Returns a single random element from some array */
const getSingleRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
/** Returns what to do string ignoring the except ToDo (see ToDos above.  except is one of those strings) */
const whatToDoExcept = (except) => {
  while (true) {
    const what_to_do = getSingleRandom(i18n.__("WHAT_TO_DO_TEXT"));
    log(msg("**" + what_to_do + "**"));
    if (!what_to_do.toLowerCase().includes(except)) {
      log(msg("--" + what_to_do + "--"));
      return what_to_do;
    }
  }
};

//************************************************************************** */
// Handle the Default Welcome Intent
// The associated Google Action has Account Linking enabled.  This means, the
// First time through will have the email/name.  And the last.seen will have
// a value.  So what we need to do is to know if our guest is coming from account
// linking prior to.  This will be based on the query.
// GOOGLE
//
// To see what apps have access to your account, check out https://myaccount.google.com/permissions
//******************************************************************************* */
//                OPENING CONVERSATION
//******************************************************************************* */
app.intent("Default Welcome Intent", (conv) => {
  // Have 6 suggestion chips
  conv.data.intentFullfilled = [0, 0, 0, 0, 0];
  let prompt = "Default Welcome Intent";
  log(boi(`>>` + prompt + `<<`));
  let messageSpeech = "";
  let messageText = "";
  if (conv.user.last.seen) {
    log(msg("--> user has used our action before"));
    const payload = conv.user.profile.payload;
    if (payload == undefined) {
      prompt = prompt + "-no email";
      log(msg("--> we do not have email"));
      log(payload);
      // Our guest has had a conversation with us before.
      // If that is true, then we have their email and name. Because
      // The Google Signin helper has been invoked because we have
      // account linking turned on for this action.
      messageText = i18n.__("WELCOME_BACK_TEXT");

      messageSpeech =
        speakPrefix + i18n.__("WELCOME_BACK_SPEECH") + speakSuffix;
      conv.ask(
        new SimpleResponse({
          speech: messageSpeech,
          text: messageText,
        })
      );
    } else {
      prompt = prompt + "-email";
      log(msg("--> we have email"));
      first_name = conv.user.profile.payload.given_name;
      // What our guest can do next.
      things_to_do = [showRanking, showImpact, showInfo, showActivity];
      messageTextPrefix =
        getSingleRandom(i18n.__("WELCOME_BACK_PREFIX")) + first_name + ".  ";
      conv.ask(
        new SimpleResponse({
          speech: messageTextPrefix,
          text: messageTextPrefix,
        })
      );
      // Pick a function
      whatToShow = getSingleRandom(things_to_do);
      // Invoke the functon.
      whatToShow(conv);
    }
  } else {
    log(msg("--> first visit"));
    prompt = prompt + "_first_visit";
    // This is the first time our guest is visiting us.
    messageText = i18n.__("WELCOME_NEW_TEXT");
    messageSpeech = speakPrefix + i18n.__("WELCOME_NEW_SPEECH") + speakSuffix;
    conv.ask(
      new SimpleResponse({
        speech: messageSpeech,
        text: messageText,
      })
    );
  }
});
//************************************************************************** */
// Handling the SignIn Intent (SignIn google helper)
app.intent("signin", (conv) => {
  log(boi(">> SIGNIN <<"));
  // Invoke the SignIn Google Helper.
  conv.ask(new SignIn());
});
// When the SignIn Google Helper returns, we have set up this intent to be called back.
// By setting the Google Assistant Sign-In event for this intent w/in Dialogflow.
app.intent("signin_handler", (conv, params, signin) => {
  log(boi(">> SIGNIN_HANDLER <<"));
  if (signin.status !== "OK") {
    return conv.ask("You need to sign in before using the app.");
  }
  // const access = conv.user.access.token;
  // possibly do something with access token

  return conv.ask("Great! Thanks for signing in.");
});
//******************************************************************************* */
//                RANKING
//******************************************************************************* */
app.intent("rank", (conv) => {
  log(boi(`>>rank<<`));
  showRanking(conv);
});
//********************************************************************************* */
const showRanking = (conv) => {
  log(boi("SHOW RANKING"));
  messageText = i18n.__("MY_RANKING_TEXT");
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
  recordsIntentFulfillment(conv, "rank");
  conv.ask(new Suggestions(selectSuggestionChips(conv, "activity")));
};

//******************************************************************************* */
//                IMPACT
//******************************************************************************* */
app.intent("IMPACT", (conv) => {
  log(boi(`>>IMPACT<<`));

  showImpact(conv);
});
//******************************************************************************* */
const showImpact = (conv) => {
  log(boi(`SHOW IMPACT`));
  messageText = getSingleRandom(i18n.__("IMPACT_TEXT")) + "  ";
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
  recordsIntentFulfillment(conv, "IMPACT");
  conv.ask(new Suggestions(selectSuggestionChips(conv)));
};
//******************************************************************************* */
//                USE
//******************************************************************************* */
app.intent("use", (conv) => {
  log(boi(`>>use<<`));
  conv.ask("electricity use text");
  recordsIntentFulfillment(conv, "use");
  conv.ask(new Suggestions(selectSuggestionChips(conv)));
});
//******************************************************************************* */
//                INFO
//******************************************************************************* */
app.intent("INFO", (conv) => {
  log(boi(`>>INFO<<`));
  showInfo(conv);
});
//******************************************************************************* */
const showInfo = (conv) => {
  log(boi(`SHOW INFO`));
  messageText = getSingleRandom(i18n.__("INFO_TEXT_LIST"));
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
  recordsIntentFulfillment(conv, "INFO");
  conv.ask(new Suggestions(selectSuggestionChips(conv)));
};
/******************************************************************************* */
//                Activity
//******************************************************************************* */
app.intent("activity", (conv) => {
  log(boi(`>>activity<<`));

  showActivity(conv);
});
//******************************************************************************* */
const showActivity = (conv) => {
  // WHAT IS THE BEST ACTIVITY?
  // WHAT ACTIVITY SHOULD I DO?
  // HOW MANY ACTIVITIES HAVE I DONE?
  //*TODO: Only recommend activities that have not been completed.
  messageText = getSingleRandom(i18n.__("ACTIVITY_TEXT"));
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
  recordsIntentFulfillment(conv, "activity");
  conv.ask(new Suggestions(selectSuggestionChips(conv)));
};
/********************
 * Our guest has chosen a specific activity to complete.
 * We need to figure out which one and go through the
 * completion steps.
 */
app.intent("activity - yes", (conv) => {
  log(boi(`>>activity - yes<<`));
  //*TODO: Figure out what activity the guest wants to do.
  //probably map the way we did with suggestion chips.
  //*TODO: Start the completion steps for the activity.
  showActivity(conv);
});

//******************************************************************************* */
//                help
//******************************************************************************* */
app.intent("help", (conv) => {
  log(boi(`>>help<<`));
  messageText = i18n.__("HELP_TEXT");
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
});
//******************************************************************************* */
//                end
//******************************************************************************* */
app.intent("end", (conv) => {
  log(boi(`>>end<<`));
  messageText = getSingleRandom(i18n.__("FAREWELL"));
  conv.close(messageText);
});
//******************************************************************************* */
//                Default Fallback Intent
//******************************************************************************* */
app.intent("Default Fallback Intent", (conv) => {
  log(boi(`>>DEFAULT FALLBACK INTENT<<`));
  if (!conv.data.fallbackCount) {
    conv.data.fallbackCount = 0;
  }
  conv.data.fallbackCount++;
  if (conv.data.fallbackCount === 1) {
    messageText = i18n.__("FALLBACKPROMPT_1");
    conv.ask(messageText);
  } else if (conv.data.fallbackCount === 2) {
    messageText = i18n.__("FALLBACKPROMPT_2_TEXT");
    messageSpeech =
      speakPrefix + i18n.__("FALLBACKPROMPT_2_SPEECH") + speakSuffix;
    conv.ask(
      new SimpleResponse({
        speech: messageSpeech,
        text: messageText,
      })
    );
  } else {
    conv.data.fallbackCount = 0;
    messageText = i18n.__("FALLBACKPROMPT_FINAL");
    conv.close(messageText);
  }
});
/**
 * Handling of suggestion chips (see Medium article)
 * Records which options the user has complete
 * @param {obj} conv, the conversation object.
 * @param num conv, the conversation object.
 * @return {null} none.
 */
function recordsIntentFulfillment(conv, intentName) {
  log(info("fulfilled intent list: " + conv.data.intentFullfilled));
  conv.data.intentFullfilled[intentValue[intentName]] = 1;
  return null;
}
/**
 * Selects suggestion chips
 * @param {obj} conv, the conversation object.
 * @return [] array of suggestion chips.
 */
function selectSuggestionChips(conv, intentName = null) {
  let suggestions = [];
  if (conv.data.intentFullfilled.every((val, i, arr) => val === arr[0])) {
    conv.data.intentFullfilled = [0, 0, 0, 0, 0];
  }
  /**
   * We want a specific chip.
   */
  if (intentName !== null) {
    suggestions.push(i18n.__("SUGGESTION_CHIPS")[intentValue[intentName]]);
  }
  for (let i = 0; i < conv.data.intentFullfilled.length; i++) {
    if (conv.data.intentFullfilled[i] === 0) {
      suggestions.push(i18n.__("SUGGESTION_CHIPS")[i]);
    }
    if (suggestions.length === 2) {
      return suggestions;
    }
  }
  return suggestions;
}
//******************************************************************************* */
module.exports = app;
