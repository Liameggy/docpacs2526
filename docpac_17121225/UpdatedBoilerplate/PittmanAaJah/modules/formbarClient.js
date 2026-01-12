const qs = require('querystring');
const FORMBASE = (process.env.FORMBAR_CLIENT_ID || 'https://formbeta.yorktechapps.com').replace(/\/$/, '');
const REDIRECT_URI = (process.env.FORMBAR_REDIRECT_URI || 'http://localhost:3000/login').trim();
const REDIRECT_PARAM = (process.env.FORMBAR_REDIRECT_PARAM || 'redirectURL').trim();

// creates the Formbar OAuth URL
function getAuthUrl() {
  const endpoint = FORMBASE + '/oauth';
  const params = {};
  params[REDIRECT_PARAM] = REDIRECT_URI;
  const url = endpoint + '?' + qs.stringify(params);
  console.log('[formbarClient] auth url ->', url);
  return url;
}

module.exports = { getAuthUrl, FORMBASE, REDIRECT_URI, REDIRECT_PARAM };
