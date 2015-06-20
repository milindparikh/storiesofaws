// Copyright (C) 2015 Milind Parikh
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 
// The function template 




var AWS = require('aws-sdk');
AWS.config.update({
    region: '{region}'
});

var s3 = new AWS.S3();


var csd = new AWS.CloudSearchDomain({
    endpoint: '{csdendpoint}' 
});




exports.handler = function(event, context) { 
    var srcBucket = event.Records[0].s3.bucket.name;
    var srcKey   =  event.Records[0].s3.object.key;

    new AWS.S3().getObject({ Bucket: srcBucket, Key: srcKey }, function(err, data)
    {
        if (!err) {
	        var body = JSON.parse(data.Body.toString());
	        var newData = [];


	    // TODO : Make it a little more flexible
	    //      By incorp more data than just with index of 0 
	    //      and externalizing the transformation logic that flattends the structure
	    

	    
	    newData[0] = {};
            newData[0].fields = {};	    


	    newData[0].fields.name = body[0].name;
	    newData[0].fields.location = body[0].location;
	    newData[0].fields.desc = body[0].desc;
	    newData[0].type = body[0].type;
	    newData[0].id = body[0].id;
	    
	    
	    // END TODO


	        var sData = JSON.stringify(newData);

	
	        var params = {
	            contentType: 'application/json', /* required */
	            documents: sData /* required */
	        };
	        csd.uploadDocuments(params, function(err, data) {
	            if (err) { console.log(err, err.stack); context.succeed('unable to upload doc'); }// an error occurred
	            else   {  console.log(data); context.succeed('event reached'); }          // successful response
	        });
        }
        else {
	        console.log(err);
	        context.succeed('unable to read file from s3');
        }
    });


};
