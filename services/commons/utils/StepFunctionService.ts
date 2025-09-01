import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: process.env.REGION });

export const sendMessageToMachine = async (scrapeSiteEvent: any) => {
    console.log(`Sending message to Step Function ${getPriceTrackMachineArn()}, payload: ${JSON.stringify(scrapeSiteEvent)}`);
    const cmd = new StartExecutionCommand({
                    stateMachineArn: getPriceTrackMachineArn(),
                    input: JSON.stringify(scrapeSiteEvent),
                });

    const response = await sfn.send(cmd);
    console.log(`Step Function response: ${JSON.stringify(response)}`);
    return response;
}

const getPriceTrackMachineArn = () => {
    return process.env.PRICE_TRACK_MACHINE_ARN;
}