/************************************/
/*			REQUIRES				*/
/************************************/
var express = require('express');
var login = require('./login.js');
var ean = require('./ean.js');
var register = require('./register.js');
var sales = require('./sales.js');

/************************************/
/*			PARAMETERS				*/
/************************************/
var port = process.argv[2] || 8080;


/************************************/
/*			REST INTERFACE			*/
/************************************/
var app = express();
app.use(express.bodyParser());	// Parse automatically a POST request body in JSON


		/*		GET 	*/

// LOGIN request
app.get('/login', function (req, res)
{
	console.log(req.query);
	res.send();
});

// PRODUCT request
app.get('/ean', function (req, res)
{
	if(req.query.id != undefined && req.query.commentsstartindex != undefined)
	{
		// The user requests a product with a certain part of comments
		ean.getProduct(req.query.id, parseInt(req.query.commentsstartindex), function(statusCode, data)
		{
			res.statusCode = statusCode;
			res.send(data);
		});
	}
	else if(req.query.id != undefined)
	{
		// The user requests a product with the first 10 comments
		ean.getProduct(req.query.id, 0, function(statusCode, data)
		{
			res.statusCode = statusCode;
			res.send(data);
		});
	}
	else
	{
		// The service requested is not available
		res.statusCode = 404;
		res.send();
	}
});

// SALES request
app.get('/sales', function (req, res)
{
	console.log(req.query);
	res.send();
});

		/*		POST 	*/

// REGISTER request
app.post('/register', function (req, res)
{
	console.log(req.body);
	res.send();
});

// PRODUCT REQUEST
app.post('/ean', function (req, res)
{
	if(req.query.id != undefined && req.query.comment != undefined)
	{
		ean.storeComment(req.query.id, req.body, function(statusCode)
		{
			res.statusCode = statusCode;
		});
	}
	else if(req.query.id != undefined && req.query.price != undefined)
	{
		ean.storePrice(req.query.id, req.body, function(statusCode)
		{
			res.statusCode = statusCode;
		});
	}
	else if(req.query.id != undefined)
	{
		ean.storeProduct(req.query.id, req.body, function(statusCode)
		{
			res.statusCode = statusCode;
		});
	}
	else
	{
		res.statusCode = 404;
	}
	res.send();
});

// PRODUCT REQUEST
app.post('/sales', function (req, res)
{
	console.log(req.query);
	console.log(req.body);
	res.send();
});

app.listen(port);

