const config = require("../config/config");
const request = require("request");

function sendOTP(phone, otp) {
  const message = "Hi, Your O.T.P is " + otp;
  sendSMS(phone, message);
}

function sendSMS(phone, message) {
  // Create Get data for otp
  var getData =
    "username=" +
    encodeURI(config.textlocal.username) +
    "&hash=" +
    encodeURIComponent(config.textlocal.hash) +
    "&numbers=" +
    encodeURIComponent(phone) +
    "&sender=" +
    encodeURIComponent(config.textlocal.sender) +
    "&message=" +
    encodeURIComponent(message);

  // sent otp to user
  var clientServerOptions = {
    uri: "https://api.textlocal.in/send/?" + getData,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  request(clientServerOptions, function (error, response) {
    console.log(response);
    return;
  });
}

function sendMail(to, message, subject = 'CodeTalkers') {
    let transporter = nodeMailer.createTransport({
      // Mail hoster
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        // Sender's account
        user: config.mail.username,
        pass: config.mail.password,
      },
    });
    let mailOptions = {
      // Recipient's account
      from: '"CodeTalkers "'+config.mail.username, // sender address
      to: to,
      subject: subject,
      html: message // plain text body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return;
      }
    });
  }

module.exports.sendOTP = sendOTP;
module.exports.sendSMS = sendSMS;
module.exports.sendMail = sendMail;
