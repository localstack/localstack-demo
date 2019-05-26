export DOCKER_BRIDGE ?= $(shell (uname -a | grep Linux > /dev/null) && echo 172.17.0.1 || echo docker.for.mac.localhost)
export SERVICES = serverless,cloudformation,sts,stepfunctions,sqs

usage:           ## Show this help
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

install:         ## Install dependencies
	npm install
	which serverless || npm install -g serverless

start:           ## Deploy and start the app locally
	@make install; \
		echo "Deploying Serverless app to local environment"; \
		SLS_DEBUG=1 serverless deploy --stage local

lint:            ## Run code linter
	@npm run lint
	@flake8 demo

.PHONY: usage install start lint
