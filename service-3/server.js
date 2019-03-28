const express = require('express'),
		app = express(),
		bodyParser = require('body-parser'),
		{ gql} = require('apollo-server-express'),
		{ graphql }=require('graphql'),
		{typeDefs,resolvers} = require("./graphql-schema"),
		{ApolloServer}  = require("apollo-server-express"),
		{graphqlExpress}= require('apollo-server-express'),
		{graphiqlExpress}= require('apollo-server-express'),
		neo4j = require("neo4j-driver").v1,
		{makeAugmentedSchema} = require("neo4j-graphql-js"),
		dotenv= require("dotenv");
const fetch = require('node-fetch');
		dotenv.config();



	const schema = makeAugmentedSchema({
		typeDefs,
		resolvers
	});

	const driver = neo4j.driver(
		process.env.NEO4J_URI || "bolt://216.158.228.178:7687",
		neo4j.auth.basic(
			process.env.NEO4J_USER || "neo4j",
			process.env.NEO4J_PASSWORD || "howru18"
		)
	);
	
	const server = new ApolloServer({
		context:  {driver} ,
		schema: schema
	});
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	server.applyMiddleware({ app ,path: '/graphqlClient'});
	
	app.get('/getAllPayment', (req, res) => {
		const query=`{
			Payment{
					_id
					paymentId
					orderId
					paid
					gst
					paymentType
					cardType
					cardNumber
					transactionId
					transationStatus
					paymentReferenceNumber
					createdDate
					}
			}`;
	fetch('http://localhost:8083/graphqlClient', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query:query}),
		// headers: {
		//   'Authorization': `Bearer ${accessToken}`,
		// },
	  }).then(res => res.text())
		.then(body => {res.send(body);})
		.catch(error => console.error(error));
	});

	async function getMaxPaymentId(){
		let query = "MATCH (payment:Payment) RETURN max(payment.paymentId) as maxpaymentId";
		let params="";
		//var returnval=driver.session().run(query,params).single().value();
		var returnval=await driver.session().run(query, params)
				.then( result => { return result.records.map(record => { return parseInt(record.get("maxpaymentId")); })});
		
		return returnval;
	}
	app.post('/savePayment', async(req, res) => {
		
		const query=`mutation(
			$paymentId:Int!
			$orderId: Int
			$paid: Int
			$gst: Int
			$paymentType: String
			$cardType:String
			$cardNumber: Int
			$transactionId:Int
			$transationStatus: Int
			$paymentReferenceNumber: Int
			$createdDate:String) {
			CreatePayment(
				paymentId:$paymentId
				orderId: $orderId
				paid: $paid
				gst: $gst
				paymentType: $paymentType
				cardType:$cardType
				cardNumber: $cardNumber
				transactionId:$transactionId
				transationStatus: $transationStatus
				paymentReferenceNumber: $paymentReferenceNumber
				createdDate:$createdDate) {
				_id
				paymentId
				orderId
				paid
				gst
				paymentType
				cardType
				cardNumber
				transactionId
				transationStatus
				paymentReferenceNumber
				createdDate
			}
		  }`;

		  
	const variables=req.body;
	 let paymentId=parseInt(await getMaxPaymentId())+1;
	
	
	if(isNaN(paymentId)||paymentId==null ||paymentId==undefined){
		paymentId=1;
	}
	variables.paymentId=paymentId;
	
	
	await fetch('http://localhost:8083/graphqlClient', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query:query,variables:variables}),
		// headers: {
		//   'Authorization': `Bearer ${accessToken}`,
		// },
	  }).then(res => res.text())
		.then(async body => {
			// console.log(body);

			var updatereqobj={
				"orderId":variables.orderId,
				"status":"Confirmed","isPaid":true
				};
				
				let ret=await updatePaymentStatus(updatereqobj);
			res.send(body);
		})
		.catch(error => console.error(error));
	});
async function updatePaymentStatus(updatereqobj){
	await fetch('http://localhost:8082/updateOrder', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updatereqobj),
		// headers: {
		//   'Authorization': `Bearer ${accessToken}`,
		// },
	  }).then(res => res.text())
		.then(body => {
			console.log("Update successFully");
			//res.send(body);
		})
		.catch(error => console.error(error));
}
	

	
	app.listen({ port: 8083 }, () =>
		console.log(`🚀 Server ready at http://localhost:8083${server.graphqlPath}`)
	)
