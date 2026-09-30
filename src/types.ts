export type AspectRatioType = '3:4' | '1:1' | '4:5' | '9:16' | '16:9' | '1:2';

export interface LayoutSlot {
  id: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  w: number; // percentage 0 - 100
  h: number; // percentage 0 - 100
  maskType?: 'fade-bottom' | 'fade-top' | 'fade-both' | 'none';
  zIndex?: number;
  shape?: 'rect' | 'circle';
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
  label?: string;
}

export type LayoutCategory =
  | 'all'
  | 'featured-3-4'
  | '1-photo'
  | '2-photos'
  | '3-photos'
  | '4-photos'
  | '5-plus'
  | 'photobooth'
  | 'polaroid';

export interface NewsPosterConfig {
  enabled: boolean;
  style: 'bold-headline' | 'editorial-serif'; // Mẫu 1: Bold News; Mẫu 2: Serif sang trọng
  headline: string;
  highlightWords: string; // Từ khóa tô màu nổi bật (phân tách dấu phẩy)
  headlineColor: string; // Mặc định #FFFFFF
  highlightColor: string; // Mặc định #FACC15 hoặc #F5D061
  fontSize: number; // 18 to 44
  gradientHeight: number; // 25 to 60 (% chiều cao đáy)
  gradientOpacity: number; // 0.6 to 1.0
  showTopBadge: boolean;
  topBadgeText: string;
  showFollowButton: boolean;
  followButtonText: string;
  showDiamondDivider: boolean;
}

export type ComparisonPosition = 'bottom' | 'above-headline' | 'top-bar' | 'top';
export type ComparisonBadgeAlign = 'center' | 'outer';
export type ComparisonBadgeStyle = 'pill' | 'minimal' | 'tag';

export interface ComparisonConfig {
  enabled: boolean;
  leftLabel: string; // e.g. 'THEN' or 'QUÁ KHỨ' or '1995'
  rightLabel: string; // e.g. 'NOW' or 'HIỆN TẠI' or '2024'
  showLabels: boolean;
  labelPosition: ComparisonPosition;
  verticalPercent?: number; // 5 to 90 (mặc định 60 - vị trí an toàn tuyệt đối không che mặt)
  badgeAlign?: ComparisonBadgeAlign; // 'center' | 'outer' (dạt 2 bên để mặt ở giữa không bị che)
  badgeStyle?: ComparisonBadgeStyle; // 'pill' | 'minimal' | 'tag'
  showVsBadge?: boolean;
  vsText?: string;
  centerDivider?: 'gap' | 'line' | 'none';
}

export interface CollageLayout {
  id: string;
  name: string;
  category: LayoutCategory;
  photoCount: number;
  defaultAspectRatio: AspectRatioType;
  slots: LayoutSlot[];
  frameType?: 'standard' | 'photobooth' | 'polaroid' | 'film' | 'washi';
  defaultGap?: number;
  defaultPadding?: number;
  defaultRadius?: number;
  isBlendedOverlap?: boolean;
  blendTransition?: 'vertical-fade' | 'soft-dissolve' | 'none';
  isCircleAccent?: boolean;
  isComparison?: boolean;
  comparisonDefault?: Partial<ComparisonConfig>;
  newsPosterDefault?: Partial<NewsPosterConfig>;
}

export interface SlotState {
  imageSrc: string | null;
  scale: number; // 1.0 to 3.0
  offsetX: number; // -50 to 50
  offsetY: number; // -50 to 50
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  filter: string; // filter ID
  sharpen?: number; // 0 to 100 (% làm nét unsharp mask)
}

export type BackgroundType = 'solid' | 'gradient' | 'pattern';

export interface CanvasConfig {
  aspectRatio: AspectRatioType;
  gap: number; // 0 to 32
  borderRadius: number; // 0 to 36
  padding: number; // 0 to 48
  bgType: BackgroundType;
  bgColor: string;
  bgGradient: string;
  bgPattern: string; // 'none' | 'dots' | 'grid' | 'stripes'
  frameStyle: 'standard' | 'polaroid' | 'photobooth' | 'film' | 'washi';
  captionText?: string;
  dateText?: string;
  newsPoster?: NewsPosterConfig;
  comparison?: ComparisonConfig;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage
  y: number; // percentage
  fontSize: number; // px
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  bgBox?: boolean;
}

export interface StickerOverlay {
  id: string;
  content: string; // emoji or svg/symbol
  x: number; // percentage
  y: number; // percentage
  size: number;
  rotation: number;
}

export interface PresetImage {
  id: string;
  title: string;
  category: string;
  url: string;
  thumb: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  cssFilter: string;
  previewColor: string;
}
