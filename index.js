'use strict';

const https = require('https');
const http = require('http');
const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const fs = require('fs');
const request = require('request');
require('date-utils');
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

// free access mp3 folder
app.use('/mp3', express.static('mp3'));

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
  //console.log('accessToken = ', accessToken);
  var dt = new Date();
  //  var yesterday = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1);
  var formatteddt = dt.toFormat("YYYY-MM-DD");
  var uurl = '';  //availability url for next game
  var member = ''; //member names to display/tell
  var member_id_list = {
    "13960517": "Chisa",
    "19522385": "Payton",
    "33629624": "Stephany",
    "29666598": "Marie",
    "3833618": "Lia",
    "14168259": "Cameron",
    "7211242": "Finley",
    "38894003": "Ruby",
    "19950030": "Sarah",
    "19522350": "Aditi",
    "33629608": "Emma",
    "24647326": "April",
    "1707206": "Rachel",
    "19522376": "Mia",
    "3834093": "Katherine",
    "19950010": "Caoimhe",
    "33629619": "Zoe",
    "19522371": "Kaley"
  } //member id-name list
  var start_date = ''; //game start date
  var opponent_name = ''; //opponent name
  var location_name = ''; //game location
  var result_sentence = ''; // final result to send/tell
  /*request({
    url: 'https://apiv3.teamsnap.com/v3/events/search?team_id=132470&page_size=1&is_game=true&started_after=' + formatteddt,
    auth: {
      'bearer': accessToken
    }
  }, function (err, ress) {
    var resultjson = JSON.parse(ress.body);
    surl = resultjson.collection.items[0].href;
    console.log ('surl = ' + surl);
  });*/

  request({
    //           url: 'https://apiv3.teamsnap.com/v3/me',
    //           url: 'https://apiv3.teamsnap.com/v3/teams/active?user_id=1449436',
    //            url: 'https://apiv3.teamsnap.com/v3/availabilities/search?team_id=132470&page_size=1&started_after=2017-05-01',
    //            url: 'https://apiv3.teamsnap.com/v3/availabilities/search?team_id=132470&page_size=10&event_id=89328118',
    // ->url: 'https://apiv3.teamsnap.com/v3/availabilities/search?team_id=132470&event_id=89328118',
    //url: surl,
    //url: 'https://apiv3.teamsnap.com/v3/events/94562099',
    url: 'https://apiv3.teamsnap.com/v3/events/search?team_id=132470&page_size=1&is_game=true&started_after=' + formatteddt,
    //            url: 'https://apiv3.teamsnap.com/v3/availabilities/1855999838&team_id=132470',

    //              url: 'https://apiv3.teamsnap.com/v3/members/search?team_id=132470',
    auth: {
      'bearer': accessToken
    }
  }, function (err, ress) {
    var resultjson = JSON.parse(ress.body);
    //                        res.send(resultjson.collection.items[0].links);
    for (var i in resultjson.collection.items[0].links) {
      var line = resultjson.collection.items[0].links.filter(function (item, index) {
        //        uurl = uurl + item.rel + ' ' +  item.href + "<BR>";
        if (item.rel == "availabilities") uurl = item.href;
      })
    }
    for (var i=0; i < resultjson.collection.items[0].data.length; i++) {
      if ((resultjson.collection.items[0].data[i].name) == 'start_date') {
        start_date = resultjson.collection.items[0].data[i].value;
        var tdate = new Date(start_date);
        //start_date = tdate.toFormat("MMMM DD DDDD HP");
      }
      if ((resultjson.collection.items[0].data[i].name) == 'opponent_name') {
        opponent_name = resultjson.collection.items[0].data[i].value;
      }
      if ((resultjson.collection.items[0].data[i].name) == 'location_name') {
        location_name = resultjson.collection.items[0].data[i].value;
      }
    }

    request({
      url: uurl,
      auth: {
        'bearer': accessToken
      }
    }, function (err, resss) {
      //console.log(resss.body);
      var resultjson = JSON.parse(resss.body);
      for (var i in resultjson.collection.items) {
        var status_code = '';
        var member_id = ''
        for (var j = 0; j < resultjson.collection.items[i].data.length; j++) {
          if ((resultjson.collection.items[i].data[j].name == "status_code")) { //&& (item.value == "1")
            status_code = resultjson.collection.items[i].data[j].value;
          }
          if (resultjson.collection.items[i].data[j].name == "member_id") {
            member_id = resultjson.collection.items[i].data[j].value;
          }
        }
        if (status_code == "1") {
          member = member + member_id_list[member_id] + ',';
        }
      }
      result_sentence = 'game versus ' + opponent_name + ' at ' + start_date + ', available members are ' + member + ' in ' + location_name;
      res.send(result_sentence);
    });
    /*    }, function (err, resss) {
          //console.log(resss.body);
          var resultjson = JSON.parse(resss.body);
     
              var status_code = '';
              for (var i in resultjson.collection.items) {
                var line = resultjson.collection.items[i].data.filter(function (item, index) {
                  console.log (item);
                  if (item.name == "status_code") {
                    status_code = item.value;
    //                console.log ('status_code = ' + item.value);
                  }
    //              if (status_code == '1') {
                    if (item.name == "member_id") {
    //                  console.log (item.value);
                      member = member + item.value + "<BR>";
                    }
    //              }
                console.log('------');
                })
              }
        });*/
    //res.send(member);
  });

});
