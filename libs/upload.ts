import multer from "multer";
import path from "path";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "purchase-receipts"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000_000
    )}${extension}`;

    callback(null, filename);
  },
});

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG, and WEBP images are allowed.")
      );
    }

    callback(null, true);
  },
});

export const uploadReceipt = multerUpload.single("receipt");

export type RequestWithFile = NextApiRequest & {
  file?: Express.Multer.File;
};

type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (error?: unknown) => void
) => void;

export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  middleware: Middleware
): Promise<void> {
  return new Promise((resolve, reject) => {
    middleware(req, res, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function deleteUploadedFile(
  filePath?: string
): Promise<void> {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      console.error("Could not delete uploaded file:", error);
    }
  }
}