#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { AppStack } from '../app-stack.js';

/**
 * CDK entry point (Project.iacEntry). Region defaults to us-east-1 (CloudFront
 * ACM requirement). Env name comes from CDK context (-c env=staging) or defaults
 * to `staging` (org rule: deploy-on-merge to staging).
 */
const app = new App();
const envName =
  (app.node.tryGetContext('env') as string | undefined) ?? 'staging';

new AppStack(app, `VibeAppStack-${envName}`, {
  envName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});
