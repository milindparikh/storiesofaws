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



Date : 06/20/2015 
Author: Milind Parikh




INTRODUCTION 

This project enables a near real time micro-indexing service between a S3 bucket and a cloud search domain through the introduction of a lambda function. This enables "spooky action at a distance" so that inserts into S3 automatically indexes the data into cloudearch. 

PREREQS

0. THe s3 bucket and the cloud search domain already present

1. AWS account that enables you to 
     a. create and assign roles
     b. create lambda functions 
     c. browse the specific S3 bucket (describe functionality) and attach events handlers 
     d. browse the cloudsearchdomain and able to utilize the permssions
     e. create and use dynamodbs


2. Nodejs installed and configured

   Following mods installed 
         adm-zip   
         aws-sdk
	 dynamodb-doc
    	 uuid

3. The git clone of this project     

4. Edits of the saaad_config.js file for your specific conditions 

5. The credentials are somehow into a place where aws-sdk has access. 
         I typcially do a 
                source ~/awskeys_acc.sh 

         YMMV


STEPS
    
       Five main steps 
               
	       1. nodejs saaad init_d 
 	       	  	 
			creates the necessary dynamodb tables
      
	       2. nodejs saaad init
                        
			creates the necessary iam role with an inline policy from template 

               3. nodejs saaad create
                        
			creates the necessary lambda function from template

               4. nodejs saaad deploy
	       	  	 
			deploys the created lambda function into AWS lambda 
			& setups the necessary linkages with the S3 bucket 


	       5. nodejs upload testdata.json 
	       	  
			uploads the testdata.json into S3 for indexing to cloudsearch 

	      6. nodejs clean 

	      	 	cleans up
			       6a. deletes the function
                               6b. deletes the created roles 
			       6c. deletes the dynamodb



