import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Loader2,
  FileImage,
  Sliders,
} from 'lucide-react';
import {
  CanvasConfig,
  CollageLayout,
  SlotState,
  StickerOverlay,
  TextOverlay,
} from '../types';
import {
  copyCanvasToClipboard,
  downloadCanvasAsImage,
  renderCollageToCanvas,
} from '../utils/canvasRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: CollageLayout;
  slots: SlotState[];
  config: CanvasConfig;
  texts: TextOverlay[];
  stickers: StickerOverlay[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  layout,
  slots,
  config,
  texts,
  stickers,
}) => {
  const [exportScale, setExportScale] = useState<number>(2); // 2x = 2K
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('ghep-anh-studio');

  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsRendering(true);

    const runRender = async () => {
      if (!hiddenCanvasRef.current) return;
      try {
        await renderCollageToCanvas(hiddenCanvasRef.current, {
          layout,
          slots,
          config,
          texts,
          stickers,
          exportScale,
        });

        if (isMounted && hiddenCanvasRef.current) {
          const url = hiddenCanvasRef.current.toDataURL(
            format === 'jpeg' ? 'image/jpeg' : 'image/png',
            0.95
          );
          setPreviewUrl(url);
        }
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    runRender();

    return () => {
      isMounted = false;
    };
  }, [isOpen, layout, slots, config, texts, stickers, exportScale, format]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!hiddenCanvasRef.current) return;
    downloadCanvasAsImage(hiddenCanvasRef.current, fileName || 'collage', format, 0.95);
  };

  const handleCopyClipboard = async () => {
    if (!hiddenCanvasRef.current) return;
    const success = await copyCanvasToClipboard(hiddenCanvasRef.current);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Xuất ảnh chất lượng cao</h2>
              <p className="text-xs text-neutral-400">
                Tải ảnh về máy hoặc sao chép nhanh vào bộ nhớ tạm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col md:flex-row gap-5">
          {/* Left Preview Box */}
          <div className="flex-1 flex flex-col items-center justify-center bg-neutral-950/60 rounded-xl border border-neutral-800 p-3 min-h-[260px] relative">
            {isRendering ? (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs font-medium">Đang kết xuất ảnh chất lượng cao...</span>
              </div>
            ) : previewUrl ? (
              <div className="max-h-[320px] max-w-full flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Collage Preview"
                  className="max-h-[300px] w-auto object-contain rounded-lg shadow-lg border border-neutral-700/60"
                />
              </div>
            ) : (
              <div className="text-neutral-500 text-xs">Không thể tạo bản xem trước</div>
            )}

            {/* Hidden export canvas */}
            <canvas ref={hiddenCanvasRef} className="hidden" />
          </div>

          {/* Right Settings Controls */}
          <div className="w-full md:w-64 space-y-4 shrink-0">
            {/* File Name */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Tên tệp ảnh:
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quality scale */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Độ phân giải xuất ảnh:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { scale: 1, label: 'Chuẩn (HD)', desc: '1080p' },
                  { scale: 2, label: 'Sắc nét (2K)', desc: '2160p' },
                  { scale: 3, label: 'Siêu nét (4K)', desc: '3240p' },
                ].map((item) => (
                  <button
                    key={item.scale}
                    onClick={() => setExportScale(item.scale)}
                    className={`p-2 text-center rounded-lg border text-xs transition-all ${
                      exportScale === item.scale
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    <span className="block">{item.label}</span>
                    <span className="text-[10px] text-neutral-400 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format: PNG vs JPG */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Định dạng tệp:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'png', label: 'PNG (Không nén)' },
                  { id: 'jpeg', label: 'JPG (Nhẹ)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as any)}
                    className={`py-2 text-center rounded-lg border text-xs font-medium transition-all ${
                      format === item.id
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleDownload}
                disabled={isRendering}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Tải ảnh về máy ({format.toUpperCase()})</span>
              </button>

              <button
                onClick={handleCopyClipboard}
                disabled={isRendering}
                className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-semibold text-xs border border-neutral-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép vào Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Sao chép vào Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
