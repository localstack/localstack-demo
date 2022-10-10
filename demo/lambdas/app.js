process.env.AWS_SECRET_ACCESS_KEY = 'test'
process.env.AWS_ACCESS_KEY_ID = 'test'

const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');

const LOCALSTACK_HOSTNAME = process.env.LOCALSTACK_HOSTNAME;
const SQS_ENDPOINT = `http://${LOCALSTACK_HOSTNAME}:4566`;
const DYNAMODB_ENDPOINT = `http://${LOCALSTACK_HOSTNAME}:4566`;

const QUEUE_URL = `http://${LOCALSTACK_HOSTNAME}:4566/queue/requestQueue`;
const DYNAMODB_TABLE = 'appRequests';


const connectSQS = () => new AWS.SQS({endpoint: SQS_ENDPOINT});

const connectDynamoDB = () => new AWS.DynamoDB({endpoint: DYNAMODB_ENDPOINT});

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
    let params = {
        MessageBody: JSON.stringify(message),
        QueueUrl: QUEUE_URL
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

    return {
        statusCode: 200,
        headers,
        body: {
            requestID: requestID,
            status: status
        }
    };
};

const listRequests = async () => {
    const dynamodb = connectDynamoDB();
    const params = {
        TableName: DYNAMODB_TABLE,
    };
    const result = await dynamodb.scan(params).promise();
    const items = result['Items'].map((x) => {
        Object.keys(x).forEach((attr) => {
            if ('N' in x[attr]) x[attr] = parseFloat(x[attr].N);
            else if ('S' in x[attr]) x[attr] = x[attr].S;
            else x[attr] = x[attr][Object.keys(x[attr])[0]];
        });
        return x;
    });
    return {
        statusCode: 200,
        headers,
        body: {result: items}
    };
};

module.exports = {
    handleRequest
};
