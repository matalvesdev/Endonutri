const admin = require('firebase-admin');

const firebaseConfig = require('../firebase-applet-config.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
