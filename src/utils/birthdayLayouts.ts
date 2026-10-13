import { LayoutSlot } from '../types';

export type BirthdayArrangement =
  | 'vertical-right'
  | 'vertical-left'
  | 'horizontal-bottom'
  | 'horizontal-top'
  | 'grid-2x2'
  | 'split-sides'
  | 'staggered';

export interface ArrangementPreset {
  id: BirthdayArrangement;
  name: string;
  icon: string;
  description: string;
}

export const BIRTHDAY_ARRANGEMENTS: ArrangementPreset[] = [
  {
    id: 'vertical-right',
    name: 'Dọc bên phải',
    icon: '➡️',
    description: 'Xếp dọc 1 bên thẳng hàng theo mép phải',
  },
  {
    id: 'vertical-left',
    name: 'Dọc bên trái',
    icon: '⬅️',
    description: 'Xếp dọc 1 bên thẳng hàng theo mép trái',
  },
  {
    id: 'horizontal-bottom',
    name: 'Ngang ở giữa',
    icon: '↔️',
    description: 'Hàng ngang ở giữa phía trên tiêu đề',
  },
  {
    id: 'horizontal-top',
    name: 'Ngang trên cùng',
    icon: '⬆️',
    description: 'Hàng ngang phía trên đầu nhân vật',
  },
  {
    id: 'grid-2x2',
    name: 'Lưới góc 2x2',
    icon: '⊞',
    description: 'Cụm lưới 2x2 gọn gàng ở góc',
  },
  {
    id: 'split-sides',
    name: 'Chia 2 bên mép',
    icon: '🔲',
    description: 'Đặt đều 2 bên mép trái & phải',
  },
  {
    id: 'staggered',
    name: 'So le nghệ thuật',
    icon: '🎲',
    description: 'Xếp lệch so le sinh động phong cách kỷ niệm',
  },
];

export interface BirthdaySlotCustomOptions {
  offsetX?: number;
  offsetY?: number;
  sizeScale?: number;
  shape?: 'rect' | 'circle';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

/**
 * Tạo danh sách slots mới cho mẫu sinh nhật dựa theo chế độ sắp xếp và số lượng ảnh nhỏ
 */
export function generateBirthdaySlots(
  smallCount: number, // 3 hoặc 4
  arrangement: BirthdayArrangement,
  currentSlots: LayoutSlot[],
  customOptions?: BirthdaySlotCustomOptions
): LayoutSlot[] {
  const slot0 = currentSlots[0] || {
    id: 0,
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    zIndex: 1,
    label: 'Ảnh chân dung chính',
  };

  const sampleSmall = currentSlots[1] || {};
  const commonProps = {
    zIndex: 12,
    borderWidth: customOptions?.borderWidth ?? sampleSmall.borderWidth ?? (smallCount > 3 ? 3 : 3.5),
    borderColor: customOptions?.borderColor ?? sampleSmall.borderColor ?? '#FFFFFF',
    borderRadius: customOptions?.borderRadius ?? sampleSmall.borderRadius ?? 8,
    shape: customOptions?.shape ?? sampleSmall.shape ?? 'rect',
    shadow: true,
  };

  const offX = customOptions?.offsetX ?? 0;
  const offY = customOptions?.offsetY ?? 0;
  const scale = customOptions?.sizeScale ?? 1.0;

  let smallDefs: Array<{ x: number; y: number; w: number; h: number }>;

  if (smallCount <= 3) {
    // ========== 3 ẢNH NHỎ ==========
    switch (arrangement) {
      case 'vertical-right': {
        const w = 22 * scale;
        const h = 17 * scale;
        const x = 74 + offX;
        const startY = 15 + offY;
        const gapY = 2.5;
        smallDefs = [
          { x, y: startY, w, h },
          { x, y: startY + h + gapY, w, h },
          { x, y: startY + (h + gapY) * 2, w, h },
        ];
        break;
      }
      case 'vertical-left': {
        const w = 22 * scale;
        const h = 17 * scale;
        const x = 4 + offX;
        const startY = 15 + offY;
        const gapY = 2.5;
        smallDefs = [
          { x, y: startY, w, h },
          { x, y: startY + h + gapY, w, h },
          { x, y: startY + (h + gapY) * 2, w, h },
        ];
        break;
      }
      case 'horizontal-top': {
        const w = 27 * scale;
        const h = 22.5 * scale;
        const y = 14 + offY;
        smallDefs = [
          { x: 5.5 + offX, y, w, h },
          { x: 36.5 + offX, y, w, h },
          { x: 67.5 + offX, y, w, h },
        ];
        break;
      }
      case 'grid-2x2': {
        const w = 22 * scale;
        const h = 17 * scale;
        smallDefs = [
          { x: 74 + offX, y: 19 + offY, w, h },
          { x: 50 + offX, y: 38 + offY, w, h },
          { x: 74 + offX, y: 38 + offY, w, h },
        ];
        break;
      }
      case 'split-sides': {
        const w = 21 * scale;
        const h = 17 * scale;
        smallDefs = [
          { x: 4 + offX, y: 28 + offY, w, h },
          { x: 75 + offX, y: 19 + offY, w, h },
          { x: 75 + offX, y: 38 + offY, w, h },
        ];
        break;
      }
      case 'staggered': {
        const w = 26 * scale;
        const h = 18.5 * scale;
        smallDefs = [
          { x: 5.5 + offX, y: 38 + offY, w, h },
          { x: 36.5 + offX, y: 35 + offY, w, h },
          { x: 67.5 + offX, y: 39 + offY, w, h },
        ];
        break;
      }
      case 'horizontal-bottom':
      default: {
        const w = 27 * scale;
        const h = 19 * scale;
        const y = 38 + offY;
        smallDefs = [
          { x: 5.5 + offX, y, w, h },
          { x: 36.5 + offX, y, w, h },
          { x: 67.5 + offX, y, w, h },
        ];
        break;
      }
    }
  } else {
    // ========== 4 ẢNH NHỎ ==========
    switch (arrangement) {
      case 'vertical-right': {
        const w = 20 * scale;
        const h = 14 * scale;
        const x = 76 + offX;
        const startY = 12 + offY;
        const gapY = 1.8;
        smallDefs = [
          { x, y: startY, w, h },
          { x, y: startY + h + gapY, w, h },
          { x, y: startY + (h + gapY) * 2, w, h },
          { x, y: startY + (h + gapY) * 3, w, h },
        ];
        break;
      }
      case 'vertical-left': {
        const w = 20 * scale;
        const h = 14 * scale;
        const x = 4 + offX;
        const startY = 12 + offY;
        const gapY = 1.8;
        smallDefs = [
          { x, y: startY, w, h },
          { x, y: startY + h + gapY, w, h },
          { x, y: startY + (h + gapY) * 2, w, h },
          { x, y: startY + (h + gapY) * 3, w, h },
        ];
        break;
      }
      case 'horizontal-top': {
        const w = 20.6 * scale;
        const h = 20.6 * scale;
        const y = 14 + offY;
        smallDefs = [
          { x: 4.5 + offX, y, w, h },
          { x: 27.9 + offX, y, w, h },
          { x: 51.3 + offX, y, w, h },
          { x: 74.7 + offX, y, w, h },
        ];
        break;
      }
      case 'grid-2x2': {
        const w = 21 * scale;
        const h = 16.5 * scale;
        smallDefs = [
          { x: 52 + offX, y: 25 + offY, w, h },
          { x: 75 + offX, y: 25 + offY, w, h },
          { x: 52 + offX, y: 43.5 + offY, w, h },
          { x: 75 + offX, y: 43.5 + offY, w, h },
        ];
        break;
      }
      case 'split-sides': {
        const w = 20 * scale;
        const h = 16 * scale;
        smallDefs = [
          { x: 4 + offX, y: 22 + offY, w, h },
          { x: 4 + offX, y: 40 + offY, w, h },
          { x: 76 + offX, y: 22 + offY, w, h },
          { x: 76 + offX, y: 40 + offY, w, h },
        ];
        break;
      }
      case 'staggered': {
        const w = 20.6 * scale;
        const h = 18 * scale;
        smallDefs = [
          { x: 4.5 + offX, y: 39 + offY, w, h },
          { x: 27.9 + offX, y: 36 + offY, w, h },
          { x: 51.3 + offX, y: 39 + offY, w, h },
          { x: 74.7 + offX, y: 36 + offY, w, h },
        ];
        break;
      }
      case 'horizontal-bottom':
      default: {
        const w = 20.6 * scale;
        const h = 18 * scale;
        const y = 39 + offY;
        smallDefs = [
          { x: 4.5 + offX, y, w, h },
          { x: 27.9 + offX, y, w, h },
          { x: 51.3 + offX, y, w, h },
          { x: 74.7 + offX, y, w, h },
        ];
        break;
      }
    }
  }

  const resultSlots: LayoutSlot[] = [
    slot0,
    ...smallDefs.map((def, idx) => ({
      ...commonProps,
      id: idx + 1,
      x: Math.max(0, Math.min(100 - def.w, Number(def.x.toFixed(1)))),
      y: Math.max(0, Math.min(100 - def.h, Number(def.y.toFixed(1)))),
      w: Math.max(8, Math.min(50, Number(def.w.toFixed(1)))),
      h: Math.max(8, Math.min(50, Number(def.h.toFixed(1)))),
      label: `Ảnh nhỏ #${idx + 1}`,
    })),
  ];

  return resultSlots;
}

/**
 * Đoán chế độ sắp xếp hiện tại của các slot ảnh nhỏ
 */
export function detectBirthdayArrangement(slots: LayoutSlot[]): BirthdayArrangement {
  if (slots.length <= 1) return 'horizontal-bottom';
  const smalls = slots.slice(1);
  if (smalls.length < 2) return 'horizontal-bottom';

  // 1. Kiểm tra nếu tất cả ảnh nhỏ xếp thẳng hàng dọc (X gần nhau)
  const firstX = smalls[0].x;
  const isVertical = smalls.every((s) => Math.abs(s.x - firstX) < 4.5);
  if (isVertical) {
    if (firstX > 50) return 'vertical-right';
    return 'vertical-left';
  }

  // 2. Kiểm tra nếu có ảnh ở cả 2 mép trái & phải (split-sides)
  const hasLeft = smalls.some((s) => s.x < 30);
  const hasRight = smalls.some((s) => s.x > 60);
  if (hasLeft && hasRight && !smalls.some((s) => s.x >= 30 && s.x <= 60)) {
    return 'split-sides';
  }

  // 3. Kiểm tra cụm lưới 2x2
  if (smalls.length === 4) {
    const xs = smalls.map((s) => s.x).sort((a, b) => a - b);
    const ys = smalls.map((s) => s.y).sort((a, b) => a - b);
    // Nếu có 2 nhóm X và 2 nhóm Y riêng biệt
    const distinctX = Math.abs(xs[2] - xs[1]) > 10 && Math.abs(xs[1] - xs[0]) < 6 && Math.abs(xs[3] - xs[2]) < 6;
    const distinctY = Math.abs(ys[2] - ys[1]) > 10 && Math.abs(ys[1] - ys[0]) < 6 && Math.abs(ys[3] - ys[2]) < 6;
    if (distinctX && distinctY) {
      return 'grid-2x2';
    }
  }

  // 4. Kiểm tra so le zic-zac
  const ys = smalls.map((s) => s.y);
  const yDiffs = ys.map((y, i) => (i > 0 ? Math.abs(y - ys[i - 1]) : 0));
  const hasStagger = yDiffs.some((d) => d >= 2.5 && d <= 7);
  if (hasStagger) {
    return 'staggered';
  }

  // 5. Kiểm tra nếu tất cả ảnh nhỏ xếp thẳng hàng ngang (Y gần nhau)
  const firstY = smalls[0].y;
  const isHorizontal = smalls.every((s) => Math.abs(s.y - firstY) < 4.5);
  if (isHorizontal) {
    if (firstY < 30) return 'horizontal-top';
    return 'horizontal-bottom';
  }

  return 'horizontal-bottom';
}
