import { supabase } from './supabase';

export type AiCheckResult = {
  score: number;
  blocked: boolean;
  reasons: string[];
  digitalMarker?: string;
  fileFingerprint: string;
};

type VisualScores = {
  aiLikelihood: number;
  anatomy: number;
  details: number;
  text: number;
  texture: number;
  styleSignals: string[];
  reasons: string[];
};

const markerNames = [
  ['c2pa', 'C2PA / Content Credentials'],
  ['content credentials', 'C2PA / Content Credentials'],
  ['synthid', 'SynthID'],
  ['stable diffusion', 'данные Stable Diffusion в метаданных'],
  ['midjourney', 'данные Midjourney в метаданных'],
  ['dall-e', 'данные DALL-E в метаданных'],
  ['comfyui', 'данные ComfyUI в метаданных'],
  ['adobe firefly', 'данные Adobe Firefly в метаданных'],
  ['generative fill', 'данные Generative Fill в метаданных'],
  ['microsoft designer', 'данные Microsoft Designer в метаданных'],
] as const;

function fingerprint(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

async function findDigitalMarker(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const searchable = new TextDecoder('latin1').decode(bytes).toLowerCase();
  return markerNames.find(([marker]) => searchable.includes(marker))?.[1];
}

async function makePreview(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1536 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.86).split(',')[1];
}

function clamp(value: unknown, maximum: number) {
  return Math.min(maximum, Math.max(0, Number(value) || 0));
}

function parseVisualScores(text: string): VisualScores {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI вернул результат в неизвестном формате');
  const value = JSON.parse(match[0]) as Partial<VisualScores>;
  return {
    aiLikelihood: clamp(value.aiLikelihood, 100),
    anatomy: clamp(value.anatomy, 35),
    details: clamp(value.details, 30),
    text: clamp(value.text, 20),
    texture: clamp(value.texture, 15),
    styleSignals: Array.isArray(value.styleSignals)
      ? value.styleSignals.filter((signal): signal is string => typeof signal === 'string').slice(0, 8)
      : [],
    reasons: Array.isArray(value.reasons)
      ? value.reasons.filter((reason): reason is string => typeof reason === 'string').slice(0, 4)
      : [],
  };
}

export async function checkArtwork(file: File): Promise<AiCheckResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Пока можно проверить и опубликовать только изображение.');
  }

  const digitalMarker = await findDigitalMarker(file);
  if (digitalMarker) {
    return {
      score: 100,
      blocked: true,
      digitalMarker,
      fileFingerprint: fingerprint(file),
      reasons: [`Обнаружено: ${digitalMarker}`],
    };
  }

  const imageBase64 = await makePreview(file);
  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      imageBase64,
      mimeType: 'image/jpeg',
      prompt: 'Проверь изображение по заданным критериям и верни только JSON.',
      system: `Ты строгий модератор, который ищет ИИ-генерацию. Сначала оцени общую вероятность aiLikelihood 0..100.
Отдельно верни styleSignals — список всех заметных признаков из этого закрытого перечня:
"шаблонная композиция", "гладкий airbrush", "одинаковые мягкие градиенты", "пластиковый объём",
"случайные декоративные блики", "неестественно идеальные контуры", "повторяющиеся формы",
"типичный стоковый мультяшный персонаж". Не считай симметрию и аккуратность доказательством ручной работы.
Для каждого реально видимого признака добавляй точную строку из перечня.
Оцени только видимые артефакты: anatomy 0..35 (пальцы/лапы до 20, глаза до 15);
details 0..30 (вплавления/фон до 15, узоры/швы до 15); text 0..20 (псевдобуквы);
texture 0..15 (пластик до 10, конфликт теней до 5).
Не занижай результат только из-за отсутствия цифровых меток. reasons должны объяснять именно видимые признаки.
Верни JSON: {"aiLikelihood":0,"anatomy":0,"details":0,"text":0,"texture":0,
"styleSignals":["точные строки из перечня"],"reasons":["признаки на русском"]}.`,
    },
  });
  if (error) throw new Error('Не удалось проверить работу. Попробуй ещё раз.');
  const scores = parseVisualScores(String(data?.text ?? ''));
  const artifactScore = scores.anatomy + scores.details + scores.text + scores.texture;
  const styleScore = Math.min(100, scores.styleSignals.length * 15);
  const score = Math.round(Math.max(scores.aiLikelihood, artifactScore, styleScore));
  const reasons = [...scores.reasons];
  if (scores.styleSignals.length > 0) {
    reasons.push(`Стилевые маркеры: ${scores.styleSignals.join(', ')}`);
  }
  return {
    score,
    blocked: score >= 90,
    reasons: reasons.slice(0, 5),
    fileFingerprint: fingerprint(file),
  };
}

export function isResultForFile(result: AiCheckResult, file: File) {
  return result.fileFingerprint === fingerprint(file);
}
