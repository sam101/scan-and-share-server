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
 * @param callback Callback function called when a product description (or not) is retrieved
*/
exports.getProduct = function(ean, callback)
{
	var product = {};

	// First we look for the product in the local database
	database.findProduct(ean, function(result)
	{
		if(result.length != 0)
		{
			callback.call(this, 200, result[0]);
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
							product.prices = [parseFloat(prixingProduct.produit.price)];
						}
						product.types = [];
						product.gps = [];
						product.photo = {};
						product.photo.url = prixingProduct.produit.image.url;
						product.photo.buffer = '';
						product.rating = 0;
						product.comment = '';

						// Save product in the database
						database.saveProduct(ean, product, function(statusCode)
						{
							//~ console.log('Sauvegarde produit: ' + statusCode);
						});

						// Give the product to the client
						callback.call(this, 200, JSON.stringify(product));

						// Free memory
						prixingProduct = null;
					}
				}
			});
		}
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
