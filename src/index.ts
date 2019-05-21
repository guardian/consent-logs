import {APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context} from 'aws-lambda';
import AWS from 'aws-sdk';
import {provider} from 'aws-sdk/lib/credentials/credential_provider_chain';

class ConsentRecord {
  browserId!: string;
  consentStr!: string;
}

// function getCredentialProviderChain(): AWS.CredentialProviderChain {
//   // Initiate provider chain like this,
//   // instead of following example in the documentation:
//   //
//   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html
//   // to circumvent this issue: https://github.com/aws/aws-sdk-js/issues/2579
//
//   const sharedCredentialsProvider: provider = () =>
//       new AWS.SharedIniFileCredentials({profile: 'frontend'});
//
//   // TODO: check that this is correct provider for lambda
//   const ec2MetadataCredentialsProvider: provider = () =>
//       new AWS.EC2MetadataCredentials();
//
//   return new AWS.CredentialProviderChain(
//       [sharedCredentialsProvider, ec2MetadataCredentialsProvider]);
// }
//
// const fh = new AWS.Firehose({
//   region: 'eu-west-1',
//   credentialProvider: getCredentialProviderChain(),
// });

AWS.config.update({region: 'eu-west-1'});
const fh = new AWS.Firehose();

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
      // make consent record
      const consentRecord = new ConsentRecord();
      if (event.body != null) {
        const bodyJson = JSON.parse(event.body);
        consentRecord.browserId = bodyJson['browser_id'];
        consentRecord.consentStr = bodyJson['consent_str'];

        // put onto Kinesis firehose
        fh.putRecord(
            {
              DeliveryStreamName: 'frontend-consent-logs-full-CODE',
              Record: {Data: Buffer.from(JSON.stringify(consentRecord))}
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
        callback('Mising params', bad('Missing required parameters'));
      }
    };

export {handler};
