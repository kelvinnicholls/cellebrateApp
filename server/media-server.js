const {
    Media
} = require('./models/media');
const {
    User
} = require('./models/user');

const {
    ObjectID
} = require('mongodb');



let setUserIdsToNames = (ids) => {
    return new Promise((resolve, reject) => {

        let retArray = [];
        let numIds = ids.length;
        let idCount = 0;
         if (numIds > 0) {
            ids.forEach(function (id) {
                 User.findById(id).then((user) => {
                    if (user) {
                        retArray.push(user.name);
                    };
                    idCount++;
                    if (idCount === numIds) {
                        return resolve(retArray);
                    }
                }, (e) => {
                     return reject(e);
                });
            });
        } else {
            return resolve(retArray);
        };
    });
};


const addMediaRoutes = (app, _, authenticate) => {

    app.post('/media', authenticate, (req, res) => {
        var media = new Media({
            location: req.body.location,
            isUrl: req.body.isUrl,
            mediaType: req.body.mediaType,
            mediaSubtype: req.body.mediaSubtype,
            description: req.body.description,
            mediaDate: req.body.mediaDate,
            tags: req.body.tags,
            users: req.body.users,
            addedDate: new Date().getTime(),
            _creator: req.user._id
        });

        media.save().then((doc) => {
            res.send(doc);
        }, (e) => {
            res.status(400).send();
        });
    });

    app.get('/medias/', authenticate, (req, res) => {

        let mediasObj = {};
        if (!req.user.adminUser) {
            mediasObj._creator = req.user._id;
        };

        Media.find(mediasObj).then((medias) => {
            let numMedias = medias.length;
            let mediaCount = 0;
            medias.forEach(function (media) {
                if (numMedias > 0) {
                    setUserIdsToNames(media.users).then((names) => {
                        media.users = names;
                        mediaCount++;
                        if (mediaCount === numMedias) {
                            res.send({
                                medias
                            });
                        };

                    }).catch((e) => {
                        res.status(400).send();
                    });
                } else {
                    res.send({
                        medias
                    });
                };
            }, (e) => {
                res.status(400).send();
            });
        });
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
                setUserIdsToNames(media.users).then((names) => {
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