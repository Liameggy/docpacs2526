const qs = require('querystring');
const FORMBASE = (process.env.FORMBAR_CLIENT_ID || 'https://formbeta.yorktechapps.com').replace(/\/$/, '');
const REDIRECT_URI = (process.env.FORMBAR_REDIRECT_URI || 'http://localhost:3000/login').trim();

function buildAuthUrl() {
  const endpoint = FORMBASE + '/oauth';
  const params = { redirectURL: REDIRECT_URI };
  return endpoint + '?' + qs.stringify(params);
}

module.exports = { buildAuthUrl, FORMBASE, REDIRECT_URI };
// handles Formbar OAuth stuff