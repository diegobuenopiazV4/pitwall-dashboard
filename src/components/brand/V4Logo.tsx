import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showDots?: boolean;
  className?: string;
}

/**
 * Logo oficial V4 PIT WALL em SVG.
 * Vermelho V4: #e4243d (oficial), gradiente ate #ff4d5a.
 * Typography: Space Grotesk / Inter para combinar com Rusting Corp & V4 Company style.
 */
export const V4Logo: React.FC<Props> = ({
  size = 'md',
  showSubtitle = true,
  showDots = true,
  className = '',
}) => {
  const heights = { sm: 24, md: 36, lg: 56, xl: 80 };
  const fontSizes = { sm: 14, md: 20, lg: 32, xl: 44 };
  const subFontSizes = { sm: 8, md: 10, lg: 13, xl: 18 };
  const h = heights[size];
  const fs = fontSizes[size];
  const sfs = subFontSizes[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="flex items-center justify-center rounded-lg shadow-lg"
        style={{
          height: h,
          width: h,
          background: 'linear-gradient(135deg, #e4243d 0%, #ff4d5a 100%)',
        }}
      >
        <span
          className="font-black text-white tracking-tighter"
          style={{ fontSize: fs, fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          V4
        </span>
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className="font-bold text-slate-100 tracking-wider"
          style={{ fontSize: fs, fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          PIT WALL
        </span>
        {showSubtitle && (
          <span
            className="text-slate-500 tracking-widest uppercase font-medium"
            style={{ fontSize: sfs, marginTop: size === 'sm' ? -2 : 0 }}
          >
            Ruston SJC{showDots ? ' · 16 AI Agents' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Logo compacto (so o quadrado com V4) — para favicons, avatares.
 */
export const V4LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-lg shadow-lg ${className}`}
      style={{
        height: size,
        width: size,
        background: 'linear-gradient(135deg, #e4243d 0%, #ff4d5a 100%)',
      }}
    >
      <span
        className="font-black text-white tracking-tighter"
        style={{ fontSize: size * 0.55, fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
      >
        V4
      </span>
    </div>
  );
};
