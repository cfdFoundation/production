const dbObj = require("./db.js"); // foudation app

async function init() {
	await dbObj.init();
	return
}

async function teardown() {
    await dbObj.teardown();
	return
}

async function logEvent(event, outcome) {
	const queryR = "INSERT INTO util_event_log(l_event,l_outcome) VALUES('" + event + "','" + outcome + "')";
	console.log(`Event ${event} :: ${outcome}`);
	
	dbObj.queryExecute(queryR);
	return;
}

module.exports = {
	init,
    teardown,
    logEvent,
};