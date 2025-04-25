import sql from '@/lib/db';
import axios from 'axios';

export default async function handler(req, res) {
  const { auth_token, feed_token, refresh_token } = req.query;
  const ANGEL_API_KEY = process.env.ANGEL_API_KEY;
  const ANGEL_API_SECRET = process.env.ANGEL_API_SECRET;

  if (!auth_token) return res.status(400).send('Missing auth_token');

  try {
    const response = await axios.post(
      'https://apiconnect.angelbroking.com/rest/auth/angelbroking/jwt/v1/generateSession',
      {
        clientcode: "", // not needed when using auth_token
        refreshToken: "",
        jwtToken: "",
        token: auth_token,
        appID: ANGEL_API_KEY,
        apiSecret: ANGEL_API_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );

    const { jwtToken, data } = response.data;
    const clientcode = data?.clientcode || 'UNKNOWN';

    await sql`
      INSERT INTO tokens (auth_token, jwt_token, feed_token, refresh_token, clientcode, created_at)
      VALUES (${auth_token}, ${jwtToken}, ${feed_token}, ${refresh_token}, ${clientcode}, NOW())
    `;

    return res.status(200).send('✅ Login success! Token saved.');
  } catch (error) {
    console.error('Session error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Token exchange failed.' });
  }
}
