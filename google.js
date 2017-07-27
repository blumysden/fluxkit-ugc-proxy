////////////////////////////////////////////////////////////////////////////
////                          Constants
////////////////////////////////////////////////////////////////////////////

/**
 * Test Form: https://docs.google.com/forms/d/1RbUkDtK54Y0RTHTxDVy0ZMmvuHt1aLjKyU-xOGrMSWw/edit?usp=sharing
 * Test Form Submission URL: https://goo.gl/forms/gC7Bd2RoZYQNIcaT2
 * Test Form Responses: https://docs.google.com/spreadsheets/d/1aVeWeH_Jd_udL5Y-c2c9G8vvrGMmkC-akWzGZLsUfiI/edit?usp=sharing
 */
var SPREADSHEET_ID = '1aVeWeH_Jd_udL5Y-c2c9G8vvrGMmkC-akWzGZLsUfiI';
var SPREADSHEET_RANGE = 'Form Responses!A1:D105';
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';


////////////////////////////////////////////////////////////////////////////
////                           Google API
////////////////////////////////////////////////////////////////////////////

function authorize(callback) {
  var oauth2Client = google.auth.getApplicationDefault(function(err, authClient) {
    if (err) {
      return (err);
    } else {
      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
        var scopes = ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/spreadsheets'];
        authClient = authClient.createScoped(scopes);
        callback(authClient);
      } else {
        // Local development
        if (process.env.GOOGLE_AUTHORIZATION_TOKEN && process.env.GOOGLE_AUTHORIZATION_TOKEN.length > 0) {
          authClient.credentials.access_token = process.env.GOOGLE_AUTHORIZATION_TOKEN;
          callback(authClient);
        } else {
          authClient.refreshAccessToken(function() {
            callback(authClient);
          });
        }; // end if (process.env.GOOGLE_AUTHORIZATION_TOKEN && process.env.GOOGLE_AUTHORIZATION_TOKEN.length > 0)
      }; // end if (authClient.createScopedRequired && authClient.createScopedRequired())
    }; // end if err
  }); // end oauth2Client
}

function getData(auth) {
  console.log('Getting Google Spreadsheet data...')
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    majorDimension: 'ROWS',
    range: SPREADSHEET_RANGE,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    let rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      // Format the data here
      googleResponse.data = response.values;
      googleResponse.emit('update');
    }
  });
}

// Use an event emitter to get response data because request is asynchronous
// Updated when response is successful in getData()
var EventEmitter = require("events").EventEmitter;
var googleResponse = new EventEmitter();
googleResponse.on('update', function() {
  console.log('Updated Google response.');
  console.log(googleResponse.data);
});

authorize(getData);
