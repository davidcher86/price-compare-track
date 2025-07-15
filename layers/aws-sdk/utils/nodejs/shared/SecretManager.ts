import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient({ region: process.env.REGION });

export async function getSecretValue(secretName: string): Promise<Record<string, string>> {
    try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await secretsClient.send(command);

        if (!response.SecretString)
            throw new Error(`Secret ${secretName} has no string value`);

        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error(`Error retrieving secret ${secretName}:`, error);
        throw error;
    }
}
