process.env.GOOGLE_APPLICATION_CREDENTIALS = './client_secret.json'
var request = require('request');
var parse = require('csv-parse');

var google = require('googleapis');
var googleAuth = require('google-auth-library');

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1HjoRA-DvEPZ6Cqg6UuadT5FAF0bVPK_zC5GHdG2KG6w/pub?gid=1880008187&single=true&output=csv'

exports.fluxUgcProxy = function fluxUgcProxy (req, res) {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET')
  request(SHEET_URL, (error, response, body) => {
    // res.send({ error, response, body });
    if (error) {
      res.send(`COULD NOT COMPLETE REQUEST`);
    } else if (response && response.statusCode) {
      parse(body, {}, (err, output) => {
        if (err) {
          res.send(`COULD NOT PARSE CSV`);
        } else {
          res.send(output);
        }
      });
      // res.send(body);
    }
  })
};


////////////////////////////////////////////////////////////////////////////
////                          Constants
////////////////////////////////////////////////////////////////////////////

/**
 * Test Form: https://docs.google.com/forms/d/1RbUkDtK54Y0RTHTxDVy0ZMmvuHt1aLjKyU-xOGrMSWw/edit?usp=sharing
 * Test Form Submission URL: https://goo.gl/forms/gC7Bd2RoZYQNIcaT2
 * Test Form Responses: https://docs.google.com/spreadsheets/d/1aVeWeH_Jd_udL5Y-c2c9G8vvrGMmkC-akWzGZLsUfiI/edit?usp=sharing
 */
// var SPREADSHEET_ID = '1aVeWeH_Jd_udL5Y-c2c9G8vvrGMmkC-akWzGZLsUfiI';
var SPREADSHEET_ID = '1HjoRA-DvEPZ6Cqg6UuadT5FAF0bVPK_zC5GHdG2KG6w'
process.env.GOOGLE_APPLICATION_CREDENTIALS = './client_secret.json'

////////////////////////////////////////////////////////////////////////////
////                           Google API
////////////////////////////////////////////////////////////////////////////

function authorize(callback) {
  var oauth2Client = google.auth.getApplicationDefault(function(err, authClient) {
    if (err) {
      return (err);
    } else {
      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
        var scopes = ['https://www.googleapis.com/auth/drive'];
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

exports.fluxUgcReader = function fluxUgcProxy (req, res) {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  authorize((auth) => {
    var drive = google.drive({ version: 'v3', auth });
    var params = { fileId: SPREADSHEET_ID, mimeType: 'text/csv' }
    drive.files.export(params, (err, response) => {
      if (err) {
        res.send(`COULD NOT CONNECT: ${err}`);
      } else {
        parse(response, {}, (err, output) => {
          if (err) {
            // console.log('could not parse');
            res.send(`COULD NOT PARSE CSV: ${err}`);
          } else {
            res.send(output);
          }
        });
      }
    });
  })
}
