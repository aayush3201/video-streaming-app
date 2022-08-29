import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { CfnOutput, CfnParameter, RemovalPolicy } from 'aws-cdk-lib';

export class CloudFormationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // ECS Cluster to run ECS Tasks
    const cluster = new ecs.Cluster(this,'ecsCluster',{
      clusterName: 'videoStreamECSCluster',
      capacity: {
        instanceType: new ec2.InstanceType('t2.micro'),
        desiredCapacity: 1
      }
    });
    // The VPC for the application
    const vpc = cluster.vpc;

    const databaseUsername = new CfnParameter(this,'username',{
      type: "String",
      description: "Database username."
    });

    const databasePassword = new CfnParameter(this,'password',{
      type: "String",
      description: "Database password."
    });

    const repository = new ecr.Repository(this,'ecrRepo',{
      repositoryName: 'videostreamimagerepository',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // ECS Task Definition
    const taskDefinition = new ecs.TaskDefinition(this,'videoStreamTask',{
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '512',
      memoryMiB: '1024',
      family: 'videoStreamTask',
      runtimePlatform: {
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      }
    });
    taskDefinition.addContainer('taskContainer',{
      containerName: 'taskContainer',
      image: ecs.ContainerImage.fromEcrRepository(repository),
      portMappings: [
        {
          containerPort: 3000
        }
      ]
    });

    // S3 Bucket
    const bucket = new s3.Bucket(this,'videobucket',{
      bucketName: 'video-bucket-videostream',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true,
      autoDeleteObjects: true
    });

    // RDS Database
    const database = new rds.DatabaseInstance(this,'rdsDatabase',{
      vpc: vpc,
      engine: rds.DatabaseInstanceEngine.MYSQL,
      allocatedStorage: 20,
      databaseName: 'videostreamdb',
      publiclyAccessible: true,
      removalPolicy: RemovalPolicy.DESTROY,
      instanceType: new ec2.InstanceType('t3.micro'),
      credentials: {
        username: databaseUsername.valueAsString,
        password: cdk.SecretValue.unsafePlainText(databasePassword.valueAsString)  
      }
    });

    // Ouptuts

    new CfnOutput(this,'databaseEndpoint',{
      description: "Database endpoint, paste in .env file as DATABASE_ENDPOINT",
      value: database.dbInstanceEndpointAddress
    });
  }
}
