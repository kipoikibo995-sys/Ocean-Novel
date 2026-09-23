import { handleWarriorPlusWebhook } from '../../src/lib/warriorplusIpnHandler';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawPayload = (req.body as Record<string, string>) || {};
    const expectedKey = process.env.WARRIORPLUS_SECURITY_KEY || '';

    const result = await handleWarriorPlusWebhook(rawPayload, expectedKey);
    console.log('[WarriorPlus IPN Success]', result.message);
    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('[WarriorPlus IPN Error]', error?.message || error);
    return res.status(400).send(`IPN Verification Failed: ${error?.message || 'Error'}`);
  }
}
