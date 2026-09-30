import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CollageCanvas } from './components/CollageCanvas';
import { ExportModal } from './components/ExportModal';
import {
  CanvasConfig,
  CollageLayout,
  SlotState,
  StickerOverlay,
  TextOverlay,
} from './types';
import { COLLAGE_LAYOUTS } from './data/presets';
import { Eye, Edit3, Sparkles } from 'lucide-react';

export default function App() {
  // 1. Core State - Default to the prioritized 3:4 basic template requested by user
  const model1Layout =
    COLLAGE_LAYOUTS.find((l) => l.id === 'layout-3-4-news-triple' || l.id === 'layout-3-4-news-3pic') ||
    COLLAGE_LAYOUTS[0];
  const model2Layout =
    COLLAGE_LAYOUTS.find((l) => l.id === 'layout-3-4-news-single') || COLLAGE_LAYOUTS[0];
  const model3Layout =
    COLLAGE_LAYOUTS.find((l) => l.id === 'layout-3-4-news-blend-duo') || COLLAGE_LAYOUTS[0];
  const model4Layout =
    COLLAGE_LAYOUTS.find((l) => l.id === 'layout-3-4-news-circle-accent') || COLLAGE_LAYOUTS[0];

  const initialLayout = model1Layout;
  const [currentLayout, setCurrentLayout] = useState<CollageLayout>(initialLayout);

  const createDefaultSlots = (count: number, sampleImages: string[] = []): SlotState[] => {
    return Array.from({ length: count }, (_, idx) => ({
      imageSrc: sampleImages[idx] || null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      filter: 'normal',
      sharpen: 0,
    }));
  };

  // Khởi tạo các ô trống sạch sẽ, không có ảnh mẫu mặc định
  const [slots, setSlots] = useState<SlotState[]>(() => {
    return createDefaultSlots(initialLayout.slots.length, []);
  });

  const [config, setConfig] = useState<CanvasConfig>({
    aspectRatio: '3:4',
    gap: 6,
    borderRadius: 0,
    padding: 0,
    bgType: 'solid',
    bgColor: '#ffffff',
    bgGradient: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    bgPattern: 'none',
    frameStyle: 'standard',
    captionText: 'Những khoảnh khắc tuyệt vời ♡',
    dateText: '2026.09.20 • MEMORIES',
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

  const [userImages, setUserImages] = useState<string[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('normal');
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Mobile View Switcher: 'preview' | 'tools'
  const [mobileView, setMobileView] = useState<'preview' | 'tools'>('preview');

  // Handle layout change
  const handleSelectLayout = (newLayout: CollageLayout) => {
    setCurrentLayout(newLayout);
    setConfig((prev) => ({
      ...prev,
      aspectRatio: newLayout.defaultAspectRatio || prev.aspectRatio,
      gap: newLayout.defaultGap !== undefined ? newLayout.defaultGap : prev.gap,
      padding: newLayout.defaultPadding !== undefined ? newLayout.defaultPadding : prev.padding,
      borderRadius: newLayout.defaultRadius !== undefined ? newLayout.defaultRadius : prev.borderRadius,
      frameStyle: newLayout.frameType || 'standard',
      newsPoster: newLayout.newsPosterDefault
        ? {
            enabled: true,
            style: newLayout.newsPosterDefault.style || prev.newsPoster?.style || 'bold-headline',
            headline: newLayout.newsPosterDefault.headline ?? prev.newsPoster?.headline ?? '',
            highlightWords: newLayout.newsPosterDefault.highlightWords ?? prev.newsPoster?.highlightWords ?? '',
            headlineColor: newLayout.newsPosterDefault.headlineColor ?? prev.newsPoster?.headlineColor ?? '#FFFFFF',
            highlightColor: newLayout.newsPosterDefault.highlightColor ?? prev.newsPoster?.highlightColor ?? '#FACC15',
            fontSize: newLayout.newsPosterDefault.fontSize ?? prev.newsPoster?.fontSize ?? 34,
            gradientHeight: newLayout.newsPosterDefault.gradientHeight ?? prev.newsPoster?.gradientHeight ?? 38,
            gradientOpacity: newLayout.newsPosterDefault.gradientOpacity ?? prev.newsPoster?.gradientOpacity ?? 0.94,
            showTopBadge: newLayout.newsPosterDefault.showTopBadge ?? prev.newsPoster?.showTopBadge ?? true,
            topBadgeText: newLayout.newsPosterDefault.topBadgeText ?? prev.newsPoster?.topBadgeText ?? 'HM MEDIA',
            showFollowButton: newLayout.newsPosterDefault.showFollowButton ?? prev.newsPoster?.showFollowButton ?? true,
            followButtonText: newLayout.newsPosterDefault.followButtonText ?? prev.newsPoster?.followButtonText ?? 'FOLLOW US',
            showDiamondDivider: newLayout.newsPosterDefault.showDiamondDivider ?? prev.newsPoster?.showDiamondDivider ?? true,
          }
        : prev.newsPoster,
    }));

    // Preserve existing images when switching layouts
    setSlots((prevSlots) => {
      const existingImages = prevSlots.map((s) => s.imageSrc).filter(Boolean) as string[];
      return Array.from({ length: newLayout.slots.length }, (_, idx) => {
        const prevSlot = prevSlots[idx];
        return {
          imageSrc: existingImages[idx] || (prevSlot ? prevSlot.imageSrc : null),
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          flipH: false,
          flipV: false,
          filter: activeFilter,
          sharpen: prevSlot ? prevSlot.sharpen || 0 : 0,
        };
      });
    });

    setSelectedSlotIndex(null);
  };

  // Update canvas config
  const handleUpdateConfig = (updates: Partial<CanvasConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // Update a single slot
  const handleUpdateSlot = (index: number, updates: Partial<SlotState>) => {
    setSlots((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], ...updates };
      }
      return next;
    });
  };

  // Apply sharpen adjustment to active slot or all slots
  const handleApplySharpen = (sharpenValue: number, all: boolean) => {
    setSlots((prev) =>
      prev.map((slot, idx) => {
        if (all || idx === selectedSlotIndex) {
          return { ...slot, sharpen: sharpenValue };
        }
        return slot;
      })
    );
  };

  // Remove photo from a slot
  const handleRemoveSlotImage = (index: number) => {
    handleUpdateSlot(index, {
      imageSrc: null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      sharpen: 0,
    });
  };

  // Swap two slots
  const handleSwapSlots = (indexA: number, indexB: number) => {
    setSlots((prev) => {
      const next = [...prev];
      const temp = next[indexA];
      next[indexA] = next[indexB];
      next[indexB] = temp;
      return next;
    });
    setSelectedSlotIndex(indexB);
  };

  // Handle uploaded images
  const handleUploadImages = (files: FileList) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return;
        setUserImages((prev) => [result, ...prev]);

        // Place into first empty slot if any
        setSlots((prev) => {
          const next = [...prev];
          const emptyIdx = next.findIndex((s) => !s.imageSrc);
          if (emptyIdx !== -1) {
            next[emptyIdx] = {
              ...next[emptyIdx],
              imageSrc: result,
              scale: 1,
              offsetX: 0,
              offsetY: 0,
            };
          }
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Select image from library
  const handleSelectImage = (imageUrl: string) => {
    setSlots((prev) => {
      const next = [...prev];
      if (selectedSlotIndex !== null && selectedSlotIndex < next.length) {
        next[selectedSlotIndex] = {
          ...next[selectedSlotIndex],
          imageSrc: imageUrl,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
        };
      } else {
        // Find first empty slot or assign to slot 0
        const emptyIdx = next.findIndex((s) => !s.imageSrc);
        const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
        next[targetIdx] = {
          ...next[targetIdx],
          imageSrc: imageUrl,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
        };
        setSelectedSlotIndex(targetIdx);
      }
      return next;
    });
  };

  // Tự động điền đầy các ô bằng ảnh người dùng đã tải lên
  const handleAutoFillPreset = useCallback(() => {
    if (userImages.length === 0) return;
    const shuffled = [...userImages].sort(() => 0.5 - Math.random());
    setSlots((prev) =>
      prev.map((slot, idx) => ({
        ...slot,
        imageSrc: shuffled[idx % shuffled.length],
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      }))
    );
  }, [userImages]);

  // Shuffle existing photos
  const handleShuffle = () => {
    setSlots((prev) => {
      const images = prev.map((s) => s.imageSrc);
      const shuffled = [...images].sort(() => 0.5 - Math.random());
      return prev.map((slot, idx) => ({
        ...slot,
        imageSrc: shuffled[idx] || null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      }));
    });
  };

  // Reset to empty slots
  const handleReset = () => {
    setSlots((prev) =>
      prev.map((slot) => ({
        ...slot,
        imageSrc: null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        flipH: false,
        flipV: false,
        filter: 'normal',
      }))
    );
    setSelectedSlotIndex(null);
  };

  // Apply filter
  const handleApplyFilter = (filterId: string, applyToAll: boolean) => {
    setActiveFilter(filterId);
    if (applyToAll) {
      setSlots((prev) =>
        prev.map((slot) => ({
          ...slot,
          filter: filterId,
        }))
      );
    } else if (selectedSlotIndex !== null) {
      handleUpdateSlot(selectedSlotIndex, { filter: filterId });
    }
  };

  // Add text overlay
  const handleAddText = (
    text: string,
    fontFamily: string,
    color: string,
    bgBox: boolean
  ) => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text,
      x: 50,
      y: 50 + (texts.length * 6) % 30,
      fontSize: 24,
      fontFamily,
      color,
      fontWeight: 'bold',
      fontStyle: 'normal',
      bgBox,
    };
    setTexts((prev) => [...prev, newText]);
  };

  const handleRemoveText = (id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add sticker overlay
  const handleAddSticker = (emoji: string) => {
    const newSticker: StickerOverlay = {
      id: `sticker-${Date.now()}`,
      content: emoji,
      x: 35 + (stickers.length * 10) % 40,
      y: 35 + (stickers.length * 10) % 40,
      size: 36,
      rotation: (Math.random() * 20 - 10),
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  // Quick switch for 2 requested basic 3:4 models
  const handleSelectModel1 = () => {
    if (model1Layout) {
      handleSelectLayout(model1Layout);
      handleUpdateConfig({
        aspectRatio: '3:4',
        gap: 6,
        padding: 0,
        borderRadius: 0,
        bgColor: '#ffffff',
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
    }
  };

  const handleSelectModel2 = () => {
    if (model2Layout) {
      handleSelectLayout(model2Layout);
      handleUpdateConfig({
        aspectRatio: '3:4',
        gap: 0,
        padding: 0,
        borderRadius: 0,
        bgColor: '#ffffff',
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
    }
  };

  const handleSelectModel3 = () => {
    if (model3Layout) {
      handleSelectLayout(model3Layout);
      handleUpdateConfig({
        aspectRatio: '3:4',
        gap: 0,
        padding: 0,
        borderRadius: 0,
        bgColor: '#ffffff',
        newsPoster: {
          enabled: true,
          style: 'bold-headline',
          headline:
            'JOHNNY DEPP WAS LOVINGLY SURPRISED TO MEET A LITTLE FAN DRESSED AS HIS ICONIC EDWARD SCISSORHANDS',
          highlightWords: 'JOHNNY DEPP, EDWARD SCISSORHANDS, SURPRISED',
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
    }
  };

  const handleSelectModel4 = () => {
    if (model4Layout) {
      handleSelectLayout(model4Layout);
      handleUpdateConfig({
        aspectRatio: '3:4',
        gap: 0,
        padding: 0,
        borderRadius: 0,
        bgColor: '#ffffff',
        newsPoster: {
          enabled: true,
          style: 'bold-headline',
          headline:
            'JOHNNY DEPP WAS LOVINGLY SURPRISED TO MEET A LITTLE FAN DRESSED AS HIS ICONIC EDWARD SCISSORHANDS',
          highlightWords: 'JOHNNY DEPP, EDWARD SCISSORHANDS, SURPRISED',
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
    }
  };

  const handleUpdateLayoutSlot = (slotIndex: number, updates: Partial<import('./types').LayoutSlot>) => {
    setCurrentLayout((prev) => {
      const nextSlots = [...prev.slots];
      if (nextSlots[slotIndex]) {
        nextSlots[slotIndex] = { ...nextSlots[slotIndex], ...updates };
      }
      return { ...prev, slots: nextSlots };
    });
  };

  const activePhotosCount = slots.filter((s) => !!s.imageSrc).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Top Navigation Bar */}
      <Header
        layout={currentLayout}
        aspectRatio={config.aspectRatio}
        onShuffle={handleShuffle}
        onReset={handleReset}
        onOpenExport={() => setIsExportOpen(true)}
        onQuickSample={handleAutoFillPreset}
        onSelectModel1={handleSelectModel1}
        onSelectModel2={handleSelectModel2}
        onSelectModel3={handleSelectModel3}
        onSelectModel4={handleSelectModel4}
        activePhotosCount={activePhotosCount}
        totalSlotsCount={currentLayout.slots.length}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (tools & presets) */}
        <div
          className={`${
            mobileView === 'tools' ? 'flex' : 'hidden'
          } lg:flex h-full w-full lg:w-96 shrink-0 z-20`}
        >
          <Sidebar
            currentLayout={currentLayout}
            onSelectLayout={handleSelectLayout}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            userImages={userImages}
            onUploadImages={handleUploadImages}
            onSelectImage={handleSelectImage}
            onAutoFillPreset={handleAutoFillPreset}
            activeFilter={activeFilter}
            onApplyFilter={handleApplyFilter}
            selectedSlotIndex={selectedSlotIndex}
            texts={texts}
            onAddText={handleAddText}
            onRemoveText={handleRemoveText}
            stickers={stickers}
            onAddSticker={handleAddSticker}
            onRemoveSticker={handleRemoveSticker}
            slots={slots}
            onUpdateSlot={handleUpdateSlot}
            onApplySharpen={handleApplySharpen}
            onUpdateLayoutSlot={handleUpdateLayoutSlot}
          />
        </div>

        {/* Center Interactive Collage Canvas Area */}
        <main
          className={`${
            mobileView === 'preview' ? 'flex' : 'hidden'
          } lg:flex flex-1 h-full overflow-hidden relative`}
        >
          <CollageCanvas
            layout={currentLayout}
            slots={slots}
            config={config}
            texts={texts}
            stickers={stickers}
            selectedSlotIndex={selectedSlotIndex}
            onSelectSlot={setSelectedSlotIndex}
            onUpdateSlot={handleUpdateSlot}
            onRemoveSlotImage={handleRemoveSlotImage}
            onSwapSlots={handleSwapSlots}
            onSelectImageForSlot={(idx) => {
              setSelectedSlotIndex(idx);
              setMobileView('tools');
            }}
            onUpdateConfig={handleUpdateConfig}
            onRemoveText={handleRemoveText}
            onRemoveSticker={handleRemoveSticker}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation Toggle between Canvas & Settings */}
      <div className="lg:hidden flex items-center justify-around py-2 border-t border-neutral-800 bg-neutral-900 z-30 shrink-0">
        <button
          onClick={() => setMobileView('preview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${
            mobileView === 'preview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-neutral-400'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Xem & Căn Chỉnh</span>
        </button>
        <button
          onClick={() => setMobileView('tools')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${
            mobileView === 'tools'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-neutral-400'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Bố Cục & Công Cụ</span>
        </button>
      </div>

      {/* Export & Download High-Res Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        layout={currentLayout}
        slots={slots}
        config={config}
        texts={texts}
        stickers={stickers}
      />
    </div>
  );
}
