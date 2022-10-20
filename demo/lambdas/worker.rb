require 'aws-sdk-states'

$localstack_hostname = ENV['LOCALSTACK_HOSTNAME']
$endpoint = "http://#{$localstack_hostname}:4566"
if $localstack_hostname
    ENV['AWS_SECRET_ACCESS_KEY'] = 'test'
    ENV['AWS_ACCESS_KEY_ID'] = 'test'
end

def triggerProcessing(event:, context:)
    if $localstack_hostname
        client = Aws::States::Client.new(:endpoint => $endpoint)
    else
        client = Aws::States::Client.new()
    end

    # get state machine ARN - TODO consider adding paging
    result = client.list_state_machines()
    sm_arn = ""
    for sm in result.state_machines do
        if sm.name == 'processingStateMachine'
            sm_arn = sm.state_machine_arn
        end
    end

    records = event['Records']
    for rec in records do
        result = client.start_execution({
            state_machine_arn: sm_arn,
            input: rec['body']
        })
    end
    {}
end
