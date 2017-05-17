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
    }
    tags: [String],
    users: [mongoose.Schema.Types.Mixed],
    medias: [mongoose.Schema.Types.Mixed]
});

// mongoose middleware fired prior to a save
MemorySchema.pre('save', function (next) {
    let memory = this;
    memory.addedDate = new Date().getTime();
    next();

});

var Memory = mongoose.model('Memory', MemorySchema);

module.exports = {
    Memory
};