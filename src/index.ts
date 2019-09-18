import {APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context} from 'aws-lambda';
import AWS from 'aws-sdk';
import {provider} from 'aws-sdk/lib/credentials/credential_provider_chain';

import {AmpConsentBody, consentModelFrom, getAmpConsentBody} from './amp';
import {CmpError, isCmpError} from './errors';
import {CMPRecord, parseJson} from './model';

const STREAM_NAME: string|undefined = process.env.STREAM_NAME;

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

function respond(
    statusCode: number, body: {}, callback: APIGatewayProxyCallback): void {
  callback(null, {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  });
}

function ok(message: string, callback: APIGatewayProxyCallback): void {
  respond(200, {response: message}, callback);
}

function bad(message: string, callback: APIGatewayProxyCallback): void {
  respond(400, {response: message}, callback);
}

function notFound(message: string, callback: APIGatewayProxyCallback): void {
  respond(404, {response: message}, callback);
}

function serviceUnavailable(
    message: string, callback: APIGatewayProxyCallback): void {
  respond(503, {response: message}, callback);
}

const putConsentToFirehose =
    (cmpCookie: CMPRecord, callback: APIGatewayProxyCallback,
     streamName: string) => {
      fh.putRecord(
          {
            DeliveryStreamName: streamName,
            Record: {Data: new Buffer(`${JSON.stringify(cmpCookie)}\n`)}
          },
          (err, data) => {
            if (err) {
              console.log('Error writing to kinesis stream', err, err.stack);
              serviceUnavailable('Could not save consent record', callback);
            } else {
              console.log(
                  'successfully added record to Kinesis stream', data.RecordId);
              ok('ok', callback);
            }
          });
    };

const handleAmp =
    (event: APIGatewayProxyEvent, context: Context,
     callback: APIGatewayProxyCallback, streamName: string) => {
      if (event.body) {
        const ampConsentBody: CmpError|AmpConsentBody =
            getAmpConsentBody(event.body);
        if (isCmpError(ampConsentBody)) {
          console.log(`Error '${ampConsentBody.message}' validating AMP body ${
              event.body}`);
          bad('Body for AMP consent request seems to be invalid', callback);
        } else {
          const cmpCookie: CMPRecord = consentModelFrom(
              ampConsentBody.ampUserId, ampConsentBody.consentState);
          try {
            putConsentToFirehose(cmpCookie, callback, streamName);
          } catch (exception) {
            console.error(
                'Error while writing AMP submission to Kinesis stream',
                exception);
            bad('Unable to write consent record', callback);
          }
        }
      } else {
        console.log('No request body');
        bad('No request body', callback);
      }
    };

const handler: APIGatewayProxyHandler =
    (event: APIGatewayProxyEvent, context: Context,
     callback: APIGatewayProxyCallback) => {
      if (STREAM_NAME) {
        if (event.path === '/report/amp') {
          return handleAmp(event, context, callback, STREAM_NAME);
        } else if (event.path === '/report') {
          // make consent record
          if (event.body != null) {
            const consentResult = parseJson(event.body);
            if (isCmpError(consentResult)) {
              console.log(
                  `Error '${consentResult.message}' validating request body ${
                      event.body}`);
              bad(`Body for consent request seems to be invalid: ${
                      consentResult.message}`,
                  callback);
            } else {
              try {
                putConsentToFirehose(consentResult, callback, STREAM_NAME);
              } catch (exception) {
                console.error(
                    'Error while writing consent to Kinesis stream', exception);
                bad('Unable to write consent record', callback);
              }
            }
          } else {
            console.log('No body provided');
            bad('No body provided', callback);
          }
        } else {
          console.log('Not found');
          notFound('Not found', callback);
        }
      } else {
        console.error('Missing STREAM_NAME from the environment');
        serviceUnavailable(
            `Missing STREAM_NAME from the environment: STREAM_NAME: ${
                STREAM_NAME}`,
            callback);
      }
    };

export {handler};
