
import React from 'react';
import { Slide, Profile, Theme } from '../types';

interface TwitterSlideProps {
  slide: Slide;
  profile: Profile;
  index: number;
  total: number;
  showSlideNumbers: boolean;
  headerScale?: number;
  theme: Theme;
  forExport?: boolean;
  showVerifiedBadge?: boolean;
  accentColor?: string;
}

// Simple Markdown Parser Helpers
const parseInline = (text: string, theme: Theme) => {
  // Colors based on theme
  const boldColor = theme === 'DARK' ? 'text-white' : 'text-gray-900';
  const italicColor = theme === 'DARK' ? 'text-gray-300' : 'text-gray-800';
  const strikeColor = theme === 'DARK' ? 'text-gray-600' : 'text-gray-500';

  // Bold: **text**, Italic: *text*, Strike: ~~text~~, Underline: __text__
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~|__.*?__)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className={`font-bold ${boldColor}`}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className={`italic ${italicColor}`}>{part.slice(1, -1)}</em>;
    if (part.startsWith('~~') && part.endsWith('~~')) return <s key={i} className={strikeColor}>{part.slice(2, -2)}</s>;
    if (part.startsWith('__') && part.endsWith('__')) return <u key={i} className="decoration-4 underline-offset-4">{part.slice(2, -2)}</u>;
    return part;
  });
};

const renderMarkdown = (text: string, theme: Theme) => {
  const lines = text.split('\n');

  // Theme Colors
  const hColor = theme === 'DARK' ? 'text-white' : 'text-gray-900';
  const textColor = theme === 'DARK' ? 'text-gray-200' : 'text-gray-800';
  const bulletColor = theme === 'DARK' ? 'text-gray-500' : 'text-gray-400';
  const numberColor = theme === 'DARK' ? 'text-white' : 'text-gray-900';

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    
    // Headers - Scaled for 1080px width
    if (line.startsWith('# ')) {
      return <h1 key={idx} className={`text-7xl font-extrabold leading-tight mb-8 tracking-tight ${hColor}`}>{parseInline(line.slice(2), theme)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={idx} className={`text-6xl font-bold leading-tight mb-6 tracking-tight ${hColor}`}>{parseInline(line.slice(3), theme)}</h2>;
    }

    // Lists - Scaled for 1080px width
    if (trimmed.startsWith('- ')) {
       return (
         <div key={idx} className="flex items-start mb-4 ml-2">
            <span className={`mr-4 text-4xl mt-1 ${bulletColor}`}>•</span>
            <span className={`text-5xl leading-normal ${textColor}`}>{parseInline(line.slice(2), theme)}</span>
         </div>
       );
    }
    if (/^\d+\. /.test(trimmed)) {
        const number = trimmed.match(/^\d+/)?.[0];
        const content = trimmed.replace(/^\d+\. /, '');
        return (
            <div key={idx} className="flex items-start mb-4 ml-2">
               <span className={`mr-4 font-bold text-5xl ${numberColor}`}>{number}.</span>
               <span className={`text-5xl leading-normal ${textColor}`}>{parseInline(content, theme)}</span>
            </div>
          );
    }

    // Empty lines (spacing)
    if (!trimmed) return <div key={idx} className="h-8"></div>;

    // Standard Paragraph - Scaled for 1080px width (Approx 48px font size)
    return <p key={idx} className={`text-5xl leading-relaxed mb-6 ${textColor}`}>{parseInline(line, theme)}</p>;
  });
};

const TwitterSlide: React.FC<TwitterSlideProps> = ({ slide, profile, index, total, showSlideNumbers, headerScale = 1.0, theme, forExport = false, showVerifiedBadge = true, accentColor }) => {
  
  // Calculate heights
  const imageScale = slide.imageScale || 50; 
  const textHeightPercent = slide.showImage ? 100 - imageScale : 100;
  const imageHeightPercent = slide.showImage ? imageScale : 0;
  const imageOffsetY = slide.imageOffsetY !== undefined ? slide.imageOffsetY : 50;

  // Header styling
  const avatarSize = 130 * headerScale;
  const nameSize = 48 * headerScale;
  const handleSize = 32 * headerScale;
  const verifiedSize = 40 * headerScale;
  const gapSize = 24 * headerScale;
  const marginBottom = 40 * headerScale;

  // Theme Base Colors
  const bgColor = theme === 'DARK' ? '#000000' : '#FFFFFF';
  
  const nameColor = theme === 'DARK' ? 'text-white' : 'text-gray-900';
  const handleColor = theme === 'DARK' ? 'text-gray-500' : 'text-gray-500';
  const borderColor = theme === 'DARK' ? 'border-gray-800' : 'border-gray-100';
  const imagePlaceholderBg = theme === 'DARK' ? 'bg-gray-900' : 'bg-gray-50';
  const imagePlaceholderBorder = theme === 'DARK' ? 'border-gray-800' : 'border-gray-200';
  const footerBg = theme === 'DARK' ? 'bg-gray-900' : 'bg-gray-100';
  const footerText = theme === 'DARK' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      className={`w-full h-full flex flex-col p-16 relative overflow-hidden font-sans shadow-sm ${forExport ? '' : 'transition-colors duration-300'}`}
      style={{ backgroundColor: bgColor }}
    >
      
      {/* Header: Profile - Dynamically Scaled */}
      <div 
        className="flex-none flex items-center z-10"
        style={{ marginBottom: `${marginBottom}px`, gap: `${gapSize}px` }}
      >
        <img 
          src={profile.avatarUrl || "https://picsum.photos/200"} 
          alt={profile.name} 
          crossOrigin="anonymous"
          className={`rounded-full object-cover border-2 ${borderColor}`}
          style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
        />
        <div className="flex flex-col justify-center" style={{ flex: '1 1 0%', minWidth: 0 }}>
          <div className="flex items-baseline" style={{ gap: `${gapSize * 0.5}px` }}>
            <span
                className={`font-bold ${nameColor} truncate`}
                style={{ fontSize: `${nameSize}px`, lineHeight: 1.5, paddingBottom: '4px' }}
            >
                {profile.name}
            </span>
            {showVerifiedBadge && (
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/1200px-Twitter_Verified_Badge.svg.png"
                    alt="Verified"
                    crossOrigin="anonymous"
                    className="object-contain flex-shrink-0"
                    style={{
                      width: `${verifiedSize}px`,
                      height: `${verifiedSize}px`,
                      alignSelf: 'center',
                      marginTop: `-${verifiedSize * 0.1}px`
                    }}
                />
            )}
          </div>
          <div
            className={`${handleColor}`}
            style={{ fontSize: `${handleSize}px`, lineHeight: 1.3, marginTop: `${4 * headerScale}px` }}
          >
            @{profile.handle}
          </div>
        </div>
      </div>

      {/* Main Container for Text + Image */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Text Area */}
        <div 
            className="w-full overflow-hidden flex flex-col transition-all duration-300 ease-in-out"
            style={{ height: `${textHeightPercent}%` }}
        >
             <div className="flex-1 w-full overflow-y-auto pr-4 no-scrollbar">
                {renderMarkdown(slide.content, theme)}
             </div>
        </div>

        {/* Image Area */}
        {slide.showImage && (
             <div 
                className="w-full pt-8 transition-all duration-300 ease-in-out flex flex-col"
                style={{ height: `${imageHeightPercent}%` }}
             >
                {slide.imageUrl ? (
                    <div className={`flex-1 w-full rounded-3xl overflow-hidden border ${borderColor} relative shadow-sm`}>
                        <img 
                        src={slide.imageUrl} 
                        alt="Slide visual" 
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `center ${imageOffsetY}%` }}
                        />
                    </div>
                ) : (
                    <div className={`flex-1 w-full rounded-3xl ${imagePlaceholderBg} flex items-center justify-center border-4 border-dashed ${imagePlaceholderBorder}`}>
                        <div className="flex flex-col items-center text-gray-500 animate-pulse scale-150">
                            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-lg font-medium">Generating...</span>
                        </div>
                    </div>
                )}
             </div>
        )}
      </div>

      {/* Footer / Pagination */}
      {showSlideNumbers && (
        <div className="flex-none pt-8 flex justify-end z-10">
           <div 
             className={`text-2xl ${footerBg} ${footerText} px-6 py-2 rounded-full font-bold tracking-wide`}
             style={accentColor ? { color: accentColor } : {}}
            >
             {index + 1} / {total}
           </div>
        </div>
      )}
    </div>
  );
};

export default TwitterSlide;
