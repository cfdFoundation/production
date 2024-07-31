const xmlrpc = require('xmlrpc');

let oDooClient;
let oDooClientTest;
let oDooDB;
let oDooUser;
let oDooPass;
let oDooUUID;

async function init() {

    //Connect to oDoo
    oDooClient = xmlrpc.createSecureClient({
        host: 'cfd-investments.odoo.com',
        port: '443',
        path: '/xmlrpc/2/object'
    });

    oDooClientTest = xmlrpc.createSecureClient({
        host: 'cfd-investments.odoo.com',
        port: '443',
        path: '/xmlrpc/2/common'
    });

    oDooDB = 'cfd-investments';
    oDooUser = 'chris.yager@cfdinvestments.com';
    oDooPass = 'd1dce00435a8f42cdc3447a89b2e3dbc1de60950';

    console.log(`XMLRPC to oDoo initialized.`);

    oDooClientTest.methodCall('version', [], (error, data) => {
        if (error) { console.log('oDoo ClientTest Error: ' + JSON.stringify(error)); }
        console.log('oDoo ClientTest Version Return: ' + JSON.stringify(data));
    });

    oDooClientTest.methodCall('authenticate', [oDooDB,oDooUser,oDooPass,''], (error, data) => {
        if (error) { console.log('oDoo ClientTest Error: ' + JSON.stringify(error)); }
        console.log('oDoo ClientTest Authenticate Return: ' + JSON.stringify(data));
        oDooUUID = JSON.stringify(data);
        testRecordPull();
    });

	return;
}

async function testRecordPull(){

    var params = [];

    oDooClient.methodCall('execute_kw', [oDooDB,oDooUUID,oDooPass,
        'res.partner',
        'search',
        [[['x_studio_type', '=', 'Prospective Adviser']]]], (error, data) => {
            if (error) { console.log('oDoo Client Error: ' + JSON.stringify(error)); }
            console.log('oDoo Client Query Recs Return: ' + JSON.stringify(data));

            params.push(data);
            params.push(['name', 'email', 'phone', 'mobile']); //fields

            oDooClient.methodCall('execute_kw', [oDooDB,oDooUUID,oDooPass,
                'res.partner',
                'read',
                params], (error, data) => {
                    if (error) { console.log('oDoo Client Error: ' + JSON.stringify(error)); }
                    console.log('oDoo Client Query Results Return: ' + JSON.stringify(data));
            });
            
    });

    return;
}

async function teardown() {
    await oDooClient.end();
    await oDooClientTest.end();
	return
}

module.exports = {
	init,
    teardown,
};