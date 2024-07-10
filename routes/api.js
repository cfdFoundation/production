const dbObj = require("./db.js"); // foudation app

async function init() {
	await dbObj.init();
	return
}

async function teardown() {
    await dbObj.teardown();
	return
}

//public api call, we need key system
async function getAdvisorList(req, data) {
	const queryR = "SELECT * FROM advisors";
	console.log(`Executing PG query :: ${queryR}`);
	
	const results = await dbObj.queryReturn(queryR,"advisors_select");
	
	console.log(results);
	return results;
}

module.exports = {
	init,
    teardown,
    getAdvisorList,
};
