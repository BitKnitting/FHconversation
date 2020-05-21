// /Users/mj/mongodb/bin/mongod --dbpath=/Users/mj/mongodb-data

const chalk = require("chalk");
const err = chalk.redBright.bold;
const msg = chalk.greenBright.bold;

const log = console.log;

// Load the available activities into mongodb.
// Take care not to have multiple copies of an activity.
// Bulk delete collection, bulk insert...? I think so.

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "Fithome";
const activities = require("./activities.json");
MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return log(err("Unable to connect to the database.  Error: ${error}"));
    }
    log(msg("Connected to the database."));
    // Connect to the database
    const db = client.db(databaseName);

    db.dropCollection("activities", (error, result) => {
      // Returns error if the collection does not exist.
      // In that error case, keep going because the point is
      // to insert a "fresh" activities collection.
      if (error && error.errmsg !== "ns not found") {
        return log(err(`Unable to drop activities collection.  ${error}`));
      }
      // Returns true if able to drop.
      log(msg(result));
    });
    db.collection("activities").insertMany(activities, (error, result) => {
      if (error) {
        return log(err(`Unable to insert the user. ${error}`));
      }
      // Note the log message puts result.ops as another
      // argument to console.log.  This way JS doesn't try
      // to interpret the ops array....
      log(msg("Activities added. "), result.ops);
    });
  }
);
