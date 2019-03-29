const express = require('express'),
	app = express();
const appRootPath = require('app-root-path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const dotenv= require("dotenv");
const fetch = require('node-fetch');
		dotenv.config();


const PORT=process.env.Service_Port;		


const OrderApp=process.env.Service_OrderApp;
const PaymentApp=process.env.Service_PaymentApp;

app.use(bodyParser.urlencoded({
	extended: true
  }));
  app.use(bodyParser.json());

	app.all('*', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'); 
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	 });
	 
(async function () {
	try {
		//promise.all to grab all remote schemas at the same time, we do not care what order they come back but rather just when they finish
		//allSchemas = await Promise.all(endpoints.map(ep => getIntrospectSchema(ep)));
		//create function for /graphql endpoint and merge all the schemas
		//app.use('/graphqlClient', bodyParser.json(), graphqlExpress({ schema: mergeSchemas({ schemas: allSchemas }) }));
		

		app.post('/saveOrder', (req, res) => {
			
			try {
			  Promise.all([
				axios.post(`${OrderApp}/saveOrder`, req.body),
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
				axios.post(`${PaymentApp}/savePayment`, req.body),
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

			app.post('/updateOrder', (req, res) => {
				try {
					Promise.all([
					axios.post(`${OrderApp}/updateOrder`, req.body),
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
				axios.get(`${OrderApp}/getOrderStatus/${orderId}`)
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
			
			app.get('/getOrderByStatusAndPaid/:status/:isPaid', (req, res) => {
		
				var status = req.params.status;
				var isPaid = req.params.isPaid;
				
				try {
					Promise.all([
					axios.get(`${OrderApp}/getOrderByStatusAndPaid/${status}/${isPaid}`)
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

			app.get('/getAllOrder', (req, res) => {
		
				try {
					Promise.all([
					axios.get(`${OrderApp}/getAllOrder`)
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


				app.get('/getAllPayment', (req, res) => {
		
					try {
						Promise.all([
						axios.get(`${PaymentApp}/getAllPayment`)
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