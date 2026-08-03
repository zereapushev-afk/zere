import { useEffect, useRef, useState } from 'react';

type AvatarCropperProps = {
  file: File;
  onCancel: () => void;
  onCrop: (file: File, previewUrl: string) => void;
};

const VIEW_SIZE = 280;
const OUTPUT_SIZE = 512;

export function AvatarCropper({ file, onCancel, onCrop }: AvatarCropperProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imageSize, setImageSize] = useState({ width: VIEW_SIZE, height: VIEW_SIZE });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function finishCrop() {
    const image = imageRef.current;
    if (!image) return;
    const baseScale = Math.max(VIEW_SIZE / image.naturalWidth, VIEW_SIZE / image.naturalHeight);
    const scale = baseScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const maxX = Math.max(0, (width - VIEW_SIZE) / 2);
    const maxY = Math.max(0, (height - VIEW_SIZE) / 2);
    const drawX = (VIEW_SIZE - width) / 2 + (offsetX / 100) * maxX;
    const drawY = (VIEW_SIZE - height) / 2 + (offsetY / 100) * maxY;
    const ratio = OUTPUT_SIZE / VIEW_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    canvas.getContext('2d')?.drawImage(image, drawX * ratio, drawY * ratio, width * ratio, height * ratio);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const cropped = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      onCrop(cropped, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.9);
  }

  const preview = (() => {
    const baseScale = Math.max(VIEW_SIZE / imageSize.width, VIEW_SIZE / imageSize.height);
    const width = imageSize.width * baseScale * zoom;
    const height = imageSize.height * baseScale * zoom;
    const x = (offsetX / 100) * Math.max(0, (width - VIEW_SIZE) / 2);
    const y = (offsetY / 100) * Math.max(0, (height - VIEW_SIZE) / 2);
    return { width, height, transform: `translate(${x}px, ${y}px)` };
  })();

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section className="modal avatar-cropper" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" type="button" onClick={onCancel}>×</button>
        <h2>Настрой аватар</h2>
        <p>Увеличь и сдвинь фотографию, чтобы выбрать нужную часть.</p>
        <div className="avatar-cropper__view">
          {sourceUrl && <img ref={imageRef} src={sourceUrl} alt="Предпросмотр обрезки" style={preview} onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />}
        </div>
        <label>Увеличение<input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /></label>
        <label>По горизонтали<input type="range" min="-100" max="100" value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} /></label>
        <label>По вертикали<input type="range" min="-100" max="100" value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} /></label>
        <div className="profile-actions"><button className="button" type="button" onClick={finishCrop}>Применить</button><button className="text-button" type="button" onClick={onCancel}>Отмена</button></div>
      </section>
    </div>
  );
}
