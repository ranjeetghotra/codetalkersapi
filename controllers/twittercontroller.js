// Load Dependancey
const express = require("express");
const router = express.Router();

var twitterAPI = require("node-twitter-api");
var twitter = new twitterAPI({
  consumerKey: "MJBi770LBwV4v9CREnnNmh2Fh",
  consumerSecret: "MelCFiBgqptLqdYF06WDsv3UbsqhxzMxOYQGJWpzY8vvMVUFGD",
  callback: "http://localhost",
});

var _requestSecret;

router.get("/request-token", function (req, res) {
  twitter.getRequestToken(function (err, requestToken, requestSecret) {
    if (err) res.status(500).send({ status: false, message: err.message });
    else {
      _requestSecret = requestSecret;
      const redirectTo =
        "https://api.twitter.com/oauth/authenticate?oauth_token=" +
        requestToken;
      res.json({ status: true, redirectTo });
    }
  });
});

router.get("/access-token", function (req, res) {
  var requestToken = req.query.oauth_token,
    verifier = req.query.oauth_verifier;

  twitter.getAccessToken(requestToken, _requestSecret, verifier, function (
    err,
    accessToken,
    accessSecret
  ) {
    if (err) res.status(500).send(err);
    else
      twitter.verifyCredentials(accessToken, accessSecret, function (
        err,
        user
      ) {
        if (err) res.status(500).send(err);
        else res.send(user);
      });
  });
});
module.exports = router;
