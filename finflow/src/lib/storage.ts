import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createId } from "@paralleldrive/cuid2";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

// Stores uploads on local disk under public/uploads. Fine for a single-server
// deployment; swap for S3/Vercel Blob/Supabase Storage before scaling beyond one instance.
export async function saveUploadedFile(organizationId: string, file: File) {
  if (file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large (max 8MB)");
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type — use PNG, JPEG, WEBP, or PDF");
  }

  const ext = path.extname(file.name) || "";
  const safeName = `${createId()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", organizationId);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safeName), buffer);

  return {
    fileName: file.name,
    fileUrl: `/uploads/${organizationId}/${safeName}`,
    mimeType: file.type,
  };
}
