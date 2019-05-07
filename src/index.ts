import {APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context} from 'aws-lambda';
import AWS from 'aws-sdk';
import {URL} from 'url';

interface ConsentRecord {
  browserId: string;
  consentStr: string;
}

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

const handler: APIGatewayProxyHandler =
    (event: APIGatewayProxyEvent, context: Context,
     callback: APIGatewayProxyCallback) => {
      // make consent record
      // put onto Kinesis firehose
      fh.putRecord(
          {
            DeliveryStreamName: 'frontend-consent-logs-full-CODE',
            //TODO: change this foo:bar record with real record. 
            Record: {Data: new Buffer(JSON.stringify({foo: 'bar'}))}

          },
          (err, data) => {
            if (err) {
              console.log(err, err.stack);
            }  // an error occurred
            else {
              console.log(data);
            }  // successful response, remove later. 
            context.done(err, data);
          });
      callback(null, ok('ok'));
    };

export {handler};
