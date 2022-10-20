require 'aws-sdk-states'

$localstack_hostname = ENV['LOCALSTACK_HOSTNAME']
$endpoint = "http://#{$localstack_hostname}:4566"
if $localstack_hostname
    ENV['AWS_SECRET_ACCESS_KEY'] = 'test'
    ENV['AWS_ACCESS_KEY_ID'] = 'test'
end
$state_machine_arn = ENV['STATE_MACHINE_ARN']

def triggerProcessing(event:, context:)
    if $localstack_hostname
        client = Aws::States::Client.new(:endpoint => $endpoint)
    else
        client = Aws::States::Client.new()
    end

    records = event['Records']
    for rec in records do
        result = client.start_execution({
            state_machine_arn: $state_machine_arn,
            input: rec['body']
        })
    end
    {}
end
