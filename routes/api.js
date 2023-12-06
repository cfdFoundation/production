const dbObj = require("./db.js"); // foudation app

async function init() {
	await dbObj.init();
	return
}

async function teardown() {
    await dbObj.teardown();
	return
}

async function getList(req, data) {
	const queryR = "SELECT * FROM employees";
	console.log(`Executing PG query :: ${queryR}`);
	
	const results = await dbObj.queryReturn(queryR,"employees_select");
	
	console.log(results);
	return results;
}

module.exports = {
	init,
    teardown,
    getList,
};