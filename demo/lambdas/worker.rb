require 'aws-sdk-states'

$aws_endpoint_url = ENV['AWS_ENDPOINT_URL']
if $aws_endpoint_url
    ENV['AWS_SECRET_ACCESS_KEY'] = 'test'
    ENV['AWS_ACCESS_KEY_ID'] = 'test'
end
$state_machine_arn = ENV['STATE_MACHINE_ARN']

def triggerProcessing(event:, context:)
    if $aws_endpoint_url
        client = Aws::States::Client.new(:endpoint => $aws_endpoint_url)
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
