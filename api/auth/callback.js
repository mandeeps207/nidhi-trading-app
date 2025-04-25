import sql from '@/lib/db';
import axios from 'axios';

export default async function handler(req, res) {
  const { auth_token, feed_token, refresh_token } = req.query;
  const ANGEL_API_KEY = process.env.ANGEL_API_KEY;
  const ANGEL_API_SECRET = process.env.ANGEL_API_SECRET;

  if (!auth_token) return res.status(400).send('Missing auth_token');

  try {
    // Exchange auth_token for jwt_token (session token)
    const response = await axios.post(
      'https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword',
      {
        clientcode: '', // We'll extract this from response or use saved client code
        password: '',   // For now, leave empty unless you switch to password login
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-ClientLocalIP': '127.0.0.1',
          'X-ClientPublicIP': '127.0.0.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'X-PrivateKey': ANGEL_API_SECRET,
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientCode': '', // will update once we get clientcode
          'X-AccessToken': auth_token,
        }
      }
    );

    const { jwtToken, clientcode } = response.data.data;

    await sql`
      INSERT INTO tokens (auth_token, jwt_token, feed_token, refresh_token, clientcode, created_at)
      VALUES (${auth_token}, ${jwtToken}, ${feed_token}, ${refresh_token}, ${clientcode}, NOW())
    `;

    return res.status(200).send('✅ Login + Token Exchange Success! Tokens stored.');
  } catch (error) {
    console.error('Token exchange error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Failed to fetch session token' });
  }
}