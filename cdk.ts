export {};
const cdk  = require('aws-cdk-lib');  
const s3 = require("aws-cdk-lib/aws-s3");
const deployment = require("aws-cdk-lib/aws-s3-deployment");
const cf = require("aws-cdk-lib/aws-cloudFront");
const origins = require("aws-cdk-lib/aws-cloudFront-origins");
const config = require("dotenv");



config();

const app = new cdk.App();

const stack = new cdk.Stack(app, "ShopReactCloudFrontStack", {
  env: { region: "us-east-1" },
});

const bucket = new s3.Bucket(stack, "WebAppBucket", {
  bucketName: "rs-aws-course-app",
});

const originAccessIdentity = new cf.OriginAccessIdentity(
  stack,
  "WebAppBucketDAI",
  {comment: bucket.bucketName}
);

bucket.grantRead(originAccessIdentity);

const cloudFront = new cf.distribution(stack, 'WebAppDistribution', {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket, {
      originAccessIdentity,
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

new deployment.BucketDeployment(stack, 'DeployWebApp', {
  destinationBucket: bucket,
  sources: [deployment.Source.asset('./dist')],
  distribution: cloudFront,
  distributionPath: ['/*'],
})

new cdk.CfnOutput(stack, 'Domain URL', {
  value: cloudFront.distributionDomainName, 
})
