var request = require('request');
var parse = require('csv-parse');

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
