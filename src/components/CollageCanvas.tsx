import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  ImagePlus,
  Move,
  Sliders,
  Check,
  X,
  Type,
  Smile,
  Award,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import {
  AspectRatioType,
  CanvasConfig,
  CollageLayout,
  FilterPreset,
  SlotState,
  StickerOverlay,
  TextOverlay,
} from '../types';
import { FILTER_PRESETS } from '../data/presets';

interface CollageCanvasProps {
  layout: CollageLayout;
  slots: SlotState[];
  config: CanvasConfig;
  texts: TextOverlay[];
  stickers: StickerOverlay[];
  selectedSlotIndex: number | null;
  onSelectSlot: (index: number | null) => void;
  onUpdateSlot: (index: number, updates: Partial<SlotState>) => void;
  onRemoveSlotImage: (index: number) => void;
  onSwapSlots: (indexA: number, indexB: number) => void;
  onSelectImageForSlot: (index: number) => void;
  onUpdateConfig: (updates: Partial<CanvasConfig>) => void;
  onRemoveText: (id: string) => void;
  onRemoveSticker: (id: string) => void;
}

export const CollageCanvas: React.FC<CollageCanvasProps> = ({
  layout,
  slots,
  config,
  texts,
  stickers,
  selectedSlotIndex,
  onSelectSlot,
  onUpdateSlot,
  onRemoveSlotImage,
  onSwapSlots,
  onSelectImageForSlot,
  onUpdateConfig,
  onRemoveText,
  onRemoveSticker,
}) => {
  const [draggedSlotIdx, setDraggedSlotIdx] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; initialOffsetX: number; initialOffsetY: number } | null>(null);
  const [showSlotFilterMenu, setShowSlotFilterMenu] = useState(false);
  const [showSharpenMenu, setShowSharpenMenu] = useState(false);

  // Aspect ratio helper
  const getAspectRatioClass = (ratio: AspectRatioType): string => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '4:5':
        return 'aspect-[4/5]';
      case '9:16':
        return 'aspect-[9/16]';
      case '16:9':
        return 'aspect-[16/9]';
      case '3:4':
        return 'aspect-[3/4]';
      case '1:2':
        return 'aspect-[1/2]';
      default:
        return 'aspect-square';
    }
  };

  // Background styling
  const getBackgroundStyle = (): React.CSSProperties => {
    if (config.bgType === 'gradient' && config.bgGradient) {
      return { background: config.bgGradient };
    }
    return { backgroundColor: config.bgColor || '#ffffff' };
  };

  // Pan interaction handlers for selected slot
  const handleMouseDownOnPhoto = (e: React.MouseEvent, index: number) => {
    if (selectedSlotIndex !== index) {
      onSelectSlot(index);
      return;
    }
    // Only pan if image exists
    const slot = slots[index];
    if (!slot?.imageSrc) return;

    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: slot.offsetX || 0,
      initialOffsetY: slot.offsetY || 0,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || selectedSlotIndex === null || !panStartRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    // Scale sensitivity
    const factor = 0.25;
    const newOffsetX = Math.max(-50, Math.min(50, panStartRef.current.initialOffsetX + dx * factor));
    const newOffsetY = Math.max(-50, Math.min(50, panStartRef.current.initialOffsetY + dy * factor));

    onUpdateSlot(selectedSlotIndex, {
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Drag & drop swap handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlotIdx(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSlotIdx !== null && draggedSlotIdx !== targetIndex) {
      onSwapSlots(draggedSlotIdx, targetIndex);
    }
    setDraggedSlotIdx(null);
  };

  // Helper to render headline with custom color highlighted words
  const renderHighlightedHeadline = (
    headline: string,
    highlightWordsStr: string,
    style: 'bold-headline' | 'editorial-serif',
    highlightColor: string,
    headlineColor: string
  ) => {
    if (!headline) return null;

    const highlights = (highlightWordsStr || '')
      .split(',')
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);

    if (highlights.length === 0) {
      return (
        <span
          style={{ color: headlineColor || '#ffffff' }}
          className={
            style === 'bold-headline'
              ? 'font-black tracking-tight uppercase'
              : 'font-serif italic font-bold'
          }
        >
          {headline}
        </span>
      );
    }

    // Split words while preserving punctuation
    const words = headline.split(/(\s+)/);

    return (
      <>
        {words.map((chunk, idx) => {
          if (/^\s+$/.test(chunk)) {
            return <React.Fragment key={idx}>{chunk}</React.Fragment>;
          }

          const cleanChunk = chunk.replace(/[^a-zA-Z0-9À-ỹ]/g, '').toLowerCase();
          const isHighlighted = highlights.some(
            (hp) => hp === cleanChunk || hp.includes(cleanChunk) || cleanChunk.includes(hp)
          );

          if (isHighlighted) {
            return (
              <span
                key={idx}
                style={{ color: highlightColor || '#facc15' }}
                className={
                  style === 'editorial-serif'
                    ? 'italic font-serif font-bold'
                    : 'font-black tracking-tight uppercase'
                }
              >
                {chunk}
              </span>
            );
          }

          return (
            <span
              key={idx}
              style={{ color: headlineColor || '#ffffff' }}
              className={
                style === 'bold-headline'
                  ? 'font-extrabold tracking-tight uppercase'
                  : 'font-serif'
              }
            >
              {chunk}
            </span>
          );
        })}
      </>
    );
  };

  const activeSlot = selectedSlotIndex !== null ? slots[selectedSlotIndex] : null;

  return (
    <div
      className="flex-1 h-full w-full overflow-auto flex items-center justify-center p-4 sm:p-8 bg-neutral-950/70 relative select-none"
      onClick={() => onSelectSlot(null)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Outer container sizing constraint */}
      <div className="relative w-full max-w-xl max-h-[82vh] flex items-center justify-center">
        {/* Slot selector for blended overlay layouts */}
        {layout.isBlendedOverlap && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/95 backdrop-blur-md border border-neutral-700 shadow-xl text-xs">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Chọn ảnh:
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(0);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                selectedSlotIndex === 0
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Ảnh 1 (Trên)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(1);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                selectedSlotIndex === 1
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Ảnh 2 (Dưới)
            </button>
          </div>
        )}

        {/* Slot selector for 1 photo + circular accent layout */}
        {layout.isCircleAccent && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/95 backdrop-blur-md border border-amber-500/40 shadow-xl text-xs">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Chọn ảnh:
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(0);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                selectedSlotIndex === 0
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Ảnh Nền (Toàn Khung)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(1);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                selectedSlotIndex === 1
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-neutral-950 inline-block" />
              Ảnh Tròn Điểm Nhấn
            </button>
          </div>
        )}

        {/* Slot selector for Then & Now comparison layout */}
        {layout.isComparison && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/95 backdrop-blur-md border border-amber-500/40 shadow-xl text-xs whitespace-nowrap">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Chọn ảnh:
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(0);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                selectedSlotIndex === 0
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Ảnh Trái ({config.comparison?.leftLabel || 'THEN'})
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(1);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                selectedSlotIndex === 1
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Ảnh Phải ({config.comparison?.rightLabel || 'NOW'})
            </button>
          </div>
        )}

        {/* Main Canvas Card */}
        <div
          id="collage-preview-container"
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${getAspectRatioClass(
            config.aspectRatio
          )} shadow-2xl rounded-2xl relative flex flex-col transition-all duration-200 overflow-hidden border border-white/10`}
          style={{
            ...getBackgroundStyle(),
            padding: `${config.padding ?? 0}px`,
          }}
        >
          {/* Dynamic SVG Sharpen Filters for real-time unsharp mask in preview */}
          <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
            <defs>
              {slots.map((s, idx) => {
                const sh = s.sharpen || 0;
                if (sh <= 0) return null;
                const k = Number(((sh / 100) * 0.95).toFixed(3));
                const center = Number((1 + 4 * k).toFixed(3));
                const negK = Number((-k).toFixed(3));
                return (
                  <filter key={idx} id={`canvas-sharpen-${idx}`} x="-10%" y="-10%" width="120%" height="120%">
                    <feConvolveMatrix
                      order="3 3"
                      preserveAlpha="true"
                      kernelMatrix={`0 ${negK} 0 ${negK} ${center} ${negK} 0 ${negK} 0`}
                    />
                  </filter>
                );
              })}
            </defs>
          </svg>

          {/* Background pattern layer */}
          {config.bgPattern === 'dots' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
          )}
          {config.bgPattern === 'grid' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-15"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #000000 1px, transparent 1px), linear-gradient(to bottom, #000000 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          )}

          {/* Photobooth Header Header */}
          {config.frameStyle === 'photobooth' && (
            <div className="text-center pt-2 pb-2 shrink-0 select-none">
              <span className="text-xs font-bold tracking-widest text-neutral-800 uppercase px-3 py-0.5 rounded-full bg-black/5">
                ★ PHOTOBOOTH STUDIO ★
              </span>
            </div>
          )}

          {/* Collage Slots Grid Container */}
          <div
            className="relative flex-1 w-full h-full"
            style={{
              gap: `${config.gap ?? 8}px`,
            }}
          >
            {layout.slots.map((slotDef, index) => {
              const slot = slots[index] || {
                imageSrc: null,
                scale: 1,
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
                flipH: false,
                flipV: false,
                filter: 'normal',
              };

              const isSelected = selectedSlotIndex === index;
              const filterDef = FILTER_PRESETS.find((f) => f.id === slot.filter);
              const halfGap = (config.gap ?? 8) / 2;

              const isDarkCanvas =
                !config.bgColor ||
                config.bgColor === '#000000' ||
                config.bgColor.startsWith('#1') ||
                config.bgColor.startsWith('#0') ||
                config.bgType === 'gradient';

              const maskStyle: React.CSSProperties = {};
              if (slot.imageSrc) {
                if (slotDef.maskType === 'fade-bottom') {
                  maskStyle.WebkitMaskImage =
                    'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0.3) 86%, transparent 100%)';
                  maskStyle.maskImage =
                    'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0.3) 86%, transparent 100%)';
                } else if (slotDef.maskType === 'fade-top') {
                  maskStyle.WebkitMaskImage =
                    'linear-gradient(to top, black 0%, black 50%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0.3) 86%, transparent 100%)';
                  maskStyle.maskImage =
                    'linear-gradient(to top, black 0%, black 50%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0.3) 86%, transparent 100%)';
                }
              }

              const isCircle = slotDef.shape === 'circle';

              return (
                <div
                  key={slotDef.id}
                  id={`slot-${index}`}
                  draggable={!!slot.imageSrc}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSlot(index);
                  }}
                  onMouseDown={(e) => handleMouseDownOnPhoto(e, index)}
                  className={`absolute overflow-hidden cursor-pointer transition-shadow group flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-900 shadow-xl'
                      : 'hover:ring-1 hover:ring-white/40'
                  }`}
                  style={(() => {
                    const touchesLeft = slotDef.x <= 0.5;
                    const touchesRight = slotDef.x + slotDef.w >= 99.5;
                    const touchesTop = slotDef.y <= 0.5;
                    const touchesBottom = slotDef.y + slotDef.h >= 99.5;

                    const gapVal = config.gap ?? 0;
                    const halfGap = gapVal / 2;

                    const slotLeft = isCircle
                      ? `${slotDef.x}%`
                      : touchesLeft
                      ? `${slotDef.x}%`
                      : `calc(${slotDef.x}% + ${halfGap}px)`;

                    const slotTop = isCircle
                      ? `${slotDef.y}%`
                      : touchesTop
                      ? `${slotDef.y}%`
                      : `calc(${slotDef.y}% + ${halfGap}px)`;

                    const slotWidth = isCircle
                      ? `${slotDef.w}%`
                      : touchesLeft && touchesRight
                      ? `${slotDef.w}%`
                      : touchesLeft || touchesRight
                      ? `calc(${slotDef.w}% - ${halfGap}px)`
                      : `calc(${slotDef.w}% - ${gapVal}px)`;

                    const slotHeight = isCircle
                      ? `${slotDef.h}%`
                      : touchesTop && touchesBottom
                      ? `${slotDef.h}%`
                      : touchesTop || touchesBottom
                      ? `calc(${slotDef.h}% - ${halfGap}px)`
                      : `calc(${slotDef.h}% - ${gapVal}px)`;

                    return {
                      left: slotLeft,
                      top: slotTop,
                      width: slotWidth,
                      height: slotHeight,
                      borderRadius: isCircle ? '9999px' : `${config.borderRadius ?? 0}px`,
                      border: isCircle ? `${slotDef.borderWidth ?? 4}px solid ${slotDef.borderColor || '#FFFFFF'}` : undefined,
                      boxShadow: isCircle
                        ? '0 12px 32px -4px rgba(0, 0, 0, 0.75), 0 4px 10px -2px rgba(0, 0, 0, 0.5)'
                        : undefined,
                      zIndex: isSelected ? 35 : (slotDef.zIndex || (isCircle ? 10 : 1)),
                      backgroundColor: slot.imageSrc ? 'transparent' : isDarkCanvas ? '#18181b' : '#f8fafc',
                    };
                  })()}
                >
                  {slot.imageSrc ? (
                    <div
                      className="w-full h-full relative overflow-hidden flex items-center justify-center"
                      style={{
                        borderRadius: isCircle ? '9999px' : undefined,
                        filter: filterDef?.cssFilter !== 'none' ? filterDef?.cssFilter : undefined,
                        ...maskStyle,
                      }}
                    >
                      <img
                        src={slot.imageSrc}
                        alt={`Khung ảnh ${index + 1}`}
                        className="max-w-none w-full h-full object-cover pointer-events-none transition-transform duration-75"
                        style={{
                          filter: slot.sharpen && slot.sharpen > 0 ? `url(#canvas-sharpen-${index})` : undefined,
                          transform: `scale(${slot.scale || 1}) translate(${slot.offsetX || 0}%, ${
                            slot.offsetY || 0
                          }%) rotate(${slot.rotation || 0}deg) scaleX(${slot.flipH ? -1 : 1}) scaleY(${
                            slot.flipV ? -1 : 1
                          })`,
                        }}
                      />

                      {/* Pan Drag Indicator when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-400/10 border-2 border-amber-400/60 pointer-events-none flex items-center justify-center">
                          <div className="bg-neutral-900/80 text-neutral-200 text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm shadow flex items-center gap-1">
                            <Move className="w-3 h-3 text-amber-400" />
                            <span>Kéo căn ảnh</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Empty slot placeholder
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectImageForSlot(index);
                      }}
                      className={`w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center transition-colors border border-dashed ${
                        isDarkCanvas
                          ? 'border-neutral-700/80 text-neutral-400 hover:text-amber-400 hover:border-amber-400/60 hover:bg-neutral-800/40'
                          : 'border-neutral-300 text-neutral-500 hover:text-amber-600 hover:border-amber-500 hover:bg-neutral-100'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full shadow-sm flex items-center justify-center transition-colors ${
                          isDarkCanvas
                            ? 'bg-neutral-800 border border-neutral-700 text-neutral-400 group-hover:text-amber-400 group-hover:border-amber-400/40'
                            : 'bg-white text-neutral-500 group-hover:text-amber-600'
                        }`}
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-[10px] font-medium leading-tight px-1 transition-colors ${
                          isDarkCanvas
                            ? 'text-neutral-400 group-hover:text-amber-400'
                            : 'text-neutral-500 group-hover:text-amber-600'
                        }`}
                      >
                        {layout.isBlendedOverlap
                          ? index === 0
                            ? 'Ảnh #1 (Trên)'
                            : 'Ảnh #2 (Dưới)'
                          : layout.isCircleAccent
                          ? index === 0
                            ? 'Thêm ảnh nền'
                            : 'Thêm ảnh tròn'
                          : layout.isComparison
                          ? index === 0
                            ? `Thêm ảnh (${config.comparison?.leftLabel || 'THEN'})`
                            : `Thêm ảnh (${config.comparison?.rightLabel || 'NOW'})`
                          : `Thêm ảnh #${index + 1}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Then & Now Comparison Badges Overlay Layer */}
          {layout.isComparison && (config.comparison?.showLabels ?? true) && (() => {
            const isOuter = config.comparison?.badgeAlign === 'outer';
            const styleType = config.comparison?.badgeStyle || 'pill';
            const vPercent = config.comparison?.verticalPercent;
            const pos = config.comparison?.labelPosition || 'bottom';

            // Safe calculation so badges never obstruct faces
            let containerStyle: React.CSSProperties;
            if (vPercent !== undefined) {
              containerStyle = { top: `${vPercent}%`, transform: 'translateY(-50%)' };
            } else if (pos === 'bottom') {
              // Placed in chest / lower photo area (~58% height), completely safe from faces
              containerStyle = { top: '58%', transform: 'translateY(-50%)' };
            } else if (pos === 'above-headline') {
              // Placed just above the headline gradient
              containerStyle = { bottom: `calc(${config.newsPoster?.gradientHeight ?? 38}% + 10px)` };
            } else if (pos === 'top-bar') {
              containerStyle = { top: '14px' };
            } else {
              containerStyle = {
                top: config.newsPoster?.showTopBadge || config.newsPoster?.showFollowButton ? '52px' : '16px',
              };
            }

            return (
              <div
                className="absolute inset-x-0 pointer-events-none z-20 flex items-center justify-between px-3 sm:px-4 transition-all duration-150"
                style={containerStyle}
              >
                {/* Left Label (THEN) */}
                <div className={`w-1/2 flex items-center ${isOuter ? 'justify-start pl-1 sm:pl-2' : 'justify-center'}`}>
                  {styleType === 'pill' ? (
                    <div className="px-3 py-1 rounded-full bg-neutral-950/90 backdrop-blur-md border border-amber-400/70 shadow-2xl flex items-center gap-1.5 pointer-events-auto transition-transform hover:scale-105">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 font-sans">
                        {config.comparison?.leftLabel || 'THEN'}
                      </span>
                    </div>
                  ) : styleType === 'minimal' ? (
                    <div className="px-2.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border-l-2 border-amber-400 shadow-lg pointer-events-auto">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 font-sans">
                        {config.comparison?.leftLabel || 'THEN'}
                      </span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-md bg-neutral-950/90 backdrop-blur-md border border-amber-500/50 shadow-xl flex items-center gap-1.5 pointer-events-auto">
                      <span className="w-1 h-3 rounded-full bg-amber-400" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 font-sans">
                        {config.comparison?.leftLabel || 'THEN'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Center VS Badge */}
                {config.comparison?.showVsBadge && (
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-neutral-950 font-black text-[10px] flex items-center justify-center shadow-2xl border-2 border-white transition-transform hover:scale-110">
                      {config.comparison?.vsText || 'VS'}
                    </div>
                  </div>
                )}

                {/* Right Label (NOW) */}
                <div className={`w-1/2 flex items-center ${isOuter ? 'justify-end pr-1 sm:pr-2' : 'justify-center'}`}>
                  {styleType === 'pill' ? (
                    <div className="px-3 py-1 rounded-full bg-neutral-950/90 backdrop-blur-md border border-white/70 shadow-2xl flex items-center gap-1.5 pointer-events-auto transition-transform hover:scale-105">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-white font-sans">
                        {config.comparison?.rightLabel || 'NOW'}
                      </span>
                    </div>
                  ) : styleType === 'minimal' ? (
                    <div className="px-2.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border-r-2 border-white shadow-lg pointer-events-auto">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white font-sans">
                        {config.comparison?.rightLabel || 'NOW'}
                      </span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-md bg-neutral-950/90 backdrop-blur-md border border-white/50 shadow-xl flex items-center gap-1.5 pointer-events-auto">
                      <span className="w-1 h-3 rounded-full bg-white" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-white font-sans">
                        {config.comparison?.rightLabel || 'NOW'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* News Poster Overlay Layer (Tỷ lệ 3:4 chuẩn tin tức / báo chí / fanpage) */}
          {config.newsPoster?.enabled && (
            <>
              {/* Top Badges */}
              {(config.newsPoster.showTopBadge || config.newsPoster.showFollowButton) && (
                <div className="absolute top-3 inset-x-3.5 flex justify-between items-start pointer-events-none z-20">
                  {config.newsPoster.showTopBadge ? (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-neutral-950/85 backdrop-blur-md border border-amber-500/40 shadow-xl pointer-events-auto">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                        <Award className="w-3 h-3" />
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-neutral-100 whitespace-pre-line leading-tight text-left">
                        {config.newsPoster.topBadgeText || 'HM MEDIA'}
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}

                  {config.newsPoster.showFollowButton && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-950/85 backdrop-blur-md border border-white/25 shadow-xl pointer-events-auto">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        {config.newsPoster.followButtonText || 'FOLLOW US'}
                      </span>
                      <MousePointerClick className="w-3.5 h-3.5 text-white animate-pulse" />
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Dark Gradient Fade */}
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none z-10 transition-all duration-200"
                style={{
                  height: `${config.newsPoster.gradientHeight ?? 38}%`,
                  background: `linear-gradient(to top, rgba(0,0,0,${
                    config.newsPoster.gradientOpacity ?? 0.94
                  }) 0%, rgba(0,0,0,${
                    (config.newsPoster.gradientOpacity ?? 0.94) * 0.85
                  }) 42%, rgba(0,0,0,${
                    (config.newsPoster.gradientOpacity ?? 0.94) * 0.4
                  }) 75%, transparent 100%)`,
                }}
              />

              {/* Headline Typography Overlay */}
              <div className="absolute inset-x-3.5 bottom-3.5 z-20 text-center pointer-events-auto flex flex-col items-center">
                <div
                  className={`w-full max-w-[94%] leading-tight select-none transition-all drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
                    config.newsPoster.style === 'bold-headline'
                      ? 'font-["Anton","Montserrat",sans-serif] uppercase tracking-wide'
                      : 'font-["Playfair_Display",serif]'
                  }`}
                  style={{
                    fontSize: `${config.newsPoster.fontSize || 35}px`,
                    lineHeight: config.newsPoster.style === 'bold-headline' ? 1.15 : 1.25,
                  }}
                >
                  {renderHighlightedHeadline(
                    config.newsPoster.headline,
                    config.newsPoster.highlightWords,
                    config.newsPoster.style,
                    config.newsPoster.highlightColor,
                    config.newsPoster.headlineColor
                  )}
                </div>

                {/* Golden Diamond Divider */}
                {config.newsPoster.showDiamondDivider && (
                  <div className="flex items-center justify-center gap-2 mt-2 opacity-90 text-amber-300">
                    <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-amber-300/80" />
                    <span className="text-[9px] text-amber-300 font-serif">◆</span>
                    <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-amber-300/80" />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Polaroid Frame Caption */}
          {config.frameStyle === 'polaroid' && (
            <div className="pt-4 pb-2 px-2 shrink-0 text-center">
              <input
                type="text"
                value={config.captionText || ''}
                onChange={(e) => onUpdateConfig({ captionText: e.target.value })}
                placeholder="Nhập chữ ghi chú Polaroid..."
                className="w-full text-center bg-transparent border-b border-dashed border-neutral-300 focus:border-amber-500 text-neutral-800 text-xl font-bold font-['Caveat',cursive] focus:outline-none py-1"
              />
            </div>
          )}

          {/* Photobooth Footer Date */}
          {config.frameStyle === 'photobooth' && (
            <div className="text-center pt-2 pb-1 shrink-0">
              <input
                type="text"
                value={config.dateText || ''}
                onChange={(e) => onUpdateConfig({ dateText: e.target.value })}
                placeholder="2026.09.20 • SEOUL MEMORIES"
                className="w-full text-center bg-transparent text-[11px] font-semibold tracking-wider text-neutral-600 focus:outline-none border-b border-transparent focus:border-neutral-400 py-0.5"
              />
            </div>
          )}

          {/* Text Overlays Layer */}
          {texts.map((textItem) => (
            <div
              key={textItem.id}
              className="absolute group/text cursor-move select-none"
              style={{
                left: `${textItem.x}%`,
                top: `${textItem.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`px-3 py-1 rounded-lg transition-all ${
                  textItem.bgBox
                    ? 'bg-neutral-900/80 text-white backdrop-blur-sm'
                    : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                }`}
                style={{
                  fontFamily: textItem.fontFamily,
                  fontSize: `${textItem.fontSize}px`,
                  color: textItem.color,
                  fontWeight: textItem.fontWeight,
                  fontStyle: textItem.fontStyle,
                }}
              >
                {textItem.text}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveText(textItem.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover/text:opacity-100 transition-opacity shadow"
                title="Xóa chữ"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Stickers Overlays Layer */}
          {stickers.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute group/sticker cursor-move select-none"
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg)`,
                fontSize: `${sticker.size}px`,
              }}
            >
              <div className="filter drop-shadow-md hover:scale-110 transition-transform">
                {sticker.content}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSticker(sticker.id);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover/sticker:opacity-100 transition-opacity shadow"
                title="Xóa sticker"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Floating Quick Action Toolbar for Selected Slot */}
        {selectedSlotIndex !== null && activeSlot && activeSlot.imageSrc && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-neutral-900/95 text-white border border-neutral-700/80 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 z-40 animate-in fade-in slide-in-from-bottom-2"
          >
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 pr-2 border-r border-neutral-700/80">
              <button
                onClick={() =>
                  onUpdateSlot(selectedSlotIndex, {
                    scale: Math.max(0.8, (activeSlot.scale || 1) - 0.15),
                  })
                }
                className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors"
                title="Thu nhỏ ảnh"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold text-amber-400 w-8 text-center">
                {Math.round((activeSlot.scale || 1) * 100)}%
              </span>
              <button
                onClick={() =>
                  onUpdateSlot(selectedSlotIndex, {
                    scale: Math.min(3, (activeSlot.scale || 1) + 0.15),
                  })
                }
                className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors"
                title="Phóng to ảnh"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rotate & Flip */}
            <div className="flex items-center gap-1 pr-2 border-r border-neutral-700/80">
              <button
                onClick={() =>
                  onUpdateSlot(selectedSlotIndex, {
                    rotation: ((activeSlot.rotation || 0) + 90) % 360,
                  })
                }
                className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors"
                title="Xoay 90 độ"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  onUpdateSlot(selectedSlotIndex, {
                    flipH: !activeSlot.flipH,
                  })
                }
                className={`p-1.5 hover:bg-neutral-800 rounded-lg transition-colors ${
                  activeSlot.flipH ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-300 hover:text-white'
                }`}
                title="Lật ngang (Flip Horizontal)"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  onUpdateSlot(selectedSlotIndex, {
                    flipV: !activeSlot.flipV,
                  })
                }
                className={`p-1.5 hover:bg-neutral-800 rounded-lg transition-colors ${
                  activeSlot.flipV ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-300 hover:text-white'
                }`}
                title="Lật dọc (Flip Vertical)"
              >
                <FlipVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSlotFilterMenu(!showSlotFilterMenu);
                  setShowSharpenMenu(false);
                }}
                className={`p-1.5 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                  showSlotFilterMenu ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-300 hover:text-white'
                }`}
                title="Chọn bộ lọc màu ô này"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Lọc</span>
              </button>

              {/* Filter popup */}
              {showSlotFilterMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl flex flex-col gap-1 w-48 z-50">
                  <span className="text-[10px] font-semibold text-neutral-400 px-2 py-1">Bộ lọc màu:</span>
                  {FILTER_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onUpdateSlot(selectedSlotIndex, { filter: f.id });
                        setShowSlotFilterMenu(false);
                      }}
                      className={`px-2 py-1 text-left text-xs rounded-md flex items-center justify-between ${
                        activeSlot.filter === f.id
                          ? 'bg-amber-500/20 text-amber-300 font-medium'
                          : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: f.previewColor }}
                        />
                        {f.name}
                      </span>
                      {activeSlot.filter === f.id && <Check className="w-3 h-3 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Sharpen Control */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSharpenMenu(!showSharpenMenu);
                  setShowSlotFilterMenu(false);
                }}
                className={`p-1.5 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                  (activeSlot.sharpen || 0) > 0 || showSharpenMenu
                    ? 'bg-amber-500/25 text-amber-300 font-semibold ring-1 ring-amber-400/40'
                    : 'text-neutral-300 hover:text-white'
                }`}
                title="Làm nét ảnh tức thì"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Nét: {activeSlot.sharpen || 0}%</span>
              </button>

              {showSharpenMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl flex flex-col gap-2 w-56 z-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Làm nét ảnh
                    </span>
                    <span className="text-xs text-neutral-200 font-semibold">{activeSlot.sharpen || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={activeSlot.sharpen || 0}
                    onChange={(e) =>
                      onUpdateSlot(selectedSlotIndex, { sharpen: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: '0%', val: 0 },
                      { label: '35%', val: 35 },
                      { label: '60%', val: 60 },
                      { label: '90%', val: 90 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => {
                          onUpdateSlot(selectedSlotIndex, { sharpen: p.val });
                        }}
                        className={`py-1 text-[10px] rounded border transition-colors ${
                          (activeSlot.sharpen || 0) === p.val
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-neutral-800 bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Replace image */}
            <button
              onClick={() => onSelectImageForSlot(selectedSlotIndex)}
              className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors"
              title="Đổi ảnh khác"
            >
              <ImagePlus className="w-3.5 h-3.5" />
            </button>

            {/* Remove */}
            <button
              onClick={() => onRemoveSlotImage(selectedSlotIndex)}
              className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
              title="Xóa ảnh khỏi ô"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Close Bar */}
            <button
              onClick={() => onSelectSlot(null)}
              className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
              title="Đóng thanh công cụ"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
