const xmlrpc = require('xmlrpc');
const cdnObj = require('./doCDN.js');
const testData = require('./test_data.js');


let oDooClient;
let oDooClientTest;
let oDooDB;
let oDooUser;
let oDooPass;
let oDooUUID;

async function init() {

    //DigitalOcean CDN
    cdnObj.init();

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

async function teardown() {
    await oDooClient.end();
    await oDooClientTest.end();
    await cdnObj.teardown();
	return
}

async function testRecordPull(){

    var params = [];

    oDooClient.methodCall('execute_kw', [oDooDB,oDooUUID,oDooPass,
        'res.partner',
        'search',
        [[['x_studio_type', '=', 'Prospective Adviser']]]], (error, data) => {
            if (error) { console.log('oDoo Client Error: ' + JSON.stringify(error)); }
            console.log('oDoo Client Query Recs Return: ' + JSON.stringify(data));

            params.push(data[0]);
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

async function pushFileToODoo(filename,fileURL,utilObj,oDooID){

    //Push files to documents.document in oDoo name, partner_id, type(URL), URL

    newRecordObj_pf = {};

    inputString = "Hello World";
    base64String = Buffer.from(inputString).toString("base64");

    newRecordObj_pf = utilObj.addToObject(newRecordObj_pf,'name',filename,0);
    newRecordObj_pf = utilObj.addToObjectInt(newRecordObj_pf,'partner_id',oDooID,1);
    newRecordObj_pf = utilObj.addToObject(newRecordObj_pf,'type','url',0);
    newRecordObj_pf = utilObj.addToObject(newRecordObj_pf,'url',fileURL,0);
    newRecordObj_pf = utilObj.addToObjectInt(newRecordObj_pf,'folder_id',13,1);
    newRecordObj_pf.spreadsheet_binary_data = base64String;

    newRecord_pf = [];
    newRecord_pf[0] = newRecordObj_pf;
    console.log(JSON.stringify(newRecord_pf));

    //Push to documents.document in oDoo
    oDooClient.methodCall('execute_kw', [oDooDB,oDooUUID,oDooPass,
        'documents.document',
        'write',
        newRecord], (error, data) => {
            if (error) { console.log('oDoo Client Error: ' + JSON.stringify(error)); }
            console.log('oDoo document.documents write Return: ' + JSON.stringify(data));
    });

}

async function pushCognitoData(inData,utilObj){

    //use test data
    //inData = await testData.getData();

    if (inData.Partnerid == undefined){
        return; 
    }

    oDooContactId = Number(inData.Partnerid.toString().replace(" ", ""));
    console.log('Partner_id: ' + oDooContactId);

    var params = [];

    //oDoo Demo Data Override
    c_name = utilObj.getNestedValue(inData, 'Name.FirstAndLast');
    c_email = utilObj.getNestedValue(inData, 'PreferredEmail');
    c_phone = utilObj.getNestedValue(inData, 'PrimaryBusinessInformation.Phone');
    c_website = utilObj.getNestedValue(inData, 'PrimaryBusinessInformation.BusinessWebsite');
    c_addr_line1 = utilObj.getNestedValue(inData, 'ResidenceInformation.HomeAddress.Line1');
    c_addr_line2 = utilObj.getNestedValue(inData, 'ResidenceInformation.HomeAddress.Line2');
    c_addr_city = utilObj.getNestedValue(inData, 'ResidenceInformation.HomeAddress.City');
    c_addr_state = utilObj.getNestedValue(inData, 'ResidenceInformation.HomeAddress.State');
    c_addr_zip = utilObj.getNestedValue(inData, 'ResidenceInformation.HomeAddress.PostalCode');
    c_cell = utilObj.getNestedValue(inData, 'ResidenceInformation.Phone');

    
    //oDoo Onboarding Tab
    //Interest
    c_motivated = utilObj.getNestedValue(inData, 'CFDInterest.WhyAreYouMotivatedToJoinCFD'); 
    c_motivated_comments = utilObj.getNestedValue(inData, 'CFDInterest.GeneralCommentsForMotivationToJoinCFD'); 
    
    //Gross Compensation
    c_gross_compensation = utilObj.getNestedValue(inData, 'GrossCompensation.WhatWasYourGrossCompensationForTheLast12Months');

    //Business Mix
    //Comission Based
    c_busMixCom_DirectMutualFunds = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.DirectMutualFunds');
    c_busMixCom_Alternatives = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.Alternatives');
    c_busMixCom_TransferAgent = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.TransferAgent');
    c_busMixCom_VariableAnnuitiesVUL = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.VariableAnnuitiesVUL');
    c_busMixCom_OtherInsurance = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.OtherInsurance');
    c_busMixCom_BrokerageAccounts = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.NumberOfBrokerageAccounts');
    c_busMixCom_EIAFIA = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.EIAFIA');
    c_busMixCom_Brokerage = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.Brokerage');
    c_busMixCom_DirBusAccounts = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.NumberOfDirectBusinessAccounts');
    c_busMixCom_AltsUsed = utilObj.getNestedValue(inData, 'CurrentBusinessMix.CommissionBased.AltsUsed');

    //Business Mix
    //Fee Based
    c_busMixFee_TPAM = utilObj.getNestedValue(inData, 'CurrentBusinessMix.FeeBased.TPAM');
    c_busMixFee_AdviserManaged = utilObj.getNestedValue(inData, 'CurrentBusinessMix.FeeBased.AdviserManaged');
    c_busMixFee_CompanyManaged = utilObj.getNestedValue(inData, 'CurrentBusinessMix.FeeBased.CompanyManaged');
    c_busMixFee_Planning = utilObj.getNestedValue(inData, 'CurrentBusinessMix.FeeBased.Planning');
    c_busMixFee_FeeBasedAccounts = utilObj.getNestedValue(inData, 'CurrentBusinessMix.FeeBased.NumberOfFeeBasedAccounts');
    c_busMixFee_TPAMsUsed = utilObj.getNestedValue(inData, 'CurrentBusinessMix.FeeBased.TPAMsUsed');

    //Additional Business Mix
    //IMO/FMO
    c_busMixImoFmo_YesNo = utilObj.getNestedValue(inData, 'AdditionalBusinessMix.DoYouUtilizeAnIMOOrFMOToRunYourFixedBusinessThrough');
    c_busMixImoFmo_List = utilObj.getNestedValue(inData, 'AdditionalBusinessMix.ListIMOsFMOs');


    //Files, push to Digital Ocean first
    c_irs_file = utilObj.getNestedValue(inData, 'GrossCompensation.IRS1099.0.File'); 
    c_dl_file = utilObj.getNestedValue(inData, 'CopyOfDriversLicense.0.File');
    c_pdf1_file = utilObj.getNestedValue(inData, 'Entry.Document1');
    c_pdf2_file = utilObj.getNestedValue(inData, 'Entry.Document2');

    //update Records at oDoo
    //[[id], {'name': "Newer partner"}]

    newRecordObj = {};

    //Basic Demo potential update
    newRecordObj = utilObj.addToObject(newRecordObj,'name',c_name,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'email',c_email,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'phone',c_phone,9);
    newRecordObj = utilObj.addToObject(newRecordObj,'website',c_website,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'mobile',c_cell,5);

    //Update Addr from Business Addr
    //Question: What do we want to do with the Residence Address at this point?
    newRecordObj = utilObj.addToObject(newRecordObj,'street',c_addr_line1,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'street2',c_addr_line2,1);
    newRecordObj = utilObj.addToObject(newRecordObj,'city',c_addr_city,5);
    //State needs an ID lookup, cirlcing back later
    //newRecordObj = utilObj.addToObject(newRecordObj,'email',c_email,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'zip',c_addr_zip,4);

    //Add/Update Onboarding/Business Mix in oDoo
    newRecordObj = utilObj.addToObject(newRecordObj,'x_studio_motivated',c_motivated,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'x_studio_motivated_comments',c_motivated_comments,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'x_studio_busmixcom_altsused',c_busMixCom_AltsUsed,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'x_studio_busmixfee_tpamsused',c_busMixFee_TPAMsUsed,5);
    newRecordObj = utilObj.addToObject(newRecordObj,'x_studio_busmiximofmo_list',c_busMixImoFmo_List,5);

    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_gross_compensation',c_gross_compensation,1);

    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_directmutualfunds',c_busMixCom_DirectMutualFunds,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_alternatives',c_busMixCom_Alternatives,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_transferagent',c_busMixCom_TransferAgent,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_variableannuitiesvul',c_busMixCom_VariableAnnuitiesVUL,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_otherinsurance',c_busMixCom_OtherInsurance,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_eiafia',c_busMixCom_EIAFIA,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_brokerage',c_busMixCom_Brokerage,100);

    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_brokerageaccounts',c_busMixCom_BrokerageAccounts,1);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixcom_dirbusaccounts',c_busMixCom_DirBusAccounts,1);
    

    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixfee_tpam',c_busMixFee_TPAM,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixfee_advisermanaged',c_busMixFee_AdviserManaged,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixfee_companymanaged',c_busMixFee_CompanyManaged,100);
    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixfee_planning',c_busMixFee_Planning,100);

    newRecordObj = utilObj.addToObjectInt(newRecordObj,'x_studio_busmixfee_feebasedaccounts',c_busMixFee_FeeBasedAccounts,1);


    file_pdf1 = '';
    file_pdf2 = '';
    file_dl = '';
    file_irs = '';

    //Send file to DigitalOcean CDN
    if (c_pdf1_file.length > 0){
        filename = '_prpq_'+oDooContactId+'.pdf';
        cdnObj.pushFileURL('OnBoarding',filename,c_pdf1_file, 'application/pdf');
        file_pdf1 = 'https://cdn-foundation.nyc3.cdn.digitaloceanspaces.com/OnBoarding/'+'_prpq_'+oDooContactId+'.pdf';

        newRecordObj.x_studio_prpdq_form = file_pdf1;

        //pushFileToODoo(filename,file_pdf1,utilObj,oDooContactId);
    }
    if (c_pdf2_file.length > 0){
        filename = '_prpqFull_'+oDooContactId+'.pdf';
        cdnObj.pushFileURL('OnBoarding',filename,c_pdf2_file, 'application/pdf');
        file_pdf2 = 'https://cdn-foundation.nyc3.cdn.digitaloceanspaces.com/OnBoarding/'+'_prpqFull_'+oDooContactId+'.pdf';

        //pushFileToODoo(filename,file_pdf2,utilObj,oDooContactId);
    }
    if (c_dl_file.length > 0){
        filename = '_dl_'+oDooContactId+'.png';
        cdnObj.pushFileURL('OnBoarding',filename,c_dl_file,'image/png');
        file_dl = 'https://cdn-foundation.nyc3.cdn.digitaloceanspaces.com/OnBoarding/'+'_dl_'+oDooContactId+'.png';

        newRecordObj.x_studio_drivers_license = file_dl;

        //pushFileToODoo(filename,file_dl,utilObj,oDooContactId);
    }
    if (c_irs_file.length > 0){
        filename = '_irs_'+oDooContactId+'.png';
        cdnObj.pushFileURL('OnBoarding',filename,c_irs_file,'image/png');
        file_irs = 'https://cdn-foundation.nyc3.cdn.digitaloceanspaces.com/OnBoarding/'+'_irs_'+oDooContactId+'.png';

        newRecordObj.x_studio_irs_1099 = file_irs;

        //pushFileToODoo(filename,file_irs,utilObj,oDooContactId);
    }
    

    

    newRecord = [];
    newRecord[0] = [oDooContactId];
    newRecord[1] = newRecordObj;

    console.log(JSON.stringify(newRecord));

    //Push to res.partner in oDoo
    oDooClient.methodCall('execute_kw', [oDooDB,oDooUUID,oDooPass,
        'res.partner',
        'write',
        newRecord], (error, data) => {
            if (error) { console.log('oDoo Client Error: ' + JSON.stringify(error)); }
            console.log('oDoo res.partner write Return: ' + JSON.stringify(data));
    });

    return;
            
}



module.exports = {
	init,
    teardown,
    pushFileToODoo,
    pushCognitoData,
};