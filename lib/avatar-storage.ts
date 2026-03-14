import { supabase } from "@/lib/supabase";

export const AVATAR_BUCKET = process.env.NEXT_PUBLIC_AVATAR_BUCKET || "avatars";

function extensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType.toLowerCase()] ?? "jpg";
}

export async function uploadAvatarToStorage(userId: string, file: File): Promise<{ objectPath: string; publicUrl: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Avatar image must be under 5 MB.");
  }

  const extension = extensionFromMime(file.type);
  const objectPath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const uploadResult = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadResult.error) {
    throw new Error(uploadResult.error.message || "Could not upload avatar.");
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
  if (!data.publicUrl) {
    throw new Error("Could not resolve avatar URL.");
  }

  return {
    objectPath,
    publicUrl: data.publicUrl,
  };
}
