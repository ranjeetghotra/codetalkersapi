var config = {};

config.baseUrl = 'http://api.thecodefusion.com:3000/' // API base url
config.siteUrl = 'http://management.thecodefusion.com:4200/' // Website url

// Database configration
config.db = { connenction: "mongodb://localhost:27017/codetalkers" };

// TextLocal sms api configration
config.textlocal = {
  username: "ratta.343@gmail.com",
  sender: "MYCSHP",
  hash: "008d27e38314ead53735ba7d8cd396bf09cbac08",
};

// Mail configration
config.mail = {
  host: "smtp.zoho.com",
  port: 587,
  secure: false,
  username: "ranjit.singh@thecodefusion.com",
  password: "007@JamesBond"
};

module.exports = config;
