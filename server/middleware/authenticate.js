let {
  User
} = require('./../models/user');

let authenticate = (req, res, next) => {
  var token = req.header('x-auth');
  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    console.log("authenticate", e);
    res.status(401).send();
  });
}


module.exports.authenticate = authenticate;