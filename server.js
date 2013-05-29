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
  if (req.query.username != undefined && req.query.password != undefined) {
    //the user wants to login: we return her the token if it is a success, a 403 error otherwise
    login.login(req.query.username, req.query.password, function(statusCode, data) {
      console.log(statusCode, data);
      res.statusCode = statusCode;
			res.setHeader("Content-Type", "application/json");
			res.send(data);
    });
  }
  else {
    res.statusCode = 404;
    res.send();
  }
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
			res.setHeader("Content-Type", "application/json;charset=utf-8");
			res.send(data);
		});
	}
	else if(req.query.id != undefined)
	{
		// The user requests a product with the first 10 comments
		ean.getProduct(req.query.id, 0, function(statusCode, data)
		{
			res.statusCode = statusCode;
			res.setHeader("Content-Type", "application/json;charset=utf-8");
			res.send(data);
		});
	}
	else if(req.query.name != undefined)
	{
		// The user requests a product by its name
		if(req.query.commentsstartindex != undefined)
		{
			ean.getProductByName(req.query, req.query.commentsstartindex, function(statusCode, data)
			{
				res.statusCode = statusCode;
				res.setHeader("Content-Type", "application/json;charset=utf-8");
				res.send(data);
			});
		}
		else
		{
			ean.getProductByName(req.query, 0, function(statusCode, data)
			{
				res.statusCode = statusCode;
				res.setHeader("Content-Type", "application/json;charset=utf-8");
				res.send(data);
			});
		}
	}
	else if(req.query.type != undefined)
	{
		// The user requests a product by its type
		if(req.query.commentsstartindex != undefined)
		{
			ean.getProductByType(req.query, req.query.commentsstartindex, function(statusCode, data)
			{
				res.statusCode = statusCode;
				res.setHeader("Content-Type", "application/json;charset=utf-8");
				res.send(data);
			});
		}
		else
		{
			ean.getProductByType(req.query, 0, function(statusCode, data)
			{
				res.statusCode = statusCode;
				res.setHeader("Content-Type", "application/json;charset=utf-8");
				res.send(data);
			});
		}
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
  console.log(req.query);
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

