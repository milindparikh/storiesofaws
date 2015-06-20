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
// The security configuration template 


exports.security_roles = ['othrole3'];

exports.othrole3_params = {
    RoleName: 'othrole3',
    AssumeRolePolicyDocument:   {
	Version: "2012-10-17",
	Statement: [
	    {
		Sid: "",
		Effect: "Allow",
		Principal: {
		    Service: "lambda.amazonaws.com"
		},
		Action: "sts:AssumeRole"
	    }
	]
    },
    PolicyName: 'saaad_inline_role_policy', 
    PolicyDocument: {
	Version: "2012-10-17",
	Statement: [
            {
		Effect: "Allow",
		Action: [
                    "logs:*"
		],
		Resource: "arn:aws:logs:*:*:*"
            },
        {
            Effect: "Allow",
            Action: [
                "s3:GetObject",
                "s3:PutObject"
            ],
            Resource: "arn:aws:s3:::*"
        },
            {
		Effect: "Allow",
		Action: [
                    "cloudsearch:document"
		],
		Resource: "{csdendpoint}"
            }
	]
    }
};
