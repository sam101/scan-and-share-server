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
