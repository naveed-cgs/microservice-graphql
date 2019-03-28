const express = require('express'),
	app = express();
const appRootPath = require('app-root-path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const {
	orderApp,
	paymentApp
  } = require(appRootPath + '/config/config.json');



app.use(bodyParser.urlencoded({
	extended: true
  }));
  app.use(bodyParser.json());


const PORT = 8081;
(async function () {
	try {
		//promise.all to grab all remote schemas at the same time, we do not care what order they come back but rather just when they finish
		//allSchemas = await Promise.all(endpoints.map(ep => getIntrospectSchema(ep)));
		//create function for /graphql endpoint and merge all the schemas
		//app.use('/graphqlClient', bodyParser.json(), graphqlExpress({ schema: mergeSchemas({ schemas: allSchemas }) }));
		

		app.post('/saveOrder', (req, res) => {
			
			try {
			  Promise.all([
				axios.post(`${orderApp}/saveOrder`, req.body),
			  ]).then(values => {
				//console.log({ data: values.map(resp => resp.data) })
				res.json({ data: values.map(resp => resp.data) });
			  }).catch(function (error) {
				console.log(error.response);
			  });
			}
			catch (err) {
			  console.log('Error while get data : ' + err);
			}
		  });

		  app.post('/makePayment', (req, res) => {
			try {
			  Promise.all([
				axios.post(`${paymentApp}/savePayment`, req.body),
			  ]).then(values => {
				res.json({ data: values.map(resp => resp.data) });
			  }).catch(function (error) {
				console.log(error.response);
			  });
			}
			catch (err) {
			  console.log('Error while get data : ' + err);
			}
		  });

		  app.get('/getOrderById/:orderId', (req, res) => {
		
			var orderId = req.params.orderId;
			
			try {
			  Promise.all([
				axios.get(`${orderApp}/getOrderStatus/${orderId}`)
			  ]).then(values => {
				
				res.json({ data: values.map(resp => resp.data) });
			  }).catch(function (error) {
				console.log(error.response);
			  });
			}
			catch (err) {
			  console.log('Error while get data : ' + err);
			}
		  });

		//start up a graphql endpoint for our main server
		app.listen(PORT, () => console.log('GraphQL API listening on port:' + PORT));
	} catch (error) {
		console.log('ERROR: Failed to grab introspection queries', error);
	}
})();


module.exports = app;