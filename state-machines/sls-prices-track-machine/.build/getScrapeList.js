"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const lib_dynamodb_2 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.REGION });
const ddb = lib_dynamodb_2.DynamoDBDocumentClient.from(client);
const handler = async (event) => {
    const { userId } = event;
    const params = {
        TableName: "user-details",
        Key: { userId },
        ProjectionExpression: "scrape-info",
    };
    const result = await ddb.send(new lib_dynamodb_1.GetCommand(params));
    return {
        scrapeList: result.Item?.['scrape-info'] ?? [],
    };
};
exports.handler = handler;
