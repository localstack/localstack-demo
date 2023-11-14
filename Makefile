export AWS_ACCESS_KEY_ID ?= test
export AWS_SECRET_ACCESS_KEY ?= test
export AWS_DEFAULT_REGION = us-east-1

usage:           ## Show this help
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

install:         ## Install dependencies
	npm install
	which serverless || npm install -g serverless
	which localstack || pip install localstack

deploy:          ## Deploy the app
	@make install; \
		echo "Deploying Serverless app to local environment"; \
		SLS_DEBUG=1 serverless deploy --stage local

send-request:    ## Send a test request to the deployed application
	@which jq || (echo "jq was not found. Please install it (https://jqlang.github.io/jq/download/) and try again." && exit 1)
	@echo Looking up API ID from deployed API Gateway REST APIs ...; \
		apiId=$$(awslocal apigateway get-rest-apis --output json | jq -r '.items[] | select(.name="local-localstack-demo") | .id'); \
		echo Sending request to API Gateway REST APIs ID "$$apiId" ...; \
		requestID=$$(curl -s -d '{}' http://$$apiId.execute-api.localhost.localstack.cloud:4566/local/requests | jq -r .requestID); \
		echo "Received request ID '$$requestID'"; \
		for i in 1 2 3 4 5 6 7 8 9 10; do echo "Polling for processing result to appear in s3://archive-bucket/..."; awslocal s3 ls s3://archive-bucket/ | grep $$requestID && exit; sleep 3; done

lint:            ## Run code linter
	@npm run lint
	@flake8 demo

.PHONY: usage install deploy send-request lint
