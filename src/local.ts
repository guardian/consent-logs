import {APIGatewayProxyEvent, Context} from 'aws-lambda';
import bodyparser from 'body-parser';
import express from 'express';
import {Request, Response} from 'express';
import path from 'path';

import {handler} from './index';

const app = express();
app.use(bodyparser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

function run(path: string, method: string) {
  return (req: Request, res: Response) => {
    // This only has the fields that we actually use in the handler
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

function devUI() {
  return (req: Request, res: Response) => {
    res.render('devui', {});
  };
}

app.post('/api/', run('/api/', 'POST'));  // mimic PROD
app.get('/dev-ui/', devUI());             // for easier testing from a browser

app.listen(9667, () => console.log('Listening on port 9667'));
