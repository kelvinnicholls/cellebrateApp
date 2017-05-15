const {User} = require('./models/user');

const addUserRoutes = (app, _, authenticate) => {

    app.post('/users', (req, res) => {

        let body = _.pick(req.body, ['email', 'password', 'name', 'adminUser', 'relationship', 'dob']);
        var user = new User(body);

        user.save().then(() => {
            return user.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send(user);
        }).catch((e) => {
            res.status(400).send({});
        });
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


    app.get('/users/me', authenticate, (req, res) => {
        res.send(req.user);
    });


    app.delete('/users/me/token', authenticate, (req, res) => {

        req.user.removeToken(req.token).then(() => {
            res.status(200).send({})
        }, () => {
            res.status(400).send({})
        });

    });
};

module.exports.addUserRoutes = addUserRoutes;