const {
    Media
} = require('./models/media');
const {
    Memory
} = require('./models/memory');
const {
    User
} = require('./models/user');

const {
    ObjectID
} = require('mongodb');

const utils = require('./utils/utils.js');


const memoryInsertFields = ['title', 'description', 'memoryDate', 'tags', 'users', 'medias'];

const addMemoryRoutes = (app, _, authenticate) => {

    app.post('/memory', authenticate, (req, res) => {
        let body = _.pick(req.body, memoryInsertFields);
        let memory = new Memory(body);
        memory._creator = req.user._id;
        memory.addedDate = new Date().getTime();
        memory.save().then((doc) => {
            res.send(doc);
        }, (e) => {
            res.status(400).send();
        });
    });

    app.get('/memories/', authenticate, (req, res) => {

        let memoriesObj = {};
        if (!req.user.adminUser) {
            memoriesObj._creator = req.user._id;
        };

        Memory.find(memoriesObj).then((memories) => {
            let numMemories = memories.length;
            let memoryCount = 0;
            memories.forEach(function (memory) {
                if (numMemories > 0) {
                    utils.setUserIdsToNames(memory.users, User).then((names) => {
                        memory.users = names;
                        memoryCount++;
                        if (memoryCount === numMemories) {
                            res.send({
                                memories
                            });
                        };

                    }).catch((e) => {
                        res.status(400).send();
                    });
                } else {
                    res.send({
                        memories
                    });
                };
            }, (e) => {
                res.status(400).send();
            });
        });
    });


    app.get('/memories/:id', authenticate, (req, res) => {
        let {
            id
        } = req.params;

        if (!ObjectID.isValid(id)) {
            return res.status(404).send({
                error: "Memory ID is invalid"
            });
        };


        Memory.findOne({
            '_id': id
        }).then((memory) => {
            if (memory) {
                utils.setUserIdsToNames(memory.users, User).then((names) => {
                    memory.users = names;
                    res.send({
                        memory
                    });
                }).catch((e) => {
                    res.status(400).send();
                });

            } else {
                res.status(404).send({
                    error: "memory not found for id"
                });
            }

        }, (e) => {
            res.status(400).send();
        });
    });


    app.delete('/memories/:id', authenticate, (req, res) => {
        let {
            id
        } = req.params;


        if (!ObjectID.isValid(id)) {
            return res.status(404).send({
                error: "Memory ID is invalid"
            });
        };

        let memories = {
            '_id': id
        };
        if (!req.user.adminUser) {
            memories._creator = req.user._id;
        }

        Memory.findOneAndRemove(memories).then((memory) => {

            if (memory) {
                res.send({
                    memory
                });
            } else {
                res.status(404).send({
                    error: "memory not found for id"
                });
            }

        }, (e) => {
            res.status(400).send(e);
        });
    });


    app.delete('/memories', authenticate, (req, res) => {

        let memories = {};
        if (!req.user.adminUser) {
            memories = {
                '_creator': req.user._id
            };
        }

        Memory.remove(memories).then((memories) => {
            if (memories) {
                if (memories.result.n === 0) {
                    res.status(404).send({
                        error: "No memory deleted"
                    });
                } else {
                    res.send({
                        memories
                    });
                }

            } else {
                res.status(400).send({
                    error: "No memory deleted"
                });
            }
        }, (e) => {
            res.status(400).send();
        });
    });


    app.patch('/memories/:id', authenticate, (req, res) => {
        let {
            id
        } = req.params;


        let body = _.pick(req.body, ['title','description','memoryDate','tags','users','medias']);

        if (!ObjectID.isValid(id)) {
            return res.status(404).send({
                error: "Memory ID is invalid"
            });
        };

        let memories = {
            '_id': id
        };
        if (!req.user.adminUser) {
            memories._creator = req.user._id;
        }

        Memory.findOneAndUpdate(memories, {
            $set: body
        }, {
            new: true
        }).then((memory) => {

            if (memory) {
                res.send({
                    memory
                });
            } else {
                res.status(404).send({
                    error: "memory not found for id"
                });
            }

        }, (e) => {
            res.status(400).send();
        });
    });
};

module.exports.addMemoryRoutes = addMemoryRoutes;