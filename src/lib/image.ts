// 🔒 写真の前処理（変更不要）。
// canvas で描き直して JPEG に再エンコードすることで、撮影位置（GPS）などの EXIF 情報を消し、長辺 1280px に縮小します。
const MAX_SIDE = 1280;

export async function sanitizePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画像を処理できませんでした");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("画像を処理できませんでした"))), "image/jpeg", 0.85),
  );
}
