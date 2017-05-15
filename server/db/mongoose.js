var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
console.log("mongoose process.env.MONGODB_URI = ",process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};

// process.env.NODE_ENV === 'production'; // Heroku
// process.env.NODE_ENV === 'development'; // localhost
// process.env.NODE_ENV === 'test'; // Mocha
