"use strict";
// const s3 = require("aws-cdk-lib/aws-s3");
// const deployment = require("aws-cdk-lib/aws-s3-deployment");
// const cf = require("aws-cdk-lib/aws-cloudFront");
// const origins = require("aws-cdk-lib/aws-cloudFront-origins");
// const config = require("dotenv");
Object.defineProperty(exports, "__esModule", { value: true });
var cdk = require("aws-cdk-lib");
var s3 = require("aws-cdk-lib/aws-s3");
var deployment = require("aws-cdk-lib/aws-s3-deployment");
var cf = require("aws-cdk-lib/aws-cloudfront");
var origins = require("aws-cdk-lib/aws-cloudfront-origins");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var app = new cdk.App();
var stack = new cdk.Stack(app, "ShopReactCloudFrontStackSec", {
    env: { region: "us-east-1" },
});
var bucket = new s3.Bucket(stack, "WebAppBucket", {
    bucketName: "rs-aws-course-app-second",
});
var originAccessIdentity = new cf.OriginAccessIdentity(stack, "WebAppBucketOAI", { comment: bucket.bucketName });
bucket.grantRead(originAccessIdentity);
var cloudFront = new cf.Distribution(stack, 'WebAppDistributionSec', {
    defaultBehavior: {
        origin: new origins.S3Origin(bucket, {
            originAccessIdentity: originAccessIdentity,
        }),
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    },
    defaultRootObject: 'index.html',
    errorResponses: [
        {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html'
        }
    ]
});
new deployment.BucketDeployment(stack, 'DeployWebApplication', {
    destinationBucket: bucket,
    sources: [deployment.Source.asset('./dist')],
    distribution: cloudFront,
    distributionPaths: ['/*'],
});
new cdk.CfnOutput(stack, 'Domain URL', {
    value: cloudFront.distributionDomainName,
});
