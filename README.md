# video-streaming-app
A cloud-based (AWS) web application (a backend project) that allows users to upload and view videos! It uses Amazon RDS as its relational database and Amazon S3 as its object store. The application is meant to run as a docker container on Amazon ECS but can be run on an EC2 instance as well.

Anyone can upload and view videos (< 100 MB in size)

## Deployment Guide

### Requirements

1. AWS Account and AWS CLI Configured
2. CDK (Cloud Development Kit) installed
3. Docker installed

### Deployment Steps

1. Clone this repository.
2. On your terminal, navigate to the repository folder. Then change directory to cloudFormation:
```
cd ./cloudFormation
```
3. Run the following commands (assuming you already have AWS CLI configured)
```
cdk synth
cdk bootstrap
```
4. Once that is done, we need to deploy are cloud resources. Before we do that decide upon a username and password for your relational database instance. Then run the following command:
```
cdk deploy --parameters username=<USERNAME> --parameters password=<PASSWORD>
```
5. Once the deployment process is complete, you will see an output on your terminal. This is the endpoint of your RDS database. Change directory to the server folder as follows:
```
cd ./../server/
```
6. Here, create a file called .env and fill it up as follows:
```
DATABASE_ENDPOINT = "<THE OUTPUT ENDPOINT FROM STEP 5>"
DATABASE_USERNAME = "<YOUR CHOSEN USERNAME FROM STEP 4>"
DATABASE_PASSWORD = "<YOUR CHOSEN PASSWORD FROM STEP 4>"
aws_access_key_id = "<YOUR AWS ACCOUNT'S ACCESS KEY ID (THE ONE YOU USED TO CONFIGURE THE CLI)>"
aws_secret_access_key = "<YOUR AWS ACCOUNT'S SECRET ACCESS KEY (THE ONE YOU USED TO CONFIGURE THE CLI)>"
```
7. Change to root project directory
```
cd ./..
```
8. Go to your AWS Console and search for Elastic Container Registry. Click on Repositories and then on videostreamimagerepository. Click on the View Push Commands button for instructions on how to build and push the Docker image to the repository.
9. Now, search for Elastic Container Service. Go to Clusters and select videoStreamECSCluster. Under Tasks, click on Run new Task. Choose Launch Type - Fargate, OS family - Linux, task definition - videoStreamTask (set to the latest revision), Cluster VPC - CloudFormationStack/ecsCluster/Vpc and then choose the public subnets (hover over the available subnets and find the ones labeled as Public). Then, edit the security group and add a rule to allow Custom TCP traffic on port 3000 (from Anywhere). Set Auto-assign public IP to ENABLED. Leave everything else as default and click on Run Task.
10. Once the task is RUNNING, visit the public IP at port 3000 to access the app! (eg: 100.100.18.1:3000)


