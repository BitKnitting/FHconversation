`use strict`

// The webhooks are in the webhooks.js file.
const app = require('./webhooks')
const express = require('express')
const bodyParser = require("body-parser");

const expressApp = express().use(bodyParser.json())

expressApp.get('/', (req, res) => res.send('online'))
expressApp.post('/fulfillment', app)

expressApp.listen(8080)
