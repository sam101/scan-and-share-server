/************************************/
/*			REQUIRES				*/
/************************************/
var database = require('./database.js');
var crypto = require('crypto');
var sha1 = crypto.createHash('sha1');

var Tokauth = require('tokauth');
var tokauth = new Tokauth(function(username) {
  return true;
});

/**
  * Generates a token using node-tokauth for a given user, 
  * sets it as the current token in the database
  * @param username user username to which we will generate a token
  * @param callback callback to call when the token has been changed (status, token)
  */
exports.genToken = function(username, callback) 
{
  tokauth.key = username + (new Date()).getTime();
  var token = tokauth.getToken(username);
  
  database.updateToken(username, token, function(status) {
    if (status != 200) {
      token = '';
    }
    callback.call(this, status, token);
  });
}
/**
  * Function which checks if an user can be connected, and if so, returns 
  * a token for the user
  * @param username User username
  * @param password User password to check
  * @param callback Callback function (statusCode, data) called when the login is successfull (or not)
  */
exports.login = function(username, password, callback)
{
  database.findAccount(username, function(result) {
    /* if the returned object is null, it means that there is no user with this
     * username in the database */
    if (result == null) 
    {
      callback.call(this, 403, ' ');
    }
    else 
    {
      //TODO: don't send he unhashed password into the network
      var hashedPassword = sha1.digest(username + password);
      //Check if the password is correct
      if (hashedPassword == result.password) {
        exports.genToken(username, function(status, token) {
          callback.call(this, status, {'token': token});        
        });
      }
      else {
        callback.call(this, 403, ' ');
      }
    }
  });    
}
/**
  * Function which register a new user into the database.
  * @param username user username
  * @param password user password
  * @param callback Callback function (statusCode) called when the registry is successfull (or not)
  */
exports.register = function(username, password, email, age, job, callback)
{
  //TODO: check the email/age
  database.registerAccount(username, password, email, age, job, function(statusCode) {
    callback.call(this, statusCode);
  });
}
