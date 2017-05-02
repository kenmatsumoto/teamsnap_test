'use strict';

const https = require('https');
const http = require('http');
const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const fs = require('fs');
const request = require ('request');
//const teamsnap = require('teamsnap');

const app = express();
const oauth2 = simpleOauthModule.create({
  client: {
    id: '0c90e5b035de7d915299dafee21c6903121670972e779d7d4608e677f80d59c9',
    secret: '8d1348c9ffbbea61fef7b92736aa5a553c44ce8f1e273a71aee668311f3db851',
  },
  auth: {
    tokenHost: 'https://auth.teamsnap.com',
    tokenPath: '/oauth/token',
    authorizePath: '/oauth/authorize',
  },
});

var port = 3000;
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: 'abcd',
  //  ca: fs.readFileSync('server.csr')
}
var server = app.listen(app.get('port'), function () { https.createServer(options, app).listen(port); });
var accessToken;

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'https://54.219.182.130:3000/callback',
  //redirect_uri: 'https://localhost:3000/callback',
  //scope: 'notifications',
  //state: '3(#0/!~',
});

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  console.log('first');
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const code = req.query.code;
  console.log('code = ', code);
  const options = {
    code: code,
    redirect_uri: 'https://54.219.182.130:3000/callback'
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);
    accessToken = result.access_token;
    return res
      .status(200)
      .json(token);
  });
});

app.get('/success', (req, res) => {
  res.send('');
});

app.get('/', (req, res) => {
  res.send('Hello<br><a href="/auth">Log in with Teamsnap</a>');
});

app.get('/available', (req, res) => {
        console.log('accessToken = ', accessToken);
        request({
//           url: 'https://apiv3.teamsnap.com/v3/me',
//           url: 'https://apiv3.teamsnap.com/v3/teams/active?user_id=1449436',
            url: 'https://apiv3.teamsnap.com/v3/availabilities/search?team_id=132470&page_size=1',
            auth: {
                'bearer': accessToken
            }
        }, function(err, ress) {
          var resultjson = JSON.parse(ress.body);
            res.send(resultjson.collection);
//            console.log(res.headers);
           // console.log(err.body);
        });
});

 /*app.listen(3000, () => {
   console.log('Express server started on port 3000'); // eslint-disable-line
 });*/

//ttp.createServer(app).listen(80);
// Credits to [@lazybean](https://github.com/lazybean)