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
  STICKER_PRESETS,
} from '../data/presets';

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
  onAddText: (text: string, font: string, color: string, bgBox: boolean) => void;
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
    onAddText(inputText.trim(), selectedFont, textColor, textBgBox);
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
            {/* ⭐ 4 MẪU CƠ BẢN 3:4 ĐƯỢC ƯU TIÊN THEO YÊU CẦU */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/15 via-neutral-900 to-neutral-950 border border-amber-500/40 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>4 MẪU 3:4 BÁO CHÍ (ƯU TIÊN)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                  Tỷ lệ 3:4
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Đã dựng sẵn 4 mẫu báo chí / tạp chí 3:4 với hiệu ứng chữ nổi bật và dải bóng mờ đen:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                {COLLAGE_LAYOUTS.filter((l) => l.category === 'featured-3-4').map((layoutItem, idx) => {
                  const isSelected = currentLayout.id === layoutItem.id;
                  const isBlend = !!layoutItem.isBlendedOverlap;
                  const isCircle = !!layoutItem.isCircleAccent;
                  return (
                    <button
                      key={layoutItem.id}
                      onClick={() => {
                        onSelectLayout(layoutItem);
                        onUpdateConfig({
                          aspectRatio: '3:4',
                          gap: layoutItem.id === 'layout-3-4-news-triple' ? 6 : 0,
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
                        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 to-transparent flex flex-col items-center justify-end pb-1 px-0.5 z-20">
                          <div className="w-4/5 h-1 bg-amber-400 rounded-full mb-0.5" />
                          <div className="w-3/5 h-0.5 bg-neutral-200 rounded-full" />
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
                            : 'Mẫu 4: 1 Ảnh + Tròn'}
                        </span>
                        <span className="text-[9px] text-neutral-400 truncate">
                          {idx === 0
                            ? '2 Trái + 1 Phải'
                            : idx === 1
                            ? 'Toàn khung'
                            : idx === 2
                            ? '2 ảnh mờ mờ'
                            : 'Điểm nhấn tròn'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
              <div className="grid grid-cols-2 gap-2">
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
              </div>
            </div>

            {config.newsPoster?.enabled && (
              <div className="space-y-4 pt-1">
                {/* Font Style Selection */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Kiểu dáng chữ tiêu đề
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            style: 'bold-headline',
                          },
                        })
                      }
                      className={`py-2 px-2 text-xs rounded-xl border font-bold text-center transition-all ${
                        config.newsPoster.style === 'bold-headline'
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      IN HOA ĐIỆN ẢNH (Anton)
                    </button>
                    <button
                      onClick={() =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            style: 'editorial-serif',
                          },
                        })
                      }
                      className={`py-2 px-2 text-xs rounded-xl border font-bold font-serif italic text-center transition-all ${
                        config.newsPoster.style === 'editorial-serif'
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      Nghiêng Tạp Chí (Playfair)
                    </button>
                  </div>
                </div>

                {/* Headline Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Nội dung tiêu đề
                    </label>
                    <span className="text-[10px] text-neutral-500">
                      {config.newsPoster.headline.length} ký tự
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={config.newsPoster.headline}
                    onChange={(e) =>
                      onUpdateConfig({
                        newsPoster: {
                          ...config.newsPoster!,
                          headline: e.target.value,
                        },
                      })
                    }
                    placeholder="Nhập tiêu đề bài báo / tin tức nổi bật..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
                  />
                  {/* Quick Vietnamese / English templates buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <button
                      onClick={() =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            headline: 'Khoảnh Khắc Đẹp Nhất Của Chuyến Đi Được Ghi Lại Hoàn Hảo',
                            highlightWords: 'Khoảnh Khắc Đẹp Nhất, Hoàn Hảo',
                          },
                        })
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:text-amber-300 hover:bg-neutral-700 transition-colors"
                    >
                      + Mẫu Kỷ Niệm
                    </button>
                    <button
                      onClick={() =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            headline: 'BỘ SƯU TẬP PHONG CÁCH MÙA THU ĐẬM CHẤT ĐIỆN ẢNH VÀ NGHỆ THUẬT',
                            highlightWords: 'BỘ SƯU TẬP, ĐIỆN ẢNH, NGHỆ THUẬT',
                            style: 'bold-headline',
                          },
                        })
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:text-amber-300 hover:bg-neutral-700 transition-colors"
                    >
                      + Mẫu Thời Trang
                    </button>
                  </div>
                </div>

                {/* Highlight Words & Color */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Từ khóa tô màu nổi bật (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={config.newsPoster.highlightWords}
                    onChange={(e) =>
                      onUpdateConfig({
                        newsPoster: {
                          ...config.newsPoster!,
                          highlightWords: e.target.value,
                        },
                      })
                    }
                    placeholder="VD: Iris West, Flash, JOHNNY DEPP"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />

                  {/* Highlight Color Picker */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-neutral-400 shrink-0">Màu từ khóa:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { color: '#FACC15', label: 'Vàng tươi' },
                        { color: '#F5D061', label: 'Vàng kim' },
                        { color: '#FB923C', label: 'Cam ấm' },
                        { color: '#F87171', label: 'Đỏ son' },
                        { color: '#38BDF8', label: 'Xanh lơ' },
                        { color: '#4ADE80', label: 'Xanh lá' },
                        { color: '#FFFFFF', label: 'Trắng' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          onClick={() =>
                            onUpdateConfig({
                              newsPoster: {
                                ...config.newsPoster!,
                                highlightColor: c.color,
                              },
                            })
                          }
                          className={`w-5 h-5 rounded-full border transition-all ${
                            config.newsPoster?.highlightColor === c.color
                              ? 'ring-2 ring-white ring-offset-1 ring-offset-neutral-900 scale-110'
                              : 'border-white/30'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Typography & Gradient Sliders */}
                <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
                  {/* Font Size */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-neutral-300">Cỡ chữ tiêu đề</span>
                      <span className="text-amber-400 font-bold">
                        {config.newsPoster.fontSize || 35}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={40}
                      value={config.newsPoster.fontSize || 35}
                      onChange={(e) =>
                        onUpdateConfig({
                          newsPoster: {
                            ...config.newsPoster!,
                            fontSize: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
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

                {/* Additional Decorative Elements */}
                <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Chi tiết trang trí báo chí
                  </span>

                  {/* Diamond divider */}
                  <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
                    <span>Đường gạch kim cương vàng đáy (`— ◆ —`)</span>
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

                  {/* Top Badge */}
                  <div className="pt-2 border-t border-neutral-800 space-y-2">
                    <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
                      <span>Huy hiệu logo tròn góc trái</span>
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
                        className="accent-amber-500 w-4 h-4 rounded"
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
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-neutral-100"
                      />
                    )}
                  </div>

                  {/* Follow Button */}
                  <div className="pt-2 border-t border-neutral-800 space-y-2">
                    <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
                      <span>Nút &quot;FOLLOW US&quot; góc phải</span>
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
                        className="accent-amber-500 w-4 h-4 rounded"
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
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-neutral-100"
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
                      <span className="truncate max-w-[200px] text-neutral-200">
                        Chữ: &quot;{t.text}&quot;
                      </span>
                      <button
                        onClick={() => onRemoveText(t.id)}
                        className="text-neutral-400 hover:text-rose-400 transition-colors"
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
