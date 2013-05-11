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
	res.send();
});

// PRODUCT request
app.get('/ean', function (req, res)
{
	console.log(req.query);
	res.send();
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
	console.log(req.query);
	console.log(req.body);
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

