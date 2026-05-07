import { Client } from '@gradio/client';

const HF_SPACE = 'douaaelagrari/hr-chatbot-api';

let _client: Awaited<ReturnType<typeof Client.connect>> | null = null;

async function getClient() {
  if (!_client) {
    _client = await Client.connect(HF_SPACE);
  }
  return _client;
}

export async function sendMessage(message: string): Promise<string> {
  const client = await getClient();
  const result = await client.predict('/chat', { message });
  return (result.data as string[])[0];
}

export async function isSpaceAwake(): Promise<boolean> {
  try {
    await Client.connect(HF_SPACE);
    return true;
  } catch {
    return false;
  }
}
