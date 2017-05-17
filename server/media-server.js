const {
    Media
} = require('./models/media');
const {
    User
} = require('./models/user');

const {
    ObjectID
} = require('mongodb');

const utils = require('./utils/utils.js');

const mediaInsertFields = ['location', 'isUrl', 'name', 'mediaType', 'mediaSubtype', 'description', 'mediaDate', 'tags', 'users'];


const addMediaRoutes = (app, _, authenticate) => {

    app.post('/media', authenticate, (req, res) => {
        let body = _.pick(req.body, mediaInsertFields);
        let media = new Media(body);
        media._creator = req.user._id;
        media.addedDate = new Date().getTime();
        media.save().then((doc) => {
            res.send(doc);
        }, (e) => {
            res.status(400).send();
        });
    });

    app.get('/medias', authenticate, (req, res) => {

        let mediasObj = {};
        if (!req.user.adminUser) {
            mediasObj._creator = req.user._id;
        };

        Media.find(mediasObj).then((medias) => {
            console.log("app.get('/medias'", medias);
            utils.setMediasUserNamesToIds(medias, res, User);
        }).catch((e) => {
            console.log("app.get('/medias/' error", e);
        });;
    });


    app.get('/medias/:id', authenticate, (req, res) => {
        let {
            id
        } = req.params;

        if (!ObjectID.isValid(id)) {
            return res.status(404).send({
                error: "Media ID is invalid"
            });
        };


        Media.findOne({
            '_id': id
        }).then((media) => {
            if (media) {
                utils.setUserIdsToNames(media.users, User).then((names) => {
                    media.users = names;
                    res.send({
                        media
                    });
                }).catch((e) => {
                    res.status(400).send();
                });

            } else {
                res.status(404).send({
                    error: "media not found for id"
                });
            }

        }, (e) => {
            res.status(400).send();
        });
    });


    app.get('/medias/byCriteria/', authenticate, (req, res) => {
        let {
            tags,
            users,
            fromDate,
            toDate
        } = req.body;

        Media.findByCriteria(tags, users, fromDate, toDate).then((medias) => {
            utils.setMediasUserNamesToIds(medias, res, User);
        });

    });



    app.delete('/medias/:id', authenticate, (req, res) => {
        let {
            id
        } = req.params;


        if (!ObjectID.isValid(id)) {
            return res.status(404).send({
                error: "Media ID is invalid"
            });
        };

        let medias = {
            '_id': id
        };
        if (!req.user.adminUser) {
            medias._creator = req.user._id;
        }

        Media.findOneAndRemove(medias).then((media) => {

            if (media) {
                res.send({
                    media
                });
            } else {
                res.status(404).send({
                    error: "media not found for id"
                });
            }

        }, (e) => {
            res.status(400).send(e);
        });
    });


    app.delete('/medias', authenticate, (req, res) => {

        let medias = {};
        if (!req.user.adminUser) {
            medias = {
                '_creator': req.user._id
            };
        }

        Media.remove(medias).then((medias) => {
            if (medias) {
                if (medias.result.n === 0) {
                    res.status(404).send({
                        error: "No media deleted"
                    });
                } else {
                    res.send({
                        medias
                    });
                }

            } else {
                res.status(400).send({
                    error: "No media deleted"
                });
            }
        }, (e) => {
            res.status(400).send();
        });
    });


    app.patch('/medias/:id', authenticate, (req, res) => {
        let {
            id
        } = req.params;


        let body = _.pick(req.body, ['location', 'isUrl', 'mediaType', 'mediaSubtype', 'description', 'mediaDate', 'tags', 'users']);

        if (!ObjectID.isValid(id)) {
            return res.status(404).send({
                error: "Media ID is invalid"
            });
        };

        let medias = {
            '_id': id
        };
        if (!req.user.adminUser) {
            medias._creator = req.user._id;
        }

        Media.findOneAndUpdate(medias, {
            $set: body
        }, {
            new: true
        }).then((media) => {

            if (media) {
                res.send({
                    media
                });
            } else {
                res.status(404).send({
                    error: "media not found for id"
                });
            }

        }, (e) => {
            res.status(400).send();
        });
    });
};

module.exports.addMediaRoutes = addMediaRoutes;