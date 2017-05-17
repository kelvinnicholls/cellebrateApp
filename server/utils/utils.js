const utils = {};

utils.schemaToObject = (propsArr) => {
    const retObj = {};
    propsArr.forEach(function (element) {
        retObj[element] = "";
    }, this);
    return retObj;
};


utils.setUserIdsToNames = (ids, User) => {
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

utils.setUserNamesToIds = (User, obj, next) => {

    let users = obj.users;
    let userIds = [];
    let numUsers = obj.users.length;
    let userCount = 0;

    if (numUsers > 0) {
        users.forEach(function (name) {
            User.findOne({
                name
            }).then((user) => {
                if (user) {
                    userIds.push(user._id);
                };
                userCount++;
                if (userCount === numUsers) {
                    obj.users = userIds;
                    return next();
                }
            }, (e) => {
                return
            });
        });
    } else {
        return next();
    };
};

utils.setMediasUserNamesToIds = (medias, res, User) => {
    console.log("utils.setMediasUserNamesToId'", medias);
    let numMedias = medias.length;
    let mediaCount = 0;
    medias.forEach(function (media) {
         if (numMedias > 0) {
            utils.setUserIdsToNames(media.users, User).then((names) => {
                media.users = names;
                mediaCount++;
                if (mediaCount === numMedias) {
                    return res.send({
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
};

module.exports = utils;