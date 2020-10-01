require 'aws-sdk-states'
ENV['AWS_SECRET_ACCESS_KEY'] = 'test'
ENV['AWS_ACCESS_KEY_ID'] = 'test'
$endpoint = "http://#{ENV['LOCALSTACK_HOSTNAME']}:4566"
$state_machine_arn = 'arn:aws:states:us-east-1:000000000000:stateMachine:processingStateMachine'

def triggerProcessing(event:, context:)
    records = event['Records']
    client = Aws::States::Client.new(:endpoint => $endpoint)
    for rec in records do
        result = client.start_execution({
            state_machine_arn: $state_machine_arn,
            input: rec['body']
        })
    end
    {}
end
