import multiparty from 'multiparty';
import fs from 'fs/promises';
import mime from 'mime-types';
import admin from 'firebase-admin';
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export const maxDuration = 300;

// Firebase Admin SDK setup
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const bucket = admin.storage().bucket();

export const config = {
  api: { bodyParser: false },
};

export default async function handle(req, res) {
  await mongooseConnect();

  try {
    await isAdminRequest(req, res);
  } catch (error) {
    console.error('Admin request error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const form = new multiparty.Form();

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const links = [];
    for (const file of files.file) {
      const ext = file.originalFilename.split('.').pop();
      const newFilename = `${Date.now()}.${ext}`;
      const filePath = file.path;

      try {
        const fileContent = await fs.readFile(filePath);
        const uploadFile = bucket.file(newFilename);

        await uploadFile.save(fileContent, {
          metadata: {
            contentType: mime.lookup(filePath) || 'application/octet-stream',
          },
          public: true,
        });

        const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${newFilename}`;
        links.push(publicUrl);

        // Optionally delete the file after upload
        await fs.unlink(filePath);
      } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ message: 'File upload error' });
      }
    }

    res.status(200).json({ links });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ message: 'File processing error' });
  }
}
