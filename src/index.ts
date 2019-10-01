import {APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, Context} from 'aws-lambda';
import AWS from 'aws-sdk';
import {provider} from 'aws-sdk/lib/credentials/credential_provider_chain';

import {AmpConsentBody, consentModelFrom, getAmpConsentBody} from './amp';
import {corsCheck, CorsHeaders, parseCorsWhitelist} from './cors';
import {CmpError, isCmpError} from './errors';
import {CmpRecord} from './model';
import {parseJson} from './validation';

const STREAM_NAME: string|undefined = process.env.STREAM_NAME;
const CORS_WHITELIST: string|undefined = process.env.CORS_WHITELIST;

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
    statusCode: number, callback: APIGatewayProxyCallback, bodyData?: {},
    cors?: CorsHeaders): void {
  const body = bodyData ? JSON.stringify(bodyData) : '';
  if (cors) {
    return callback(null, {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Vary': 'Accept-Encoding, Origin',
        'Access-Control-Allow-Origin': cors.origin,
        'Access-Control-Allow-Methods': cors.methods,
        'Access-Control-Allow-Headers': cors.headers,
      },
      body
    });
  } else {
    return callback(null, {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Vary': 'Accept-Encoding, Origin',
      },
      body
    });
  }
}

function ok(
    message: string, callback: APIGatewayProxyCallback,
    cors: CorsHeaders): void {
  respond(200, callback, {response: message}, cors);
}

function okNoContent(
    callback: APIGatewayProxyCallback, cors: CorsHeaders): void {
  respond(204, callback, cors);
}

function bad(
    message: string, callback: APIGatewayProxyCallback,
    cors: CorsHeaders): void {
  respond(400, callback, {response: message}, cors);
}

function notFound(
    message: string, callback: APIGatewayProxyCallback,
    cors: CorsHeaders): void {
  respond(404, callback, {response: message}, cors);
}

function serviceUnavailable(
    message: string, callback: APIGatewayProxyCallback,
    cors?: CorsHeaders): void {
  respond(503, callback, {response: message}, cors);
}

function forbidden(
    message: string, callback: APIGatewayProxyCallback,
    cors?: CorsHeaders): void {
  respond(403, callback, {response: message}, cors);
}

const putConsentToFirehose =
    (cmpRecord: CmpRecord, callback: APIGatewayProxyCallback,
     streamName: string, cors: CorsHeaders) => {
      fh.putRecord(
          {
            DeliveryStreamName: streamName,
            Record: {Data: new Buffer(`${JSON.stringify(cmpRecord)}\n`)}
          },
          (err, data) => {
            if (err) {
              console.log('Error writing to kinesis stream', err, err.stack);
              serviceUnavailable(
                  'Could not save consent record', callback, cors);
            } else {
              console.log(
                  'successfully added record to Kinesis stream', data.RecordId);
              ok('ok', callback, cors);
            }
          });
    };

const handleAmp =
    (event: APIGatewayProxyEvent, context: Context,
     callback: APIGatewayProxyCallback, streamName: string,
     cors: CorsHeaders) => {
      if (event.body) {
        const ampConsentBody: CmpError|AmpConsentBody =
            getAmpConsentBody(event.body);
        if (isCmpError(ampConsentBody)) {
          console.log(`Error '${ampConsentBody.message}' validating AMP body ${
              event.body}`);
          bad('Body for AMP consent request seems to be invalid', callback,
              cors);
        } else {
          const cmpCookie: CmpRecord = consentModelFrom(
              ampConsentBody.ampUserId, ampConsentBody.consentState);
          try {
            putConsentToFirehose(cmpCookie, callback, streamName, cors);
          } catch (exception) {
            console.error(
                'Error while writing AMP submission to Kinesis stream',
                exception);
            bad('Unable to write consent record', callback, cors);
          }
        }
      } else {
        console.log('No request body');
        bad('No request body', callback, cors);
      }
    };

const handler: APIGatewayProxyHandler =
    (event: APIGatewayProxyEvent, context: Context,
     callback: APIGatewayProxyCallback) => {
      const requestOrigin = (event.headers && event.headers.origin) || '';
      if (CORS_WHITELIST) {
        const corsWhitelist = parseCorsWhitelist(CORS_WHITELIST);
        const corsHeaders = corsCheck(requestOrigin, corsWhitelist);
        if (corsHeaders) {
          if (event.httpMethod === 'OPTIONS') {
            // just CORS preflight request
            okNoContent(callback, corsHeaders);
          } else {
            if (STREAM_NAME) {
              if (event.path === '/report/amp') {
                return handleAmp(
                    event, context, callback, STREAM_NAME, corsHeaders);
              } else if (event.path === '/report') {
                // make consent record
                if (event.body != null) {
                  const consentResult = parseJson(event.body);
                  if (isCmpError(consentResult)) {
                    console.log(`Error '${
                        consentResult.message}' validating request body ${
                        event.body}`);
                    bad(`Body for consent request seems to be invalid: ${
                            consentResult.message}`,
                        callback, corsHeaders);
                  } else {
                    try {
                      putConsentToFirehose(
                          consentResult, callback, STREAM_NAME, corsHeaders);
                    } catch (exception) {
                      console.error(
                          'Error while writing consent to Kinesis stream',
                          exception);
                      bad('Unable to write consent record', callback,
                          corsHeaders);
                    }
                  }
                } else {
                  console.log('No body provided');
                  bad('No body provided', callback, corsHeaders);
                }
              } else {
                console.log('Not found');
                notFound('Not found', callback, corsHeaders);
              }
            } else {
              console.error('Missing STREAM_NAME from the environment');
              serviceUnavailable(
                  `Missing STREAM_NAME from the environment: STREAM_NAME: ${
                      STREAM_NAME}`,
                  callback);
            }
          }
        } else {
          console.error(`Cors check failed for origin ${requestOrigin}`);
          forbidden('Invalid Origin', callback);
        }
      } else {
        console.error('Missing CORS_WHITELIST from the environment');
        serviceUnavailable(
            `Missing CORS_WHITELIST from the environment: CORS_WHITELIST: ${
                CORS_WHITELIST}`,
            callback);
      }
    };

export {handler};
