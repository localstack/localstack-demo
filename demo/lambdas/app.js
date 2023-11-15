const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');

const AWS_ENDPOINT_URL = process.env.AWS_ENDPOINT_URL;
if (AWS_ENDPOINT_URL) {
    process.env.AWS_SECRET_ACCESS_KEY = 'test';
    process.env.AWS_ACCESS_KEY_ID = 'test';
}

const DYNAMODB_TABLE = 'appRequests';
const QUEUE_NAME = 'requestQueue';
const CLIENT_CONFIG = AWS_ENDPOINT_URL ? {endpoint: AWS_ENDPOINT_URL} : {};

const connectSQS = () => new AWS.SQS(CLIENT_CONFIG);
const connectDynamoDB = () => new AWS.DynamoDB(CLIENT_CONFIG);

const shortUid = () => uuidv4().substring(0, 8);

const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers' : 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
};

const handleRequest = async (event) => {
    if (event.path === '/requests' && event.httpMethod === 'POST') {
        return startNewRequest(event);
    } else if (event.path === '/requests' && event.httpMethod === 'GET') {
        return listRequests(event);
    } else {
        return {statusCode: 404, headers, body: {}};
    }
};

const startNewRequest = async () => {
    // put message onto SQS queue
    const sqs = connectSQS();
    const requestID = shortUid();
    const message = {'requestID': requestID};
    const queueUrl = (await sqs.getQueueUrl({QueueName: QUEUE_NAME}).promise()).QueueUrl;
    let params = {
        MessageBody: JSON.stringify(message),
        QueueUrl: queueUrl
    };
    await sqs.sendMessage(params).promise();

    // set status in DynamoDB to QUEUED
    const dynamodb = connectDynamoDB();
    const status = 'QUEUED';
    params = {
        TableName: DYNAMODB_TABLE,
        Item: {
            id: {
                S: shortUid()
            },
            requestID: {
                S: requestID
            },
            timestamp: {
                N: '' + Date.now()
            },
            status: {
                S: status
            }
        }
    };
    await dynamodb.putItem(params).promise();

    const body = JSON.stringify({
        requestID,
        status
    });
    return {
        statusCode: 200,
        headers,
        body
    };
};

const listRequests = async () => {
    const dynamodb = connectDynamoDB();
    const params = {
        TableName: DYNAMODB_TABLE,
    };
    const scanResult = await dynamodb.scan(params).promise();
    const items = scanResult['Items'].map((x) => {
        Object.keys(x).forEach((attr) => {
            if ('N' in x[attr]) x[attr] = parseFloat(x[attr].N);
            else if ('S' in x[attr]) x[attr] = x[attr].S;
            else x[attr] = x[attr][Object.keys(x[attr])[0]];
        });
        return x;
    });
    const result = {
        statusCode: 200,
        headers,
        body: JSON.stringify({result: items})
    };
    return result;
};

module.exports = {
    handleRequest
};
