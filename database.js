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
exports.findAccount = function(username, callback) {
	mongoose.connect(databaseUri);

  var accountSchema = new mongoose.Schema(
  {
    'username': String,
    'password': String,
    'email': String,
    'age': Number,
    'job': String
  }  
  );
  
  var accountModel = mongoose.model('account', accountSchema);
  
  accountModel.find({}, function(error, result) 
  {
    if (error) 
    {
      console.log(error);
    }
    else
    {
      mongoose.connection.close();
      callback.call(this, result);
      
      // Free memory
      accountModel = null;
      accountSchema = null;
    }
  });
}
/**
 * Function which retrieves a product from its ean ID
 * @param ean Product ID
 * @param callback Callback function calls when there is a result
*/
exports.findProduct = function (ean, callback)
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
		'photo': String,
		'rating': Number,
		'comments': Array
	});

	var productModel = mongoose.model('product', productSchema);

	productModel.find({}, function (error, result)
	{
		if(error)
		{
			console.log(error);
		}
		else
		{
			mongoose.connection.close();
			callback.call(this, result);

			// Free memory
			productSchema = null;
			productModel = null;
		}
	});
};

/**
 * Function which saves a new product in the database
 * @param ean The product ID
 * @param data JSON containing the data of the product
 * @param callback Callback function calls when the save ends and give the httpCode corresponding
*/
exports.saveProduct = function (ean, data, callback)
{
	var description = '';
	var rating = -1;
	var comments = [];
	var types = [];
	var photo = '';

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
		'photo': String,
		'rating': Number,
		'comments': Array
	});

	var productModel = mongoose.model('product', productSchema);

	// Product to store
	var product = new productModel({
		'ean': ean,
		'name': data.name,
		'prices': [data.price],
		'types': types,
		'gps': [data.gps],
		'description': description,
		'photo': photo,
		'rating': rating,
		'comments': comments
	});

	product.save(function (err)
	{
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
		productModel = null;
		product = null;
	});

	// Free memory
	description = null;
	rating = null;
	comments = null;
	types = null;
	photo = null;
};

