const jwt = require('jsonwebtoken');
let config = require('./config/config.js')
const seed = process.env.JWT_SECRET;

const {
    User
} = require('./models/user');

const userOutFields = ['email', 'name', 'adminUser', 'relationship', 'dob', '_id'];
const usersInsertFields = ['email', 'password', 'name', 'adminUser', 'relationship', 'dob'];
const usersUpdateFields = ['email', 'name', 'adminUser', 'relationship', 'dob'];

const addUserRoutes = (app, _, authenticate) => {

    app.post('/users', authenticate, (req, res) => {
        if (req.user.adminUser) {
            let body = _.pick(req.body, usersInsertFields);
            var user = new User(body);
            user.save().then((user) => {
                res.send(_.pick(user, userOutFields));
            }).catch((e) => {
                res.status(400).send({});
            });
        } else {
            res.status(401).send();
        };
    });

    app.post('/users/login', (req, res) => {

        let body = _.pick(req.body, ['email', 'password']);

        User.findByCredentials(body.email, body.password).then((user) => {
            user.generateAuthToken().then((token) => {
                res.header('x-auth', token).send(user);
            });
        }).catch((e) => {
            res.status(400).send({});
        });
    });

    app.patch('/users/:id', authenticate, (req, res) => {
        let token = req.params.id;

        console.log("token", token);

        User.findByToken(token).then((user) => {
            console.log("findByToken", user);
            if (!user) {
                console.log("findByToken", 1);
                return Promise.reject();
            };
            console.log("findByToken", 2);
            let decoded;
            try {
                console.log("findByToken", 3, seed);
                decoded = jwt.verify(token, seed);
            } catch (e) {
                console.log("findByToken", 4, e);
                return Promise.reject();
            }
            console.log("findByToken", 5);
            console.log("findByToken req.user.adminUser", req.user.adminUser);
            console.log("findByToken decoded._id", decoded._id);
            console.log("findByToken  req.user._id", req.user._id);

            if (req.user.adminUser || req.user._id == decoded._id) {
                let userObj = {
                    '_id': decoded._id,
                    'tokens.token': token,
                    'tokens.access': 'auth'
                };

                console.log("findByToken  userObj", userObj);

                let body = _.pick(req.body, usersUpdateFields);

                User.findOneAndUpdate(userObj, {
                    $set: body
                }, {
                    new: true
                }).then((user) => {
                    if (user) {
                        console.log("findByToken  user", _.pick(user, userOutFields));
                        res.send(_.pick(user, userOutFields));
                    } else {
                        res.status(404).send({
                            error: "user not found for id"
                        });
                    };
                }, () => {
                    res.status(400).send();
                });

            } else {
                console.log("findByToken  err");
                res.status(401).send();
            };
        }).catch((e) => {
            console.log("findByToken  err",e);
            res.status(401).send();
        });

    });

    app.get('/users/me', authenticate, (req, res) => {
        res.send(req.user);
    });


    app.get('/users/', authenticate, (req, res) => {

        let userObj = {};
        if (!req.user.adminUser) {
            userObj._creator = req.user._id;
        };

        User.find(userObj).then((users) => {
            res.send(_.pick(user, userOutFields));
        }, (e) => {
            res.status(400).send();
        });
    });

    app.delete('/users/me/token', authenticate, (req, res) => {

        req.user.removeToken(req.token).then(() => {
            res.status(200).send({})
        }, () => {
            res.status(400).send({})
        });

    });

    app.delete('/users/:id', authenticate, (req, res) => {
        if (req.user.adminUser) {
            let {
                id,
                adminUser
            } = req.params;


            if (!ObjectID.isValid(id)) {
                return res.status(404).send({
                    error: "User ID is invalid"
                });
            };

            let userObj = {
                '_id': id
            };

            if (adminUser) {
                return res.status(404).send({
                    error: "Cannot delete an admin user!"
                });
            }

            User.findOneAndRemove(userObj).then((user) => {
                if (user) {
                    res.send(_.pick(user, userOutFields));
                } else {
                    res.status(404).send({
                        error: "User not found for id!"
                    });
                }

            }, (e) => {
                res.status(400).send();
            });
        } else {
            res.status(401).send();
        }
    });
};

module.exports.addUserRoutes = addUserRoutes;