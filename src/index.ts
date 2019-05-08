import {APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context} from 'aws-lambda';
import AWS from 'aws-sdk';
import {URL} from 'url';

class ConsentRecord {
  browserId!: string;
  consentStr!: string;
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
        callback('Mising params', bad('Missing required parameters'));
      }
    };

export {handler};
