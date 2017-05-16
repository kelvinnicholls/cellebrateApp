const mongoose = require('mongoose');
const validator = require('validator');
const {
    User
} = require('../models/user');

const {
    ObjectID
} = require('mongodb');

// {
//     location: "",
//     isUrl: false,
//     mediaType:  "",
//     mediaSubtype: ,
//     description: "",
//     _creator: ,
//     addedDate: 123,
//     mediaDate: 123,
//     tags: [""],
//     users: []
// }
let MediaSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
    },
    isUrl: {
        required: true,
        type: Boolean
    },
    mediaType: {
        type: String,
        required: function () {
            return !this.isUrl;
        },
        minlength: 1
    },
    mediaSubtype: {
        type: String,
        required: function () {
            return !this.isUrl && this.mediaType;
        },
        minlength: 1
    },
    description: {
        type: String,
        required: true,
        minlength: 1
    },
    _creator: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    addedDate: {
        required: true,
        type: Number
    },
    mediaDate: {
        type: Number
    },
    tags: [String],
    users: [mongoose.Schema.Types.Mixed]
});

// mongoose middleware fired prior to a save
MediaSchema.pre('save', function (next) {
    let media = this;
    let users = this.users;
    let userIds = [];
    let numUsers = media.users.length;
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
                    media.users = userIds;
                    next();
                }
            }, (e) => {});
        });
    } else {
        next();
    };
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = {
    Media
};