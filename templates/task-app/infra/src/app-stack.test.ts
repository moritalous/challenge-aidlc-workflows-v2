import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AppStack } from './app-stack.js';

// A real (but empty) asset directory so synth's asset staging succeeds without
// requiring a prior `npm run build` of the api package.
let codePath: string;

beforeAll(() => {
  codePath = mkdtempSync(join(tmpdir(), 'vibe-lambda-'));
  writeFileSync(join(codePath, 'lambda.js'), 'exports.handler = () => {};');
});

function synth(): Template {
  const app = new App();
  const stack = new AppStack(app, 'TestStack', {
    envName: 'test',
    lambdaCodePath: codePath,
    env: { account: '123456789012', region: 'us-east-1' },
  });
  return Template.fromStack(stack);
}

describe('AppStack', () => {
  it('synthesizes without error', () => {
    expect(() => synth()).not.toThrow();
  });

  it('provisions a DynamoDB table with PK=id and PITR enabled', () => {
    const t = synth();
    t.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
    });
  });

  it('provisions a Node 20 Lambda with TABLE_NAME env', () => {
    const t = synth();
    t.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
      Environment: {
        Variables: Match.objectLike({ TABLE_NAME: Match.anyValue() }),
      },
    });
  });

  it('provisions an HTTP API Gateway and a CloudFront distribution', () => {
    const t = synth();
    t.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
    t.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });

  it('blocks all public access on the site S3 bucket', () => {
    const t = synth();
    t.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  it('IAM policy for dynamodb actions has NO wildcard resource', () => {
    const t = synth();
    const policies = t.findResources('AWS::IAM::Policy');
    let sawDynamoStatement = false;

    for (const policy of Object.values(policies)) {
      const statements = policy.Properties?.PolicyDocument?.Statement ?? [];
      for (const stmt of statements) {
        const actions: string[] = Array.isArray(stmt.Action)
          ? stmt.Action
          : [stmt.Action];
        const isDynamo = actions.some(
          (a) => typeof a === 'string' && a.startsWith('dynamodb:'),
        );
        if (!isDynamo) {
          continue;
        }
        sawDynamoStatement = true;
        const resource = stmt.Resource;
        const resources = Array.isArray(resource) ? resource : [resource];
        // No statement granting dynamodb actions may use "*" as a resource.
        expect(resources).not.toContain('*');
      }
    }

    expect(sawDynamoStatement).toBe(true);
  });

  it('grants exactly the 5 expected DynamoDB actions', () => {
    const t = synth();
    const policies = t.findResources('AWS::IAM::Policy');
    const dynamoActions = new Set<string>();

    for (const policy of Object.values(policies)) {
      const statements = policy.Properties?.PolicyDocument?.Statement ?? [];
      for (const stmt of statements) {
        const actions: string[] = Array.isArray(stmt.Action)
          ? stmt.Action
          : [stmt.Action];
        for (const a of actions) {
          if (typeof a === 'string' && a.startsWith('dynamodb:')) {
            dynamoActions.add(a);
          }
        }
      }
    }

    expect([...dynamoActions].sort()).toEqual([
      'dynamodb:DeleteItem',
      'dynamodb:GetItem',
      'dynamodb:PutItem',
      'dynamodb:Query',
      'dynamodb:UpdateItem',
    ]);
  });
});
