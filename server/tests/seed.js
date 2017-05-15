const {
    ObjectID
} = require('mongodb');
const {
    Media
} = require('../models/media');

const {
    User,
    seed
} = require('../models/user');

const jwt = require('jsonwebtoken');

const user1Id = new ObjectID();
const user1email = "email1@email.com";
const user1password = "email1.password";

const user2Id = new ObjectID();
const user2email = "email2@email.com";
const user2password = "email2.password";

const mediaId1 = new ObjectID();
const mediaId2 = new ObjectID();


const users = [{
        _id: user1Id,
        email: user1email,
        password: user1password,
        name: "Kelv",
        adminUser: true,
        relationship: "Son",
        dob: 111,
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: user1Id.toHexString(),
                access: 'auth'
            }, seed).toString()
        }]
    },
    {
        _id: user2Id,
        email: user2email,
        password: user2password,
        name: "Sharon",
        adminUser: false,
        relationship: "Daughter",
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: user2Id.toHexString(),
                access: 'auth'
            }, seed).toString()
        }]
    }
];

const medias = [{
    _id: mediaId1,
    location: "/media/media1.mpeg",
    isUrl: false,
    mediaType: "Movie",
    mediaSubtype: "mpeg4",
    description: "Movie 1",
    _creator: user1Id,
    addedDate: 123,
    mediaDate: 123,
    tags: ["tag1", "tag2"],
    users: [users[0].name, users[1].name]
},{
    _id: mediaId2,
    location: "https://somesite/movie.mpeg",
    isUrl: true,
    description: "Url 1",
    _creator: user2Id,
    addedDate: 345,
    mediaDate: 345,
    tags: ["tag3", "tag4"],
    users: [users[0].name, users[1].name]
}];


const populateUsers = (done) => {
    User.remove({}).then(() => {
        // return User.insertMany(users); // does not run mongoose middleware
        let user1 = new User(users[0]).save();
        let user2 = new User(users[1]).save();
        return Promise.all([user1, user2]); // returns after both passed promises finish and calls middleware
    }).then(() => done()).catch((err) => {
        console.log("populateUsers", err);
    });
};

const populateMedias = (done) => {
    Media.remove({}).then(() => {
        // return User.insertMany(users); // does not run mongoose middleware
        let media1 = new Media(medias[0]).save();
        let media2 = new Media(medias[1]).save();
        return Promise.all([media1, media2]); // returns after both passed promises finish and calls middleware
    }).then(() => done()).catch((err) => {
        console.log("populateMedias", err);
    });
};


module.exports = {
    medias,
    users,
    populateMedias,
    populateUsers
};