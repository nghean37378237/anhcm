import React from 'react';
import {
  Download,
  Shuffle,
  RotateCcw,
  Sparkles,
  Layers,
  Camera,
  Share2,
  Check,
} from 'lucide-react';
import { AspectRatioType, CollageLayout, LayoutSlot } from '../types';
import {
  BIRTHDAY_ARRANGEMENTS,
  generateBirthdaySlots,
  detectBirthdayArrangement,
} from '../utils/birthdayLayouts';

interface HeaderProps {
  layout: CollageLayout;
  aspectRatio: AspectRatioType;
  onShuffle: () => void;
  onReset: () => void;
  onOpenExport: () => void;
  onQuickSample: () => void;
  onSelectModel1?: () => void;
  onSelectModel2?: () => void;
  onSelectModel3?: () => void;
  onSelectModel4?: () => void;
  onSelectModel5?: () => void;
  onSelectModelTribute?: () => void;
  onSelectModelBirthday?: () => void;
  onSelectModelBirthday3?: () => void;
  onSelectModelBirthday4?: () => void;
  onToggleBirthdaySmallCount?: (count: 3 | 4) => void;
  onUpdateLayoutSlots?: (newSlots: LayoutSlot[], newPhotoCount?: number) => void;
  activePhotosCount: number;
  totalSlotsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  layout,
  aspectRatio,
  onShuffle,
  onReset,
  onOpenExport,
  onQuickSample,
  onSelectModel1,
  onSelectModel2,
  onSelectModel3,
  onSelectModel4,
  onSelectModel5,
  onSelectModelTribute,
  onSelectModelBirthday,
  onSelectModelBirthday3,
  onSelectModelBirthday4,
  onToggleBirthdaySmallCount,
  onUpdateLayoutSlots,
  activePhotosCount,
  totalSlotsCount,
}) => {
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-3 lg:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 p-[2px] shadow-lg shadow-rose-500/10">
          <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
            <Camera className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Ghép Ảnh Nghệ Thuật
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3:4 Poster
              </span>
            </h1>
          </div>
          <p className="text-xs text-neutral-400 hidden sm:block">
            {layout.name} • {aspectRatio} • {activePhotosCount}/{totalSlotsCount} ảnh
          </p>
        </div>
      </div>

      {/* Quick 5 Basic 3:4 Templates Toggle */}
      <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-neutral-950/80 border border-neutral-800">
        <span className="text-[11px] font-bold text-amber-400 pl-1.5 pr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>5 Mẫu 3:4:</span>
        </span>
        <button
          onClick={onSelectModel1}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            layout.id === 'layout-3-4-news-triple' || layout.id === 'layout-3-4-news-3pic'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          title="Mẫu 1: Ghép 3 ảnh dọc phong cách Hollywood"
        >
          Mẫu 1 (3 Ảnh)
        </button>
        <button
          onClick={onSelectModel2}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            layout.id === 'layout-3-4-news-single'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          title="Mẫu 2: Ảnh 3:4 toàn khung phong cách tạp chí"
        >
          Mẫu 2 (1 Ảnh)
        </button>
        <button
          onClick={onSelectModel3}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            layout.id === 'layout-3-4-news-blend-duo'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          title="Mẫu 3: 2 ảnh chồng lên nhau mờ mờ nghệ thuật (Fade đôi)"
        >
          Mẫu 3 (Chồng Mờ)
        </button>
        <button
          onClick={onSelectModel4}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
            layout.id === 'layout-3-4-news-circle-accent'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          title="Mẫu 4: 1 ảnh toàn khung + 1 ảnh tròn làm điểm nhấn"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-neutral-900 inline-block" />
          Mẫu 4 (1+Tròn)
        </button>
        <button
          onClick={onSelectModel5}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
            layout.id === 'layout-3-4-news-comparison'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          title="Mẫu 5: 2 ảnh so sánh Then & Now (Trước & Sau)"
        >
          <span className="text-[10px] font-black text-amber-400">⚡</span>
          Mẫu 5 (Then & Now)
        </button>
        <button
          onClick={onSelectModelTribute}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
            layout.id === 'layout-tribute-rip'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          title="Mẫu Tưởng Niệm / Tri Ân (REST IN PEACE • Ruy băng trắng)"
        >
          <span>🎗️</span>
          <span>Tưởng Niệm (RIP)</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onSelectModelBirthday}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              layout.isBirthdayPoster ||
              layout.id.startsWith('layout-birthday')
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
            title="Mẫu Ảnh Sinh Nhật (HAPPY BIRTHDAY • 1 Ảnh Chính + 3 hoặc 4 Ảnh Nhỏ Kỷ Niệm)"
          >
            <span>🎂</span>
            <span>Sinh Nhật (SN)</span>
          </button>
          {(layout.isBirthdayPoster ||
            layout.id.startsWith('layout-birthday')) && (
            <div className="flex items-center gap-1 bg-neutral-900 border border-amber-500/40 rounded-lg p-0.5">
              {/* 3 vs 4 small photos */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleBirthdaySmallCount) {
                      onToggleBirthdaySmallCount(3);
                    } else if (onSelectModelBirthday3) {
                      onSelectModelBirthday3();
                    } else if (onSelectModelBirthday) {
                      onSelectModelBirthday();
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                    layout.slots.length <= 4
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Mẫu 1 ảnh chính + 3 ảnh nhỏ kỷ niệm"
                >
                  3 ảnh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleBirthdaySmallCount) {
                      onToggleBirthdaySmallCount(4);
                    } else if (onSelectModelBirthday4) {
                      onSelectModelBirthday4();
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                    layout.slots.length >= 5
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Mẫu 1 ảnh chính + 4 ảnh nhỏ kỷ niệm"
                >
                  4 ảnh
                </button>
              </div>

              {/* Quick Position Selector in Header */}
              {onUpdateLayoutSlots && (
                <div className="hidden lg:flex items-center gap-0.5 pl-1 border-l border-neutral-800">
                  {[
                    { id: 'vertical-right' as const, label: 'Dọc phải', icon: '➡️' },
                    { id: 'vertical-left' as const, label: 'Dọc trái', icon: '⬅️' },
                    { id: 'horizontal-bottom' as const, label: 'Ngang', icon: '↔️' },
                    { id: 'grid-2x2' as const, label: 'Lưới', icon: '⊞' },
                    { id: 'split-sides' as const, label: '2 bên', icon: '🔲' },
                  ].map((arr) => {
                    const currentArr = detectBirthdayArrangement(layout.slots);
                    const isCurrent = currentArr === arr.id;
                    return (
                      <button
                        key={arr.id}
                        type="button"
                        onClick={() => {
                          const smallCount = layout.slots.length > 4 ? 4 : 3;
                          const newSlots = generateBirthdaySlots(smallCount, arr.id, layout.slots);
                          onUpdateLayoutSlots(newSlots, smallCount + 1);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-medium flex items-center gap-0.5 transition-all ${
                          isCurrent
                            ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-400/50'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                        title={`Đổi vị trí ảnh nhỏ sang: ${arr.label}`}
                      >
                        <span>{arr.icon}</span>
                        <span>{arr.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Sample Fill Button */}
        <button
          onClick={onQuickSample}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition-all"
          title="Tự động điền ảnh mẫu ngẫu nhiên đẹp mắt"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Điền ảnh mẫu</span>
        </button>

        {/* Shuffle Button */}
        <button
          onClick={onShuffle}
          disabled={activePhotosCount < 2}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition-all"
          title="Xáo trộn vị trí các ảnh"
        >
          <Shuffle className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Xáo trộn</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-700/60 transition-all inline-flex items-center gap-1.5"
          title="Làm mới khung ảnh"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-semibold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          title="Xuất ảnh chất lượng cao"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Ảnh</span>
        </button>
      </div>
    </header>
  );
};
