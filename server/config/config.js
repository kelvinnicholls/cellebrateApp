let env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  let config = require('./config.json');
  let envConfig = config[env];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

console.log("env = ", env);

console.log("process.env.PORT = ", process.env.PORT);
console.log("process.env.MONGODB_URI = ", process.env.MONGODB_URI);
//console.log("process.env.JWT_SECRET = ", process.env.JWT_SECRET);