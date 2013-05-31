/************************************/
/*			REQUIRES				*/
/************************************/
var mongoose = require('mongoose');
var crypto = require('crypto');

/************************************/
/*			PARAMETERS				*/
/************************************/
var databaseUri = 'mongodb://localhost:27017/nf28_project';

/************************************/
/*      Models initialisation       */
/************************************/

function getSalesModel()
{
  var salesSchema = new mongoose.Schema(
  {
    'username': String,
    'ean': String,
    'description': String,
    'date': Date
  });
  try
  {
    this.model = mongoose.model('sales',salesSchema);
  }
  catch (error) {}

  return this.model;
}

function getAccountModel()
{
  var accountSchema = new mongoose.Schema(
  {
    'username': String,
    'password': String,
    'email': String,
    'age': Number,
    'job': String,
    'token': String
  });
  try
  {
    // Model initialisation
    this.model = mongoose.model('account', accountSchema);
  }
  catch(error)
  {
    // The model 'account' is already initialised
  }
  return this.model;
}


/************************************/
/*			DATABASE QUERIES		*/
/************************************/
/**
  * Function which retrieves a list of sales from the database
  * @param i index from which we retrieve the sales
  * @param n number of sales we retrieve
  * @param callback Callback function called when there is a result (error, result)
  */
exports.getSales = function(i, n, callback)
{
  mongoose.connect(databaseUri);
  var salesModel = getSalesModel();

  salesModel.find({}, function(error, result) {
    if (error) {
      callback.call(this,error,null);
    }
    else {
      //TODO: Not optimized at all.
      mongoose.connection.close();
      callback.call(this,error,result.slice(i,n));
    }
  });
}
/**
  * Function which adds a sale to the database
  * @param data JSON Data (username, ean, description, date) containing the sale data
  * @param callback Callback function to call when the sale has been added to the database
  * (or when errors occured)
  */
exports.addSale = function(data, callback)
{
  mongoose.connect(databaseUri);

  var salesModel = getSalesModel();

  var sale = new salesModel({'username': data.username,
                             'ean': data.ean,
                             'description': data.description,
                             'date': data.date
                            });
  sale.save(function(err) {
    mongoose.connection.close();
    callback.call(this,err);
  });
}
/**
  * Function which retrieves an account from its username
  * @param username username
  * @param callback Callback function to call when the result is retrieved
  */
exports.findAccount = function(username, callback)
{
  mongoose.connect(databaseUri);
  var accountModel = getAccountModel();

  accountModel.findOne({'username': username}, function(error, result)
  {
    mongoose.connection.close();
    if (error)
    {
      console.log(error);
    }
    else
    {
      callback.call(this, result);
    }
    // Free memory
    accountModel = null;
    accountSchema = null;
  });
}
/**
  * Function which checks if a given token is associated to an user,
  * returns the associated user (or null if there isn't one)
  * @param token token to check
  * @param callback Callback function called when there is a result (ok, username)
  */
exports.checkToken = function(token, callback)
{
  mongoose.connect(databaseUri);
  var accountModel = getAccountModel();

  accountModel.findOne({'token': token}, function(error, result)
  {
    if (result == null) {
      callback.call(this,false,'');
    }
    else {
      callback.call(this,true,result.username);
    }
  });
}
/**
  * Function which update the token associated to an user
  * @param username user username
  * @param token new token to asscociate with the user
  * @param callback Callback function called when there is a result (status)
  */
exports.updateToken = function(username, token, callback)
{
  mongoose.connect(databaseUri);
  var accountModel = getAccountModel();
  var update = {'$set': {'token': token} };

	accountModel.update({'username': username}, update, function(err)
	{
		mongoose.connection.close();
		if(err)
		{
			callback.call(this, 500);
		}
		else
		{
			callback.call(this, 200);
		}
  });
}
/**
  * Function which adds a new user account into the database.
  * Returns a token for the user
  * @param username user username
  * @param password user password
  * @param email email address for the user
  * @param job user current job
  * @param callback Callback function called when there is a result: (status)

  */
exports.registerAccount = function(username, password, email, age, job, callback)
{
  //check if the account doesn't already exists
  exports.findAccount(username, function(result) {
    if (result != null) {
      callback.call(this, 403, '');
    }
    else {
      mongoose.connect(databaseUri);
      //hash the user password
      var sha1 = crypto.createHash('sha1');
      sha1.update(username + password);
      var hashedPassword = sha1.digest('base64');

      var accountModel = getAccountModel();
      //the account doesn't exists: we add it to the database
      var account = new accountModel({'username': username,
                                       'password': hashedPassword,
                                       'email': email,
                                       'age': age,
                                       'job': job});
      account.save(function(err) {
    		mongoose.connection.close();
    		if (err)
    		{
		      console.log(err);
		      callback.call(this, 500);
    		}
    		else
    		{
    		  callback.call(this,200);
        }
        accountSchema = null;
        account = null;
      });

    }
  });

}

/**
 * Function which retrieves a product from its ean ID
 * @param ean Product ID
 * @param callback Callback function calls when there is a result
*/
exports.findProduct = function(ean, query, callback)
{
	mongoose.connect(databaseUri);

	var productSchema = new mongoose.Schema(
	{
		'ean': String,
		'name': String,
		'prices': Array,
		'types': Array,
		'description': String,
		'photo': {
			'url': String,
			'buffer': Buffer,
			},
		'rating': Number,
		'comments': Array
	});

	try
	{
		// Model initialisation
		module.exports = mongoose.model('product', productSchema);
	}
	catch(error)
	{
		// The model 'product' is already initialised
	}

	if(ean != null)
	{
		// Query on the EAN ID of the product
		module.exports.find({'ean': ean}, function (error, result)
		{
			mongoose.connection.close();

			if(error)
			{
				console.log(error);
				callback.call(this, null);
			}
			else
			{
				callback.call(this, result);
			}
			// Free memory
			productSchema = null;
		});
	}
	else if(query != null)
	{
		if(query.name != undefined)
		{
			// Query on a product's name
			module.exports.find({'name': {'$regex': query.name, '$options': 'i'}}, function (error, result)
			{
				mongoose.connection.close();

				if(error)
				{
					console.log(error);
					callback.call(this, null);
				}
				else
				{
					callback.call(this, result);
				}
				// Free memory
				productSchema = null;
			});
		}
		else if(query.type != undefined)
		{
			// Query on a product's type
			module.exports.find({'types': {'$in': [query.type]}}, function (error, result)
			{
				mongoose.connection.close();

				if(error)
				{
					console.log(error);
					callback.call(this, null);
				}
				else
				{
					callback.call(this, result);
				}
				// Free memory
				productSchema = null;
			});
		}
		else
		{
			callback.call(this, null);
		}
	}
	else
	{
		callback.call(this, null);
	}

};

/**
 * Function which saves a new product in the database
 * @param ean The product ID
 * @param data JSON containing the data of the product
 * @param callback Callback function calls when the save ends and give the httpCode corresponding
*/
exports.saveProduct = function(ean, data, callback)
{
	var description = '';
	var rating = 0;
	var comments = [];
	var types = [];
	var photo = {};

	/*		Optional fields		*/
	if(data.description != undefined)
	{
		description = data.description;
	}
	if(data.rating != undefined)
	{
		rating = data.rating;
	}
	if(data.comments != undefined)
	{
		comments = data.comments;
	}
	if(data.types != undefined)
	{
		types = data.types;
	}
	if(data.photo != undefined)
	{
		photo = data.photo;
	}

	mongoose.connect(databaseUri);

	var productSchema = new mongoose.Schema(
	{
		'ean': String,
		'name': String,
		'prices': Array,
		'types': Array,
		'description': String,
		'photo': {
			'url': String,
			'buffer': Buffer,
			},
		'rating': Number,
		'comments': Array
	});

	try
	{
		// Model initialisation
		module.exports = mongoose.model('product', productSchema);
	}
	catch(error)
	{
		// The model 'product' is already initialised
	}

	// Product to store
	var product = new module.exports({
		'ean': ean,
		'name': data.name,
		'prices': data.prices,
		'types': types,
		'description': description,
		'photo': photo,
		'rating': rating,
		'comments': comments
	});

	product.save(function (err)
	{
		mongoose.connection.close();
		if(err)
		{
			console.log(err);
			callback.call(this, 500);
		}
		else
		{
			callback.call(this, 200);
		}

		// Free memory
		productSchema = null;
		product = null;
	});

	// Free memory
	description = null;
	rating = null;
	comments = null;
	types = null;
	photo = null;
};

/**
 * Function which saves a new comment in the database
 * @param ean The product ID
 * @param data JSON containing the rating and the comment
 * @param callback The callback function called when the new comment is saved
*/
exports.saveComment = function(ean, data, callback)
{
	mongoose.connect(databaseUri);

	var productSchema = new mongoose.Schema(
	{
		'ean': String,
		'name': String,
		'prices': Array,
		'types': Array,
		'description': String,
		'photo': {
			'url': String,
			'buffer': Buffer,
			},
		'rating': Number,
		'comments': Array
	});

	try
	{
		// Model initialisation
		module.exports = mongoose.model('product', productSchema);
	}
	catch(error)
	{
		// The model 'product' is already initialised
	}

	module.exports.find({'ean': ean}, function(err, result)
	{
		if(err)
		{
			mongoose.connection.close();
			callback.call(this, 500);
		}
		else
		{
			var product = JSON.parse(JSON.stringify(result[0]));
			var rating = parseFloat(data.rating);
			if(product.rating != 0)
			{
				rating = (product.rating + parseFloat(data.rating)) / 2;
			}
			var update = {};

			if(data.comment != undefined)
			{
				update = {'$push': {'comments': data.comment}, '$set': {'rating': rating}};
			}
			else
			{
				update = {'$set': {'rating': rating}};
			}

			module.exports.update({'ean': ean}, update, function(err)
			{
				mongoose.connection.close();
				if(err)
				{
					callback.call(this, 500);
				}
				else
				{
					callback.call(this, 200);
				}

				// Free memory
				productSchema = null;
				product = null;
				rating = null;
				update = null;
			});
		}
	});
}

/**
 * Function which saves a new price and its GPS location in the database
 * @param ean The product ID
 * @param data JSON containing the new price and the GPS location
 * @param callback The callback function called when the new price is saved
*/
exports.savePrice = function(ean, data, callback)
{
	mongoose.connect(databaseUri);

	var productSchema = new mongoose.Schema(
	{
		'ean': String,
		'name': String,
		'prices': Array,
		'types': Array,
		'description': String,
		'photo': {
			'url': String,
			'buffer': Buffer,
			},
		'rating': Number,
		'comments': Array
	});

	try
	{
		// Model initialisation
		module.exports = mongoose.model('product', productSchema);
	}
	catch(error)
	{
		// The model 'product' is already initialised
	}

	module.exports.update({'ean': ean}, {'$push': {'prices': data}}, function(err)
	{
		mongoose.connection.close();
		if(err)
		{
			callback.call(this, 500);
		}
		else
		{
			callback.call(this, 200);
		}
	});
}

