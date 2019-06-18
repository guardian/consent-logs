import {APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context} from 'aws-lambda';
import AWS from 'aws-sdk';
import {provider} from 'aws-sdk/lib/credentials/credential_provider_chain';

const STREAM_NAME: string | undefined = process.env.STREAM_NAME;

class ConsentRecord {
  browserId!: string;
  consentStr!: string;
}

function getCredentialProviderChain(): AWS.CredentialProviderChain {
  // Initiate provider chain like this,
  // instead of following example in the documentation:
  //
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html
  // to circumvent this issue: https://github.com/aws/aws-sdk-js/issues/2579

  const sharedCredentialsProvider: provider = () =>
      new AWS.SharedIniFileCredentials({profile: 'frontend'});

  const ec2MetadataCredentialsProvider: provider = () =>
      new AWS.EC2MetadataCredentials();

  return new AWS.CredentialProviderChain(
      [sharedCredentialsProvider, ec2MetadataCredentialsProvider]);
}

const fh = new AWS.Firehose({
  region: 'eu-west-1',
  credentialProvider: getCredentialProviderChain(),
});

function ok(message: string): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({response: message})
  };
}

function bad(message: string): APIGatewayProxyResult {
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({response: message})
  };
}

const handler: APIGatewayProxyHandler =
    (event: APIGatewayProxyEvent, context: Context,
     callback: APIGatewayProxyCallback) => {
      if (STREAM_NAME) {       
        // make consent record
        const consentRecord = new ConsentRecord();
        if (event.body != null) {
          const bodyJson = JSON.parse(event.body);
          consentRecord.browserId = bodyJson['browser_id'];
          consentRecord.consentStr = bodyJson['consent_str'];

          // put onto Kinesis firehose
          fh.putRecord(
              {
                DeliveryStreamName: STREAM_NAME,
                Record: {Data: new Buffer(JSON.stringify(consentRecord))}
              },
              (err, data) => {
                if (err) {
                  console.log(err, err.stack);
                }  // an error occurred
                else {
                  console.log(data);
                }  // successful response, remove later.
                callback(err, ok(data.RecordId));
              });

        } else {
          callback('Missing params', bad('Missing required parameters'));
        }
      } else {
        callback('Missing STREAM_NAME from the environment', bad(`Missing STREAM_NAME from the environment: STREAM_NAME: ${STREAM_NAME}`));
      }
    };

export {handler};
