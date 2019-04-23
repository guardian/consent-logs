import { URL } from 'url';

import { APIGatewayProxyHandler, Context, APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

function ok(data: string): APIGatewayProxyResult {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: data
    };
}

const handler: APIGatewayProxyHandler = (event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) => {
    callback(null, ok("ok"));
};

export { handler }
