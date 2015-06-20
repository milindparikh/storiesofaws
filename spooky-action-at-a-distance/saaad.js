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
// The driver file





var fs = require('fs');
var saaad_config = require("./saaad_config.js");
var AWS = require("aws-sdk");
AWS.config.update({region: saaad_config.region });

var DOC = require("dynamodb-doc");
var AdmZip = require('adm-zip');
var jt = require("./json-template.js").jsontemplate;
var uuid = require('uuid');

var s3 = new AWS.S3();
var cloudsearch = new AWS.CloudSearch();
var dynamodb = new AWS.DynamoDB();
var docClient = new DOC.DynamoDB();
var iam = new AWS.IAM();
var lambda = new AWS.Lambda();






exports.init = function() {
    init_saaad();
}

exports.create = function() {
    create_saaad();
}

exports.deploy = function() {
    deploy_saaad();
    
}

exports.undeploy = function() {
    undeploy_saad();
}

exports.clean = function() {
    clean_saaad();
}    

function eolforcreate() {
    console.log("ok");
}




function init_saaad(operation) {

    var config = "saaad_config";
    
    var expandData = {'s3Bucket': saaad_config.s3Bucket};
    var securityPolicyTemplate = saaad_config.security_policy_template;
    var securityPolicy = saaad_config.security_policy;
    var securityRoleTemplate = saaad_config.security_role_template;
    var securityRole = saaad_config.security_role;
    var tables = saaad_config.tables;


    if (operation == "create_dynamodb") {
	create_dynamo_tables();
    }
    else {
	create_iam_roles();
    }	
    
    

    
    function create_dynamo_tables() {
	
	function create_tables(tables, nextCall) {

	    var totalTables = tables.length;
	    function decr() {
		totalTables = totalTables - 1;
		if (totalTables == 0) {
		    nextCall();
		}
	    }
    
	    for (index = 0; index < tables.length; index++) {
		create_table(tables[index], decr);
	    }
	}

	function create_table(table, callFunc) {
	    

	    var vAttributeDefinitions = config+"."+table+"_"+ eval(config+"."+"tables_attribute_definitions");
	    var attributeDefinitions = eval(vAttributeDefinitions);
	    
	    var vKeySchema = config  +"."+table+"_"+ eval(config+"."+"tables_key_schema");
	    
	    var keySchema = eval(vKeySchema);
	    
	    var vProvisionedThroughput = config+"."+table+"_"+eval(config+"."+"tables_provisioned_throughput");
	    
	    var provisionedThroughput = eval(vProvisionedThroughput);
	    


	    var params = {
		TableName: table /* required */
	    };
	    dynamodb.describeTable(params, function(err, data) {

		if (err) {
		    if (err.code == 'ResourceNotFoundException') { 
			
			var paramCreateTable = {
			    AttributeDefinitions: [ /* required */
				attributeDefinitions
			    ],
			    KeySchema: [ /* required */
				keySchema
			    ],
			    ProvisionedThroughput: provisionedThroughput,
			    TableName: table, /* required */
			};
			dynamodb.createTable(paramCreateTable, function(err, data) {
			    if (err) { console.log(err, err.stack); callFunc(); } // an error occurred
			    else   {  console.log(data); callFunc(); }        // successful response
			});
			
		    }
		}
		else     {
		    console.log(data); 
		    callFunc();
		}
	    });
	    
	    
	}
	
	create_tables(tables, eolforcreate);
	
    }

    function create_iam_roles() {
	
	
	fs.readFile(securityRoleTemplate, 'utf8', function (err, securityRoleTemplateFile) {
	    
	    
	    if (err) throw err;

	    var params = {
		DomainNames: [
		    saaad_config.cloudsearchdomain
		]
	    };
	    cloudsearch.describeDomains(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else {
		    console.log(data.DomainStatusList[0]);
//		    var csdendpoint = data.DomainStatusList[0].DocService.Endpoint;
		    var csdendpoint = data.DomainStatusList[0].ARN;


		    var expandData = {'s3Bucket': saaad_config.s3Bucket,
				      'csdendpoint': csdendpoint};
		    



		    
		    var jsonText = jt.expand(securityRoleTemplateFile    , expandData);
		    fs.writeFile(securityRole, jsonText, function(err) {
			if(err) {
			    return console.log(err);
			}
			else {
			    console.log("security role file written");
			    var security_roles = require("./"+securityRole);
			    var roles = security_roles.security_roles;
			    

			    function create_security_roles(roles) {
				
				var totalRoles = roles.length;
				function decr() {
				    totalRoles = totalRoles - 1;
				    if (totalRoles == 0) {
					eolforcreate();
				    }
				}
				for (index = 0; index < roles.length; index++) {
				    create_security_role(security_roles, roles[index], decr);
				}
			    }
			    
			    create_security_roles(roles);		    
			    
			}
			
		    });
		}
	    });
	});
	
	function create_security_role(roles, role, callFunc) {
	    
	    var securityRoleParams = eval("roles."+ role + "_params");
	    
	    
	    //		    console.log(role);
	    
	    
	    function createRole (roleName, securityRoleParams, callFunc) {
		console.log(JSON.stringify(securityRoleParams.RoleName));
		
		var params = {
		    RoleName: securityRoleParams.RoleName, /* required */
		    AssumeRolePolicyDocument: JSON.stringify(securityRoleParams.AssumeRolePolicyDocument)
		    
		};
		iam.createRole(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack);
			callFunc();
		    }
		    else   {  // succeful role creation
			console.log(data);
			var fullRole = data.Role;

			
			var params = {
			    RoleName: securityRoleParams.RoleName,
			    PolicyName: securityRoleParams.PolicyName, /* required */
			    PolicyDocument: JSON.stringify(securityRoleParams.PolicyDocument) /* required */
			    
			};
			iam.putRolePolicy(params, function(err, data) {
			    if (err) console.log(err, err.stack); // an error occurred
			    else  {
				console.log(data);           // successful response
				var params = {};
				params.TableName = saaad_config.security_roles_info_table;

		 		params.Item = {
				    securityRoleName: securityRoleParams.RoleName,
				    value: fullRole
				}
				docClient.putItem(params, function (err, data) {
				    if (err) {
					console.log(err);
					callFunc();
				    }
				    else {
					console.log(data);
					callFunc();
				    }
				});
			    }
			});

		    }

		});
	    }
	    createRole (role, securityRoleParams, callFunc) ;
	}
    }
}






function create_saaad() {
    var params = {
	Bucket: saaad_config.s3Bucket /* required */
    };

    
    s3.getBucketPolicy(params, function(err, data) {
	if (err) {
	    if (err.code == 'NoSuchBucketPolicy') {

		var params = {
		    DomainNames: [
			saaad_config.cloudsearchdomain
		    ]
		};
		cloudsearch.describeDomains(params, function(err, data) {
		    if (err) console.log(err, err.stack); // an error occurred
		    else {
			console.log(data.DomainStatusList[0]);
			var csdendpoint = data.DomainStatusList[0].DocService.Endpoint;
			console.log(csdendpoint);
		  
			function createLambdaFunction(csdendpoint) {
			    
			    fs.readFile(saaad_config.funcTemplateFileName, 'utf8', function (err, data) {
				if (err) throw err;
				var jsonText = jt.expand(data, {'region': saaad_config.region, 'csdendpoint': csdendpoint, '_empty': "{}"});
				fs.writeFile(saaad_config.funcFileName, jsonText, function(err) {
				    if(err) {
					return console.log(err);
				    }
				    else {
					var zip = new AdmZip();
					zip.addLocalFile(saaad_config.funcFileName);
					// get everything as a buffer
					zip.writeZip(saaad_config.funcZipFileName);
					console.log("lambda function created and zipped");
				    }
				});
			    });
			    
			}

			// ok... both a S3 bucket with non-existent policy AND a named cloudsearch domain exists

			createLambdaFunction(csdendpoint);
			
		    }
		});
	    }
	    
	    else     console.log("sorry... must use a bucket with no policies...");        
	}
    });



}



function deploy_saaad() {
    var fileBuffer = fs.readFileSync(saaad_config.funcZipFileName);

    var params = {};
    
    var tableName = saaad_config.security_roles_info_table;


    params.TableName = tableName;
    params.Key = {securityRoleName: saaad_config.securityRoleName};    
    
    docClient.getItem(params, function (err, data) {
	if (err) {
	    console.log(err);
	    callFunc();
	}
	else {

	    var roleArn = data.Item.value.Arn;


	    var params = {
		Code: {
		    ZipFile: fileBuffer
		},
		FunctionName: saaad_config.funcName, /* required */
		Handler: saaad_config.funcName+'.'+ 'handler', /* required */
		Role: roleArn, /* required */
		Runtime: 'nodejs', /* required */
		Description: 'auto-generated by storiesofaws--saaad',
		MemorySize: 128,
		Timeout: 3
	    };
	    
	    lambda.createFunction(params, function(err, data) {
		if (err) {
		    console.log(err, err.stack); // an error occurred
		}
		else       { 
		    
		    var endPoint = data.FunctionArn;
		    var params = {
			Action: 'lambda:invokeFunction', /* required */
			FunctionName: saaad_config.funcName, /* required */
			Principal: "s3.amazonaws.com", /* required */
			StatementId: uuid.v4() /* required */
		    };
		    lambda.addPermission(params, function(err, data) {
			if (err) {
			    console.log(err);
			}
			else {
			    console.log(data);
		
			    var params = {
				Bucket: saaad_config.s3Bucket, /* required */
				NotificationConfiguration: { /* required */
				    LambdaFunctionConfigurations: [
					{
					    Events: [ /* required */
						's3:ObjectCreated:*' 
					    ],
					    LambdaFunctionArn: endPoint
					    
					}
				    ]
				    
				}
			    };
			    s3.putBucketNotificationConfiguration(params, function(err, data) {
				if (err) console.log(err, err.stack); // an error occurred
				else     console.log(data);           // successful response
			    });
			}
		    });
		}
	    });
	}
    });

}


function clean_roles_and_policies() {
    
    var roleName =  saaad_config.securityRoleName; /* required */

    var securityRoleTemplateFile = saaad_config.security_role_template;
    var securityRoleTemplate  = require('./'+securityRoleTemplateFile);
    var securityRoleParams  = eval("securityRoleTemplate."+ securityRoleTemplate.security_roles[0] + "_params");
    
    var policyName = securityRoleParams.PolicyName;


    
    var params = {
	PolicyName: policyName, /* required */
	RoleName: roleName /* required */
    };
    iam.deleteRolePolicy(params, function(err, data) {
	if (err) console.log(err, err.stack); // an error occurred
	else {
	    console.log(data);           // successful response

	    var  params = {
		RoleName: roleName
	    }
	    
	    iam.deleteRole(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else  {   
		    console.log(data);           // successful response
		    
		    
		    var tables = saaad_config.tables;
		    
		    function eolDelete() {
			console.log("ok");
		    }
		    
		    function delete_tables(nextCall) {
			var totalTables = tables.length;
			function decr() {
			    totalTables = totalTables - 1;
			    if (totalTables == 0) {
				nextCall();
			    }
			}
			
			for (index = 0; index < tables.length; index++) {
			    var params = {
				TableName: tables[index]
			    };
			    dynamodb.deleteTable(params, function(err, data) {
				if (err) {
				    console.log(err, err.stack); // an error occurred
				    decr();
				}
				else {
				    console.log(data);           // successful response
				    decr();
				}
			    })
			}
		    }
		    delete_tables(eolDelete);
		}
	    });
	}
    });
}




function clean_saaad() {
    var params = {
	FunctionName: saaad_config.funcName /* required */
    };
    lambda.deleteFunction(params, function(err, data) {
	if (err) {
	    console.log(err, err.stack); // an error occurred
	    clean_roles_and_policies();
	}
	else {
	    console.log(data);           // successful response
	    clean_roles_and_policies();
	}
    });
}





function upload_saaad(file) {
    fs.readFile(file, 'utf8', function (err, data) {
	if (err) throw err; 
	var key = uuid.v4();
	var params = {Bucket: saaad_config.s3Bucket, Key: key , Body: data};
	
	s3.putObject(params, function(err, data) {
	    if (err) {
		console.log("Error uploading data: ", err);
	    } else {
		console.log("Successfully uploaded data to " +  saaad_config.s3Bucket + " Key: " + key);
	    }
	});
	
    });
}

function process_input() {
    if (process.argv[2] == 'init_d') {
	init_saaad("create_dynamodb");
    }

    if (process.argv[2] == 'init') {
	init_saaad("create");
    }
    


    if (process.argv[2] == 'create') {
	create_saaad();
    }

    if (process.argv[2] == 'deploy') {
	deploy_saaad();
    }


    if (process.argv[2] == 'upload') {
	upload_saaad(process.argv[3]);
    }


    if (process.argv[2] == 'clean') {
	clean_saaad();
    }
    
}


process_input();
