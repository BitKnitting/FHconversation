`use strict`;
const {
  dialogflow,
  SimpleResponse,
  SignIn,
  Image,
  Table,
} = require("actions-on-google");
const path = require("path");
const i18n = require("i18n");
const chalk = require("chalk");

const log = console.log;
const ToDos = {
  ACTIVITY: "activity",
  RANK: "rank",
  IMPACT: "impact",
  DETAILS: "details",
  INFO: "info",
};
//************************************ */
// colors used for logging.
// Beginning of intent
const boi = chalk.black.bgYellow.bold;
// Messages
const msg = chalk.yellowBright.bold;
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
    if (!what_to_do.toLowerCase().includes(except)) {
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
  log(boi(`>>Default Welcome Intent<<`));
  let messageSpeech = "";
  let messageText = "";
  if (conv.user.last.seen) {
    log(msg("--> user has used our action before"));
    const payload = conv.user.profile.payload;
    if (payload == undefined) {
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
      log(msg("--> we have email"));
      first_name = conv.user.profile.payload.given_name;
      // What our guest can do next.
      things_to_do = [showRanking, showImpact, showInfo, doActivity];
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

  const payload = conv.user.profile.payload;
  return conv.ask("Great! Thanks for signing in.");
});
//******************************************************************************* */
//                RANKING
//******************************************************************************* */
app.intent("MY_RANKING", (conv) => {
  log(boi(`>>MY_RANKING<<`));
  showRanking(conv);
});
//********************************************************************************* */
const showRanking = (conv) => {
  log(boi("SHOW RANKING"));
  messageText = i18n.__("MY_RANKING_PRE_TEXT");
  whatToDo = whatToDoExcept(ToDos.RANK);
  messageText += whatToDo;
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
  if (conv.screen) {
    showRankingTable(conv);
  }
};

//******************************************************************************** */
const showRankingTable = (conv) =>
  conv.ask(
    new Table({
      title: "Student Rank",
      subtitle: "From Least to Most",
      image: new Image({
        url: conv.user.profile.payload.picture,
        alt: "Alt Text",
      }),
      columns: [
        {
          header: "Name",
          align: "CENTER",
        },
        {
          header: "Average kWh",
          align: "CENTER",
        },
      ],
      rows: [
        {
          cells: ["Thor Johnson", "24.3"],
          dividerAfter: true,
        },
        {
          cells: ["Byron", "26.7"],
          dividerAfter: true,
        },
        {
          cells: ["Vera Kark", "28.2"],
          dividerAfter: true,
        },
      ],
    })
  );
//******************************************************************************* */
//                IMPACT
//******************************************************************************* */
app.intent("IMPACT", (conv) => {
  log(boi(`>>IMPACT<<`));
  showImpact(conv);
});
const showImpact = (conv) => {
  log(boi(`SHOW IMPACT`));
  messageText = i18n.__("MY_IMPACT_TEXT") + "  ";
  whatToDo = whatToDoExcept(ToDos.IMPACT);
  messageText += whatToDo;
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
};
//******************************************************************************* */
//                INFO
//******************************************************************************* */
app.intent("INFO", (conv) => {
  log(boi(`>>INFO<<`));
  showInfo(conv);
});
const showInfo = (conv) => {
  log(boi(`SHOW INFO`));
  messageText = getSingleRandom(i18n.__("INFO_PRE_TEXT")) + "  ";
  whatToDo = whatToDoExcept(ToDos.INFO);
  messageText += whatToDo;
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
};
/******************************************************************************* */
//                Activity
//******************************************************************************* */
app.intent("activity", (conv) => {
  log(boi(`>>activity<<`));
  doActivity(conv);
});
//******************************************************************************* */
const doActivity = (conv) => {
  messageText = "TODO";
  messageSpeech = messageText;
  conv.ask(
    new SimpleResponse({
      speech: messageSpeech,
      text: messageText,
    })
  );
};

module.exports = app;
