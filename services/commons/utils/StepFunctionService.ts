import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: process.env.REGION });

export const sendMessageToMachine = async (scrapeSiteEvent: any) => {
    const cmd = new StartExecutionCommand({
                    stateMachineArn: getPriceTrackMachineArn(),
                    input: JSON.stringify(scrapeSiteEvent),
                });

    const response = await sfn.send(cmd);

    return response;
}

const getPriceTrackMachineArn = () => {
    return process.env.STAGE === 'prod'  
        ? process.env.PRICE_TRACK_MACHINE
        : process.env.PRICE_TRACK_MACHINE_DEV;
}