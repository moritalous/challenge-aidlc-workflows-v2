import { Stack, type StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export interface AppStackProps extends StackProps {
  /** Deployment environment label used in resource names: vibe-<env>-<resource>. */
  readonly envName: string;
  /**
   * Path to the bundled Lambda code asset (the api package's build output).
   * Defaults to the sibling `../api/dist` relative to the CDK entry. Override in
   * tests with a path that exists so synth does not require a prior build.
   */
  readonly lambdaCodePath?: string;
}

/**
 * AppStack (U8 / deployment-architecture.md) — the single skeleton stack:
 *   S3 (block-public, OAC-only) -> CloudFront (HTTPS) -> HTTP API -> Lambda(Node20)
 *   -> DynamoDB Tasks (PK=id, PITR).
 *
 * IAM is least-privilege (SEC-A4): the Lambda role gets exactly the 5 DynamoDB
 * actions scoped to the Tasks table ARN — NEVER a wildcard resource. Logs perms
 * are scoped to the function's log group ARN.
 *
 * No secrets are embedded; TABLE_NAME / AWS_REGION are injected as env vars.
 */
export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const { envName } = props;
    const name = (resource: string): string => `vibe-${envName}-${resource}`;

    // --- DynamoDB Tasks table (PK=id, PITR, on-demand) ---
    const table = new dynamodb.Table(this, 'TasksTable', {
      tableName: name('tasks'),
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // GSI for the list view: a constant partition (gsi1pk = "TASK") keyed by
    // createdAt, so `GET /tasks` is a bounded Query — never a Scan
    // (infrastructure-services.md: "スキャン操作は使用しない"). The repository's
    // `list()` queries this index; index name/keys must match the repository.
    table.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: { name: 'gsi1pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // --- Lambda execution role (least-privilege) ---
    const role = new iam.Role(this, 'TasksApiRole', {
      roleName: name('tasks-api-role'),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // Exactly the 5 DynamoDB actions, scoped to the table ARN. No wildcard.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'TasksTableLeastPrivilege',
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
        ],
        resources: [table.tableArn],
      }),
    );

    // Query is also needed on the GSI used by the list view. Scoped to the
    // table's index ARNs — never a wildcard resource. Keeps the action set at
    // the same 5 (Query already granted above); this only widens Query to the
    // index, not the other four actions.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'TasksTableIndexQuery',
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/*`],
      }),
    );

    // Explicit, scoped log group (14-day retention) — avoids the deprecated
    // logRetention custom resource and keeps the ARN known for least-priv IAM.
    const logGroup = new logs.LogGroup(this, 'TasksApiLogs', {
      logGroupName: `/aws/lambda/${name('tasks-api')}`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // --- Lambda (Hono API) ---
    const fn = new lambda.Function(this, 'TasksApiFn', {
      functionName: name('tasks-api'),
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      // Generated build output is bundled to ../api/dist by the pipeline.
      code: lambda.Code.fromAsset(props.lambdaCodePath ?? '../api/dist'),
      role,
      memorySize: 512,
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: table.tableName,
        // AWS_REGION is provided by the Lambda runtime automatically.
      },
      logGroup,
    });

    // Scope logs to this function's log group ARN (no wildcard resource).
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'ScopedLogs',
        effect: iam.Effect.ALLOW,
        actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: [
          `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${name('tasks-api')}:*`,
        ],
      }),
    );

    // --- HTTP API Gateway (Lambda proxy) ---
    const httpApi = new apigwv2.HttpApi(this, 'TasksHttpApi', {
      apiName: name('http-api'),
      corsPreflight: {
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
        ],
        allowOrigins: ['*'],
      },
    });
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration('FnIntegration', fn),
    });

    // --- S3 static site bucket (block public, OAC-only) ---
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: name('site'),
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // --- CloudFront distribution (S3 via OAC by default, /api/* -> HTTP API) ---
    const apiDomain = `${httpApi.apiId}.execute-api.${this.region}.amazonaws.com`;
    new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(apiDomain),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
      defaultRootObject: 'index.html',
    });
  }
}
