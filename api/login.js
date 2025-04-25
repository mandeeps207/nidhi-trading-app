export default async function handler(req, res) {
    const ANGEL_API_KEY = process.env.ANGEL_API_KEY;
    const REDIRECT_URI = process.env.REDIRECT_URI;
  
    const loginURL = `https://smartapi.angelbroking.com/publisher-login?api_key=${ANGEL_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    return res.redirect(loginURL);
  }