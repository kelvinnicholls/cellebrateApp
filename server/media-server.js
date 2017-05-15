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

        console.log("setUserIdsToNames ids", ids);
        let retArray = [];
        let numIds = ids.length;
        let idCount = 0;
        console.log("setUserIdsToNames numIds", numIds);
        console.log("setUserIdsToNames idCount", idCount);
        if (numIds > 0) {
            ids.forEach(function (id) {
                console.log("setUserIdsToNames id", id);
                User.findById(id).then((user) => {
                    console.log("setUserIdsToNames user", user);
                    if (user) {
                        retArray.push(user.name);
                    };
                    idCount++;
                    if (idCount === numIds) {
                        console.log("setUserIdsToNames return retArray1", retArray);
                        return resolve(retArray);
                    }
                }, (e) => {
                    console.log("setUserIdsToNames error", e);
                    console.log("setUserIdsToNames return retArray2", retArray);
                    return reject(e);
                });
            });
        } else {
            console.log("setUserIdsToNames return retArray3", retArray);
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

        console.log("YYY id", id);

        Media.findOne({
            '_id': id
        }).then((media) => {
            console.log("media", media);
            if (media) {
                setUserIdsToNames(media.users).then((names) => {
                    console.log("app.get('/medias/:id' names", names);
                    media.users = names;
                    console.log("app.get('/medias/:id' media.users", media.users);
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
            console.log("app.get('/medias/:id' error", e);
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