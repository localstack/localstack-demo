[![Build Status](https://travis-ci.org/localstack/localstack-demo.svg?branch=master)](https://travis-ci.org/whummer/localstack-demo)

# LocalStack Demo

Simple demo application deployed using LocalStack, developed using the Serverless framework.

The sample app illustrates a typical Web application scenario with asynchronous request processing happening in the background, all running locally inside LocalStack. The figure below outlines the application architecture with the different components and services involved in processing the requests.

<img src="demo/web/architecture.png" style="width: 600px" />

## Prerequisites

* LocalStack
* Docker
* Node.js / `yarn`
* `make`
* (optional) jq

Note: Please make sure to pull and start the `latest` LocalStack Docker image. At the time of writing (2023-02-01), the demo requires some features that were only recently added to LocalStack and are not part of a tagged release version yet.

## Running LocalStack

Use the `localstack` CLI command to get started:
```
localstack start
```

## Installing dependencies & running the application

To install the dependencies, deploy and start the application locally in LocalStack:
```
make deploy
```

## Testing

After starting the app, open this URL in your browser: http://localhost:4566/archive-bucket/index.html

* Enable the option "Auto-Refresh" to continuously poll for new results
* Click the button "Create new request" to send a new request to the backend API
* The new request will go through the phases `QUEUED->PROCESSING->FINISHED` as the request is being handled by the backend services (Lambda functions, Step Functions state machine)

If you have the [`awslocal`](https://github.com/localstack/awscli-local) command line installed, you can browse the contents of the local S3 bucket via:
```
awslocal s3 ls s3://archive-bucket/
```

## License

This code is available under the Apache 2.0 license.
