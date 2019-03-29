const  { neo4jgraphql } =require("neo4j-graphql-js");
const  fs=require("fs");
const  path =require("path");
const { find, filter } = require('lodash');
const  neo4j = require("neo4j-driver").v1;
/*
 * Check for GRAPHQL_SCHEMA environment variable to specify schema file
 * fallback to schema.graphql if GRAPHQL_SCHEMA environment variable is not set
 */

 const typeDefs = fs
  .readFileSync(
    process.env.GRAPHQL_SCHEMA || path.join(__dirname, "schema.graphql")
  )
	.toString("utf-8");
	
	const driver = neo4j.driver(
		process.env.NEO4J_URI || "bolt://192.168.15.183:7687",
		neo4j.auth.basic(
			process.env.NEO4J_USER || "neo4j",
			process.env.NEO4J_PASSWORD || "Passw0rd19"
		)
	);
	let session = driver.session();
	
  var returnData=[ ];
  const resolvers={}
	
	exports.typeDefs=typeDefs;
	exports.resolvers=resolvers;
