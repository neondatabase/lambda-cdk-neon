import * as cdk from 'aws-cdk-lib';
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ServerlessApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const listProductsFunction = new lambdaNodejs.NodejsFunction(
      this,
      "ListProductsFunction",
      {
        entry: "functions/list-products.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
      },
    )
    
    listProductsFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'],
    }))

    const productServiceApi = new apigateway.RestApi(this, "Endpoint", {
      restApiName: "Product Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const products = productServiceApi.root.addResource("products");

    products.addMethod("GET", new apigateway.LambdaIntegration(listProductsFunction));

  }
}
