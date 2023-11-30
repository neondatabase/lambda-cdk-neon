import { neon } from '@neondatabase/serverless';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const getSecret = async (secretName: string): Promise<string | undefined> => {

  const secretsManager = new SecretsManagerClient();

  const command = new GetSecretValueCommand({
    SecretId: secretName,
  })

  const response = await secretsManager.send(command);

  if ('SecretString' in response) {
    return response.SecretString;
  }

  throw new Error('Secret not found');
};

export const handler = async (): Promise<any> => {
  try {
    const DATABASE_URL = await getSecret('DATABASE_URL');

    const sql = neon(DATABASE_URL!);
    const result = await sql('SELECT * FROM products');

    return {
      statusCode: 200,
      body: JSON.stringify({
        products: result,
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
};