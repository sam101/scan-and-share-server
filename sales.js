/************************************/
/*			REQUIRES				*/
/************************************/
var database = require('./database.js');
/**
  * Function which retrieves a list of sales
  * @param i index from which we retrieve the sales
  * @param n number of sales we retrieve
  * @param callback Callback function called when there is a result (error, result)
  */
exports.getSales = function(i, n, callback) 
{ 
  database.getSales(i,n, function(error, data) {
    if (error) {
      callback.call(this,500,' ');
    }
    else {
      callback.call(this,200,data);    
    }
  });
}
/**
 * Function which adds a sale to the database
 * @param token 
 * @param data JSON Data (description, date, price) containing the sale data
 * @param callback Callback function to call when the sale has been added to 
 * the database (or when errors have occured)
 */
exports.addSale = function(token, ean, data, callback) 
{
  database.checkToken(token, function(error, username) {
    if (username == null) {
      callback.call(this,401);      
    }
    else {
      data.username = username;
      data.ean = ean;
      database.addSale(data, function(err) {
        if (err) {
          console.log(err);
          callback.call(this,403); 
        }
        else {
          callback.call(this,200);
        }
      });
    
    }
  });  
}
