import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import fs from "fs/promises";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

interface ScrapeInfo {
    url: string;
    meta?: Record<string, any>;
}

// interface EventInput {
//     userId: string;
// }

export const handler = async (event: any) => {
    const { userId } = event;

    const params = {
        TableName: "user-details",
        Key: { userId },
        ProjectionExpression: "scrapeInfo"
    };
    console.log("params: ", JSON.stringify(params));
    const result = await ddb.send(new GetCommand(params));
    console.log("result items", JSON.stringify(result.Item));


    // const filePath = 'handlers/scrape-site/scrapeInfo.json'; // Replace with your desired file path
    // await fs.writeFile(filePath, JSON.stringify(result.Item), 'utf-8');

    return {
        scrapeList: (result.Item?.['scrapeInfo']) ?? [],
        userId: userId,
    };
};