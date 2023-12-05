import datetime
import os
import time
import uuid

import boto3

AWS_ENDPOINT_URL = os.environ.get("AWS_ENDPOINT_URL")

DYNAMODB_TABLE = 'appRequests'
S3_BUCKET = os.environ.get('ARCHIVE_BUCKET') or 'archive-bucket'


def handle_request(event, context=None):
    # simulate queueing delay
    time.sleep(5)
    print('handle_request', event)
    # set request status to PROCESSING
    status = 'PROCESSING'
    set_status(event['requestID'], status)
    # simulate processing delay
    time.sleep(4)
    return {
        'requestID': event['requestID'],
        'status': status
    }


def archive_result(event, context=None):
    print('archive_result', event)
    requestID = event['requestID']
    # put result onto S3
    s3 = get_client('s3')
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=f'{requestID}/result.txt',
        Body=f'Archive result for request {requestID}'
    )
    # simulate processing delay
    time.sleep(3)
    # set request status to FINISHED
    set_status(requestID, 'FINISHED')


def get_client(resource):
    kwargs = {"endpoint_url": AWS_ENDPOINT_URL} if AWS_ENDPOINT_URL else {}
    return boto3.client(resource, **kwargs)


def set_status(requestID, status):
    dynamodb = get_client('dynamodb')
    item = {
        'id': {'S': short_uid()},
        'requestID': {'S': requestID},
        'timestamp': {'N': str(now_utc())},
        'status': {'S': status}
    }
    dynamodb.put_item(TableName=DYNAMODB_TABLE, Item=item)


def now_utc():
    diff = datetime.datetime.utcnow() - datetime.datetime(1970, 1, 1)
    return int(diff.total_seconds() * 1000.0)


def short_uid():
    return str(uuid.uuid4())[0:8]
