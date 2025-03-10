import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { logger } from '../server';

dotenv.config();

// Check if Firebase credentials are configured
if (!process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_CLIENT_EMAIL) {
  logger.warn('Firebase credentials not properly configured. Authentication will not work.');
}

// Initialize Firebase Admin SDK (using environment variables)
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    logger.info('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  logger.error('Error initializing Firebase Admin SDK:', error);
}

export const auth = admin.auth();
