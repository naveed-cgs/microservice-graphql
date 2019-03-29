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
		process.env.NEO4J_URI || "bolt://192.168.15.183:7687",
		neo4j.auth.basic(
			process.env.NEO4J_USER || "neo4j",
			process.env.NEO4J_PASSWORD || "Passw0rd19"
		)
	);
	const PORT=process.env.Service_Port;
	
	const server = new ApolloServer({
		context:  {driver} ,
		schema: schema
	});
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	server.applyMiddleware({ app ,path: '/graphqlClient'});
	
	app.get('/getAllOrder', (req, res) => {
		const query=`{
			Order{
					_id
					orderId
					orderName
					orderDetails
					orderQuantity
					orderTotalAmt
					orderDiscountAmt
					orderGrandTotal
					status
					isCancelled
					isPaid
					createdBy
		  			createdDate
					}
			}`;
	fetch('http://localhost:'+PORT+'/graphqlClient', {
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

	app.get('/getOrderByStatusAndPaid/:status/:isPaid', (req, res) => {
		const query=`query getOrderByStatusAndPaid($status:String,$isPaid:Boolean){
			Order(status:$status
			isPaid:$isPaid
			){
			_id 
			orderId 
			orderName 
			orderDetails 
			orderQuantity 
			orderTotalAmt 
			orderDiscountAmt 
			orderGrandTotal 
			status 
			isCancelled 
			isPaid 
			createdBy 
			createdDate
			}
			}`;
	const isPaid=false;
	if(req.params.isPaid=="true" ||req.params.isPaid==true){
		isPaid=true;
	}
	const variables={status:req.params.status,isPaid:isPaid};
	fetch('http://localhost:'+PORT+'/graphqlClient', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query:query,variables:variables}),
		// headers: {
		//   'Authorization': `Bearer ${accessToken}`,
		// },
	  }).then(res => res.text())
		.then(body => {res.send(body);})
		.catch(error => console.error(error));
	});

	app.get('/getOrderStatus/:orderId', (req, res) => {
		
		const query=`query getOrderById($orderId:Int){
			Order(orderId:$orderId){
					_id
					orderId
					orderName
					orderDetails
					orderQuantity
					orderTotalAmt
					orderDiscountAmt
					orderGrandTotal
					status
					isCancelled
					isPaid
					createdBy
		  			createdDate
					}
			}`;
		const variables={orderId:req.params.orderId};
	fetch('http://localhost:'+PORT+'/graphqlClient', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query:query,variables:variables}),
		// headers: {
		//   'Authorization': `Bearer ${accessToken}`,
		// },
	  }).then(res => res.text())
		.then(body => {res.send(body);})
		.catch(error => console.error(error));
	});


	async function getMaxOrder(){
		let query = "MATCH (order:Order) RETURN max(order.orderId) as maxorderId";
		let params="";
		//var returnval=driver.session().run(query,params).single().value();
		var returnval=await driver.session().run(query, params)
				.then( result => { return result.records.map(record => { return parseInt(record.get("maxorderId")); })});
		
		return returnval;
	}

	app.post('/saveOrder', async(req, res) => {
		
		const query=`mutation(
			$orderId:Int
			$orderName:String
			$orderDetails:String
			$orderQuantity:Int
			$orderTotalAmt:Int
			$orderDiscountAmt:Int
			$orderGrandTotal:Int
			$status:String
			$isCancelled:Boolean
			$isPaid:Boolean
			$createdBy:String
			$createdDate:String) {
			CreateOrder(
						orderId:$orderId
						orderName:$orderName
						orderDetails:$orderDetails
						orderQuantity:$orderQuantity
						orderTotalAmt:$orderTotalAmt
						orderDiscountAmt:$orderDiscountAmt
						orderGrandTotal:$orderGrandTotal
						status:$status
						isCancelled:$isCancelled
						isPaid:$isPaid
						createdBy:$createdBy
						createdDate:$createdDate
			){
			  _id
			  orderId
			  orderName
			  orderDetails
			  orderQuantity
			  orderTotalAmt
			  orderDiscountAmt
			  orderGrandTotal
			  status
			  isCancelled
			  isPaid
			  createdBy
			  createdDate
			}
		  }`;

		  
	const variables=req.body;
	 let orderId=parseInt(await getMaxOrder())+1;
	
	
	if(isNaN(orderId)||orderId==null ||orderId==undefined){
		orderId=1;
	}
	variables.orderId=orderId;
	
	fetch('http://localhost:'+PORT+'/graphqlClient', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query:query,variables:variables}),
		// headers: {
		//   'Authorization': `Bearer ${accessToken}`,
		// },
	  }).then(res => res.text())
		.then(body => {res.send(body);})
		.catch(error => console.error(error));
	});

	app.post('/updateOrder', (req, res) => {
		
		const query=`mutation(
			$orderId:Int!
			  $status:String
			$isPaid:Boolean
			  ) {
			  UpdateOrder( 
				  orderId:$orderId,
						status:$status,
				  isPaid:$isPaid
					  ){
				_id
				orderId
				orderName
				orderDetails
				orderQuantity
				orderTotalAmt
				orderDiscountAmt
				orderGrandTotal
				status
				isCancelled
				isPaid
				createdBy
				createdDate
			  }
			}`;
	const variables=req.body;
	fetch('http://localhost:'+PORT+'/graphqlClient', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query:query,variables:variables}),
		// headers: {
		//   'Authorization': `Bearer ${accessToken}`,
		// },
	  }).then(res => res.text())
		.then(body => {res.send(body);})
		.catch(error => console.error(error));
	});


	
	app.listen({ port: PORT }, () =>
		console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
	)
