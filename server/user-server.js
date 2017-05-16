const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
let config = require('./config/config.js')
const seed = process.env.JWT_SECRET;

const NOT_AUTHORISED = {
    error: "You are not authorised to perform this action!"
};

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

    app.patch('/users/:token', authenticate, (req, res) => {
        let token = req.params.token;

        User.findByToken(token).then((user) => {
            if (!user) {
                return Promise.reject();
            };
            let decoded;
            try {
                decoded = jwt.verify(token, seed);
            } catch (e) {
                return Promise.reject();
            };

            if (req.user.adminUser || req.user._id == decoded._id) {
                let userObj = {
                    '_id': decoded._id,
                    'tokens.token': token,
                    'tokens.access': 'auth'
                };
                let body = _.pick(req.body, usersUpdateFields);

                User.findOneAndUpdate(userObj, {
                    $set: body
                }, {
                    new: true
                }).then((user) => {
                    if (user) {
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
                res.status(401).send();
            };
        }).catch((e) => {
            res.status(401).send();
        });
    });

    app.patch('/users/change-password/:token', authenticate, (req, res) => {

        var token = req.header('x-auth');
        let {
            oldPassword
        } = req.body;
        let {
            newPassword
        } = req.body;
        let decoded;
        if (oldPassword && newPassword) {
            User.findByToken(token).then((user) => {

                if (!user) {
                    return Promise.reject();
                };

                try {
                    decoded = jwt.verify(token, seed);
                } catch (e) {
                    return Promise.reject();
                };

                return bcrypt.compare(oldPassword, user.password);

            }).then((passwordsMatch) => {

                if (passwordsMatch && req.user._id == decoded._id) {
                    let userObj = {
                        '_id': decoded._id,
                        'tokens.token': token,
                        'tokens.access': 'auth'
                    };
                    let body = {
                        password: newPassword
                    };

                    User.findOneAndUpdate(userObj, {
                        $set: body
                    }, {
                        new: true
                    }).then((user) => {
                        if (user) {
                            res.send(_.pick(user, userOutFields));
                        } else {
                            res.status(404).send({
                                error: "user not found for id"
                            });
                        };
                    }, () => {
                        res.status(401).send(NOT_AUTHORISED);
                    });

                } else {
                    res.status(401).send(NOT_AUTHORISED);
                };
            }).catch((e) => {
                res.status(401).send(NOT_AUTHORISED);
            });
        } else {
            res.status(404).send({
                error: "An old and new password must be passed"
            });
        };
    });

    app.get('/users/me', authenticate, (req, res) => {
        res.send(req.user);
    });


    app.get('/users/', authenticate, (req, res) => {

        let userObj = {};

        if (!req.user.adminUser) {
            userObj._id = req.user._id;
        };

        User.find(userObj).then((users) => {
            if (users) {
                users.forEach((user) => {
                    users.user = _.pick(user, userOutFields);
                });
                res.send(users);
            } else {
                res.status(404).send();
            }

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

    app.delete('/users/:token', authenticate, (req, res) => {

        let token = req.params.token;

        User.findByToken(token).then((user) => {
            if (!user) {
                return Promise.reject();
            };
            let decoded;
            try {
                decoded = jwt.verify(token, seed);
            } catch (e) {
                return Promise.reject();
            };

            if (req.user.adminUser || req.user._id == decoded._id) {
                let userObj = {
                    '_id': decoded._id,
                    'tokens.token': token,
                    'tokens.access': 'auth',
                    adminUser: false
                };

                User.findOneAndRemove(userObj).then((user) => {
                    if (user) {
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
                res.status(401).send();
            };
        }).catch((e) => {
            res.status(401).send();
        });

    });
};

module.exports.addUserRoutes = addUserRoutes;