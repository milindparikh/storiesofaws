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
// The base config file 





exports.s3Bucket="BUCKETNAME";            // your bucket name here
exports.cloudsearchdomain="CLOUDSEARCHDOMAIN";   // your cloudsearchdomain here
exports.region="us-east-1";
exports.selfreference="saaad_config";

exports.funcName = "func_qe_real";
exports.securityRoleName = 'othrole3';

exports.funcTemplateFileName = "func_qe_template.js";
exports.funcFileName         = "/tmp/func_qe_real.js";
exports.funcZipFileName      = "/tmp/func_qe_real.zip";




exports.tables = [ 'security_roles_info_table'];
exports.tables_attribute_definitions = 'attribute_definitions';
exports.tables_key_schema = 'key_schema';
exports.tables_provisioned_throughput = 'provisioned_throughput';


exports.security_roles_info_table = 'security_roles_info_table';


// TABLE security_roles_info_table

exports.security_roles_info_table_attribute_definitions = 
    {
	AttributeName: 'securityRoleName', /* required */
	AttributeType: 'S' /* required */
    };
exports.security_roles_info_table_key_schema = 
    {
	AttributeName: 'securityRoleName', /* required */
	KeyType: 'HASH' /* required */
    };

exports.security_roles_info_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.security_roles_info_table_id_definition = 'securityRoleName';



exports.security_role_template='saaad_security_role_template.js';
exports.security_role='saaad_security_role.js';





