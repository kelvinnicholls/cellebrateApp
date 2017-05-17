const mongoose = require('mongoose');
const validator = require('validator');
const {
    User
} = require('../models/user');

const {
    ObjectID
} = require('mongodb');

const utils = require('../utils/utils.js');

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
        type: Number
    },
    mediaDate: {
        type: Number
    },
    tags: [String],
    users: [mongoose.Schema.Types.Mixed]
});

//console.log("MediaSchema",utils.schemaToObject(Object.keys(MediaSchema.paths)));

// MediaSchema { location: '',
//   isUrl: '',
//   mediaType: '',
//   mediaSubtype: '',
//   description: '',
//   _creator: '',
//   addedDate: '',
//   mediaDate: '',
//   tags: '',
//   users: '',
//   _id: '' }


MediaSchema.statics.findByCriteria = function (tags, users, fromDate, toDate) {
    let Media = this;
    queryObj = {};

    if (fromDate) {
        queryObj.mediaDate = {
            "$gte": fromDate
        }
    };
    if (toDate) {
        queryObj.mediaDate += {
            "$lte": toDate
        }
    };
    if (tags && tags.length > 0) {
        queryObj.tags = {
            "$all": tags
        }
    };
    if (users && users.length > 0) {
        queryObj.users = {
            "$all": users
        }
    };

    return Media.find(queryObj).then((medias) => {
        return medias;
    }).catch((e) => {
        return [];
    });
};

// mongoose middleware fired prior to a save
MediaSchema.pre('save', function (next) {
    utils.setUserNamesToIds(User, this, next);
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = {
    Media
};