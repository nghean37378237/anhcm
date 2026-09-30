import { CanvasConfig, CollageLayout, FilterPreset, SlotState, StickerOverlay, TextOverlay } from '../types';
import { FILTER_PRESETS } from '../data/presets';

interface RenderOptions {
  layout: CollageLayout;
  slots: SlotState[];
  config: CanvasConfig;
  texts: TextOverlay[];
  stickers: StickerOverlay[];
  exportScale?: number; // default 2 for crystal clear 2K+ quality
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
  const { layout, slots, config, texts, stickers, exportScale = 2 } = options;

  const baseSize = 1080;
  const { width: rawW, height: rawH } = getAspectRatioDimensions(config.aspectRatio, baseSize);

  const canvasW = rawW * exportScale;
  const canvasH = rawH * exportScale;

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
    const gradH = (canvasH * (np.gradientHeight || 38)) / 100;
    const gradStartY = canvasH - gradH;
    const grad = ctx.createLinearGradient(0, gradStartY, 0, canvasH);
    const op = np.gradientOpacity ?? 0.94;
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.35, `rgba(0, 0, 0, ${op * 0.45})`);
    grad.addColorStop(0.7, `rgba(0, 0, 0, ${op * 0.85})`);
    grad.addColorStop(1, `rgba(0, 0, 0, ${op})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, gradStartY, canvasW, gradH);

    // B. Top Badges
    const padTop = 28 * exportScale;
    const padSide = 28 * exportScale;

    // Logo Badge (Top Left)
    if (np.showTopBadge) {
      ctx.save();
      const badgeText = np.topBadgeText || 'HM MEDIA';
      const lines = badgeText.split('\n');
      const badgeR = 34 * exportScale;
      const badgeCenterX = padSide + badgeR;
      const badgeCenterY = padTop + badgeR;

      // Outer circle
      ctx.beginPath();
      ctx.arc(badgeCenterX, badgeCenterY, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 15, 15, 0.85)';
      ctx.fill();
      ctx.lineWidth = 1.5 * exportScale;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      // Mini star / emblem
      ctx.fillStyle = '#f59e0b';
      ctx.font = `${10 * exportScale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', badgeCenterX, badgeCenterY - 12 * exportScale);

      // Text in badge
      ctx.fillStyle = '#f1f5f9';
      ctx.font = `bold ${8 * exportScale}px Montserrat, sans-serif`;
      if (lines.length === 1) {
        ctx.fillText(lines[0].toUpperCase(), badgeCenterX, badgeCenterY + 4 * exportScale);
      } else {
        lines.forEach((line, idx) => {
          ctx.fillText(
            line.toUpperCase(),
            badgeCenterX,
            badgeCenterY + (idx === 0 ? -1 * exportScale : 9 * exportScale)
          );
        });
      }
      ctx.restore();
    }

    // Follow Button (Top Right)
    if (np.showFollowButton) {
      ctx.save();
      const btnText = (np.followButtonText || 'FOLLOW US').toUpperCase();
      const btnH = 28 * exportScale;
      const btnW = 95 * exportScale;
      const btnX = canvasW - padSide - btnW;
      const btnY = padTop + 8 * exportScale;

      drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 14 * exportScale);
      ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
      ctx.fill();
      ctx.lineWidth = 1 * exportScale;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${10 * exportScale}px Montserrat, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${btnText} 👆`, btnX + btnW / 2, btnY + btnH / 2);
      ctx.restore();
    }

    // C. Headline Typography
    if (np.headline) {
      ctx.save();
      const baseFontSize = (np.fontSize || 35) * exportScale * 1.35;
      const isBoldStyle = np.style === 'bold-headline';

      ctx.font = isBoldStyle
        ? `900 ${baseFontSize}px Anton, Montserrat, sans-serif`
        : `italic 700 ${baseFontSize}px "Playfair Display", serif`;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      // Subtle drop shadow for crisp readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 10 * exportScale;
      ctx.shadowOffsetY = 4 * exportScale;

      // Word wrapping logic
      const maxTextW = canvasW * 0.9;
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

      const lineHeight = baseFontSize * (isBoldStyle ? 1.22 : 1.32);
      const dividerSpace = np.showDiamondDivider ? 36 * exportScale : 0;
      const totalBlockH = lines.length * lineHeight + dividerSpace;
      const startY = canvasH - 36 * exportScale - totalBlockH + baseFontSize;

      // Render line by line, coloring highlight words
      lines.forEach((lineStr, lineIdx) => {
        const lineY = startY + lineIdx * lineHeight;

        if (highlightPhrases.length === 0) {
          ctx.fillStyle = np.headlineColor || '#ffffff';
          ctx.fillText(isBoldStyle ? lineStr.toUpperCase() : lineStr, canvasW / 2, lineY);
        } else {
          // Break line into words to draw each word with matching color
          const lineWords = lineStr.split(' ');
          // Measure full line width
          const fullLineWidth = ctx.measureText(isBoldStyle ? lineStr.toUpperCase() : lineStr).width;
          let currentWordX = canvasW / 2 - fullLineWidth / 2;

          lineWords.forEach((word) => {
            const cleanWord = word.replace(/[^a-zA-Z0-9À-ỹ]/g, '').toLowerCase();
            const isHighlighted = highlightPhrases.some(
              (hp) => hp === cleanWord || hp.includes(cleanWord) || cleanWord.includes(hp)
            );

            ctx.fillStyle = isHighlighted
              ? np.highlightColor || '#facc15'
              : np.headlineColor || '#ffffff';

            const displayWord = (isBoldStyle ? word.toUpperCase() : word) + ' ';
            ctx.textAlign = 'left';
            ctx.fillText(displayWord, currentWordX, lineY);
            currentWordX += ctx.measureText(displayWord).width;
          });
        }
      });

      // D. Diamond Divider (— ◆ —)
      if (np.showDiamondDivider) {
        ctx.shadowColor = 'transparent';
        const dividerY = startY + lines.length * lineHeight + 4 * exportScale;
        const dividerColor = np.highlightColor || '#f5d061';

        ctx.strokeStyle = dividerColor;
        ctx.lineWidth = 1.2 * exportScale;

        const lineLen = 45 * exportScale;
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
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // 2.7. Render Then & Now Comparison Badges (for comparison 3:4 posters)
  if (layout.isComparison && (config.comparison?.showLabels ?? true)) {
    ctx.save();
    const isBottomPos = config.comparison?.labelPosition === 'bottom';
    const hasTopBadges = !!(config.newsPoster?.showTopBadge || config.newsPoster?.showFollowButton);
    const badgeY = isBottomPos
      ? canvasH - (canvasH * (config.newsPoster?.gradientHeight || 38)) / 100 - 24 * exportScale
      : (hasTopBadges ? 92 * exportScale : 34 * exportScale);

    const pillH = 26 * exportScale;
    const pillRadius = 13 * exportScale;

    // A. Left Label (THEN)
    const leftText = (config.comparison?.leftLabel || 'THEN').toUpperCase();
    ctx.font = `900 ${11 * exportScale}px Montserrat, sans-serif`;
    const leftMetrics = ctx.measureText(leftText);
    const leftPillW = leftMetrics.width + 36 * exportScale;
    const leftCenterX = canvasW / 4;
    const leftPillX = leftCenterX - leftPillW / 2;
    const leftPillY = badgeY - pillH / 2;

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 12 * exportScale;
    ctx.shadowOffsetY = 4 * exportScale;

    drawRoundedRect(ctx, leftPillX, leftPillY, leftPillW, pillH, pillRadius);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.88)';
    ctx.fill();
    ctx.lineWidth = 1.5 * exportScale;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    // Inner dot
    ctx.beginPath();
    ctx.arc(leftPillX + 13 * exportScale, badgeY, 3 * exportScale, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Text
    ctx.fillStyle = '#fde68a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(leftText, leftPillX + 22 * exportScale, badgeY);

    // B. Right Label (NOW)
    const rightText = (config.comparison?.rightLabel || 'NOW').toUpperCase();
    ctx.font = `900 ${11 * exportScale}px Montserrat, sans-serif`;
    const rightMetrics = ctx.measureText(rightText);
    const rightPillW = rightMetrics.width + 36 * exportScale;
    const rightCenterX = (3 * canvasW) / 4;
    const rightPillX = rightCenterX - rightPillW / 2;
    const rightPillY = badgeY - pillH / 2;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 12 * exportScale;
    ctx.shadowOffsetY = 4 * exportScale;

    drawRoundedRect(ctx, rightPillX, rightPillY, rightPillW, pillH, pillRadius);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.88)';
    ctx.fill();
    ctx.lineWidth = 1.5 * exportScale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    // Inner dot
    ctx.beginPath();
    ctx.arc(rightPillX + 13 * exportScale, badgeY, 3 * exportScale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(rightText, rightPillX + 22 * exportScale, badgeY);

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
    const fSize = (textItem.fontSize || 24) * exportScale;

    const fontStyle = textItem.fontStyle === 'italic' ? 'italic' : '';
    const fontWeight = textItem.fontWeight === 'bold' ? 'bold' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${fSize}px ${textItem.fontFamily || 'Montserrat, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (textItem.bgBox) {
      const textMetrics = ctx.measureText(textItem.text);
      const paddingX = 14 * exportScale;
      const paddingY = 6 * exportScale;
      const boxW = textMetrics.width + paddingX * 2;
      const boxH = fSize + paddingY * 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      drawRoundedRect(ctx, tx - boxW / 2, ty - boxH / 2, boxW, boxH, 8 * exportScale);
      ctx.fill();
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 4 * exportScale;
      ctx.shadowOffsetY = 2 * exportScale;
    }

    ctx.fillStyle = textItem.color || '#ffffff';
    ctx.fillText(textItem.text, tx, ty);
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
