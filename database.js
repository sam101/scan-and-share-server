/************************************/
/*			REQUIRES				*/
/************************************/
var mongoose = require('mongoose');

/************************************/
/*			PARAMETERS				*/
/************************************/
var databaseUri = 'mongodb://localhost:27017/nf28_project';

/************************************/
/*			DATABASE QUERIES		*/
/************************************/
/**
  * Function which retrieves an account from its username
  * @param username username
  * @param callback Callback function to call when the result is retrieved
  */
exports.findAccount = function(username, callback)
{
  mongoose.connect(databaseUri);

  var accountSchema = new mongoose.Schema(
  {
    'username': String,
    'password': String,
    'email': String,
    'age': Number,
    'job': String
  });
  try
  {
    // Model initialisation
    module.exports = mongoose.model('account', accountSchema);
  }
  catch(error)
  {
    // The model 'account' is already initialised
  }

  module.exports.find({'username': username}, function(error, result)
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
 * Function which retrieves a product from its ean ID
 * @param ean Product ID
 * @param callback Callback function calls when there is a result
*/
exports.findProduct = function(ean, callback)
{
	mongoose.connect(databaseUri);

	var productSchema = new mongoose.Schema(
	{
		'ean': String,
		'name': String,
		'prices': Array,
		'types': Array,
		'gps': Array,
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

	module.exports.find({'ean': ean}, function (error, result)
	{
		mongoose.connection.close();

		if(error)
		{
			console.log(error);
		}
		else
		{
			callback.call(this, result);
		}
		// Free memory
		productSchema = null;
	});
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
	if(data.comment != undefined)
	{
		comments[0] = data.comment;
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
		'gps': Array,
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
		'gps': data.gps,
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
		'gps': Array,
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
		'gps': Array,
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

	module.exports.update({'ean': ean}, {'$push': {'gps': data.gps, 'prices': parseFloat(data.price)}}, function(err)
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

