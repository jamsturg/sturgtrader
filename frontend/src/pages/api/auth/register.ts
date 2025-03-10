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
    const { username, email, password } = req.body;

    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // This is a mock implementation for demo purposes
    // In a real application, you would store user data in your database
    // Check if email already exists (mocked)
    if (email === 'demo@sturgtrader.com') {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Success - return a mock token
    return res.status(201).json({
      success: true,
      token: 'mock-jwt-token',
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
