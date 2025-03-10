import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  token?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // This is a mock implementation for demo purposes
    // In a real application, you would verify credentials against your database
    if (email === 'demo@sturgtrader.com' && password === 'password') {
      // Success - return a mock token
      return res.status(200).json({
        success: true,
        token: 'mock-jwt-token',
        message: 'Login successful'
      });
    }

    // Authentication failed
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
