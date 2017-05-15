const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const app = express();
// const {ObjectID} = require('mongodb');

const {addUserRoutes} =  require('./user-server.js');
const {addMediaRoutes} =  require('./media-server.js');
const {authenticate} = require('../server/middleware/authenticate');
const config = require('./config/config.js');
const {mongoose} = require('./db/mongoose');

app.use(bodyParser.json());

addUserRoutes (app, _, authenticate);
addMediaRoutes (app, _, authenticate);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};




