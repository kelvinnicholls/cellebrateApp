const mongoose = require('mongoose');
const validator = require('validator');
const {
    User
} = require('../models/user');
const {
    Media
} = require('../models/media');
const {
    ObjectID
} = require('mongodb');

//const utils = require('../utils/utils.js');


let MemorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    description: {
        type: String,
        required: true,
        minlength: 1
    },
    addedDate: {
        type: Number
    },
    memoryDate: {
        type: Number
    },
    _creator: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    tags: [String],
    users: [mongoose.Schema.Types.Mixed],
    medias: [mongoose.Schema.Types.Mixed]
});

// console.log("MemorySchema",utils.schemaToObject(Object.keys(MemorySchema.paths)));

// MemorySchema { title: '',
//   description: '',
//   addedDate: '',
//   memoryDate: '',
//   _creator: '',
//   tags: '',
//   users: '',
//   medias: '',
//   _id: '' }

// mongoose middleware fired prior to a save
MemorySchema.pre('save', function (next) {
    let memory = this;
    let users = this.users;
    let userIds = [];
    let numUsers = memory.users.length;
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
                    memory.users = userIds;
                    next();
                }
            }, (e) => {});
        });
    } else {
        next();
    };
});

var Memory = mongoose.model('Memory', MemorySchema);

module.exports = {
    Memory
};