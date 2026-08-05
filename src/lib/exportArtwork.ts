import type { Artwork } from '../data/artworks';

export type ArtworkFormat = 'original' | 'png' | 'jpeg' | 'webp';

const mimeTypes: Record<Exclude<ArtworkFormat, 'original'>, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export async function prepareArtworkFile(artwork: Artwork, format: ArtworkFormat) {
  if (!artwork.imageUrl) throw new Error('У работы нет файла');
  const response = await fetch(artwork.imageUrl);
  if (!response.ok) throw new Error('Не удалось загрузить работу');
  const original = await response.blob();
  const safeTitle = artwork.title.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_-]/g, '_');

  if (format === 'original') {
    const extension = artwork.filePath?.split('.').pop()?.toLowerCase() || original.type.split('/')[1] || 'img';
    return new File([original], `${safeTitle}.${extension}`, { type: original.type });
  }

  const converted = await convertImage(original, mimeTypes[format]);
  const extension = format === 'jpeg' ? 'jpg' : format;
  return new File([converted], `${safeTitle}.${extension}`, { type: mimeTypes[format] });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function convertImage(source: Blob, mimeType: string) {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Не удалось преобразовать изображение');
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Формат не поддерживается')), mimeType, 0.92);
  });
}
