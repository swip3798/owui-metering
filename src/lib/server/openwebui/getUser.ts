import 'dotenv/config';
import * as z from 'zod/v4';

const User = z.object({ name: z.string(), email: z.string(), role: z.string(), id: z.string() });

export async function getUser(userId: string): Promise<{
  name: string;
  email: string;
  role: string;
  id: string;
} | null> {
  if (!process.env.OPENWEBUI_ENDPOINT || process.env.OPENWEBUI_API_KEY) {
    console.warn('Openwebui connection is not configured, endpoint or API key not set');
    return null;
  }
  let res = await fetch(`${process.env.OPENWEBUI_ENDPOINT!}/api/v1/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENWEBUI_API_KEY!}`
    }
  });
  if (res.status != 200) {
    console.error('Pulling user failed, result:');
    console.error(res);
    return null;
  }
  try {
    let data = await res.json();
    let user = User.parse(data);
    return user;
  } catch (error) {
    console.error('Parsing user from openwebui failed, error:');
    console.error(error);
    return null;
  }
}
