import { CanvasConfig, CollageLayout, FilterPreset, SlotState, StickerOverlay, TextOverlay } from '../types';
import { FILTER_PRESETS } from '../data/presets';

interface RenderOptions {
  layout: CollageLayout;
  slots: SlotState[];
  config: CanvasConfig;
  texts: TextOverlay[];
  stickers: StickerOverlay[];
  exportScale?: number; // default 2 for crystal clear 2K+ quality
  previewWidth?: number;
  previewHeight?: number;
}

// Preload an image safely
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // In case cross-origin fails, try without crossOrigin or reject
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = (e) => reject(e);
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

// 3x3 Convolution Unsharp Mask for image sharpening
function applySharpenKernel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sharpenPercent: number
) {
  if (w <= 2 || h <= 2 || sharpenPercent <= 0) return;
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);
    const k = (Math.min(100, Math.max(0, sharpenPercent)) / 100) * 0.85;
    const center = 1 + 4 * k;

    for (let y = 1; y < h - 1; y++) {
      const row = y * w;
      for (let x = 1; x < w - 1; x++) {
        const i = (row + x) * 4;
        for (let c = 0; c < 3; c++) {
          const val =
            copy[i + c] * center -
            (copy[((y - 1) * w + x) * 4 + c] +
              copy[((y + 1) * w + x) * 4 + c] +
              copy[(row + (x - 1)) * 4 + c] +
              copy[(row + (x + 1)) * 4 + c]) *
              k;
          data[i + c] = val < 0 ? 0 : val > 255 ? 255 : val;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('Sharpen skipped during render:', err);
  }
}

function getAspectRatioDimensions(ratio: string, baseWidth: number): { width: number; height: number } {
  switch (ratio) {
    case '1:1':
      return { width: baseWidth, height: baseWidth };
    case '4:5':
      return { width: baseWidth, height: Math.round((baseWidth * 5) / 4) };
    case '9:16':
      return { width: baseWidth, height: Math.round((baseWidth * 16) / 9) };
    case '16:9':
      return { width: baseWidth, height: Math.round((baseWidth * 9) / 16) };
    case '3:4':
      return { width: baseWidth, height: Math.round((baseWidth * 4) / 3) };
    case '1:2':
      return { width: baseWidth, height: Math.round(baseWidth * 2) };
    default:
      return { width: baseWidth, height: baseWidth };
  }
}

// Helper to draw rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function renderCollageToCanvas(
  targetCanvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const { layout, slots, config, texts, stickers, exportScale = 2, previewWidth } = options;

  // Đảm bảo toàn bộ phông chữ web đã nạp xong đầy đủ các trọng số trước khi vẽ lên canvas
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.allSettled([
        document.fonts.load('900 48px "Playfair Display"'),
        document.fonts.load('800 48px "Playfair Display"'),
        document.fonts.load('700 48px "Playfair Display"'),
        document.fonts.load('600 48px "Playfair Display"'),
        document.fonts.load('italic 700 48px "Playfair Display"'),
        document.fonts.load('900 48px Anton'),
        document.fonts.load('900 48px Montserrat'),
        document.fonts.load('800 48px Montserrat'),
        document.fonts.load('700 48px Montserrat'),
        document.fonts.load('700 48px Oswald'),
        document.fonts.load('700 48px Caveat'),
        document.fonts.load('700 48px "Dancing Script"'),
        document.fonts.load('700 48px "Plus Jakarta Sans"'),
        document.fonts.ready,
      ]);
    } catch (e) {
      console.warn('Document fonts wait skipped:', e);
    }
  }

  const baseSize = 1080;
  const { width: rawW, height: rawH } = getAspectRatioDimensions(config.aspectRatio, baseSize);

  const canvasW = rawW * exportScale;
  const canvasH = rawH * exportScale;

  // Tỉ lệ quy đổi từ khung xem trước thực tế sang canvas xuất ảnh để đảm bảo
  // kích thước chữ và mẫu phông chữ xuất ra khớp chính xác 100% với màn hình
  const previewW = previewWidth && previewWidth > 100 ? previewWidth : 480;
  const scaleRatio = canvasW / previewW;

  targetCanvas.width = canvasW;
  targetCanvas.height = canvasH;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Background
  if (config.bgType === 'gradient' && config.bgGradient) {
    // Parse linear gradient or create standard diagonal gradient
    const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    // Simple fallback parse for linear-gradient colors
    const colors = config.bgGradient.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
    if (colors && colors.length >= 2) {
      colors.forEach((c, idx) => {
        gradient.addColorStop(idx / (colors.length - 1), c);
      });
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = config.bgColor || '#ffffff';
    }
  } else {
    ctx.fillStyle = config.bgColor || '#ffffff';
  }
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Background Pattern (optional dots or grid)
  if (config.bgPattern === 'dots') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    const spacing = 24 * exportScale;
    const dotRadius = 1.5 * exportScale;
    for (let x = spacing / 2; x < canvasW; x += spacing) {
      for (let y = spacing / 2; y < canvasH; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  } else if (config.bgPattern === 'grid') {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1 * exportScale;
    const spacing = 32 * exportScale;
    for (let x = 0; x < canvasW; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasH);
      ctx.stroke();
    }
    for (let y = 0; y < canvasH; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasW, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Handle frame styles special spacing (e.g. Photobooth header/footer or Polaroid bottom area)
  let innerTop = (config.padding ?? 0) * exportScale;
  let innerBottom = (config.padding ?? 0) * exportScale;
  let innerLeft = (config.padding ?? 0) * exportScale;
  let innerRight = (config.padding ?? 0) * exportScale;

  if (config.frameStyle === 'photobooth') {
    innerTop = 48 * exportScale;
    innerBottom = 58 * exportScale;
    innerLeft = Math.max(16 * exportScale, innerLeft);
    innerRight = Math.max(16 * exportScale, innerRight);

    // Draw photobooth top branding
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.font = `bold ${14 * exportScale}px Montserrat, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ PHOTOBOOTH STUDIO ★', canvasW / 2, 26 * exportScale);

    // Draw photobooth bottom date / quote
    const now = new Date();
    const dateStr = config.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} • MEMORIES`;
    ctx.font = `600 ${12 * exportScale}px Montserrat, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText(dateStr, canvasW / 2, canvasH - 28 * exportScale);
    ctx.restore();
  } else if (config.frameStyle === 'polaroid') {
    innerBottom = 80 * exportScale; // extra room for handwritten polaroid text
    if (config.captionText) {
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${24 * exportScale}px 'Caveat', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.captionText, canvasW / 2, canvasH - 38 * exportScale);
      ctx.restore();
    }
  }

  const gridW = canvasW - innerLeft - innerRight;
  const gridH = canvasH - innerTop - innerBottom;
  const gapPx = (config.gap || 8) * exportScale;
  const radiusPx = (config.borderRadius || 0) * exportScale;

  // Load all images in parallel
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    layout.slots.map(async (slotDef, idx) => {
      const slotState = slots[idx];
      if (!slotState || !slotState.imageSrc) return null;
      try {
        return await loadImage(slotState.imageSrc);
      } catch (err) {
        console.warn('Failed to load image for slot', idx, err);
        return null;
      }
    })
  );

  // 2. Render each slot
  // Sort drawing order by slotDef.zIndex so underlying slots draw first
  const slotOrder = layout.slots.map((_, i) => i).sort((a, b) => {
    const zA = layout.slots[a].zIndex ?? 1;
    const zB = layout.slots[b].zIndex ?? 1;
    return zA - zB;
  });

  for (const i of slotOrder) {
    const slotDef = layout.slots[i];
    const slotState = slots[i] || {
      imageSrc: null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      filter: 'normal',
    };

    const isCircle = slotDef.shape === 'circle';

    // Calculate slot coordinates accounting for gap
    const rawX = innerLeft + (slotDef.x / 100) * gridW;
    const rawY = innerTop + (slotDef.y / 100) * gridH;
    const rawWidth = (slotDef.w / 100) * gridW;
    const rawHeight = (slotDef.h / 100) * gridH;

    // Check if slot touches canvas outer boundaries
    const touchesLeft = slotDef.x <= 0.5;
    const touchesRight = slotDef.x + slotDef.w >= 99.5;
    const touchesTop = slotDef.y <= 0.5;
    const touchesBottom = slotDef.y + slotDef.h >= 99.5;

    // Apply gap inset only inside, not on outer perimeter
    const halfGap = isCircle ? 0 : gapPx / 2;

    const slotX = isCircle
      ? rawX
      : touchesLeft
      ? rawX
      : rawX + halfGap;

    const slotW = isCircle
      ? rawWidth
      : touchesLeft && touchesRight
      ? rawWidth
      : touchesLeft || touchesRight
      ? Math.max(1, rawWidth - halfGap)
      : Math.max(1, rawWidth - gapPx);

    const slotY = isCircle
      ? rawY
      : touchesTop
      ? rawY
      : rawY + halfGap;

    const slotH = isCircle
      ? rawHeight
      : touchesTop && touchesBottom
      ? rawHeight
      : touchesTop || touchesBottom
      ? Math.max(1, rawHeight - halfGap)
      : Math.max(1, rawHeight - gapPx);

    const centerX = slotX + slotW / 2;
    const centerY = slotY + slotH / 2;
    const circleRadius = isCircle ? Math.min(slotW, slotH) / 2 : 0;

    // Outer shadow for circle accent slot
    if (isCircle && slotDef.shadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 24 * exportScale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8 * exportScale;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.restore();
    }

    ctx.save();

    // Clip to rounded rectangle or circle
    if (isCircle) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    } else {
      drawRoundedRect(ctx, slotX, slotY, slotW, slotH, radiusPx);
      ctx.clip();
    }

    const img = loadedImages[i];
    if (img) {
      // Apply CSS filter
      const filterDef = FILTER_PRESETS.find((f) => f.id === slotState.filter);
      if (filterDef && filterDef.cssFilter !== 'none') {
        ctx.filter = filterDef.cssFilter;
      }

      ctx.save();

      // Center of slot for transforms
      const centerX = slotX + slotW / 2;
      const centerY = slotY + slotH / 2;

      ctx.translate(centerX, centerY);

      // Rotation & Flip
      if (slotState.rotation) {
        ctx.rotate((slotState.rotation * Math.PI) / 180);
      }
      ctx.scale(slotState.flipH ? -1 : 1, slotState.flipV ? -1 : 1);

      // Calculate cover dimensions
      const isRotated90or270 = slotState.rotation % 180 !== 0;
      const targetW = isRotated90or270 ? slotH : slotW;
      const targetH = isRotated90or270 ? slotW : slotH;

      const imgAspect = img.width / img.height;
      const slotAspect = targetW / targetH;

      let drawW: number;
      let drawH: number;

      if (imgAspect > slotAspect) {
        // Image is wider than slot: match height, crop width
        drawH = targetH;
        drawW = targetH * imgAspect;
      } else {
        // Image is taller than slot: match width, crop height
        drawW = targetW;
        drawH = targetW / imgAspect;
      }

      // Apply user scale & offsets
      const userScale = Math.max(0.5, slotState.scale || 1);
      drawW *= userScale;
      drawH *= userScale;

      const panX = ((slotState.offsetX || 0) / 100) * targetW;
      const panY = ((slotState.offsetY || 0) / 100) * targetH;

      const hasMask = slotDef.maskType && slotDef.maskType !== 'none';
      const hasSharpen = slotState.sharpen && slotState.sharpen > 0;

      if (hasMask || hasSharpen) {
        try {
          const offW = Math.max(2, Math.ceil(slotW));
          const offH = Math.max(2, Math.ceil(slotH));
          const offCanvas = document.createElement('canvas');
          offCanvas.width = offW;
          offCanvas.height = offH;
          const offCtx = offCanvas.getContext('2d');

          if (offCtx) {
            if (filterDef && filterDef.cssFilter !== 'none') {
              offCtx.filter = filterDef.cssFilter;
            }
            offCtx.translate(offW / 2, offH / 2);
            if (slotState.rotation) {
              offCtx.rotate((slotState.rotation * Math.PI) / 180);
            }
            offCtx.scale(slotState.flipH ? -1 : 1, slotState.flipV ? -1 : 1);
            offCtx.drawImage(img, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);

            // Apply unsharp mask filter directly on offscreen image data
            if (hasSharpen) {
              applySharpenKernel(offCtx, offW, offH, slotState.sharpen!);
            }

            // Apply feather fade gradient mask if specified
            if (hasMask) {
              offCtx.resetTransform();
              offCtx.save();
              offCtx.globalCompositeOperation = 'destination-in';
              const maskGrad = offCtx.createLinearGradient(0, 0, 0, offH);
              if (slotDef.maskType === 'fade-bottom') {
                maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
                maskGrad.addColorStop(0.5, 'rgba(0, 0, 0, 1)');
                maskGrad.addColorStop(0.68, 'rgba(0, 0, 0, 0.85)');
                maskGrad.addColorStop(0.86, 'rgba(0, 0, 0, 0.3)');
                maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
              } else if (slotDef.maskType === 'fade-top') {
                maskGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                maskGrad.addColorStop(0.14, 'rgba(0, 0, 0, 0.3)');
                maskGrad.addColorStop(0.32, 'rgba(0, 0, 0, 0.85)');
                maskGrad.addColorStop(0.5, 'rgba(0, 0, 0, 1)');
                maskGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
              }
              offCtx.fillStyle = maskGrad;
              offCtx.fillRect(0, 0, offW, offH);
              offCtx.restore();
            }

            // Draw processed offscreen image back to main canvas (clipped by rounded rect)
            ctx.drawImage(offCanvas, -slotW / 2, -slotH / 2, slotW, slotH);
          } else {
            ctx.drawImage(img, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
          }
        } catch (e) {
          ctx.drawImage(img, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
        }
      } else {
        ctx.drawImage(img, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
      }

      ctx.restore();
    } else {
      // Empty slot placeholder
      const isDark =
        !config.bgColor ||
        config.bgColor === '#000000' ||
        config.bgColor.startsWith('#1') ||
        config.bgType === 'gradient';

      if (isCircle) {
        ctx.fillStyle = isDark ? '#18181b' : '#f1f5f9';
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? '#71717a' : '#94a3b8';
        ctx.font = `bold ${13 * exportScale}px Montserrat, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+ Thêm ảnh tròn', centerX, centerY);
      } else {
        ctx.fillStyle = isDark ? '#18181b' : '#f1f5f9';
        ctx.fillRect(slotX, slotY, slotW, slotH);

        // Subtle border and text indicator
        ctx.strokeStyle = isDark ? '#27272a' : '#cbd5e1';
        ctx.lineWidth = 2 * exportScale;
        ctx.strokeRect(slotX + 1, slotY + 1, slotW - 2, slotH - 2);

        ctx.fillStyle = isDark ? '#71717a' : '#94a3b8';
        ctx.font = `${14 * exportScale}px Montserrat, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+ Thêm ảnh #${i + 1}`, slotX + slotW / 2, slotY + slotH / 2);
      }
    }

    ctx.restore();

    // Draw circular accent crisp border
    if (isCircle) {
      const borderWidth = (slotDef.borderWidth ?? 4) * exportScale;
      if (borderWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = slotDef.borderColor || '#FFFFFF';
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // 2.5. Render News Poster Overlays (for 3:4 viral news / editorial posters)
  if (config.newsPoster?.enabled) {
    const np = config.newsPoster;
    ctx.save();

    // A. Bottom Dark Gradient
    const isTribute = np.style === 'tribute-rip';
    const gradH = (canvasH * (np.gradientHeight || (isTribute ? 46 : 38))) / 100;
    const gradStartY = canvasH - gradH;
    const grad = ctx.createLinearGradient(0, gradStartY, 0, canvasH);
    const op = np.gradientOpacity ?? 1.0;

    if (isTribute) {
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.28, `rgba(0, 0, 0, ${op * 0.52})`);
      grad.addColorStop(0.5, `rgba(0, 0, 0, ${op * 0.95})`);
      grad.addColorStop(0.72, `rgba(0, 0, 0, ${op})`);
      grad.addColorStop(1, `rgba(0, 0, 0, ${op})`);
    } else {
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.35, `rgba(0, 0, 0, ${op * 0.45})`);
      grad.addColorStop(0.7, `rgba(0, 0, 0, ${op * 0.85})`);
      grad.addColorStop(1, `rgba(0, 0, 0, ${op})`);
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, gradStartY, canvasW, gradH);

    // B. Top Badges & Emblems
    const padTop = 28 * exportScale;
    const padSide = 28 * exportScale;

    // Top Emblem Badge (cho Mẫu Tưởng niệm REST IN PEACE)
    const hasTopBadges = Boolean(np.showTopBadge || np.showFollowButton);
    if (isTribute && np.showTopEmblem) {
      ctx.save();
      const isLeft = np.topEmblemPosition === 'top-left';
      const emblemR = 20 * exportScale;
      const emblemCx = isLeft ? padSide + emblemR + 2 * exportScale : canvasW - padSide - emblemR - 2 * exportScale;
      const emblemCy = padTop + (hasTopBadges ? 52 * exportScale : emblemR);

      // Dark circle with white ring
      ctx.beginPath();
      ctx.arc(emblemCx, emblemCy, emblemR, 0, Math.PI * 2);
      ctx.fillStyle = '#050505';
      ctx.fill();
      ctx.lineWidth = 2 * exportScale;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Draw emblem icon
      if (np.topEmblemIcon === 'ship' || !np.topEmblemIcon) {
        ctx.save();
        ctx.translate(emblemCx, emblemCy);
        const iconScale = (emblemR * 1.35) / 48;
        ctx.scale(iconScale, iconScale);
        ctx.translate(-24, -24);
        ctx.fillStyle = '#FFFFFF';

        // Warship silhouette
        ctx.beginPath();
        ctx.moveTo(24, 7);
        ctx.lineTo(26, 12);
        ctx.lineTo(28, 12);
        ctx.lineTo(29, 17);
        ctx.lineTo(33, 17);
        ctx.lineTo(33, 20);
        ctx.lineTo(35, 20);
        ctx.lineTo(35, 23);
        ctx.lineTo(39, 24);
        ctx.lineTo(41, 28);
        ctx.lineTo(7, 28);
        ctx.lineTo(9, 24);
        ctx.lineTo(13, 20);
        ctx.lineTo(15, 20);
        ctx.lineTo(15, 17);
        ctx.lineTo(19, 17);
        ctx.lineTo(20, 12);
        ctx.lineTo(22, 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillRect(29, 14, 8, 2);
        ctx.fillRect(11, 21, 6, 2);

        // Waves
        ctx.beginPath();
        ctx.moveTo(4, 32);
        ctx.bezierCurveTo(8, 30, 12, 34, 16, 32);
        ctx.bezierCurveTo(20, 30, 24, 34, 28, 32);
        ctx.bezierCurveTo(32, 30, 36, 34, 40, 32);
        ctx.lineTo(44, 33);
        ctx.lineTo(40, 36);
        ctx.bezierCurveTo(36, 38, 32, 34, 28, 36);
        ctx.bezierCurveTo(24, 38, 20, 34, 16, 36);
        ctx.bezierCurveTo(12, 38, 8, 34, 4, 36);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(7, 38);
        ctx.bezierCurveTo(11, 37, 15, 40, 19, 38);
        ctx.bezierCurveTo(23, 37, 27, 40, 31, 38);
        ctx.bezierCurveTo(35, 37, 39, 40, 42, 38);
        ctx.stroke();

        ctx.restore();
      } else if (np.topEmblemIcon === 'star') {
        ctx.fillStyle = '#facc15';
        ctx.font = `${18 * exportScale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', emblemCx, emblemCy);
      }
      ctx.restore();
    }

    // Logo Badge (Top Left - HM MEDIA pill) - Chung cho tất cả các mẫu ảnh
    if (np.showTopBadge) {
      ctx.save();
      const badgeText = (np.topBadgeText || 'HM MEDIA').toUpperCase();
      const pillH = 28 * exportScale;
      const iconR = 9.5 * exportScale;
      ctx.font = `900 ${9.5 * exportScale}px Montserrat, sans-serif`;
      const textWidth = ctx.measureText(badgeText).width;
      const pillW = iconR * 2 + textWidth + 24 * exportScale;
      const pillX = padSide + 2 * exportScale;
      const pillY = padTop + 8 * exportScale;

      // Draw rounded pill background
      drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fillStyle = 'rgba(10, 10, 10, 0.90)';
      ctx.fill();
      ctx.lineWidth = 1 * exportScale;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)'; // golden border
      ctx.stroke();

      // Golden circular emblem on left of pill
      const circleCenterX = pillX + iconR + 5 * exportScale;
      const circleCenterY = pillY + pillH / 2;
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, iconR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.fill();
      ctx.lineWidth = 1 * exportScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Mini golden medal/ribbon icon in circle
      ctx.fillStyle = '#f59e0b';
      ctx.font = `${10 * exportScale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏅', circleCenterX, circleCenterY);

      // Text beside icon
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${9.5 * exportScale}px Montserrat, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, circleCenterX + iconR + 6 * exportScale, pillY + pillH / 2);

      ctx.restore();
    }

    // Follow Button (Top Right - FOLLOW US pill) - Chung cho tất cả các mẫu ảnh
    if (np.showFollowButton) {
      ctx.save();
      const btnText = (np.followButtonText || 'FOLLOW US').toUpperCase();
      const btnH = 28 * exportScale;
      ctx.font = `900 ${9.5 * exportScale}px Montserrat, sans-serif`;
      const btnTextW = ctx.measureText(btnText).width;
      const btnW = btnTextW + 36 * exportScale;
      const btnX = canvasW - padSide - btnW - 2 * exportScale;
      const btnY = padTop + 8 * exportScale;

      drawRoundedRect(ctx, btnX, btnY, btnW, btnH, btnH / 2);
      ctx.fillStyle = 'rgba(10, 10, 10, 0.90)';
      ctx.fill();
      ctx.lineWidth = 1 * exportScale;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${9.5 * exportScale}px Montserrat, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${btnText} 👆`, btnX + btnW / 2, btnY + btnH / 2);
      ctx.restore();
    }

    // C. Headline Typography
    if (isTribute) {
      ctx.save();
      // baseFontSize & subtitleFontSize quy đổi theo scaleRatio khớp 100% với khung xem trước thực tế
      const baseFontSize = (np.fontSize || 48) * scaleRatio;
      const subtitleFontSize = (np.subtitleFontSize || 13) * scaleRatio;

      const headlineFontFamily = np.fontFamily || '"Playfair Display", Georgia, serif';
      const subtitleFontFamily = np.subtitleFontFamily || np.fontFamily || '"Playfair Display", Georgia, serif';

      const hasSubtitle = Boolean(np.subtitle);
      const hasRibbon = (np.bottomSymbol ?? 'ribbon') !== 'none';
      const hasTitleDivider = (np.showTitleDivider ?? true) && hasSubtitle;
      const midDivH = hasTitleDivider ? 12 * scaleRatio : 0;
      const symbolBasePx = (np.bottomSymbolSize || 36) * scaleRatio;
      const ribbonH = hasRibbon ? (symbolBasePx + 10 * scaleRatio) : 0;
      const subH = hasSubtitle ? subtitleFontSize * 1.4 + 14 * scaleRatio + midDivH : 0;
      const bottomPad = 24 * scaleRatio;

      const headlineLines = np.headline ? np.headline.split('\n') : ['REST', 'IN PEACE'];
      const headlineLineH = baseFontSize * 1.06;

      // firstLineY: Baseline of first line of headline
      const firstLineY =
        canvasH - bottomPad - ribbonH - subH - (headlineLines.length - 1) * headlineLineH;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 12 * exportScale;
      ctx.shadowOffsetY = 4 * exportScale;

      const hasOutline = np.textOutline ?? true;
      const outlineLineWidth = Math.max(3.5 * exportScale, baseFontSize * 0.08);

      // Draw Primary Headline (REST IN PEACE)
      headlineLines.forEach((lineText, idx) => {
        const lineY = firstLineY + idx * headlineLineH;
        const currentFontSize = idx === 0 ? baseFontSize : Math.round(baseFontSize * 0.72);
        ctx.font = `900 ${currentFontSize}px ${headlineFontFamily}`;

        const upperText = lineText.toUpperCase();
        if (hasOutline) {
          ctx.save();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = outlineLineWidth;
          ctx.lineJoin = 'round';
          ctx.strokeText(upperText, canvasW / 2, lineY);
          ctx.restore();
        }

        ctx.fillStyle = np.headlineColor || '#ffffff';
        ctx.fillText(upperText, canvasW / 2, lineY);
      });

      const headlineBottomY = firstLineY + (headlineLines.length - 1) * headlineLineH;

      // Draw Divider between Big Headline and Small Subtitle (như phía dưới)
      if (hasTitleDivider) {
        const midDividerY = headlineBottomY + 8 * scaleRatio;
        const dividerW = Math.min(canvasW * 0.44, 200 * scaleRatio);
        const lineGrad = ctx.createLinearGradient(
          canvasW / 2 - dividerW / 2,
          0,
          canvasW / 2 + dividerW / 2,
          0
        );
        lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        lineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
        lineGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.85)');
        lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = lineGrad;
        ctx.fillRect(canvasW / 2 - dividerW / 2, midDividerY, dividerW, 1.5 * scaleRatio);
      }

      // Draw Subtitle (e.g. 'LAST ROSIE THE RIVETER OF WWII')
      if (hasSubtitle && np.subtitle) {
        const subY =
          headlineBottomY +
          (hasTitleDivider ? midDivH : 0) +
          subtitleFontSize * 1.1 +
          6 * scaleRatio;
        ctx.font = `600 ${subtitleFontSize}px ${subtitleFontFamily}`;
        ctx.fillStyle = np.subtitleColor || '#ffffff';
        const subUpper = np.subtitle.toUpperCase();

        if (hasOutline) {
          ctx.save();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.max(2 * exportScale, subtitleFontSize * 0.08);
          ctx.strokeText(subUpper, canvasW / 2, subY);
          ctx.restore();
        }
        ctx.fillText(subUpper, canvasW / 2, subY);

        // Subtitle underline
        if (np.showSubtitleUnderline ?? true) {
          const textMetrics = ctx.measureText(subUpper);
          const lineW = Math.max(textMetrics.width * 1.1, 160 * scaleRatio);
          const lineY = subY + Math.max(6 * scaleRatio, subtitleFontSize * 0.32);
          const lineGrad = ctx.createLinearGradient(
            canvasW / 2 - lineW / 2,
            0,
            canvasW / 2 + lineW / 2,
            0
          );
          lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          lineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
          lineGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.85)');
          lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = lineGrad;
          ctx.fillRect(canvasW / 2 - lineW / 2, lineY, lineW, 1.5 * scaleRatio);
        }
      }

      // Draw Memorial Ribbon (Ruy băng trắng)
      if (hasRibbon) {
        const ribbonTopY = canvasH - bottomPad - ribbonH + 6 * exportScale;
        const symPx = symbolBasePx * exportScale;
        if (np.bottomSymbol === 'ribbon' || !np.bottomSymbol) {
          ctx.save();
          ctx.fillStyle = np.bottomSymbolColor || '#FFFFFF';
          ctx.translate(canvasW / 2, ribbonTopY);
          const ribbonScale = symPx / 140;
          ctx.scale(ribbonScale, ribbonScale);
          ctx.translate(-50, 0);

          ctx.beginPath();
          ctx.moveTo(50, 6);
          ctx.bezierCurveTo(28, 6, 16, 25, 16, 48);
          ctx.bezierCurveTo(16, 66, 25, 83, 37, 99);
          ctx.lineTo(13, 134);
          ctx.bezierCurveTo(11, 137, 14, 141, 18, 139);
          ctx.lineTo(47, 116);
          ctx.lineTo(50, 120);
          ctx.lineTo(53, 116);
          ctx.lineTo(82, 139);
          ctx.bezierCurveTo(86, 141, 89, 137, 87, 134);
          ctx.lineTo(63, 99);
          ctx.bezierCurveTo(75, 83, 84, 66, 84, 48);
          ctx.bezierCurveTo(84, 25, 72, 6, 50, 6);
          ctx.closePath();

          ctx.moveTo(50, 23);
          ctx.bezierCurveTo(62, 23, 68, 34, 68, 48);
          ctx.bezierCurveTo(68, 60, 61, 74, 52, 89);
          ctx.bezierCurveTo(43, 74, 32, 60, 32, 48);
          ctx.bezierCurveTo(32, 34, 38, 23, 50, 23);
          ctx.closePath();

          ctx.fill('evenodd');
          ctx.restore();
        } else if (np.bottomSymbol === 'candle') {
          ctx.font = `${Math.round(symPx * 0.75)}px sans-serif`;
          ctx.fillText('🕯️', canvasW / 2, ribbonTopY + symPx * 0.7);
        } else if (np.bottomSymbol === 'dove') {
          ctx.font = `${Math.round(symPx * 0.75)}px sans-serif`;
          ctx.fillText('🕊️', canvasW / 2, ribbonTopY + symPx * 0.7);
        } else if (np.bottomSymbol === 'rose') {
          ctx.font = `${Math.round(symPx * 0.75)}px sans-serif`;
          ctx.fillText('🌹', canvasW / 2, ribbonTopY + symPx * 0.7);
        } else if (np.bottomSymbol === 'lotus') {
          ctx.font = `${Math.round(symPx * 0.75)}px sans-serif`;
          ctx.fillText('🪷', canvasW / 2, ribbonTopY + symPx * 0.7);
        } else if (np.bottomSymbol === 'star') {
          ctx.fillStyle = '#facc15';
          ctx.font = `${Math.round(symPx * 0.72)}px sans-serif`;
          ctx.fillText('⭐', canvasW / 2, ribbonTopY + symPx * 0.7);
        } else if (np.bottomSymbol === 'cross') {
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.round(symPx * 0.72)}px sans-serif`;
          ctx.fillText('✝️', canvasW / 2, ribbonTopY + symPx * 0.7);
        } else if (np.bottomSymbol === 'hands') {
          ctx.font = `${Math.round(symPx * 0.75)}px sans-serif`;
          ctx.fillText('🙏', canvasW / 2, ribbonTopY + symPx * 0.7);
        }
      }

      ctx.restore();
    } else if (np.headline) {
      ctx.save();
      // baseFontSize quy đổi theo scaleRatio khớp chính xác 100% với màn hình xem trước
      const baseFontSize = (np.fontSize || 35) * scaleRatio;
      const isBoldStyle = np.style === 'bold-headline';
      const headlineFont = np.fontFamily || (isBoldStyle ? 'Anton, Montserrat, sans-serif' : '"Playfair Display", serif');
      const fontStylePrefix = (!np.fontFamily && !isBoldStyle) ? 'italic ' : '';
      const fontWeightPrefix = isBoldStyle ? '900 ' : '700 ';

      ctx.font = `${fontStylePrefix}${fontWeightPrefix}${baseFontSize}px ${headlineFont}`;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      // Drop shadow for crisp readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 12 * exportScale;
      ctx.shadowOffsetY = 4 * exportScale;

      // Word wrapping logic
      const maxTextW = canvasW * 0.92;
      const words = np.headline.split(/\s+/);
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Parse highlight phrases
      const highlightPhrases = (np.highlightWords || '')
        .split(',')
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);

      const lineHeight = baseFontSize * (isBoldStyle ? 1.15 : 1.25);
      const dividerPos = np.dividerPosition ?? 'top';
      const hasTopDivider = np.showDiamondDivider && (dividerPos === 'top' || dividerPos === 'both');
      const hasBottomDivider = np.showDiamondDivider && (dividerPos === 'bottom' || dividerPos === 'both');

      const topDividerSpace = hasTopDivider ? 28 * exportScale : 0;
      const bottomDividerSpace = hasBottomDivider ? 24 * exportScale : 0;

      const bottomPad = 28 * exportScale;
      const textBlockH = (lines.length - 1) * lineHeight;

      // firstLineY: Baseline of first line of headline
      const firstLineY = canvasH - bottomPad - bottomDividerSpace - textBlockH;
      const topDividerY = firstLineY - baseFontSize * 0.85 - 12 * exportScale;
      const bottomDividerY = canvasH - bottomPad - 6 * exportScale;

      const hasOutline = np.textOutline ?? true;
      const outlineLineWidth = Math.max(3.5 * exportScale, baseFontSize * 0.08);

      // Helper to draw diamond divider (— ◆ —)
      const drawDiamondDivider = (dividerY: number) => {
        ctx.save();
        ctx.shadowColor = 'transparent';
        const dividerColor = np.highlightColor || '#f5d061';
        ctx.strokeStyle = dividerColor;
        ctx.lineWidth = 1.4 * exportScale;

        const lineLen = 50 * exportScale;
        const gap = 12 * exportScale;

        // Left line
        ctx.beginPath();
        ctx.moveTo(canvasW / 2 - gap - lineLen, dividerY);
        ctx.lineTo(canvasW / 2 - gap, dividerY);
        ctx.stroke();

        // Right line
        ctx.beginPath();
        ctx.moveTo(canvasW / 2 + gap, dividerY);
        ctx.lineTo(canvasW / 2 + gap + lineLen, dividerY);
        ctx.stroke();

        // Centered diamond
        ctx.fillStyle = dividerColor;
        ctx.font = `${12 * exportScale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◆', canvasW / 2, dividerY);
        ctx.restore();
      };

      // Draw Top Divider if enabled (ngăn cách giữa ảnh và chữ)
      if (hasTopDivider) {
        drawDiamondDivider(topDividerY);
      }

      // Render line by line, coloring highlight words
      lines.forEach((lineStr, lineIdx) => {
        const lineY = firstLineY + lineIdx * lineHeight;

        if (highlightPhrases.length === 0) {
          const textToDraw = isBoldStyle ? lineStr.toUpperCase() : lineStr;
          if (hasOutline) {
            ctx.save();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = outlineLineWidth;
            ctx.lineJoin = 'round';
            ctx.strokeText(textToDraw, canvasW / 2, lineY);
            ctx.restore();
          }
          ctx.fillStyle = np.headlineColor || '#ffffff';
          ctx.fillText(textToDraw, canvasW / 2, lineY);
        } else {
          // Break line into words to draw each word with matching color
          const lineWords = lineStr.split(' ');
          const fullLineWidth = ctx.measureText(isBoldStyle ? lineStr.toUpperCase() : lineStr).width;
          let currentWordX = canvasW / 2 - fullLineWidth / 2;

          lineWords.forEach((word) => {
            const cleanWord = word.replace(/[^a-zA-Z0-9À-ỹ]/g, '').toLowerCase();
            const isHighlighted = highlightPhrases.some(
              (hp) => hp === cleanWord || hp.includes(cleanWord) || cleanWord.includes(hp)
            );

            const displayWord = (isBoldStyle ? word.toUpperCase() : word) + ' ';

            if (hasOutline) {
              ctx.save();
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = outlineLineWidth;
              ctx.lineJoin = 'round';
              ctx.strokeText(displayWord, currentWordX, lineY);
              ctx.restore();
            }

            ctx.fillStyle = isHighlighted
              ? np.highlightColor || '#facc15'
              : np.headlineColor || '#ffffff';

            ctx.textAlign = 'left';
            ctx.fillText(displayWord, currentWordX, lineY);
            currentWordX += ctx.measureText(displayWord).width;
          });
        }
      });

      // Draw Bottom Divider if enabled
      if (hasBottomDivider) {
        drawDiamondDivider(bottomDividerY);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // 2.7. Render Then & Now Comparison Badges (for comparison 3:4 posters)
  if (layout.isComparison && (config.comparison?.showLabels ?? true)) {
    ctx.save();
    const styleType = config.comparison?.badgeStyle || 'pill';
    const isOuter = config.comparison?.badgeAlign === 'outer';

    // Safe badgeY calculation so badges never cover the person's face
    let badgeY: number;
    if (config.comparison?.verticalPercent !== undefined) {
      badgeY = (canvasH * config.comparison.verticalPercent) / 100;
    } else {
      const pos = config.comparison?.labelPosition || 'bottom';
      if (pos === 'bottom') {
        badgeY = canvasH * 0.58; // 58% height, safely in chest / lower photo area
      } else if (pos === 'above-headline') {
        badgeY = canvasH - (canvasH * (config.newsPoster?.gradientHeight || 38)) / 100 - 20 * exportScale;
      } else if (pos === 'top-bar') {
        badgeY = 26 * exportScale;
      } else {
        const hasTopBadges = !!(config.newsPoster?.showTopBadge || config.newsPoster?.showFollowButton);
        badgeY = hasTopBadges ? 92 * exportScale : 34 * exportScale;
      }
    }

    const bSize = config.comparison?.badgeSize || 'normal';
    const sizeMultiplier = bSize === 'xl' ? 1.45 : bSize === 'large' ? 1.22 : 1.0;
    const badgeFontPx = Math.round(11 * sizeMultiplier * exportScale);

    const pillH = (styleType === 'minimal' ? 22 : 28) * sizeMultiplier * exportScale;
    const pillRadius = (styleType === 'minimal' ? 6 : pillH / 2);
    const marginSide = 20 * exportScale;

    // A. Left Label (THEN)
    const leftText = (config.comparison?.leftLabel || 'THEN').toUpperCase();
    ctx.font = `900 ${badgeFontPx}px Montserrat, sans-serif`;
    const leftMetrics = ctx.measureText(leftText);
    const pillPaddingExtra = (styleType === 'minimal' ? 24 : 38) * sizeMultiplier * exportScale;
    const leftPillW = leftMetrics.width + pillPaddingExtra;
    const leftPillX = isOuter ? marginSide : canvasW / 4 - leftPillW / 2;
    const leftPillY = badgeY - pillH / 2;

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 14 * exportScale;
    ctx.shadowOffsetY = 4 * exportScale;

    drawRoundedRect(ctx, leftPillX, leftPillY, leftPillW, pillH, pillRadius);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.95)';
    ctx.fill();
    ctx.lineWidth = (styleType === 'minimal' ? 2.5 : 2) * exportScale;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    const dotR = 3.5 * sizeMultiplier * exportScale;
    const dotMargin = 14 * sizeMultiplier * exportScale;
    if (styleType === 'pill') {
      // Inner dot
      ctx.beginPath();
      ctx.arc(leftPillX + dotMargin, badgeY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Text
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(leftText, leftPillX + dotMargin + 9 * sizeMultiplier * exportScale, badgeY);
    } else {
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(leftText, leftPillX + leftPillW / 2, badgeY);
    }

    // B. Right Label (NOW)
    const rightText = (config.comparison?.rightLabel || 'NOW').toUpperCase();
    ctx.font = `900 ${badgeFontPx}px Montserrat, sans-serif`;
    const rightMetrics = ctx.measureText(rightText);
    const rightPillW = rightMetrics.width + pillPaddingExtra;
    const rightPillX = isOuter ? canvasW - marginSide - rightPillW : (3 * canvasW) / 4 - rightPillW / 2;
    const rightPillY = badgeY - pillH / 2;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 14 * exportScale;
    ctx.shadowOffsetY = 4 * exportScale;

    drawRoundedRect(ctx, rightPillX, rightPillY, rightPillW, pillH, pillRadius);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.95)';
    ctx.fill();
    ctx.lineWidth = (styleType === 'minimal' ? 2.5 : 2) * exportScale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    if (styleType === 'pill') {
      // Inner dot
      ctx.beginPath();
      ctx.arc(rightPillX + dotMargin, badgeY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(rightText, rightPillX + dotMargin + 9 * sizeMultiplier * exportScale, badgeY);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rightText, rightPillX + rightPillW / 2, badgeY);
    }

    // C. Optional Center VS Badge
    if (config.comparison?.showVsBadge) {
      const vsR = 15 * exportScale;
      const vsCenterX = canvasW / 2;
      const vsCenterY = badgeY;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 16 * exportScale;
      ctx.shadowOffsetY = 4 * exportScale;

      ctx.beginPath();
      ctx.arc(vsCenterX, vsCenterY, vsR, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.lineWidth = 2 * exportScale;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#09090b';
      ctx.font = `900 ${10 * exportScale}px Montserrat, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.comparison?.vsText || 'VS', vsCenterX, vsCenterY);
      ctx.restore();
    }

    ctx.restore();
  }

  // 3. Render Stickers
  for (const sticker of stickers) {
    ctx.save();
    const sx = (sticker.x / 100) * canvasW;
    const sy = (sticker.y / 100) * canvasH;
    const size = (sticker.size || 40) * exportScale;

    ctx.translate(sx, sy);
    if (sticker.rotation) {
      ctx.rotate((sticker.rotation * Math.PI) / 180);
    }
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.content, 0, 0);
    ctx.restore();
  }

  // 4. Render Text Overlays
  for (const textItem of texts) {
    ctx.save();
    const tx = (textItem.x / 100) * canvasW;
    const ty = (textItem.y / 100) * canvasH;
    const fSize = (textItem.fontSize || 24) * scaleRatio;

    const fontStylePrefix = textItem.fontStyle === 'italic' ? 'italic ' : '';
    const fontWeightPrefix = textItem.fontWeight === 'bold' ? 'bold ' : 'normal ';
    const cleanFontFamily = textItem.fontFamily || 'Montserrat, sans-serif';
    ctx.font = `${fontStylePrefix}${fontWeightPrefix}${fSize}px ${cleanFontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (textItem.bgBox) {
      const textMetrics = ctx.measureText(textItem.text);
      const paddingX = 14 * scaleRatio;
      const paddingY = 6 * scaleRatio;
      const boxW = textMetrics.width + paddingX * 2;
      const boxH = fSize + paddingY * 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      drawRoundedRect(ctx, tx - boxW / 2, ty - boxH / 2, boxW, boxH, 8 * scaleRatio);
      ctx.fill();
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 6 * scaleRatio;
      ctx.shadowOffsetY = 2 * scaleRatio;
    }

    ctx.fillStyle = textItem.color || '#ffffff';
    ctx.fillText(textItem.text, tx, ty);
    ctx.restore();
  }

  // 5. Render Polaroid Frame Caption & Photobooth Date
  if (config.frameStyle === 'polaroid' && config.captionText) {
    ctx.save();
    const capSize = 24 * scaleRatio;
    ctx.font = `bold ${capSize}px Caveat, cursive`;
    ctx.fillStyle = '#262626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.captionText, canvasW / 2, canvasH - 35 * scaleRatio);
    ctx.restore();
  }

  if (config.frameStyle === 'photobooth' && config.dateText) {
    ctx.save();
    const dateSize = 12 * scaleRatio;
    ctx.font = `600 ${dateSize}px Montserrat, sans-serif`;
    ctx.fillStyle = '#525252';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.dateText, canvasW / 2, canvasH - 18 * scaleRatio);
    ctx.restore();
  }
}

export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'jpeg' = 'png',
  quality = 0.95
) {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    mime,
    quality
  );
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
