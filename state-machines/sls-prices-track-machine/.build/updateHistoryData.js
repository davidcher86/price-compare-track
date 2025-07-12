"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const lib_dynamodb_2 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.REGION });
const ddb = lib_dynamodb_2.DynamoDBDocumentClient.from(client);
const handler = async (event) => {
    const params = {
        TableName: "historical-data",
        Item: {
            id: Date.now().toString(),
            ...event,
        },
    };
    await ddb.send(new lib_dynamodb_1.PutCommand(params));
    return { status: 'saved' };
};
exports.handler = handler;
