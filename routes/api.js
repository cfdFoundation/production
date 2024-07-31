const dbObj = require("./db.js"); // foudation app
const oDooObj = require("./oDoo.js"); // foudation app
const utilObj = require("./util.js"); // foudation app

async function init() {
	await dbObj.init();
	await oDooObj.init();
	await utilObj.init();
	return
}

async function teardown() {
    await dbObj.teardown();
	await oDooObj.teardown();
	await utilObj.teardown();
	return
}

async function getAdvisorList(req, data) {
	const queryR = "SELECT * FROM advisors";
	console.log(`Executing PG query :: ${queryR}`);
	
	const results = await dbObj.queryReturn(queryR,"advisors_select");
	
	console.log(results);
	return results;
}

async function cognitoPush(req,data){
	utilObj.logEvent('cognitoPush',JSON.stringify(data));
	returnObj = [{'message': 'Data Recieved.'}];
	return returnObj;
}

module.exports = {
	init,
    teardown,
    getAdvisorList,
	cognitoPush,
};