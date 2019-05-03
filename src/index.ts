import {APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context} from 'aws-lambda';
import {URL} from 'url';

interface ConsentRecord {
  browserId: string;
  consentStr: string;
}

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

const handler: APIGatewayProxyHandler =
    (event: APIGatewayProxyEvent, context: Context,
     callback: APIGatewayProxyCallback) => {
      console.log('consent parameters', event.body);
      // make consent record
      // put onto Kinesis firehose
      callback(null, ok('ok'));
    };

export {handler};
