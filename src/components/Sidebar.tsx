import React, { useState, useRef } from 'react';
import {
  LayoutGrid,
  Images,
  Palette,
  Sliders,
  Type,
  Upload,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Smile,
  Frame,
  Newspaper,
  Award,
  MousePointerClick,
} from 'lucide-react';
import {
  AspectRatioType,
  CanvasConfig,
  CollageLayout,
  LayoutCategory,
  PresetImage,
  SlotState,
  StickerOverlay,
  TextOverlay,
} from '../types';
import {
  BACKGROUND_COLORS,
  BACKGROUND_GRADIENTS,
  COLLAGE_LAYOUTS,
  FILTER_PRESETS,
  FONT_OPTIONS,
  HEADLINE_FONT_OPTIONS,
  STICKER_PRESETS,
} from '../data/presets';
import { HeadlineHighlightEditor } from './HeadlineHighlightEditor';

interface SidebarProps {
  currentLayout: CollageLayout;
  onSelectLayout: (layout: CollageLayout) => void;
  config: CanvasConfig;
  onUpdateConfig: (updates: Partial<CanvasConfig>) => void;
  userImages: string[];
  onUploadImages: (files: FileList) => void;
  onSelectImage: (imageUrl: string) => void;
  onAutoFillPreset: () => void;
  activeFilter: string;
  onApplyFilter: (filterId: string, applyToAll: boolean) => void;
  selectedSlotIndex: number | null;
  texts: TextOverlay[];
  onAddText: (text: string, font: string, color: string, bgBox: boolean, fontSize?: number) => void;
  onUpdateText?: (id: string, updates: Partial<TextOverlay>) => void;
  onRemoveText: (id: string) => void;
  stickers: StickerOverlay[];
  onAddSticker: (emoji: string) => void;
  onRemoveSticker: (id: string) => void;
  slots?: SlotState[];
  onUpdateSlot?: (index: number, updates: Partial<SlotState>) => void;
  onApplySharpen: (sharpenValue: number, all: boolean) => void;
  onUpdateLayoutSlot?: (slotIndex: number, updates: Partial<import('../types').LayoutSlot>) => void;
}

type TabType = 'layout' | 'news' | 'photos' | 'canvas' | 'filters' | 'decor';

export const Sidebar: React.FC<SidebarProps> = ({
  currentLayout,
  onSelectLayout,
  config,
  onUpdateConfig,
  userImages,
  onUploadImages,
  onSelectImage,
  onAutoFillPreset,
  activeFilter,
  onApplyFilter,
  selectedSlotIndex,
  texts,
  onAddText,
  onUpdateText,
  onRemoveText,
  stickers,
  onAddSticker,
  onRemoveSticker,
  slots = [],
  onUpdateSlot,
  onApplySharpen,
  onUpdateLayoutSlot,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('layout');
  const [layoutFilter, setLayoutFilter] = useState<LayoutCategory>('all');
  const [applyFilterToAll, setApplyFilterToAll] = useState<boolean>(true);

  // Text input state
  const [inputText, setInputText] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBgBox, setTextBgBox] = useState(true);
  const [inputFontSize, setInputFontSize] = useState(32);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered layouts
  const filteredLayouts = COLLAGE_LAYOUTS.filter((l) => {
    if (layoutFilter === 'all') return true;
    if (layoutFilter === '1-photo' && (l.photoCount === 1 || l.id === 'layout-3-4-news-circle-accent')) return true;
    if (layoutFilter === '2-photos' && l.photoCount === 2) return true;
    return l.category === layoutFilter;
  });

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadImages(e.target.files);
    }
  };

  const handleAddTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddText(inputText.trim(), selectedFont, textColor, textBgBox, inputFontSize);
    setInputText('');
  };

  return (
    <aside className="w-full lg:w-96 border-r border-neutral-800 bg-neutral-900/95 flex flex-col h-full shrink-0 select-none z-20">
      {/* Tab Navigation */}
      <div className="grid grid-cols-6 border-b border-neutral-800 bg-neutral-950/60 p-1 shrink-0 gap-1">
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'layout'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
          title="Chọn bố cục khung ghép"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="truncate w-full text-center">Bố cục</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-all relative ${
            activeTab === 'news'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
          title="Chỉnh chữ tiêu đề & phong cách 3:4"
        >
          <div className="relative">
            <Newspaper className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span className="truncate w-full text-center font-bold text-amber-400/90">Mẫu 3:4</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'photos'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
          title="Tải ảnh lên & quản lý ảnh của bạn"
        >
          <Images className="w-4 h-4" />
          <span className="truncate w-full text-center">Tải ảnh</span>
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'canvas'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
          title="Tỷ lệ 3:4, khung viền & nền"
        >
          <Palette className="w-4 h-4" />
          <span className="truncate w-full text-center">Khung</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'filters'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
          title="Làm nét ảnh & Bộ lọc màu"
        >
          <Sparkles className="w-4 h-4" />
          <span className="truncate w-full text-center">Làm nét</span>
        </button>

        <button
          onClick={() => setActiveTab('decor')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'decor'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
          title="Thêm chữ tùy ý & emoji nhãn dán"
        >
          <Smile className="w-4 h-4" />
          <span className="truncate w-full text-center">Trang trí</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ==================== TAB 1: BỐ CỤC ==================== */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            {/* ⭐ 5 MẪU CƠ BẢN 3:4 ĐƯỢC ƯU TIÊN THEO YÊU CẦU */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/15 via-neutral-900 to-neutral-950 border border-amber-500/40 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>5 MẪU 3:4 BÁO CHÍ (ƯU TIÊN)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                  Tỷ lệ 3:4
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Đã dựng sẵn 6 mẫu báo chí / tưởng niệm / tạp chí với hiệu ứng chữ nổi bật, bóng mờ và so sánh:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
                {COLLAGE_LAYOUTS.filter((l) => l.category === 'featured-3-4').map((layoutItem, idx) => {
                  const isSelected = currentLayout.id === layoutItem.id;
                  const isBlend = !!layoutItem.isBlendedOverlap;
                  const isCircle = !!layoutItem.isCircleAccent;
                  const isComp = !!layoutItem.isComparison;
                  const isTribute = layoutItem.id === 'layout-tribute-rip' || layoutItem.newsPosterDefault?.style === 'tribute-rip';
                  return (
                    <button
                      key={layoutItem.id}
                      onClick={() => {
                        onSelectLayout(layoutItem);
                        onUpdateConfig({
                          aspectRatio: layoutItem.defaultAspectRatio || '3:4',
                          gap: layoutItem.defaultGap ?? 0,
                          padding: 0,
                          borderRadius: 0,
                        });
                      }}
                      className={`p-1.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400 shadow-md shadow-amber-500/20'
                          : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="w-full aspect-[3/4] bg-neutral-950 rounded-lg p-0.5 relative overflow-hidden border border-neutral-800">
                        {isBlend ? (
                          <>
                            {/* Visual representation of 2 blended photos */}
                            <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-amber-500/50 via-amber-500/30 to-transparent z-10" />
                            <div className="absolute inset-x-0 bottom-0 h-[62%] bg-amber-500/35" />
                          </>
                        ) : isCircle ? (
                          <>
                            {/* Full background photo representation */}
                            <div className="absolute inset-0 bg-amber-500/35" />
                            {/* Circular accent representation */}
                            <div className="absolute right-1 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-amber-400 shadow-md flex items-center justify-center text-[7px] font-bold text-neutral-900 z-10">
                              ●
                            </div>
                          </>
                        ) : isComp ? (
                          <>
                            {/* 2 comparison columns */}
                            <div className="absolute inset-y-0 left-0 w-[49%] bg-amber-500/40 rounded-[1px] border-r border-neutral-950" />
                            <div className="absolute inset-y-0 right-0 w-[49%] bg-amber-500/30 rounded-[1px]" />
                            <div className="absolute top-4 left-1 px-1 py-0.2 bg-black/85 rounded text-[5px] font-black text-amber-300 z-10">
                              THEN
                            </div>
                            <div className="absolute top-4 right-1 px-1 py-0.2 bg-black/85 rounded text-[5px] font-black text-white z-10">
                              NOW
                            </div>
                          </>
                        ) : isTribute ? (
                          <>
                            {/* Tribute portrait representation */}
                            <div className="absolute inset-0 bg-neutral-800/80" />
                            {/* Solid black bottom with REST IN PEACE and ribbon */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col items-center justify-end pb-0.5 px-0.5 z-20">
                              <span className="text-[5.5px] font-black font-serif text-white leading-none tracking-wider mb-0.5">
                                REST IN PEACE
                              </span>
                              <div className="w-1.5 h-2 text-white">
                                <svg viewBox="0 0 100 140" fill="currentColor" className="w-full h-full">
                                  <path d="M50 6 C28 6, 16 25, 16 48 C16 66, 25 83, 37 99 L13 134 C11 137, 14 141, 18 139 L47 116 L50 120 L53 116 L82 139 C86 141, 89 137, 87 134 L63 99 C75 83, 84 66, 84 48 C84 25, 72 6, 50 6 Z M50 23 C62 23, 68 34, 68 48 C68 60, 61 74, 52 89 C43 74, 32 60, 32 48 C32 34, 38 23, 50 23 Z" />
                                </svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          layoutItem.slots.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="absolute bg-amber-500/35 rounded-[1px] border border-neutral-950/80"
                              style={{
                                left: `${s.x}%`,
                                top: `${s.y}%`,
                                width: `${s.w}%`,
                                height: `${s.h}%`,
                              }}
                            />
                          ))
                        )}
                        {/* Visual indicator of bottom text gradient */}
                        {!isTribute && (
                          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 to-transparent flex flex-col items-center justify-end pb-1 px-0.5 z-20">
                            <div className="w-4/5 h-1 bg-amber-400 rounded-full mb-0.5" />
                            <div className="w-3/5 h-0.5 bg-neutral-200 rounded-full" />
                          </div>
                        )}

                        {/* Universal Top Logo Header Bar (HM MEDIA & FOLLOW) across ALL template previews */}
                        <div className="absolute top-1 inset-x-1 flex justify-between items-center z-30 pointer-events-none">
                          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-black/90 border border-amber-500/60 shadow-sm">
                            <span className="w-1 h-1 rounded-full bg-amber-400 inline-block" />
                            <span className="text-[5px] font-black text-white leading-none tracking-tighter">HM</span>
                          </div>
                          <div className="px-1 py-0.5 rounded-full bg-black/90 border border-white/30 shadow-sm">
                            <span className="text-[5px] font-black text-white leading-none tracking-tighter">FOLLOW</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-amber-300 truncate">
                          {idx === 0
                            ? 'Mẫu 1: 3 Ảnh'
                            : idx === 1
                            ? 'Mẫu 2: 1 Ảnh'
                            : idx === 2
                            ? 'Mẫu 3: Chồng Mờ'
                            : idx === 3
                            ? 'Mẫu 4: 1+Tròn'
                            : idx === 4
                            ? 'Mẫu 5: Then&Now'
                            : 'Mẫu 6: Tưởng Niệm'}
                        </span>
                        <span className="text-[9px] text-neutral-400 truncate">
                          {idx === 0
                            ? '2 Trái + 1 Phải'
                            : idx === 1
                            ? 'Toàn khung'
                            : idx === 2
                            ? '2 ảnh mờ mờ'
                            : idx === 3
                            ? 'Điểm nhấn tròn'
                            : idx === 4
                            ? 'So sánh Trước Sau'
                            : 'REST IN PEACE'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ⭐ BỘ ĐIỀU CHỈNH MẪU THEN & NOW (SO SÁNH 2 ẢNH) */}
            {currentLayout.isComparison && (
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-amber-500/40 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>TÙY CHỈNH SO SÁNH (THEN & NOW)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                    Mẫu 5
                  </span>
                </div>

                {/* Nhãn 2 ảnh */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                      Nhãn ảnh trái (THEN)
                    </label>
                    <input
                      type="text"
                      value={config.comparison?.leftLabel || ''}
                      onChange={(e) =>
                        onUpdateConfig({
                          comparison: {
                            ...(config.comparison || {
                              enabled: true,
                              leftLabel: 'THEN',
                              rightLabel: 'NOW',
                              showLabels: true,
                              labelPosition: 'top',
                            }),
                            leftLabel: e.target.value,
                          },
                        })
                      }
                      placeholder="THEN / QUÁ KHỨ"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                      Nhãn ảnh phải (NOW)
                    </label>
                    <input
                      type="text"
                      value={config.comparison?.rightLabel || ''}
                      onChange={(e) =>
                        onUpdateConfig({
                          comparison: {
                            ...(config.comparison || {
                              enabled: true,
                              leftLabel: 'THEN',
                              rightLabel: 'NOW',
                              showLabels: true,
                              labelPosition: 'top',
                            }),
                            rightLabel: e.target.value,
                          },
                        })
                      }
                      placeholder="NOW / HIỆN TẠI"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Vị trí nhãn THEN & NOW - Tối ưu chống che mặt */}
                <div className="space-y-2 pt-1 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                      <span>Vị trí nhãn</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-normal border border-emerald-500/30">
                        Chống che mặt
                      </span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">
                      {config.comparison?.verticalPercent ?? 58}% Y
                    </span>
                  </div>

                  {/* 4 Nút Vị Trí Nhanh */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      {
                        label: '🛡️ Chân ảnh (Chuẩn)',
                        sub: 'Dưới mặt, an toàn 100%',
                        pos: 'bottom' as const,
                        vPercent: 58,
                      },
                      {
                        label: '📰 Trên tiêu đề',
                        sub: 'Trong dải màu tối đáy',
                        pos: 'above-headline' as const,
                        vPercent: 68,
                      },
                      {
                        label: '🔝 Sát đỉnh trên',
                        sub: 'Trên cùng, tránh trán',
                        pos: 'top-bar' as const,
                        vPercent: 12,
                      },
                      {
                        label: '👤 Góc trên ảnh',
                        sub: 'Vị trí cổ điển',
                        pos: 'top' as const,
                        vPercent: 22,
                      },
                    ].map((item) => {
                      const isActive =
                        (config.comparison?.verticalPercent === item.vPercent) ||
                        (!config.comparison?.verticalPercent && (config.comparison?.labelPosition || 'bottom') === item.pos);
                      return (
                        <button
                          key={item.pos}
                          onClick={() =>
                            onUpdateConfig({
                              comparison: {
                                ...(config.comparison || {
                                  enabled: true,
                                  leftLabel: 'THEN',
                                  rightLabel: 'NOW',
                                  showLabels: true,
                                  labelPosition: 'bottom',
                                }),
                                labelPosition: item.pos,
                                verticalPercent: item.vPercent,
                              },
                            })
                          }
                          className={`p-1.5 text-left rounded-lg border transition-all ${
                            isActive
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-850'
                          }`}
                        >
                          <div className="text-[11px] font-semibold leading-tight">{item.label}</div>
                          <div className="text-[9px] text-neutral-400 leading-tight mt-0.5">{item.sub}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Thanh kéo chỉnh độ cao tự do */}
                  <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400">Kéo độ cao tùy chỉnh:</span>
                      <span className={`font-medium ${
                        (config.comparison?.verticalPercent ?? 58) < 45
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {(config.comparison?.verticalPercent ?? 58) < 45
                          ? '⚠️ Cẩn thận che mặt'
                          : '✅ Vùng an toàn (Không che mặt)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="85"
                      step="1"
                      value={config.comparison?.verticalPercent ?? 58}
                      onChange={(e) =>
                        onUpdateConfig({
                          comparison: {
                            ...(config.comparison || {
                              enabled: true,
                              leftLabel: 'THEN',
                              rightLabel: 'NOW',
                              showLabels: true,
                              labelPosition: 'bottom',
                            }),
                            verticalPercent: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Căn lề nhãn (Center vs Dạt mép ngoài) */}
                <div className="space-y-1.5 pt-1 border-t border-neutral-800">
                  <label className="text-[11px] font-semibold text-neutral-300 block">
                    Căn lề nhãn 2 bên
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() =>
                        onUpdateConfig({
                          comparison: {
                            ...(config.comparison || {
                              enabled: true,
                              leftLabel: 'THEN',
                              rightLabel: 'NOW',
                              showLabels: true,
                              labelPosition: 'bottom',
                            }),
                            badgeAlign: 'center',
                          },
                        })
                      }
                      className={`py-1.5 px-2 text-xs rounded-lg border font-medium transition-all ${
                        (config.comparison?.badgeAlign || 'center') === 'center'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Giữa mỗi ảnh
                    </button>
                    <button
                      onClick={() =>
                        onUpdateConfig({
                          comparison: {
                            ...(config.comparison || {
                              enabled: true,
                              leftLabel: 'THEN',
                              rightLabel: 'NOW',
                              showLabels: true,
                              labelPosition: 'bottom',
                            }),
                            badgeAlign: 'outer',
                          },
                        })
                      }
                      className={`py-1.5 px-2 text-xs rounded-lg border font-medium transition-all ${
                        config.comparison?.badgeAlign === 'outer'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Dạt 2 mép ngoài (Tránh mặt)
                    </button>
                  </div>
                </div>

                {/* Kiểu huy hiệu */}
                <div className="space-y-1.5 pt-1 border-t border-neutral-800">
                  <label className="text-[11px] font-semibold text-neutral-300 block">
                    Kiểu dáng nhãn
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'pill' as const, label: 'Viên thuốc' },
                      { id: 'minimal' as const, label: 'Tối giản' },
                      { id: 'tag' as const, label: 'Thẻ viền' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() =>
                          onUpdateConfig({
                            comparison: {
                              ...(config.comparison || {
                                enabled: true,
                                leftLabel: 'THEN',
                                rightLabel: 'NOW',
                                showLabels: true,
                                labelPosition: 'bottom',
                              }),
                              badgeStyle: st.id,
                            },
                          })
                        }
                        className={`py-1 px-1.5 text-[10px] rounded-lg border font-medium transition-all ${
                          (config.comparison?.badgeStyle || 'pill') === st.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kích cỡ nhãn THEN & NOW - Kéo to & rõ */}
                <div className="space-y-1.5 pt-1 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-neutral-300">
                      Độ to & rõ nhãn THEN & NOW
                    </label>
                    <span className="text-[10px] text-amber-400 font-bold">
                      {config.comparison?.badgeSize === 'xl'
                        ? 'Cực to (XL)'
                        : config.comparison?.badgeSize === 'large'
                        ? 'To rõ (L)'
                        : 'Chuẩn (M)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'normal' as const, label: 'Vừa (Chuẩn)' },
                      { id: 'large' as const, label: 'To rõ (L)' },
                      { id: 'xl' as const, label: 'Cực to (XL)' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        onClick={() =>
                          onUpdateConfig({
                            comparison: {
                              ...(config.comparison || {
                                enabled: true,
                                leftLabel: 'THEN',
                                rightLabel: 'NOW',
                                showLabels: true,
                                labelPosition: 'bottom',
                              }),
                              badgeSize: sz.id,
                            },
                          })
                        }
                        className={`py-1 px-1.5 text-[10px] rounded-lg border font-medium transition-all ${
                          (config.comparison?.badgeSize || 'normal') === sz.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tùy chọn hiển thị */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                  <span className="text-[11px] font-semibold text-neutral-300">Hiện nhãn THEN / NOW</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.comparison?.showLabels !== false}
                      onChange={(e) =>
                        onUpdateConfig({
                          comparison: {
                            ...(config.comparison || {
                              enabled: true,
                              leftLabel: 'THEN',
                              rightLabel: 'NOW',
                              showLabels: true,
                              labelPosition: 'bottom',
                            }),
                            showLabels: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Huy hiệu VS ở giữa */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                  <span className="text-[11px] font-semibold text-neutral-300">Huy hiệu "VS" ở giữa</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!config.comparison?.showVsBadge}
                      onChange={(e) =>
                        onUpdateConfig({
                          comparison: {
                            ...(config.comparison || {
                              enabled: true,
                              leftLabel: 'THEN',
                              rightLabel: 'NOW',
                              showLabels: true,
                              labelPosition: 'bottom',
                            }),
                            showVsBadge: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Khoảng cách viền giữa 2 ảnh */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-neutral-300">
                      Khoảng cách chia đôi 2 ảnh
                    </label>
                    <span className="text-[10px] text-amber-400 font-semibold">{config.gap ?? 6}px</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 4, 6, 12].map((g) => (
                      <button
                        key={g}
                        onClick={() => onUpdateConfig({ gap: g })}
                        className={`py-1 px-1 text-[10px] rounded-lg border font-medium transition-all ${
                          (config.gap ?? 6) === g
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                      >
                        {g === 0 ? 'Dính liền' : `${g}px`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ⭐ BỘ ĐIỀU CHỈNH ẢNH TRÒN ĐIỂM NHẤN (Khi đang chọn Mẫu 4) */}
            {currentLayout.isCircleAccent && onUpdateLayoutSlot && (
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-amber-500/40 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-neutral-900" />
                    <span>TÙY CHỈNH ẢNH TRÒN ĐIỂM NHẤN</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                    Ô #2
                  </span>
                </div>

                {/* Vị trí nhanh */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1.5">
                    Vị trí ảnh tròn
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Trên phải', x: 62, y: 11 },
                      { label: 'Trên trái', x: 6, y: 11 },
                      { label: 'Giữa phải', x: 62, y: 30 },
                      { label: 'Giữa trái', x: 6, y: 30 },
                      { label: 'Dưới phải', x: 62, y: 48 },
                      { label: 'Dưới trái', x: 6, y: 48 },
                    ].map((pos) => {
                      const circleSlot = currentLayout.slots[1];
                      const isCurrentPos = circleSlot && circleSlot.x === pos.x && circleSlot.y === pos.y;
                      return (
                        <button
                          key={pos.label}
                          onClick={() => {
                            onUpdateLayoutSlot(1, { x: pos.x, y: pos.y });
                          }}
                          className={`py-1 px-1 text-[10px] rounded-lg border font-medium transition-all ${
                            isCurrentPos
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kích thước ảnh tròn */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-neutral-300">
                      Kích thước ảnh tròn
                    </label>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {Math.round(currentLayout.slots[1]?.w || 32)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Nhỏ (26%)', w: 26, h: 19.5 },
                      { label: 'Vừa (32%)', w: 32, h: 24 },
                      { label: 'Lớn (38%)', w: 38, h: 28.5 },
                    ].map((sz) => {
                      const circleSlot = currentLayout.slots[1];
                      const isCurrentSize = circleSlot && circleSlot.w === sz.w;
                      return (
                        <button
                          key={sz.label}
                          onClick={() => {
                            onUpdateLayoutSlot(1, { w: sz.w, h: sz.h });
                          }}
                          className={`py-1 px-1 text-[10px] rounded-lg border font-medium transition-all ${
                            isCurrentSize
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          {sz.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Độ dày viền trắng */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-neutral-300">
                      Độ dày viền tròn
                    </label>
                    <span className="text-[10px] text-neutral-400">
                      {(currentLayout.slots[1]?.borderWidth ?? 4)}px
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 2, 4, 6].map((bw) => {
                      const isCurrentBw = (currentLayout.slots[1]?.borderWidth ?? 4) === bw;
                      return (
                        <button
                          key={bw}
                          onClick={() => {
                            onUpdateLayoutSlot(1, { borderWidth: bw });
                          }}
                          className={`py-1 px-1 text-[10px] rounded-lg border font-medium transition-all ${
                            isCurrentBw
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          {bw === 0 ? 'Không viền' : `${bw}px`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Phân loại bố cục ({filteredLayouts.length})
                </label>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {[
                  { id: 'featured-3-4', label: '⭐ 3:4 Cơ bản' },
                  { id: 'all', label: 'Tất cả' },
                  { id: '2-photos', label: '2 ảnh' },
                  { id: '3-photos', label: '3 ảnh' },
                  { id: '4-photos', label: '4 ảnh' },
                  { id: '5-plus', label: '5+ ảnh' },
                  { id: 'photobooth', label: 'Photobooth' },
                  { id: 'polaroid', label: 'Polaroid' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setLayoutFilter(cat.id as LayoutCategory)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                      layoutFilter === cat.id
                        ? 'bg-neutral-100 text-neutral-900 font-semibold shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layouts Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredLayouts.map((layoutItem) => {
                const isActive = currentLayout.id === layoutItem.id;
                return (
                  <button
                    key={layoutItem.id}
                    onClick={() => onSelectLayout(layoutItem)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400 shadow-lg shadow-amber-500/10'
                        : 'border-neutral-800 bg-neutral-800/50 hover:border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {/* Visual Layout Preview Outline */}
                    <div className="w-full aspect-square bg-neutral-950/80 rounded-lg p-1 relative overflow-hidden border border-neutral-800">
                      {layoutItem.slots.map((s, idx) => (
                        <div
                          key={idx}
                          className="absolute bg-neutral-700/80 rounded-[2px] border border-neutral-900/60 transition-colors"
                          style={{
                            left: `${s.x}%`,
                            top: `${s.y}%`,
                            width: `${s.w}%`,
                            height: `${s.h}%`,
                            backgroundColor: isActive ? '#f59e0b88' : undefined,
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-200 truncate">
                        {layoutItem.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium px-1.5 py-0.5 rounded bg-neutral-800">
                        {layoutItem.photoCount} ảnh
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB: MẪU 3:4 & BÁO CHÍ ==================== */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            {/* Header / Intro */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-neutral-900 to-neutral-950 border border-amber-500/40 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Newspaper className="w-4 h-4 text-amber-400" />
                  <span>PHONG CÁCH BÁO CHÍ 3:4</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.newsPoster?.enabled ?? false}
                    onChange={(e) =>
                      onUpdateConfig({
                        newsPoster: {
                          ...(config.newsPoster || {
                            enabled: true,
                            style: 'editorial-serif',
                            headline:
                              "Iris West Never Needed Super-Speed to Become One of The Flash's Strongest Voices",
                            highlightWords: "Iris West, The Flash's Strongest Voices",
                            headlineColor: '#FFFFFF',
                            highlightColor: '#F5D061',
                            fontSize: 26,
                            gradientHeight: 38,
                            gradientOpacity: 0.94,
                            showTopBadge: false,
                            topBadgeText: '',
                            showFollowButton: false,
                            followButtonText: 'FOLLOW US',
                            showDiamondDivider: true,
                          }),
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Tự động tạo dải bóng đen chuyển tiếp và chữ báo chí / tin tức nổi bật ở chân ảnh theo 2 mẫu bạn yêu cầu.
              </p>
            </div>

            {/* 2 Quick Presets Buttons */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                2 Phong Cách Chuẩn Theo Mẫu Bạn Gửi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onUpdateConfig({
                      aspectRatio: '3:4',
                      newsPoster: {
                        enabled: true,
                        style: 'editorial-serif',
                        headline:
                          "Iris West Never Needed Super-Speed to Become One of The Flash's Strongest Voices",
                        highlightWords: "Iris West, The Flash's Strongest Voices",
                        headlineColor: '#FFFFFF',
                        highlightColor: '#F5D061',
                        fontSize: 35,
                        gradientHeight: 38,
                        gradientOpacity: 0.94,
                        showTopBadge: true,
                        topBadgeText: 'HM MEDIA',
                        showFollowButton: true,
                        followButtonText: 'FOLLOW US',
                        showDiamondDivider: true,
                      },
                    });
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                    config.newsPoster?.style === 'editorial-serif' && config.newsPoster?.enabled
                      ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 shadow'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-300">✨ Mẫu Iris West</span>
                  <span className="text-[10px] text-neutral-400 font-serif italic">
                    Chữ nghiêng Serif nghệ thuật, gạch kim cương ◆ đáy
                  </span>
                </button>

                <button
                  onClick={() => {
                    onUpdateConfig({
                      aspectRatio: '3:4',
                      newsPoster: {
                        enabled: true,
                        style: 'bold-headline',
                        headline:
                          'JOHNNY DEPP SAYS HE WAS "SURPRISED" BY TIM BURTON\'S CASTING FOR EDWARD SCISSORHANDS',
                        highlightWords: 'JOHNNY DEPP, EDWARD SCISSORHANDS, SURPRISED',
                        headlineColor: '#FFFFFF',
                        highlightColor: '#FACC15',
                        fontSize: 35,
                        gradientHeight: 38,
                        gradientOpacity: 0.94,
                        showTopBadge: true,
                        topBadgeText: 'HM MEDIA',
                        showFollowButton: true,
                        followButtonText: 'FOLLOW US',
                        showDiamondDivider: true,
                      },
                    });
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                    config.newsPoster?.style === 'bold-headline' && config.newsPoster?.enabled
                      ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 shadow'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-300">⚡ Mẫu Johnny Depp</span>
                  <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold tracking-tight">
                    Chữ in hoa Anton, kèm huy hiệu & nút Follow
                  </span>
                </button>

                <button
                  onClick={() => {
                    onUpdateConfig({
                      aspectRatio: '3:4',
                      comparison: {
                        enabled: true,
                        leftLabel: 'THEN',
                        rightLabel: 'NOW',
                        showLabels: true,
                        labelPosition: 'bottom',
                        verticalPercent: 58,
                        badgeAlign: 'center',
                        badgeStyle: 'pill',
                        showVsBadge: false,
                        centerDivider: 'gap',
                      },
                      newsPoster: {
                        enabled: true,
                        style: 'bold-headline',
                        headline: 'THEN & NOW: THE INCREDIBLE TRANSFORMATION OVER THE YEARS',
                        highlightWords: 'THEN & NOW, INCREDIBLE TRANSFORMATION, YEARS',
                        headlineColor: '#FFFFFF',
                        highlightColor: '#FACC15',
                        fontSize: 34,
                        gradientHeight: 38,
                        gradientOpacity: 0.94,
                        showTopBadge: true,
                        topBadgeText: 'HM MEDIA',
                        showFollowButton: true,
                        followButtonText: 'FOLLOW US',
                        showDiamondDivider: true,
                      },
                    });
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                    config.comparison?.enabled && config.newsPoster?.enabled
                      ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 shadow'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-300">🔥 Mẫu Then & Now</span>
                  <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold tracking-tight">
                    2 ảnh so sánh trước sau, nhãn Then/Now nổi bật
                  </span>
                </button>
              </div>
            </div>

            {config.newsPoster?.enabled && (
              <div className="space-y-4 pt-1">
                {/* Font Style Selection */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Phong cách thiết kế
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            style: 'bold-headline',
                          },
                        })
                      }
                      className={`py-2 px-1 text-[11px] rounded-xl border font-bold text-center transition-all ${
                        config.newsPoster.style === 'bold-headline'
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      In Hoa Báo Chí
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            style: 'editorial-serif',
                          },
                        })
                      }
                      className={`py-2 px-1 text-[11px] rounded-xl border font-bold font-serif italic text-center transition-all ${
                        config.newsPoster.style === 'editorial-serif'
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      Nghiêng Tạp Chí
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            style: 'tribute-rip',
                            headline: config.newsPoster?.headline?.includes('REST')
                              ? config.newsPoster?.headline
                              : 'REST\nIN PEACE',
                            subtitle: config.newsPoster?.subtitle || 'LAST ROSIE THE RIVETER OF WWII',
                            bottomSymbol: config.newsPoster?.bottomSymbol || 'ribbon',
                            showTopEmblem: config.newsPoster?.showTopEmblem ?? true,
                            topEmblemIcon: config.newsPoster?.topEmblemIcon || 'ship',
                          },
                        })
                      }
                      className={`py-2 px-1 text-[11px] rounded-xl border font-bold font-serif text-center transition-all ${
                        config.newsPoster.style === 'tribute-rip'
                          ? 'border-amber-400 bg-amber-500/20 text-white font-extrabold shadow-sm'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      Tưởng Niệm (RIP) 🎗
                    </button>
                  </div>
                </div>

                {config.newsPoster.style === 'tribute-rip' ? (
                  /* ==================== CÁC TÙY CHỌN RIÊNG CHO MẪU TƯỞNG NIỆM TRI ÂN ==================== */
                  <div className="space-y-3.5">
                    {/* Headline for Tribute */}
                    <div>
                      <HeadlineHighlightEditor
                        headline={config.newsPoster.headline}
                        highlightWords={config.newsPoster.highlightWords}
                        highlightColor={config.newsPoster.highlightColor || '#FACC15'}
                        headlineColor={config.newsPoster.headlineColor || '#FFFFFF'}
                        wordColorMap={config.newsPoster.wordColorMap}
                        fontFamily={config.newsPoster.fontFamily}
                        styleType="tribute-rip"
                        rows={2}
                        placeholder="REST&#10;IN PEACE"
                        onUpdateHeadline={(val) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              headline: val,
                            },
                          })
                        }
                        onUpdateHighlight={({ highlightWords: hw, highlightColor: hc, wordColorMap: wcm }) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              highlightWords: hw,
                              highlightColor: hc,
                              wordColorMap: wcm,
                            },
                          })
                        }
                        quickTemplates={[
                          { label: 'REST IN PEACE', text: 'REST\nIN PEACE' },
                          { label: 'VÔ CÙNG THƯƠNG TIẾC', text: 'VÔ CÙNG\nTHƯƠNG TIẾC' },
                          { label: 'IN LOVING MEMORY', text: 'IN LOVING\nMEMORY' },
                          { label: 'TƯỞNG NIỆM & TRI ÂN', text: 'TƯỞNG NIỆM\n& TRI ÂN' },
                          { label: 'MÃI TRONG TIM', text: 'MÃI MÃI\nTRONG TIM' },
                        ]}
                        onSelectQuickTemplate={(item) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              headline: item.text,
                            },
                          })
                        }
                      />

                      {/* Khoảng cách giữa 2 dòng tiêu đề */}
                      <div className="mt-2.5 pt-2 border-t border-neutral-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-medium text-neutral-300">
                            Khoảng cách 2 dòng chữ:
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {config.newsPoster.headlineLineGap ?? 2}px {((config.newsPoster.headlineLineGap ?? 2) === 2) ? '(Chuẩn mẫu)' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-500 font-mono">0px</span>
                          <input
                            type="range"
                            min="0"
                            max="16"
                            step="1"
                            value={config.newsPoster.headlineLineGap ?? 2}
                            onChange={(e) =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  headlineLineGap: parseInt(e.target.value, 10),
                                },
                              })
                            }
                            className="flex-1 accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                          />
                          <span className="text-[10px] text-neutral-500 font-mono">16px</span>
                        </div>
                        <div className="flex gap-1.5">
                          {[
                            { label: 'Sát nhau (0px)', val: 0 },
                            { label: 'Chuẩn mẫu (2px)', val: 2 },
                            { label: 'Vừa (4px)', val: 4 },
                            { label: 'Rộng (8px)', val: 8 },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() =>
                                onUpdateConfig({
                                  newsPoster: {
                                    ...config.newsPoster!,
                                    headlineLineGap: opt.val,
                                  },
                                })
                              }
                              className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                                (config.newsPoster?.headlineLineGap ?? 2) === opt.val
                                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Subtitle / Description (e.g. 'LAST ROSIE THE RIVETER OF WWII') */}
                    <div className="space-y-2.5 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                          Dòng phụ đề danh vị / tên tuổi
                        </label>
                        <span className="text-[10px] text-amber-400 font-bold font-mono">
                          {config.newsPoster.subtitleFontSize || 13}px
                        </span>
                      </div>
                      <input
                        type="text"
                        value={config.newsPoster.subtitle || ''}
                        onChange={(e) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              subtitle: e.target.value,
                            },
                          })
                        }
                        placeholder="VD: LAST ROSIE THE RIVETER OF WWII"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 uppercase tracking-wider"
                      />

                      {/* Subtitle Font Size Slider & Quick Presets */}
                      <div className="space-y-1.5 pt-1 border-t border-neutral-800/80">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-neutral-300 text-[11px] font-medium">Cỡ chữ phụ đề:</span>
                          <span className="text-amber-400 font-bold text-[11px]">
                            {config.newsPoster.subtitleFontSize || 13}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="32"
                          value={config.newsPoster.subtitleFontSize || 13}
                          onChange={(e) =>
                            onUpdateConfig({
                              newsPoster: {
                                ...config.newsPoster!,
                                subtitleFontSize: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                        {/* Quick preset buttons for Subtitle Font Size */}
                        <div className="grid grid-cols-5 gap-1 pt-0.5">
                          {[
                            { label: '11px', size: 11, desc: 'Nhỏ' },
                            { label: '13px', size: 13, desc: 'Chuẩn' },
                            { label: '16px', size: 16, desc: 'Vừa' },
                            { label: '20px', size: 20, desc: 'To' },
                            { label: '26px', size: 26, desc: 'Rất to' },
                          ].map((preset) => (
                            <button
                              key={preset.size}
                              type="button"
                              onClick={() =>
                                onUpdateConfig({
                                  newsPoster: {
                                    ...config.newsPoster!,
                                    subtitleFontSize: preset.size,
                                  },
                                })
                              }
                              className={`py-1 px-0.5 rounded text-[10px] font-medium border text-center transition-all cursor-pointer ${
                                (config.newsPoster?.subtitleFontSize || 13) === preset.size
                                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                              }`}
                            >
                              <span className="block leading-none">{preset.label}</span>
                              <span className="text-[8px] opacity-70 block mt-0.5">{preset.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Đường gạch trắng phân cách */}
                      <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-neutral-300">
                            Đường gạch trắng trang trí
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Hiệu ứng vát mờ 2 đầu
                          </span>
                        </div>

                        {/* Gạch giữa 2 tiêu đề to và nhỏ */}
                        <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer p-1.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/60 transition-colors">
                          <div>
                            <span className="text-[11px] font-medium text-white block">
                              Gạch giữa 2 tiêu đề (To & Nhỏ)
                            </span>
                            <span className="text-[9px] text-neutral-400 block">
                              Nằm giữa "REST IN PEACE" và dòng phụ đề
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.newsPoster.showTitleDivider ?? true}
                            onChange={(e) =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  showTitleDivider: e.target.checked,
                                },
                              })
                            }
                            className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                          />
                        </label>

                        {/* Gạch dưới phụ đề */}
                        <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer p-1.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/60 transition-colors">
                          <div>
                            <span className="text-[11px] font-medium text-white block">
                              Gạch chân dưới dòng phụ đề
                            </span>
                            <span className="text-[9px] text-neutral-400 block">
                              Nằm phía dưới dòng phụ đề nhỏ
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.newsPoster.showSubtitleUnderline ?? true}
                            onChange={(e) =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  showSubtitleUnderline: e.target.checked,
                                },
                              })
                            }
                            className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                          />
                        </label>

                        {/* Nút chọn nhanh */}
                        <div className="grid grid-cols-4 gap-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  showTitleDivider: true,
                                  showSubtitleUnderline: true,
                                },
                              })
                            }
                            className={`py-1 px-1 rounded text-[9px] font-medium border text-center transition-all cursor-pointer ${
                              (config.newsPoster?.showTitleDivider ?? true) &&
                              (config.newsPoster?.showSubtitleUnderline ?? true)
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            Cả 2 gạch
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  showTitleDivider: true,
                                  showSubtitleUnderline: false,
                                },
                              })
                            }
                            className={`py-1 px-1 rounded text-[9px] font-medium border text-center transition-all cursor-pointer ${
                              (config.newsPoster?.showTitleDivider ?? true) &&
                              !(config.newsPoster?.showSubtitleUnderline ?? true)
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            Chỉ ở giữa
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  showTitleDivider: false,
                                  showSubtitleUnderline: true,
                                },
                              })
                            }
                            className={`py-1 px-1 rounded text-[9px] font-medium border text-center transition-all cursor-pointer ${
                              !(config.newsPoster?.showTitleDivider ?? true) &&
                              (config.newsPoster?.showSubtitleUnderline ?? true)
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            Chỉ ở dưới
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  showTitleDivider: false,
                                  showSubtitleUnderline: false,
                                },
                              })
                            }
                            className={`py-1 px-1 rounded text-[9px] font-medium border text-center transition-all cursor-pointer ${
                              !(config.newsPoster?.showTitleDivider ?? true) &&
                              !(config.newsPoster?.showSubtitleUnderline ?? true)
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            Tắt gạch
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Memorial Symbol Selection */}
                    <div className="space-y-3 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                          Biểu tượng tưởng niệm (Đáy poster)
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {config.newsPoster?.bottomSymbolSize ?? 36}px
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'ribbon', label: '🎗 Ruy băng (Mẫu ảnh)' },
                          { id: 'candle', label: '🕯️ Ngọn nến' },
                          { id: 'rose', label: '🌹 Hoa hồng' },
                          { id: 'dove', label: '🕊️ Chim bồ câu' },
                          { id: 'lotus', label: '🪷 Hoa sen' },
                          { id: 'star', label: '⭐ Ngôi sao' },
                          { id: 'cross', label: '✝️ Thập tự' },
                          { id: 'hands', label: '🙏 Cầu nguyện' },
                          { id: 'none', label: '✕ Tắt' },
                        ].map((sym) => (
                          <button
                            key={sym.id}
                            type="button"
                            onClick={() =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  bottomSymbol: sym.id as any,
                                },
                              })
                            }
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer ${
                              (config.newsPoster?.bottomSymbol || 'ribbon') === sym.id
                                ? 'border-amber-400 bg-amber-500/20 text-white font-bold shadow-sm'
                                : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            {sym.label}
                          </button>
                        ))}
                      </div>

                      {/* Slider & Quick Presets to adjust symbol size (16px - 72px) */}
                      {(config.newsPoster?.bottomSymbol ?? 'ribbon') !== 'none' && (
                        <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-neutral-300 flex items-center gap-1.5">
                              <span>Kích thước biểu tượng ruy băng</span>
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Kéo để phóng to / thu nhỏ
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-500 font-mono">16px</span>
                            <input
                              type="range"
                              min="16"
                              max="72"
                              step="2"
                              value={config.newsPoster?.bottomSymbolSize ?? 36}
                              onChange={(e) =>
                                onUpdateConfig({
                                  newsPoster: {
                                    ...config.newsPoster!,
                                    bottomSymbolSize: parseInt(e.target.value, 10),
                                  },
                                })
                              }
                              className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <span className="text-[10px] text-neutral-500 font-mono">72px</span>
                          </div>

                          {/* Quick size presets */}
                          <div className="grid grid-cols-5 gap-1 pt-1">
                            {[
                              { size: 24, label: 'Nhỏ', desc: '24px' },
                              { size: 36, label: 'Chuẩn', desc: '36px' },
                              { size: 44, label: 'Vừa', desc: '44px' },
                              { size: 54, label: 'To', desc: '54px' },
                              { size: 68, label: 'Cực đại', desc: '68px' },
                            ].map((preset) => (
                              <button
                                key={preset.size}
                                type="button"
                                onClick={() =>
                                  onUpdateConfig({
                                    newsPoster: {
                                      ...config.newsPoster!,
                                      bottomSymbolSize: preset.size,
                                    },
                                  })
                                }
                                className={`py-1 px-1 rounded text-[10px] border text-center transition-all cursor-pointer ${
                                  (config.newsPoster?.bottomSymbolSize ?? 36) === preset.size
                                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                                }`}
                              >
                                <span className="block leading-none">{preset.label}</span>
                                <span className="text-[8px] opacity-70 block mt-0.5">{preset.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Top Emblem Badge Selection */}
                    <div className="space-y-2 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800">
                      <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
                        <div>
                          <span className="font-semibold text-neutral-200 block">
                            Huy hiệu tròn góc trên (Tàu chiến / Quân nhân)
                          </span>
                          <span className="text-[10px] text-neutral-400 block">
                            Đúng chuẩn huy hiệu góc trên trong mẫu ảnh
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.newsPoster.showTopEmblem ?? true}
                          onChange={(e) =>
                            onUpdateConfig({
                              newsPoster: {
                                ...config.newsPoster!,
                                showTopEmblem: e.target.checked,
                              },
                            })
                          }
                          className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                        />
                      </label>

                      {config.newsPoster.showTopEmblem && (
                        <div className="pt-2 space-y-2 border-t border-neutral-800">
                          <div>
                            <span className="text-[11px] font-semibold text-neutral-300 block mb-1">
                              Biểu tượng huy hiệu:
                            </span>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'ship', label: '⚓ Tàu chiến (Ảnh)' },
                                { id: 'star', label: '⭐ Ngôi sao' },
                                { id: 'shield', label: '🛡️ Khiên' },
                              ].map((em) => (
                                <button
                                  key={em.id}
                                  type="button"
                                  onClick={() =>
                                    onUpdateConfig({
                                      newsPoster: {
                                        ...config.newsPoster!,
                                        topEmblemIcon: em.id as any,
                                      },
                                    })
                                  }
                                  className={`py-1.5 px-1 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer ${
                                    (config.newsPoster?.topEmblemIcon || 'ship') === em.id
                                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                                  }`}
                                >
                                  {em.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold text-neutral-300 block mb-1">
                              Vị trí đặt:
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { id: 'top-right', label: 'Góc phải trên (Mẫu ảnh)' },
                                { id: 'top-left', label: 'Góc trái trên' },
                              ].map((pos) => (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() =>
                                    onUpdateConfig({
                                      newsPoster: {
                                        ...config.newsPoster!,
                                        topEmblemPosition: pos.id as any,
                                      },
                                    })
                                  }
                                  className={`py-1.5 px-2 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer ${
                                    (config.newsPoster?.topEmblemPosition || 'top-right') === pos.id
                                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                                  }`}
                                >
                                  {pos.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ==================== CÁC TÙY CHỌN CHO MẪU BÁO CHÍ THÔNG THƯỜNG ==================== */
                  <>
                    <HeadlineHighlightEditor
                      headline={config.newsPoster.headline}
                      highlightWords={config.newsPoster.highlightWords}
                      highlightColor={config.newsPoster.highlightColor || '#FACC15'}
                      headlineColor={config.newsPoster.headlineColor || '#FFFFFF'}
                      wordColorMap={config.newsPoster.wordColorMap}
                      fontFamily={config.newsPoster.fontFamily}
                      styleType={config.newsPoster.style}
                      rows={3}
                      placeholder="Nhập tiêu đề bài báo / tin tức nổi bật..."
                      onUpdateHeadline={(val) =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            headline: val,
                          },
                        })
                      }
                      onUpdateHighlight={({ highlightWords: hw, highlightColor: hc, wordColorMap: wcm }) =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            highlightWords: hw,
                            highlightColor: hc,
                            wordColorMap: wcm,
                          },
                        })
                      }
                      quickTemplates={[
                        {
                          label: 'Mẫu Kỷ Niệm',
                          text: 'Khoảnh Khắc Đẹp Nhất Của Chuyến Đi Được Ghi Lại Hoàn Hảo',
                          highlightWords: 'Khoảnh Khắc Đẹp Nhất, Hoàn Hảo',
                        },
                        {
                          label: 'Mẫu Thời Trang',
                          text: 'BỘ SƯU TẬP PHONG CÁCH MÙA THU ĐẬM CHẤT ĐIỆN ẢNH VÀ NGHỆ THUẬT',
                          highlightWords: 'BỘ SƯU TẬP, ĐIỆN ẢNH, NGHỆ THUẬT',
                          style: 'bold-headline',
                        },
                        {
                          label: 'Mẫu Điện Ảnh',
                          text: 'JOHNNY DEPP SAYS HE WAS "SURPRISED" BY TIM BURTON\'S CASTING FOR EDWARD SCISSORHANDS',
                          highlightWords: 'JOHNNY DEPP, EDWARD SCISSORHANDS, SURPRISED',
                          style: 'bold-headline',
                        },
                        {
                          label: 'Mẫu Biến Đổi',
                          text: 'THEN & NOW: THE INCREDIBLE TRANSFORMATION OVER THE PAST 20 YEARS',
                          highlightWords: 'THEN & NOW, INCREDIBLE TRANSFORMATION, YEARS',
                          style: 'bold-headline',
                        },
                      ]}
                      onSelectQuickTemplate={(item) =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            headline: item.text,
                            highlightWords: item.highlightWords || '',
                            style: item.style || config.newsPoster!.style,
                          },
                        })
                      }
                    />

                      {/* Dòng phụ đề nhỏ (Dưới tiêu đề) */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-neutral-300 block">
                            Dòng phụ đề nhỏ (Dưới tiêu đề to)
                          </label>
                          {config.newsPoster.subtitle && (
                            <span className="text-[10px] text-amber-400 font-bold font-mono">
                              {config.newsPoster.subtitleFontSize || 13}px
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={config.newsPoster.subtitle || ''}
                          onChange={(e) =>
                            onUpdateConfig({
                              newsPoster: {
                                ...config.newsPoster!,
                                subtitle: e.target.value,
                              },
                            })
                          }
                          placeholder="VD: PHỤ ĐỀ / DIỄN VIÊN / NGUỒN TIN..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 uppercase tracking-wider"
                        />
                        {config.newsPoster.subtitle && (
                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.newsPoster.showTitleDivider ?? true}
                                onChange={(e) =>
                                  onUpdateConfig({
                                    newsPoster: {
                                      ...config.newsPoster!,
                                      showTitleDivider: e.target.checked,
                                    },
                                  })
                                }
                                className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
                              />
                              <span>Gạch trắng giữa 2 tiêu đề (To & Nhỏ)</span>
                            </label>
                          </div>
                        )}
                      </div>
                  </>
                )}

                {/* Typography & Gradient Sliders */}
                <div className="space-y-3.5 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
                  {/* Mẫu phông chữ tiêu đề (Font Family) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                        Mẫu phông chữ tiêu đề (Mẫu chữ)
                      </label>
                      <span className="text-[10px] text-amber-400 font-medium">
                        Lưu chuẩn 100% khi xuất ảnh
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {HEADLINE_FONT_OPTIONS.map((f) => {
                        const currentFont =
                          config.newsPoster?.fontFamily ||
                          (config.newsPoster?.style === 'tribute-rip'
                            ? 'Playfair Display, Georgia, serif'
                            : config.newsPoster?.style === 'bold-headline'
                            ? 'Anton, Montserrat, sans-serif'
                            : 'Playfair Display, serif');

                        const isSelected =
                          config.newsPoster?.fontFamily === f.value ||
                          (!config.newsPoster?.fontFamily && currentFont.startsWith(f.value.split(',')[0]));

                        return (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  fontFamily: f.value,
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm ring-1 ring-amber-400/40'
                                : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                            }`}
                          >
                            <span
                              className="text-xs font-bold truncate block"
                              style={{ fontFamily: f.value }}
                            >
                              {f.label}
                            </span>
                            <span className="text-[9px] text-neutral-400 truncate block mt-0.5">
                              {f.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size - Mở rộng kéo to và rõ hơn */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                        <span>Cỡ chữ tiêu đề (Kéo to & cực rõ nét)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                          Max 80px
                        </span>
                      </span>
                      <span className="text-amber-400 font-bold text-sm font-mono">
                        {config.newsPoster.fontSize || (config.newsPoster.style === 'tribute-rip' ? 48 : 35)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={80}
                      step={1}
                      value={config.newsPoster.fontSize || (config.newsPoster.style === 'tribute-rip' ? 48 : 35)}
                      onChange={(e) =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            fontSize: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                    />

                    {/* Quick Font Size Presets */}
                    <div className="grid grid-cols-5 gap-1 pt-2">
                      {[
                        { label: '28px', desc: 'Nhỏ', val: 28 },
                        { label: '36px', desc: 'Vừa', val: 36 },
                        { label: '48px', desc: 'Chuẩn', val: 48 },
                        { label: '58px', desc: 'To', val: 58 },
                        { label: '72px', desc: 'Cực to', val: 72 },
                      ].map((item) => {
                        const currentVal =
                          config.newsPoster?.fontSize ||
                          (config.newsPoster?.style === 'tribute-rip' ? 48 : 35);
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() =>
                              onUpdateConfig({
                                newsPoster: {
                                  ...config.newsPoster!,
                                  fontSize: item.val,
                                },
                              })
                            }
                            className={`py-1 px-0.5 text-[10px] rounded-lg border transition-all cursor-pointer font-medium text-center ${
                              currentVal === item.val
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            <span className="block leading-none">{item.label}</span>
                            <span className="text-[8px] opacity-70 block mt-0.5">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Text Sharpness / Outline toggle */}
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-neutral-800">
                      <div>
                        <span className="text-xs font-semibold text-neutral-200 block">
                          Viền nét đen chống chìm chữ
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          Chữ nổi bật, cực rõ nét khi xuất ảnh
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.newsPoster.textOutline ?? true}
                          onChange={(e) =>
                            onUpdateConfig({
                              newsPoster: {
                                ...config.newsPoster!,
                                textOutline: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Gradient Height */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-neutral-300">Chiều cao bóng mờ đen (Gradient)</span>
                      <span className="text-amber-400 font-bold">
                        {config.newsPoster.gradientHeight ?? 38}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={60}
                      value={config.newsPoster.gradientHeight ?? 38}
                      onChange={(e) =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            gradientHeight: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Gradient Opacity */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-neutral-300">Độ đậm bóng mờ đen</span>
                      <span className="text-amber-400 font-bold">
                        {Math.round((config.newsPoster.gradientOpacity ?? 0.94) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={Math.round((config.newsPoster.gradientOpacity ?? 0.94) * 100)}
                      onChange={(e) =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            gradientOpacity: Number(e.target.value) / 100,
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                {/* Additional Decorative Elements (Dành cho Mẫu Báo chí) */}
                {config.newsPoster.style !== 'tribute-rip' && (
                  <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Chi tiết trang trí báo chí
                    </span>

                    {/* Diamond divider with position options */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
                        <div>
                          <span className="font-medium text-neutral-200 block">
                            Vạch kim cương (`— ◆ —`)
                          </span>
                          <span className="text-[10px] text-neutral-400 block">
                            Phân cách ranh giới sang trọng giữa ảnh và chữ
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.newsPoster.showDiamondDivider}
                          onChange={(e) =>
                            onUpdateConfig({
                              newsPoster: {
                                ...config.newsPoster!,
                                showDiamondDivider: e.target.checked,
                              },
                            })
                          }
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                      </label>

                      {config.newsPoster.showDiamondDivider && (
                        <div className="pt-1.5 pl-2 border-l-2 border-amber-500/50 space-y-1.5">
                          <span className="text-[11px] font-semibold text-neutral-300 block">
                            Vị trí đặt vạch:
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'top', label: 'Trên chữ (Ảnh & Chữ)' },
                              { id: 'bottom', label: 'Dưới chữ' },
                              { id: 'both', label: 'Cả 2 bên' },
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() =>
                                  onUpdateConfig({
                                    newsPoster: {
                                      ...config.newsPoster!,
                                      dividerPosition: pos.id as 'top' | 'bottom' | 'both',
                                    },
                                  })
                                }
                                className={`py-1.5 px-1 rounded text-[10px] font-medium border text-center transition-all cursor-pointer ${
                                  (config.newsPoster?.dividerPosition ?? 'top') === pos.id
                                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Logo & Thanh tiêu đề trên cùng (Dùng chung cho tất cả các mẫu ảnh) */}
                <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Logo & Thanh tiêu đề trên cùng
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                      Chung cho tất cả mẫu ảnh
                    </span>
                  </div>

                  {/* Top Badge: HM MEDIA */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-sm">🏅</span>
                        <div>
                          <span className="font-semibold text-white block">Logo góc trái (HM MEDIA)</span>
                          <span className="text-[10px] text-neutral-400 block">Huy hiệu tròn viền vàng + tên thương hiệu</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.newsPoster.showTopBadge}
                        onChange={(e) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              showTopBadge: e.target.checked,
                            },
                          })
                        }
                        className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                      />
                    </label>
                    {config.newsPoster.showTopBadge && (
                      <input
                        type="text"
                        value={config.newsPoster.topBadgeText || ''}
                        onChange={(e) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              topBadgeText: e.target.value,
                            },
                          })
                        }
                        placeholder="HM MEDIA"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    )}
                  </div>

                  {/* Follow Button: FOLLOW US */}
                  <div className="pt-2 border-t border-neutral-800 space-y-2">
                    <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">👆</span>
                        <div>
                          <span className="font-semibold text-white block">Nút góc phải (FOLLOW US)</span>
                          <span className="text-[10px] text-neutral-400 block">Nút theo dõi bo tròn bo viền nổi bật</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.newsPoster.showFollowButton}
                        onChange={(e) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              showFollowButton: e.target.checked,
                            },
                          })
                        }
                        className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                      />
                    </label>
                    {config.newsPoster.showFollowButton && (
                      <input
                        type="text"
                        value={config.newsPoster.followButtonText || ''}
                        onChange={(e) =>
                          onUpdateConfig({
                            newsPoster: {
                              ...config.newsPoster!,
                              followButtonText: e.target.value,
                            },
                          })
                        }
                        placeholder="FOLLOW US"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: TẢI ẢNH ==================== */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-amber-500/40 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all shadow">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-neutral-100 block">
                  Tải ảnh từ máy tính / điện thoại
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Hỗ trợ JPG, PNG, WEBP (chọn nhiều ảnh cùng lúc)
                </span>
              </div>
            </div>

            {/* User Uploaded Photos Gallery (if any) */}
            {userImages.length > 0 ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5">
                    <span>Ảnh bạn đã tải lên</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-neutral-800 text-[10px] text-amber-400 font-bold">
                      {userImages.length}
                    </span>
                  </span>
                  <button
                    onClick={onAutoFillPreset}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Điền vào tất cả ô</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {userImages.map((src, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectImage(src)}
                      className="aspect-square rounded-xl overflow-hidden border border-neutral-700 relative group cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all shadow"
                    >
                      <img
                        src={src}
                        alt={`Ảnh tải lên ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1 p-1 text-center">
                        <Plus className="w-5 h-5 text-amber-400" />
                        <span className="text-[9px] font-semibold text-neutral-200">
                          {selectedSlotIndex !== null
                            ? `Gán ô #${selectedSlotIndex + 1}`
                            : 'Thêm vào ô'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center space-y-2">
                <span className="text-xs font-semibold text-neutral-200 block">
                  Chưa có ảnh nào được tải lên
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Kho ảnh mặc định đã được xóa sạch. Hãy tải ảnh của bạn lên để bắt đầu ghép ảnh nhé! Bạn cũng có thể bấm trực tiếp vào từng ô trên khung để thêm ảnh.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: KHUNG & NỀN ==================== */}
        {activeTab === 'canvas' && (
          <div className="space-y-5">
            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                Tỉ lệ khung hình
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '3:4', label: '⭐ 3:4 Chuẩn', desc: 'Báo chí / Ưu tiên' },
                  { id: '1:1', label: '1:1 Vuông', desc: 'Instagram / FB' },
                  { id: '4:5', label: '4:5 Dọc', desc: 'Chân dung' },
                  { id: '9:16', label: '9:16 Story', desc: 'TikTok / Reel' },
                  { id: '16:9', label: '16:9 Ngang', desc: 'Màn hình rộng' },
                  { id: '1:2', label: '1:2 Strip', desc: 'Photobooth' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => onUpdateConfig({ aspectRatio: ratio.id as AspectRatioType })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      config.aspectRatio === ratio.id
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-neutral-800 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="text-xs block font-bold">{ratio.id}</span>
                    <span className="text-[10px] text-neutral-400 block">{ratio.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Frame Style */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                Kiểu khung phong cách
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', label: 'Tiêu chuẩn' },
                  { id: 'photobooth', label: 'Photobooth Hàn' },
                  { id: 'polaroid', label: 'Polaroid Retro' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() =>
                      onUpdateConfig({
                        frameStyle: f.id as any,
                        padding: f.id === 'photobooth' || f.id === 'polaroid' ? 16 : config.padding,
                      })
                    }
                    className={`py-2 px-1 text-xs rounded-xl border font-semibold text-center transition-all ${
                      config.frameStyle === f.id
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                        : 'border-neutral-800 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Gap, Radius, Padding */}
            <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
              {/* Gap */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-neutral-300">Khoảng cách ô (Gap)</span>
                  <span className="text-amber-400 font-bold">{config.gap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="2"
                  value={config.gap}
                  onChange={(e) => onUpdateConfig({ gap: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Radius */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-neutral-300">Bo góc ảnh (Radius)</span>
                  <span className="text-amber-400 font-bold">{config.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="36"
                  step="2"
                  value={config.borderRadius}
                  onChange={(e) => onUpdateConfig({ borderRadius: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Padding */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-neutral-300">Viền lề ngoài (Padding)</span>
                  <span className="text-amber-400 font-bold">{config.padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="4"
                  value={config.padding}
                  onChange={(e) => onUpdateConfig({ padding: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Background Color & Gradient */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Màu nền Canvas
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => onUpdateConfig({ bgType: 'solid' })}
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      config.bgType === 'solid'
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Đơn sắc
                  </button>
                  <button
                    onClick={() => onUpdateConfig({ bgType: 'gradient' })}
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      config.bgType === 'gradient'
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Gradient
                  </button>
                </div>
              </div>

              {config.bgType === 'solid' ? (
                <div className="grid grid-cols-6 gap-2">
                  {BACKGROUND_COLORS.map((col) => (
                    <button
                      key={col.value}
                      onClick={() => onUpdateConfig({ bgColor: col.value })}
                      title={col.name}
                      className={`aspect-square rounded-lg border flex items-center justify-center transition-all ${
                        config.bgColor === col.value
                          ? 'border-amber-400 scale-105 shadow-md'
                          : 'border-neutral-700/60 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.value }}
                    >
                      {config.bgColor === col.value && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            col.value === '#ffffff' || col.value.includes('f')
                              ? 'text-neutral-900'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {BACKGROUND_GRADIENTS.map((grad, idx) => (
                    <button
                      key={idx}
                      onClick={() => onUpdateConfig({ bgGradient: grad.value, bgType: 'gradient' })}
                      title={grad.name}
                      className={`h-10 rounded-xl border transition-all ${
                        config.bgGradient === grad.value
                          ? 'border-amber-400 scale-105 shadow-md'
                          : 'border-neutral-700/60 hover:scale-105'
                      }`}
                      style={{ background: grad.value }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pattern */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                Họa tiết trang trí nền
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Không' },
                  { id: 'dots', label: 'Chấm bi (Dots)' },
                  { id: 'grid', label: 'Lưới kẻ (Grid)' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => onUpdateConfig({ bgPattern: pat.id })}
                    className={`py-1.5 px-2 text-xs rounded-xl border font-medium text-center transition-all ${
                      config.bgPattern === pat.id
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                        : 'border-neutral-800 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: LÀM NÉT & BỘ LỌC ==================== */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            {/* LÀM NÉT ẢNH CHUYÊN NGHIỆP */}
            <div className="space-y-3 bg-neutral-950/60 p-3.5 rounded-xl border border-amber-500/30 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 uppercase tracking-wide">
                      Làm Nét & Tăng Độ Sắc
                    </h4>
                    <span className="text-[10px] text-amber-300/80 block">
                      Thuật toán Unsharp Mask khử mờ & nét viền
                    </span>
                  </div>
                </div>
              </div>

              {/* Scope info & checkbox */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                <span className="text-[11px] text-neutral-400">
                  {selectedSlotIndex !== null && !applyFilterToAll
                    ? `Đang chọn: Ô #${selectedSlotIndex + 1}`
                    : 'Phạm vi: Tất cả các ảnh'}
                </span>
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyFilterToAll}
                    onChange={(e) => setApplyFilterToAll(e.target.checked)}
                    className="accent-amber-500 cursor-pointer w-3.5 h-3.5"
                  />
                  <span>Áp dụng tất cả ô</span>
                </label>
              </div>

              {/* 1-Click Auto Sharpen Button */}
              <button
                onClick={() => onApplySharpen(60, applyFilterToAll)}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Chạm: Làm Nét Chuẩn (60%)</span>
              </button>

              {/* Sharpen Slider */}
              {(() => {
                const targetSlot =
                  selectedSlotIndex !== null && slots[selectedSlotIndex]
                    ? slots[selectedSlotIndex]
                    : slots.find((s) => !!s.imageSrc) || slots[0];
                const currentSharpen = targetSlot?.sharpen || 0;

                return (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-neutral-300">Độ nét chi tiết</span>
                      <span className="text-amber-400 font-bold">
                        {currentSharpen}%{' '}
                        {currentSharpen === 0
                          ? '• Gốc'
                          : currentSharpen < 50
                          ? '• Tự nhiên'
                          : currentSharpen < 80
                          ? '• Rõ nét'
                          : '• Cực căng'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentSharpen}
                      onChange={(e) => onApplySharpen(Number(e.target.value), applyFilterToAll)}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    {/* Quick presets */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2">
                      {[
                        { label: 'Gốc', val: 0 },
                        { label: 'Vừa (35%)', val: 35 },
                        { label: 'Rõ (60%)', val: 60 },
                        { label: 'Căng (90%)', val: 90 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => onApplySharpen(item.val, applyFilterToAll)}
                          className={`py-1 text-[11px] rounded-md border transition-all cursor-pointer ${
                            currentSharpen === item.val
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* BỘ LỌC MÀU NGHỆ THUẬT */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Bộ lọc màu nghệ thuật
              </label>
            </div>

            {selectedSlotIndex !== null && !applyFilterToAll && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                Đang áp dụng cho ô <strong>#{selectedSlotIndex + 1}</strong>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {FILTER_PRESETS.map((f) => {
                const isSelected = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onApplyFilter(f.id, applyFilterToAll)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                        : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800'
                    }`}
                  >
                    <div
                      className="w-full h-14 rounded-lg overflow-hidden relative"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
                        filter: f.cssFilter !== 'none' ? f.cssFilter : undefined,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider drop-shadow">
                        {f.name.split(' ')[0]}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-200">{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: TRANG TRÍ ==================== */}
        {activeTab === 'decor' && (
          <div className="space-y-5">
            {/* Add Text Section */}
            <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Thêm chữ nghệ thuật
              </label>
              <form onSubmit={handleAddTextSubmit} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Nhập nội dung (VD: Mùa hè 2026, Best day ever...)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />

                <div className="grid grid-cols-2 gap-2">
                  {/* Font picker */}
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>

                  {/* Text Color Picker */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={textBgBox}
                        onChange={(e) => setTextBgBox(e.target.checked)}
                        className="accent-amber-500 cursor-pointer"
                      />
                      Hộp nền mờ
                    </label>
                  </div>
                </div>

                {/* Font Size slider for new text */}
                <div className="space-y-1 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Cỡ chữ (Kéo to & rõ):</span>
                    <span className="text-amber-400 font-bold">{inputFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={72}
                    value={inputFontSize}
                    onChange={(e) => setInputFontSize(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <button
                      type="button"
                      onClick={() => setInputFontSize(22)}
                      className="hover:text-amber-300"
                    >
                      Nhỏ (22px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputFontSize(34)}
                      className="hover:text-amber-300"
                    >
                      Chuẩn (34px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputFontSize(48)}
                      className="hover:text-amber-300"
                    >
                      To rõ (48px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputFontSize(64)}
                      className="hover:text-amber-300"
                    >
                      Cực to (64px)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dán chữ lên khung</span>
                </button>
              </form>
            </div>

            {/* Sticker Presets */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                Nhãn dán Sticker & Emoji
              </label>
              <div className="grid grid-cols-6 gap-2 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800">
                {STICKER_PRESETS.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAddSticker(emoji)}
                    className="aspect-square flex items-center justify-center text-2xl hover:scale-125 transition-transform cursor-pointer rounded-lg hover:bg-neutral-800"
                    title={`Thêm sticker ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Added Elements Management */}
            {(texts.length > 0 || stickers.length > 0) && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Đã thêm ({texts.length + stickers.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {texts.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60 text-xs border border-neutral-700/60"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="truncate block text-neutral-200 font-medium">
                          &quot;{t.text}&quot;
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-amber-400 font-bold">{t.fontSize || 32}px</span>
                          {onUpdateText && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateText(t.id, {
                                    fontSize: Math.max(14, (t.fontSize || 32) - 4),
                                  })
                                }
                                className="px-1.5 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-[10px]"
                                title="Thu nhỏ chữ"
                              >
                                -4px
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateText(t.id, {
                                    fontSize: Math.min(80, (t.fontSize || 32) + 6),
                                  })
                                }
                                className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] border border-amber-500/30"
                                title="Kéo to chữ"
                              >
                                +6px
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveText(t.id)}
                        className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
                        title="Xóa chữ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {stickers.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60 text-xs border border-neutral-700/60"
                    >
                      <span className="text-neutral-200 flex items-center gap-2">
                        <span>Sticker:</span>
                        <span className="text-base">{s.content}</span>
                      </span>
                      <button
                        onClick={() => onRemoveSticker(s.id)}
                        className="text-neutral-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
