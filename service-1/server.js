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
	
	app.get('/getAllOrder', (req, res) => {
		const query=`{
			Order{
					_id
					orderId
					orderDetails
					orderTotalAmt
					orderDiscountAmt
					orderGrandTotal
					status
					isCancelled
					isPaid
		  			createdDate
					createdBy
					updatedBy
					}
			}`;
	fetch('http://localhost:8082/graphqlClient', {
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

	app.get('/getOrderStatus/:orderId', (req, res) => {
		
		const query=`query getOrderById($orderId:Int){
			Order(orderId:$orderId){
					_id
					orderId
					orderDetails
					orderTotalAmt
					orderDiscountAmt
					orderGrandTotal
					status
					isCancelled
					isPaid
		  			createdDate
					createdBy
					updatedBy
					}
			}`;
		const variables={orderId:req.params.orderId};
	fetch('http://localhost:8082/graphqlClient', {
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
			$orderDetails:String
			$orderTotalAmt:Int
			$orderDiscountAmt:Int
			$orderGrandTotal:Int
			$status:String
			$isCancelled:Boolean
			$isPaid:Boolean
			$createdBy:Int
			$createdDate:String
			$updatedBy:Int
			$updatedDate:String) {
			CreateOrder(
						orderId:$orderId
					    orderDetails:$orderDetails
						orderTotalAmt:$orderTotalAmt
						orderDiscountAmt:$orderDiscountAmt
						orderGrandTotal:$orderGrandTotal
						status:$status
						isCancelled:$isCancelled
						isPaid:$isPaid
						createdBy:$createdBy
						createdDate:$createdDate
						updatedBy:$updatedBy
						updatedDate:$updatedDate
			){
			  _id
			  orderId
			  orderDetails
			  orderTotalAmt
			  orderDiscountAmt
			  orderGrandTotal
			  status
			  isCancelled
			  isPaid
			  createdBy
			  createdDate
			  updatedBy
			  updatedDate
			}
		  }`;

		  
	const variables=req.body;
	 let orderId=parseInt(await getMaxOrder())+1;
	
	
	if(isNaN(orderId)||orderId==null ||orderId==undefined){
		orderId=1;
	}
	variables.orderId=orderId;
	
	fetch('http://localhost:8082/graphqlClient', {
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
				orderDetails
				orderTotalAmt
				orderDiscountAmt
				orderGrandTotal
				status
				isCancelled
				isPaid
				createdBy
				createdDate
				updatedBy
				updatedDate
			  }
			}`;
	const variables=req.body;
	fetch('http://localhost:8082/graphqlClient', {
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


	
	app.listen({ port: 8082 }, () =>
		console.log(`🚀 Server ready at http://localhost:8082${server.graphqlPath}`)
	)
