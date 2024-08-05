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

function getNestedValue(obj, path) {
    returnStr = path.split('.').reduce((acc, part) => acc?.[part] ?? undefined, obj);

	if (returnStr === undefined) {
		returnStr = '';
	}

	logEvent(path, returnStr);

	return returnStr;
}

function addToObject(obj,attribute,value,len){
	value = value.toString().replace(",", " ");
	if (value.length > len){
        obj[attribute] = value;
    }
	return obj;
}

function addToObjectInt(obj,attribute,value,mod){
        try {
			obj[attribute] = Number(value) * mod;
		}
		catch(err){
			obj[attribute] = 0;
		}
	return obj;
}

module.exports = {
	init,
    teardown,
    logEvent,
	getNestedValue,
	addToObject,
	addToObjectInt,
};