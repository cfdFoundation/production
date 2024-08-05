const awsObj = require('aws-sdk');
const https = require('https'); 
const fs = require('fs'); 

let s3;

async function init() {

	const spacesEndpoint = new awsObj.Endpoint('nyc3.digitaloceanspaces.com');
	s3 = new awsObj.S3({
	endpoint: spacesEndpoint,
	accessKeyId: 'DO00ACD9NJPAQW86AWZH',
    secretAccessKey: 'wj06eXH91/R9bz640KYBLX41r3r0z6NnXszsma67Zu0',
	});

	return
}

async function teardown() {

	return
}

async function rmFile(filename){
	fs.unlink('temp/'+filename, (err) => { 
		if (err) { 
		  console.error('Error deleting file:', err); 
		} else { 
		  console.log('File deleted successfully!');
		} 
	  }); 
}

async function writeFile(filename,data,foldername,type){
	fs.writeFile('temp/'+filename, data, (err) => { 
		if (err) { 
		  console.error('Error writing file:', err); 
		} else { 
		  console.log('File saved successfully!'); 
		  pushCDN(foldername,filename,type);
		} 
	  });
}

async function pushCDN(foldername,filename,type){
	file = 'temp/'+filename;

	const params = {
		Bucket: 'cdn-foundation',
		Key: foldername+'/'+filename,
		ContentType: type,
		Body: fs.createReadStream(file)
	};

	s3.putObject(params).
  	on('build', function(req) { req.httpRequest.headers['x-amz-acl'] = 'public-read'; }).
  	send(function(err, data) { 
		if (err) {
			console.log('Error uploading file:', err);
		} else {
			console.log('File uploaded successfully. File:', foldername+'/'+filename);
			rmFile(filename);
		} 
	});

} 

async function pushFileURL(foldername, filename, urlname, filetype) {

	https.get(urlname, (res) => { 
		var file = []; 
	   
		res.on('data', (chunk) => { 
			file.push(chunk); 
		}); 

		res.on('end', () => { 
			file = Buffer.concat(file); 
			writeFile(filename,file,foldername,filetype);
		}); 
	  }).on('error', (err) => { 
		console.error('Error retrieving file:', err); 
	  }); 
	  
	  filepath = 'https://cdn-foundation.nyc3.cdn.digitaloceanspaces.com/'+foldername+'/'+filename;

	return filepath;
}

module.exports = {
	init,
    teardown,
    pushFileURL,
};