[![Build Status](https://travis-ci.org/localstack/localstack-demo.svg?branch=master)](https://travis-ci.org/whummer/localstack-demo)

# LocalStack Demo

Simple demo application deployed using LocalStack, developed using the Serverless framework.

## Prerequisites

* LocalStack
* Docker
* Node.js / `npm`
* `make`

**Note:** Make sure to start LocalStack with the `EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000` config enabled, to ensure the demo Web application can access the local APIs from the browser.

## Installing

Install the dependencies using this command:
```
make install
```

## Running

Start the application locally in LocalStack:
```
make start
```

## Testing

After starting the app, open this URL in your browser: http://localhost:3000

* Enable the option "Auto-Refresh" to continuously poll for new results
* Click the button "Create new request" to send a new request to the backend API
* The new request will go through the phases `QUEUED->PROCESSING->FINISHED` as the request is being handled by the backend services (Lambda functions, Step Functions state machine)

If you have the [`awslocal`](https://github.com/localstack/awscli-local) command line installed, you can browse the contents of the local S3 bucket via:
```
awslocal s3 ls s3://archive-bucket/
```

## License

This code is available under the Apache 2.0 license.
