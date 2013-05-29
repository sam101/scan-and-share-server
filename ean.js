/************************************/
/*			REQUIRES				*/
/************************************/
var http = require('http');
var database = require('./database.js');

/************************************/
/*			PARAMETERS				*/
/************************************/
var appKeyPrixing = 'ebe66fca00324b3a989b8a6a81d8e672';

/************************************/
/*			PRODUCT REQUESTS		*/
/************************************/

/**
 * Function which gets a product in the local database or in the Prixing database
 * @param ean The product ID
 * @param startIndex The index of the array where we start the slicing
 * @param callback Callback function called when a product description (or not) is retrieved
*/
exports.getProduct = function(ean, startIndex, callback)
{
	var product = {};

	// First we look for the product in the local database
	database.findProduct(ean, null, function(result)
	{
		if(result == null)
		{
			callback.call(this, 404, '');
		}
		else if(result.length != 0)
		{
			callback.call(this, 200, commentsSlicer(JSON.stringify(result[0]), startIndex));
		}
		else
		{
			// If the product doesn't exist we try to get it from the Prixing database
			getPrixingProduct(ean, function(result)
			{
				if(result == 'error')
				{
					// The product description is not available
					callback.call(this, 404, '');
				}
				else
				{
					// We format the result to store it in the local database and to send it to the client
					var prixingProduct = JSON.parse(result);

					if(prixingProduct.code >= 400)
					{
						callback.call(this, 404, '');
					}
					else
					{
						// Product definition
						product.ean = ean;
						product.name = prixingProduct.produit.marque[0] + ' - ' + prixingProduct.produit.titre[0];
						product.description = '';
						if(prixingProduct.produit.proprietes.utf8 != undefined)
						{
							product.description = prixingProduct.produit.proprietes.utf8;
						}
						product.prices = [];
						if(prixingProduct.produit.price != undefined)
						{
							product.prices = [{'price': parseFloat(prixingProduct.produit.price), 'gps': ''}];
						}
						product.types = [];
						product.photo = {};
						product.photo.url = prixingProduct.produit.image.url;
						product.photo.buffer = '';
						product.rating = 0;
						product.comments = [];

						// Save product in the database
						database.saveProduct(ean, product, function(statusCode)
						{
							//~ console.log('Sauvegarde produit: ' + statusCode);
						});

						// Give the product to the client
						callback.call(this, 200, commentsSlicer(JSON.stringify(product), startIndex));

						// Free memory
						product = null;
						prixingProduct = null;
					}
				}
			});
		}
	});
}

/**
 * Function which gets a product by a part of its name
 * @param query JSON containing informations passed in the URL
 * @param startIndex The index of the array where we start the slicing
 * @param callback The callback function called when we get a result
*/
exports.getProductByName = function(query, startIndex, callback)
{
	database.findProduct(null, query, function(result)
	{
		if(result == null || result.length == 0)
		{
			callback.call(this, 404, '');
		}
		else if(result.length != 0)
		{
			callback.call(this, 200, commentsSlicer(JSON.stringify(result[0]), startIndex));
		}
		else
		{
			callback.call(this, 404, '');
		}
	});
};

/**
 * Function which gets a product from its type
 * @param query JSON containing informations passed in the URL
 * @param startIndex The index of the array where we start the slicing
 * @param callback The callback function called when we get a result
*/
exports.getProductByType = function(query, startIndex, callback)
{
	database.findProduct(null, query, function(result)
	{
		if(result == null || result.length == 0)
		{
			callback.call(this, 404, '');
		}
		else if(result.length != 0)
		{
			callback.call(this, 200, commentsSlicer(JSON.stringify(result[0]), startIndex));
		}
		else
		{
			callback.call(this, 404, '');
		}
	});
};

/**
 * Function which store a new product in the database
 * @param ean The product ID
 * @param data The JSON of the product
 * @param callback The callback function called when the product is stored in the database
*/
exports.storeProduct = function(ean, data, callback)
{
	data.gps = [data.gps];
	data.prices = [{'price': parseFloat(data.price), 'gps': data.gps}];
	delete data.price;
	delete data.gps;

	var photo = {};
	photo.url = '';
	photo.buffer = '';
	if(data.buffer != undefined)
	{
		photo.buffer = data.buffer;
	}
	data.photo = photo;

	if(data.types != undefined)
	{
		data.types = data.types.split(',');
	}

	if(data.comment != undefined)
	{
		data.comments = [data.comment];
		delete data.comment;
	}

	database.saveProduct(ean, data, function(statusCode)
	{
		callback.call(this, statusCode);

		// Free memory
		photo = null;
	});
}

/**
 * Function which stores a new comment in the database
 * @param ean The product ID
 * @param data JSON containing the rating and the comment
 * @param callback The callback function called when the new comment is saved
*/
exports.storeComment = function(ean, data, callback)
{
	database.saveComment(ean, data, function(statusCode)
	{
		callback.call(this, statusCode);
	});
}

/**
 * Function which stores a new price and its GPS location
 * @param ean The product ID
 * @param data JSON containing the new price and the GPS location
 * @param callback The callback function called when the new price is saved
*/
exports.storePrice = function(ean, data, callback)
{
	var price = {'price': parseFloat(data.price), 'gps': data.gps};
	database.savePrice(ean, price, function(statusCode)
	{
		callback.call(this, statusCode);
		// Free memory
		price = null;
	});
}

/**
 * Function which retrieves a product from Prixing database
 * @param ean The product ID
 * @param callback The callback function called when we've got a response from Prixing API
*/
function getPrixingProduct(ean, callback)
{
	var prixingUri = 'http://v1.prixing.fr/api/v1/ean/';

	// GET request
	var request = http.get(prixingUri + ean + '?key=' + appKeyPrixing, function(response)
	{
		var buffer = '';
		response.on('data', function (chunk)
		{
			buffer += chunk;
		});

		response.on('end', function()
		{
			callback.call(this, buffer);

			// Free memory
			prixingUri = null;
			request = null;
			buffer = null;
		});
	});

	request.on('error', function(exception)
	{
		console.log('[HTTP REQUEST] An error has occured: ' + exception);
		callback.call(this, 'error');

		// Free memory
		prixingUri = null;
		request = null;
	});
}

/**
 * Function which slices the comments array
 * @param data The JSON of a product stringified
 * @param startIndex The beginning of the slicing of the array
 * @return String The new JSON of the product
*/
function commentsSlicer(data, startIndex)
{
	var dataParsed = JSON.parse(data);
	dataParsed.comments = dataParsed.comments.slice(startIndex, startIndex + 10);
	return JSON.stringify(dataParsed);
}

