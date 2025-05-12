import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const ensureLocalDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const makeStorageFactory = () => {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production') {
    console.log('Using DigitalOcean Spaces for storage');
    const s3Client = new AWS.S3({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: process.env.DO_SPACES_REGION,
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
      s3ForcePathStyle: false, // DigitalOcean Spaces needs this to be false
      signatureVersion: 'v4'
    });

    return multerS3({
      s3: s3Client,
      bucket: process.env.DO_SPACES_BUCKET,
      acl: 'public-read',
      metadata: (req: Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatars/${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    });
  } else {
    console.log('Using local storage for uploads');
    const uploadDir = path.resolve('uploads');
    ensureLocalDir(uploadDir);

    return multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadDir);
      },
      filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });
  }
}; 