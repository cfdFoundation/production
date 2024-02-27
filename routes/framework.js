const dbObj = require("./db.js"); // foudation app

async function init() {
	await dbObj.init();
	return
}

async function teardown() {
    await dbObj.teardown();
	return
}

async function setCacheTimeout(req, data) {
	const queryR = "SELECT * FROM employees";
	console.log(`Executing PG query :: ${queryR}`);
	
	const results = await dbObj.queryReturn(queryR,"employees_select");
	
	console.log(results);
	return results;
}

async function redirectURL(req, data) {
	const queryR = "SELECT * FROM framework_redirectURL where entryURL = '"+data.entryURL+"'";
	const cacheKey = "CacheKey_" + data.entryURL;

	console.log(`Executing PG query :: ${queryR}`);

	const results = await dbObj.queryReturn(queryR,cacheKey,86400);
	
	console.log(results);
	return results;
}

module.exports = {
	init,
    teardown,
    setCacheTimeout,
	redirectURL,
};