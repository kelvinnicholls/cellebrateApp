const utils = {};

utils.schemaToObject = (propsArr) => {
    const retObj = {};
    propsArr.forEach(function (element) {
        retObj[element] = "";
    }, this);
    return retObj;
};


utils.setUserIdsToNames = (ids,User) => {
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


module.exports = utils;