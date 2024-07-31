//Route Objects
const fAPI = require("./api.js"); // foudation app
const fFramework = require("./framework.js"); // foudation app

//Initialize Objects
fAPI.init();
fFramework.init();


//When Shutting down, teardown Route Objects
const gracefulShutdown = () => {
	console.log(`Shutting down route objects ...`);
	
	fAPI.teardown()
		.catch(() => {})
		.then(() => process.exit());

	fFramework.teardown()
		.catch(() => {})
		.then(() => process.exit());
};

//shutdown services
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon



module.exports = async (req, res) => {
	
	const routerR = req.params.router;
	const methodR = req.params.method;
	const dataR = req.body;
	
	console.log(`Router calling route:${routerR} method:${methodR} ...`);

	//Send Response back to the requester
	const sendR = (results) => {
		res.setHeader("Content-Type", "application/json");
		res.status(200);
		res.send(JSON.stringify(results));
	};
	
	
	//****************************
	// Route Object Bindings
	//*******************************
	
	//api Route Binding
	if (routerR == "api"){
		const results = await fAPI[methodR](req,dataR);
		sendR(results);
	}
	if (routerR == "framework"){
		const results = await fFramework[methodR](req,dataR);
		sendR(results);
	}
	
	
};
