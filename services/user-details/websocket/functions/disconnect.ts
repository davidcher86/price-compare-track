import {deleteUserWebesocket} from "./../../../commons/utils/DynamoDBService.ts";

export const handler = async (event: any) => {
    const connectionId = event.requestContext.connectionId;
    
    await deleteUserWebesocket(connectionId);

    return { statusCode: 200 };
};