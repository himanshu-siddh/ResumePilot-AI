import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

import type { UploadRouter } from "@/server/upload/uploadthing";

export const UploadDropzone = generateUploadDropzone<UploadRouter>();
export const UploadButton = generateUploadButton<UploadRouter>();
