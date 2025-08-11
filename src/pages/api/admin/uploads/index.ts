import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

// Varsayılan body parser kapatılmalı
export const config = {
  api: {
    bodyParser: false,
  },
};

// Kayıt klasörü
const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Sadece POST desteklenir" });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Hata:", err);
      return res.status(500).json({ success: false, message: "Form ayrıştırma hatası" });
    }

    let uploadedFile: File | undefined;
    const fileField = files.file;
    if (Array.isArray(fileField)) {
      uploadedFile = fileField[0];
    } else {
      uploadedFile = fileField;
    }

    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: "Dosya alınamadı" });
    }

    const filename = path.basename(uploadedFile.filepath);
    const filePath = `/uploads/${filename}`;

    return res.status(200).json({
      success: true,
      filePath,
    });
  });
}
