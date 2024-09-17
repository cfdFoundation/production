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

//public api call, we need key system
async function getAdvisorList(req, data) {
	const queryR = "SELECT * FROM advisors";
	console.log(`Executing PG query :: ${queryR}`);
	
	const results = await dbObj.queryReturn(queryR,"advisors_select");
	
	console.log(results);
	return results;
}

async function cognitoPush(req,data){
	utilObj.logEvent('cognitoPush',JSON.stringify(data));
	oDooObj.pushCognitoData(data,utilObj);
	returnObj = [{'message': 'Data Recieved.'}];
	return returnObj;
}

async function getCommitteeMessages(req,data){
	utilObj.logEvent('getCommitteeMessages',JSON.stringify(data));
	userID = data.userid;
	//userID = 18; //debug
	const results = await oDooObj.getCommitteeMessages(userID,utilObj);
	return results;
}

async function pushCommitteeMessage(req,data){
	utilObj.logEvent('pushCommitteeMessage',JSON.stringify(data));

	userID = data.userid;
	targetID = data.targetid;
	message = data.message;
	
	oDooObj.pushCommitteeMessage(userID,targetID,message);

	return;
}

module.exports = {
	init,
    teardown,
    getAdvisorList,
	cognitoPush,
	getCommitteeMessages,
	pushCommitteeMessage,
};
