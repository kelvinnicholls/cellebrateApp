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


// app.post('/todos', authenticate, (req, res) => {
//   var todo = new Todo({
//     text: req.body.text,
//     _creator: req.user._id
//   });

//   todo.save().then((doc) => {
//     res.send(doc);
//   }, (e) => {
//     res.status(400).send();
//   });
// });


// app.get('/todos', authenticate, (req, res) => {

//   Todo.find({
//     _creator: req.user._id
//   }).then((todos) => {
//     res.send({
//       todos
//     });
//   }, (e) => {
//     res.status(400).send();
//   });
// });

// app.get('/todos/:id', authenticate, (req, res) => {
//   let {
//     id
//   } = req.params;

//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send({
//       error: "ID is invalid"
//     });
//   };

//   Todo.findOne({
//     '_id': id,
//     '_creator': req.user._id
//   }).then((todo) => {
//     if (todo) {
//       res.send({
//         todo
//       });
//     } else {
//       res.status(404).send({
//         error: "todo not found for id"
//       });
//     }

//   }, (e) => {
//     res.status(400).send();
//   });
// });


// app.delete('/todos/:id', authenticate, (req, res) => {
//   let {
//     id
//   } = req.params;

//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send({
//       error: "ID is invalid"
//     });
//   };

//   Todo.findOneAndRemove({
//     '_id': id,
//     '_creator': req.user._id
//   }).then((todo) => {
//     if (todo) {
//       res.send({
//         todo
//       });
//     } else {
//       res.status(404).send({
//         error: "todo not found for id"
//       });
//     }

//   }, (e) => {
//     res.status(400).send();
//   });
// });


// app.delete('/todos', authenticate, (req, res) => {
//   Todo.remove({
//     '_creator': req.user._id
//   }).then((todos) => {
//     if (todos) {
//       if (todos.result.n === 0) {
//         res.status(404).send({
//           error: "No todos deleted"
//         });
//       } else {
//         res.send({
//           todos
//         });
//       }

//     } else {
//       res.status(400).send({
//         error: "No todos deleted"
//       });
//     }
//   }, (e) => {
//     res.status(400).send();
//   });
// });


// app.patch('/todos/:id', authenticate, (req, res) => {
//   let {
//     id
//   } = req.params;

//   let body = _.pick(req.body, ['text', 'completed']);

//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send({
//       error: "ID is invalid"
//     });
//   };

//   if (_.isBoolean(body.completed) && body.completed) {
//     body.completedAt = new Date().getTime();
//   } else {
//     body.completed = false;
//     body.completedAt = null;
//   }


//   Todo.findOneAndUpdate({
//     '_id': id,
//     '_creator': req.user._id
//   }, {
//     $set: body
//   }, {
//     new: true
//   }).then((todo) => {

//     if (todo) {
//       res.send({
//         todo
//       });
//     } else {
//       res.status(404).send({
//         error: "todo not found for id"
//       });
//     }

//   }, (e) => {
//     res.status(400).send(e);
//   });
// });








