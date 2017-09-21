const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const debug =require('debug')('google_apis');
const account = require('google-auth2-service-account');
const config = require('../../config');

const client = require('redis').createClient(process.env.REDISTOGO_URL);
const Redis = require('ioredis');

const redis = new Redis(process.env.REDISTOGO_URL);

client.on('connect', function() {
    console.log('Redis connected on: '+process.env.REDISTOGO_URL);
});

let ucode = "empty";

Date.prototype.yt_friendly = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + String(mm),
          (dd>9 ? '' : '0') + String(dd)
        ].join('-');
};
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube',
'https://www.googleapis.com/auth/yt-analytics.readonly',
'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
'https://www.googleapis.com/auth/youtubepartner'];
var TOKEN_DIR = config.tokenDir();
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
let connection = {};

function loadAuth(fn, req, res) {
if(!res.headersSent) {
      res.header("Access-Control-Allow-Origin", "*");
}

//let service_pem = process.env.GOOGLE_SERVICE_PEM ? new Buffer(process.env.GOOGLE_SERVICE_PEM) : fs.readFileSync('google_service.pem');

const args = arguments;

//let service_account;
//if(service_pem) {
  /*      service_account =

        account.auth( service_pem, {
            iss : 'bold-111@uon-bold-video-analytics.iam.gserviceaccount.com',
            scope : 'https://www.googleapis.com/auth/yt-analytics.readonly'
        }, function ( err, accessToken ) {*/
          if(! process.env.GOOGLE_CREDENTIALS) {
                fs.readFile('client_secret.json', function processClientSecrets(err, content) {
                  if (err) {
                    debug('Error loading client secret file: ' + err);
                    return;
                  }

                  connection = {req: req, res: res};
                  // Authorize a client with the loaded credentials, then call the YouTube API.
                  authorize(JSON.parse(content), fn, args);
                });
          } else {
                  connection = {req: req, res: res};

                  let content = process.env.GOOGLE_CREDENTIALS;

                  if(typeof content !== 'undefined') {
                      content = JSON.parse(content);
                      authorize(content, fn, args);
                  } else {
                      debug("Google credentials not found");
                      return;
                  }
          }
            //authorize(accessToken, fn, args);
    //    });
    //  });
/*} else {
   debug("Service Account not authorised");
}*/



/*
*/
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];

        const auth = new googleAuth();
        const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        const args = arguments[2];
        client.get('google_token', function(err, reply) {
              if(reply) {
                  oauth2Client.credentials = JSON.parse(reply);
                  callback(oauth2Client, args);
              } else {
                  getNewToken(oauth2Client, callback);
              }
        });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */

function setIdentityCode(callback) {
  //  console.log("waiting for input");
    const google_code_check = setInterval(function() {
        if(ucode !== "empty") {
          //  console.log("Setting: "+ucode);
            callback(ucode);
            clearInterval(google_code_check);
        }
    }, 100);
}

function getNewToken(oauth2Client, args) {

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

    setIdentityCode(function(code) {
            oauth2Client.getToken(code, function(err, token) {
              if (err) {
                debug('Error while trying to retrieve access token', err);
                return;
              }
              oauth2Client.credentials = JSON.parse(token);
              storeToken(token);
            });
      });

    connection.res.json({authUrl: authUrl, action: one_off_auth});
  }

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    client.set('google_token', JSON.stringify(token), function(err,reply)
      {
          console.log("Set token:");
          console.log(reply);
      });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth, args) {
  var service = google.youtube('v3');
  let outcome = {};

  service.channels.list({
    auth: auth,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'theboldlab'
  }, function(err, response) {
    if (err) {
      debug('The API returned an error: ' + err);
      return;
    }
    var channels = response.items;
    if (channels.length == 0) {
      debug('No channel found.');
    } else {
      debug('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);

        outcome = channels[0].contentDetails.relatedPlaylists.uploads;
      //  debug("RAW: "+JSON.stringify(channels));
      //  debug("OUTCOME: "+JSON.stringify(outcome));
      //  debug("Calling "+args[3]);
        switch(args[3]) {
          case 'playlistItems':
            getPlaylistItems(auth, outcome);
          break;
          case 'playlists':
            getPlaylists(auth, outcome);
        }
    }
  });
}

function getChannels(auth) {
  const service = google.youtube('v3');

  //debug(service);
  let outcome = {};

//  debug(service.youtubereporting);
  service.channels.list({
    auth: auth,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'theboldlab'
  }, function(err, response) {
    if (err) {
      debug('The API returned an error: ' + err);
      return;
    }
    var channels = response.items;
    if (channels.length == 0) {
      debug('No channel found.');
    } else {
      /*debug('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);*/

      //connection.res.json(response.items);
        outcome = response.items;
    }
  });

  return outcome;
}

function getPlaylistId(auth) {
  return getChannel(auth);
}

function getPlaylistItems(auth, playlistId) {
  const service = google.youtube('v3');
//  const playlistId = getPlaylistId(auth);
//  debug("GOT ID: "+playlistId);
  let outcome = {};
//  debug(service.youtubereporting);
  service.playlistItems.list({
    auth: auth,
    part: 'snippet, contentDetails',
    playlistId: playlistId,
    maxResults: 25
  }, function(err, response) {
    if (err) {
      debug('The API returned an error: ' + err);
      return;
    }

    if (response.items.snippet == 0) {
      debug('No playlists found.');
    } else {

      //connection.res.json(response.items);
      connection.res.json(response);
    }
  });
}

function getVideoDetails(auth, args) {
  const service = google.youtube('v3');
  const id = args[3];
//  const playlistId = getPlaylistId(auth);
//  debug("GOT ID: "+playlistId);
  let outcome = {};
//  debug(service.youtubereporting);
  service.videos.list({
    auth: auth,
    part: 'snippet',
    id: id,
    maxResults: 1
  }, function(err, response) {
    if (err) {
      debug('The API returned an error: ' + err);
      return;
    }

    if (response.items.snippet == 0) {
      debug('No video found.');
    } else {

      //connection.res.json(response.items);
      connection.res.json(response);
    }
  });
}

function getVideoAnalytics(auth, args) {
  if(typeof args === 'undefined') {
      debug("analytics args were undefined");
      return;
  }
  const service = google.youtubeAnalytics('v1');
  const channelId = args[3];
  const videoId = args[4];
  const start_d = !args[5]?null:args[5];
  const end_d = !args[6]?null:args[6];
  debug("c: "+args[3]);
    debug("v: "+args[4]);
    debug("s: "+args[5]);

  let outcome = {};
  let date = start_d ? new Date(start_d) : new Date();

  const start = date.yt_friendly();

  date = end_d ? new Date(end_d) : new Date();
  const end = date.yt_friendly();

  debug(auth);
  debug(start+ " ==> "+end);
  debug(channelId);
  debug(start);
  debug(end);
  debug(videoId);
  service.reports.query({
    auth: auth,
    ids: 'channel=='+channelId,
    'start-date': start,
    'end-date': end,
    metrics: 'averageViewDuration,views,averageViewPercentage,estimatedMinutesWatched',
    filters: 'video=='+videoId
  }, function(err, response) {
    if (err) {
      debug('The API returned an error: ' + err);
      return;
    }

    if (response == 0) {
      debug('No analytics found.');
    } else {

      //connection.res.json(response.items);
      connection.res.json(response);
    }
  });
}

function getPlaylists(auth, playlistId) {
  const service = google.youtube('v3');
  let outcome = {};

  service.playlists.list({
    auth: auth,
    part: 'snippet, contentDetails',
    id: playlistId,
    maxResults: 25
  }, function(err, response) {
    if (err) {
      debug('The API returned an error: ' + err);
      return;
    }

    if (response.items.snippet == 0) {
      debug('No playlists found.');
    } else {

      connection.res.json(response);
    }
  });
}


/*
 Requires a youtube partner account
*/
function getReportTypes(auth) {
  const reports = google.youtubereporting('v1');
//  debug(reports);
//  debug(service.youtubereporting);
  reports.reportTypes.list({
    auth: auth,
  //  onBehalfOfContentOwner: "theboldlab"
    /*part: 'snippet,contentDetails,statistics',
    forUsername: 'theboldlab'*/
  }, function(err, response) {
    if (err) {
      debug('The API returned an error: ' + err);
      return;
    }

      connection.res.json(response);
    });
}

/*
 Requires a youtube partner account
*/
function createReport(auth) {
    const reports = google.youtubereporting('v1');

    reports.jobs.create({auth: auth,
                          onBehalfOfContentOwner: 'theBOLDlab'
                        },
                        function(err, response) {
                          if (err) {
                            debug('The API returned an error: ' + err);
                            return;
                          }

                            connection.res.json(response);
                        });
}

module.exports.verify =function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(new Buffer('google-site-verification: google79db606f71f9941f.html'));
};

module.exports.one_off_auth=(function(req, res) {
      ucode = req.query.code;
      res.set('Content-Type', 'text/plain');
      res.send(new Buffer('Applied code: '+req.query.code));
})

module.exports.playlist_items = function(req,res) {
    loadAuth(getChannel, req, res, 'playlistItems');
};

module.exports.playlists = function(req,res) {
    loadAuth(getChannel, req, res, 'playlists');
};

module.exports.video_details = function(req, res) {

   loadAuth(getVideoDetails, req, res, req.query.v);
};

module.exports.video_analytics = function(req,res) {
    loadAuth(getVideoAnalytics, req, res, req.query.c, req.query.v, req.query.t, req.query.e);
};

module.exports.list_all_channels = function(req, res) {
    loadAuth(getChannels, req, res);
};

module.exports.list_all_report_types = function(req,res) {
    loadAuth(getReportTypes, req, res);
};
module.exports.create_report = function(req, res) {
    loadAuth(createReport, req, res);
};
