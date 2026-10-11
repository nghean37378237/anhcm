import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Check, X, Palette, Trash2, Edit3, HelpCircle } from 'lucide-react';

export const QUICK_HIGHLIGHT_COLORS = [
  { color: '#FACC15', label: 'Vàng tươi' },
  { color: '#F5D061', label: 'Vàng kim' },
  { color: '#FB923C', label: 'Cam ấm' },
  { color: '#EF4444', label: 'Đỏ tươi' },
  { color: '#38BDF8', label: 'Xanh lơ' },
  { color: '#4ADE80', label: 'Xanh lá' },
  { color: '#C084FC', label: 'Tím nhạt' },
  { color: '#F472B6', label: 'Hồng phấn' },
  { color: '#FFFFFF', label: 'Trắng tinh' },
];

interface QuickTemplate {
  label: string;
  text: string;
  highlightWords?: string;
  style?: 'bold-headline' | 'editorial-serif' | 'tribute-rip';
}

interface HeadlineHighlightEditorProps {
  headline: string;
  highlightWords: string;
  highlightColor: string;
  headlineColor?: string;
  wordColorMap?: Record<string, string>;
  fontFamily?: string;
  styleType?: 'bold-headline' | 'editorial-serif' | 'tribute-rip';
  rows?: number;
  placeholder?: string;
  onUpdateHeadline: (headline: string) => void;
  onUpdateHighlight: (params: {
    highlightWords: string;
    highlightColor: string;
    wordColorMap?: Record<string, string>;
  }) => void;
  quickTemplates?: QuickTemplate[];
  onSelectQuickTemplate?: (template: QuickTemplate) => void;
}

export const HeadlineHighlightEditor: React.FC<HeadlineHighlightEditorProps> = ({
  headline,
  highlightWords,
  highlightColor,
  headlineColor = '#FFFFFF',
  wordColorMap,
  fontFamily,
  styleType = 'bold-headline',
  rows = 3,
  placeholder = 'Nhập tiêu đề...',
  onUpdateHeadline,
  onUpdateHighlight,
  quickTemplates,
  onSelectQuickTemplate,
}) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Check selection whenever mouse/keyboard leaves textarea
  const updateSelection = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end && start !== undefined && end !== undefined) {
      const text = el.value.substring(start, end).trim();
      if (text.length > 0) {
        setSelectedText(text);
        return;
      }
    }
  };

  const parsedHighlights = (highlightWords || '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);

  const cleanString = (str: string) => str.replace(/[^a-zA-Z0-9À-ỹ]/g, '').toLowerCase();

  const isPhraseHighlighted = (phrase: string): boolean => {
    if (!phrase) return false;
    const cleanP = cleanString(phrase);
    if (!cleanP) return false;
    return parsedHighlights.some((hp) => {
      const cleanHp = cleanString(hp);
      return cleanHp === cleanP || cleanHp.includes(cleanP) || cleanP.includes(cleanHp);
    });
  };

  const getWordColor = (word: string): string => {
    const cleanW = cleanString(word);
    if (wordColorMap) {
      if (wordColorMap[word.toLowerCase()]) return wordColorMap[word.toLowerCase()];
      if (cleanW && wordColorMap[cleanW]) return wordColorMap[cleanW];
      for (const [key, color] of Object.entries(wordColorMap)) {
        if (cleanString(key) === cleanW || cleanW.includes(cleanString(key))) {
          return color;
        }
      }
    }
    return highlightColor || '#FACC15';
  };

  // Áp dụng màu cho đoạn chữ đang được chọn bôi đen hoặc từ khóa
  const handleApplyColor = (phrase: string, color: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;

    const currentList = [...parsedHighlights];
    const exists = currentList.some((w) => w.toLowerCase() === trimmed.toLowerCase());
    const updatedList = exists ? currentList : [...currentList, trimmed];

    const newMap = { ...(wordColorMap || {}) };
    newMap[trimmed.toLowerCase()] = color;
    const cleanKey = cleanString(trimmed);
    if (cleanKey) newMap[cleanKey] = color;

    onUpdateHighlight({
      highlightWords: updatedList.join(', '),
      highlightColor: color,
      wordColorMap: newMap,
    });

    showToast(`Đã tô màu cho "${trimmed}"!`);
  };

  // Bỏ tô màu cho từ khóa
  const handleRemoveColor = (phrase: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    const cleanTarget = cleanString(trimmed);

    const updatedList = parsedHighlights.filter((w) => {
      const cleanW = cleanString(w);
      return cleanW !== cleanTarget && !cleanTarget.includes(cleanW) && !cleanW.includes(cleanTarget);
    });

    const newMap = { ...(wordColorMap || {}) };
    delete newMap[trimmed.toLowerCase()];
    if (cleanTarget) delete newMap[cleanTarget];

    onUpdateHighlight({
      highlightWords: updatedList.join(', '),
      highlightColor,
      wordColorMap: newMap,
    });

    showToast(`Đã bỏ màu cho "${trimmed}"!`);
  };

  // Toggle từ đơn
  const handleToggleWord = (word: string) => {
    if (isPhraseHighlighted(word)) {
      handleRemoveColor(word);
    } else {
      handleApplyColor(word, highlightColor || '#FACC15');
    }
  };

  // Danh sách các từ riêng lẻ trong tiêu đề
  const headlineWords = headline
    ? headline
        .split(/(\s+)/)
        .filter((w) => !/^\s+$/.test(w) && w.length > 0)
    : [];

  return (
    <div className="space-y-3">
      {/* Tiêu đề & Hướng dẫn */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            Nội dung tiêu đề
          </label>
          <span className="text-[10px] text-neutral-500">{headline.length} ký tự</span>
        </div>

        {/* Ô nhập tiêu đề chính */}
        <textarea
          ref={textareaRef}
          rows={rows}
          value={headline}
          onChange={(e) => onUpdateHeadline(e.target.value)}
          onSelect={updateSelection}
          onMouseUp={updateSelection}
          onKeyUp={updateSelection}
          onTouchEnd={updateSelection}
          placeholder={placeholder}
          className={`w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none transition-colors leading-relaxed selection:bg-amber-500/40 selection:text-amber-200 ${
            styleType === 'tribute-rip'
              ? 'font-serif uppercase tracking-widest font-bold'
              : styleType === 'bold-headline'
              ? 'font-extrabold uppercase tracking-wide'
              : 'font-serif'
          }`}
          style={{ fontFamily: fontFamily || undefined }}
        />

        {/* Mẹo tiện ích */}
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Mẹo:</strong> Bôi đen (chọn) đoạn chữ trong ô trên hoặc bấm vào các từ bên dưới để chọn màu ngay!
          </span>
        </div>

        {/* Quick templates nếu có */}
        {quickTemplates && quickTemplates.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {quickTemplates.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectQuickTemplate?.(item)}
                className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:text-amber-300 hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                + {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          THANH TÔ MÀU KHI BÔI ĐEN CHỮ (TỰ ĐỘNG HIỆN KHI NGƯỜI DÙNG BÔI ĐEN)
          ========================================================================= */}
      {selectedText && (
        <div className="p-3 bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 border-2 border-amber-400 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-xs text-amber-300 font-bold whitespace-nowrap">Đang bôi đen:</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-amber-400/50 text-white font-bold text-xs truncate max-w-[180px] shadow-inner">
                "{selectedText}"
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isPhraseHighlighted(selectedText) && (
                <button
                  type="button"
                  onClick={() => handleRemoveColor(selectedText)}
                  className="text-[10px] text-red-300 hover:text-red-200 bg-red-950/80 hover:bg-red-900 border border-red-700 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                >
                  ✕ Bỏ tô màu
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedText('')}
                className="text-[10px] text-neutral-400 hover:text-white bg-neutral-800 px-1.5 py-0.5 rounded cursor-pointer"
                title="Đóng thanh chọn"
              >
                ✕
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-neutral-300 font-medium mb-1.5 flex items-center justify-between">
              <span>👉 Bấm chọn màu để tô ngay:</span>
              <span className="text-[10px] text-amber-400/90 font-mono">1 chạm đổi màu</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_HIGHLIGHT_COLORS.map((c) => {
                const isCurrentActive =
                  isPhraseHighlighted(selectedText) && getWordColor(selectedText).toLowerCase() === c.color.toLowerCase();

                return (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => handleApplyColor(selectedText, c.color)}
                    className={`group relative w-7 h-7 rounded-full border-2 transition-all hover:scale-125 active:scale-95 cursor-pointer shadow-md flex items-center justify-center ${
                      isCurrentActive
                        ? 'border-white ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-950 scale-110'
                        : 'border-white/30 hover:border-white'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={`Tô màu ${c.label}`}
                  >
                    {isCurrentActive && <Check className="w-3.5 h-3.5 text-neutral-950 stroke-[3]" />}
                  </button>
                );
              })}

              {/* Tùy chọn chọn màu bất kỳ */}
              <label
                className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-neutral-600 hover:border-white cursor-pointer hover:scale-110 active:scale-95 transition-transform flex items-center justify-center shadow-md bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400"
                title="Chọn màu tùy thích"
              >
                <input
                  type="color"
                  value={highlightColor || '#FACC15'}
                  onChange={(e) => handleApplyColor(selectedText, e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <Palette className="w-3.5 h-3.5 text-neutral-950" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo thao tác thành công (Toast) */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-2 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs animate-in fade-in slide-in-from-top-1">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          BẢNG CHỌN TỪ TRỰC QUAN (CLICK VÀO TỪNG TỪ ĐỂ TÔ HOẶC BỎ MÀU NGAY)
          ========================================================================= */}
      {headlineWords.length > 0 && (
        <div className="p-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
              <span>Bấm nhanh từng từ để tô/bỏ màu:</span>
            </span>
            <span className="text-[10px] text-neutral-500">{headlineWords.length} từ</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {headlineWords.map((word, idx) => {
              const highlighted = isPhraseHighlighted(word);
              const color = highlighted ? getWordColor(word) : undefined;

              return (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  onClick={() => handleToggleWord(word)}
                  style={{
                    backgroundColor: highlighted ? color : undefined,
                    color: highlighted ? (color === '#FFFFFF' ? '#000000' : '#000000') : undefined,
                    borderColor: highlighted ? '#ffffff' : undefined,
                  }}
                  className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                    highlighted
                      ? 'font-bold shadow-md scale-105 hover:opacity-90'
                      : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:border-amber-400/80 hover:text-white hover:bg-neutral-800'
                  }`}
                  title={highlighted ? `Đang tô màu (${color}) - Bấm để bỏ màu` : `Bấm để tô màu từ này`}
                >
                  <span>{word}</span>
                  {highlighted ? (
                    <X className="w-2.5 h-2.5 opacity-70 hover:opacity-100" />
                  ) : (
                    <span className="text-[9px] text-neutral-500 opacity-60">+</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          DANH SÁCH CÁC TỪ ĐANG ĐƯỢC TÔ MÀU & ĐỔI MÀU CHUNG
          ========================================================================= */}
      <div className="space-y-2 pt-1 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300">
            Từ khóa nổi bật ({parsedHighlights.length}):
          </span>
          {parsedHighlights.length > 0 && (
            <button
              type="button"
              onClick={() =>
                onUpdateHighlight({
                  highlightWords: '',
                  highlightColor,
                  wordColorMap: {},
                })
              }
              className="text-[10px] text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Xóa tất cả màu
            </button>
          )}
        </div>

        {/* Các chip từ khóa đang có */}
        {parsedHighlights.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {parsedHighlights.map((phrase, idx) => {
              const pColor = getWordColor(phrase);
              return (
                <div
                  key={`${phrase}-${idx}`}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border bg-neutral-900 border-neutral-700 text-xs text-white"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30" style={{ backgroundColor: pColor }} />
                  <span className="font-semibold text-neutral-100">{phrase}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(phrase)}
                    className="text-neutral-400 hover:text-red-400 ml-0.5 p-0.5 cursor-pointer"
                    title={`Xóa tô màu "${phrase}"`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-neutral-500 italic">
            Chưa có từ nào được tô màu. Hãy bôi đen chữ trong ô hoặc bấm vào từ ở trên.
          </p>
        )}

        {/* Chọn màu chủ đạo cho các từ nổi bật */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-neutral-400 shrink-0">Màu chủ đạo:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {QUICK_HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() =>
                  onUpdateHighlight({
                    highlightWords,
                    highlightColor: c.color,
                    wordColorMap,
                  })
                }
                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                  highlightColor.toLowerCase() === c.color.toLowerCase()
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-neutral-900 scale-110 border-transparent'
                    : 'border-white/30 hover:border-white'
                }`}
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
            <label
              className="relative w-5 h-5 rounded-full overflow-hidden border border-neutral-600 hover:border-white cursor-pointer hover:scale-110 transition-transform flex items-center justify-center bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400"
              title="Tùy chỉnh màu"
            >
              <input
                type="color"
                value={highlightColor || '#FACC15'}
                onChange={(e) =>
                  onUpdateHighlight({
                    highlightWords,
                    highlightColor: e.target.value,
                    wordColorMap,
                  })
                }
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <Palette className="w-2.5 h-2.5 text-black" />
            </label>
          </div>
        </div>

        {/* Nút mở rộng nhập thủ công nếu muốn */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[10px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
          >
            {showManualInput ? 'Ẩn ô nhập từ khóa bằng tay' : '+ Nhập danh sách từ khóa bằng tay (dấu phẩy)'}
          </button>

          {showManualInput && (
            <input
              type="text"
              value={highlightWords}
              onChange={(e) =>
                onUpdateHighlight({
                  highlightWords: e.target.value,
                  highlightColor,
                  wordColorMap,
                })
              }
              placeholder="VD: Iris West, Flash, JOHNNY DEPP"
              className="mt-1.5 w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};
