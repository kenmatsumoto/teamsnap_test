'use strict';

//const express = require ('express');
//const https = require ('https');
const request = require('request');
//const utils = require ('utils');

var accessToken = '633dcbde2901669aae0a7d2aba228a50c8621a9c0a0bd285f83cd3420004de3f';

/*
// try first attemp
httpsGet(accessToken, (myResult) => {
    console.log("Sent    : " + accessToken);
    console.log("received: " + myResult);
    
    this.emit('tell', 'Results are ' + myResult);
});
*/
// call by request module
//        console.log(accessToken);

request({
    //           url: 'https://apiv3.teamsnap.com/v3/me',
    //           url: 'https://apiv3.teamsnap.com/v3/teams/active?user_id=1449436',
    url: 'https://apiv3.teamsnap.com/v3/availabilities/search?team_id=132470',
    auth: {
        'bearer': accessToken
    }
}, function (err, res) {
    console.log(res.body);
    //            console.log(res.headers);
    // console.log(err.body);
});