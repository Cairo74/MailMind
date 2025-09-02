import * as admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin environment variables are not set. Please check your .env.local file.");
    // Em um ambiente de produção, você pode querer lançar um erro mais forte.
    // throw new Error("Firebase Admin environment variables are not set.");
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
  }
}

export const firebaseAdmin = admin;
