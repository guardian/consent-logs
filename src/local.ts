import {APIGatewayProxyCallback, APIGatewayProxyEvent, Context} from 'aws-lambda';
import bodyparser from 'body-parser';
import express from 'express';
import {Request, Response} from 'express';

import {handler} from './index';

const app = express();
app.use(bodyparser.json());

function run(path: string, method: string) {
  return (req: Request, res: Response) => {
    // This simply has the fields that we end up accessing in the handler
    const event = {
      httpMethod: method,
      path: path.substring('/api'.length),
      queryStringParameters: req.query,
      body: req.body ? JSON.stringify(req.body) : undefined
    };

    handler(event as APIGatewayProxyEvent, {} as Context, (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else if (result) {
        const headers = result.headers || {};

        const resp = res.status(result.statusCode);
        Object.keys(headers || {}).forEach(header => {
          resp.header(header, headers[header] as string);
        });

        resp.send(result.body);
      }
    });
  };
}

app.get('/api/consent', run('/api/consent', 'GET'));

app.listen(9667, () => console.log('Listening on port 9667'));
