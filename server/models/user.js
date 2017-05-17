const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const config = require('../config/config.js');
//const utils = require('../utils/utils.js');

const seed = process.env.JWT_SECRET;
let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: '{VALUE} is not a valid email!'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 1
  },
  adminUser: {
    required: true,
    type: Boolean
  },
  relationship: {
    type: String,
    required: true,
    minlength: 1
  },
  dob: {
    type: Number
  },
  profilePhotoLocation: {
    type: String
  },
  twitterId: {
    type: String
  },
  facebookId: {
    type: String
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    }
  }]
});

// console.log("UserSchema",utils.schemaToObject(Object.keys(UserSchema.paths)));

//  { email: '',
//   password: '',
//   name: '',
//   adminUser: '',
//   relationship: '',
//   dob: '',
//   profilePhotoLocation: '',
//   twitterId: '',
//   facebookId: '',
//   _creator: '',
//   tokens: '',
//   _id: '' }

//override this method
UserSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  //return _.pick(userObject, ['_id', 'email','tokens']);
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, seed).toString();
  user.tokens.push({
    access,
    token
  });
  return user.save().then(() => {
    return token;
  })
};

UserSchema.methods.removeToken = function (token) {
  let user = this;
  return user.update({
    // if token in tokens array matches passed token the element is removed from the array
    $pull: {
      tokens: {
        token: token
      }
    }
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({
    email
  }).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (!err && res) {
          return resolve(user);
        };
        reject();
      });
    });
  });
};


UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, seed);
  } catch (e) {
    return Promise.reject();

  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
};


// mongoose middleware fired prior to a save
UserSchema.pre('save', function (next) {
  let user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (!err) {
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (!err) {
            this.password = hash;
            next();
          }
        });
      }
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User,
  seed
}