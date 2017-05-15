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
    console.log("MediaSchema.pre users1",users);
    console.log("MediaSchema.pre numUsers",numUsers);
    if (numUsers > 0) {
        console.log("MediaSchema.pre users2",users);
        users.forEach(function (name) {
            console.log("MediaSchema.pre name",name);
            User.findOne({
                name
            }).then((user) => {
                console.log("MediaSchema.pre user", user);
                if (user) {
                    userIds.push(user._id);
                };
                userCount++;
                if (userCount === numUsers) {
                    media.users = userIds;
                    console.log("MediaSchema.pre media",media);
                    next();
                }
            }, (e) => {
                console.log("MediaSchema.pre error", e);
            });
        });
    } else {
        next();
    };
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = {
    Media
};