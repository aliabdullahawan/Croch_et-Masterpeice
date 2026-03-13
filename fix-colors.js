const fs = require('fs');
let content = fs.readFileSync('app/products/[id]/page.tsx', 'utf8');

content = content.replace(
  `import { useWishlist }     from "@/context/WishlistContext";`,
  `import { useWishlist }     from "@/context/WishlistContext";\nimport { useTheme }        from "@/context/ThemeContext";`
);

content = content.replace(
  `  const { toggle, isInList }  = useWishlist();`,
  `  const { toggle, isInList }  = useWishlist();\n  const { theme } = useTheme();\n  const isDark = theme === "dark";\n\n  const tBaseBg     = isDark ? "#1A0D06" : "#FDF8F3";\n  const tCardBg     = isDark ? "rgba(42,22,10,0.9)" : "rgba(255,248,243,0.9)";\n  const tTextMain   = isDark ? "#F2E9DE" : "#3D2B1F";\n  const tTextDim    = isDark ? "#C8B89A" : "#7A5A48";\n  const tTextMuted  = isDark ? "rgba(200,184,154,0.7)" : "rgba(122,90,72,0.6)";\n  const tBorder     = isDark ? "rgba(201,160,40,0.15)" : "rgba(61,43,31,0.12)";\n  const tInputBg    = isDark ? "rgba(42,22,10,0.8)" : "rgba(255,248,243,0.9)";`
);

// Do global replacements
content = content.replace(/"#FDF8F3"/g, 'tBaseBg');
content = content.replace(/"#3D2B1F"/g, 'tTextMain');
content = content.replace(/"#7A5A48"/g, 'tTextDim');
content = content.replace(/"rgba\(122,90,72,0\.\d+\)"/g, 'tTextMuted');
content = content.replace(/"rgba\(255,248,243,0\.9\)"/g, 'tCardBg');

// Specific style object edge cases
content = content.replace(/border: "1px solid rgba\(201,160,40,0\.15\)"/g, 'border: `1px solid ${tBorder}`');
content = content.replace(/border: "1px solid rgba\(61,43,31,0\.12\)"/g, 'border: `1px solid ${tBorder}`');
content = content.replace(/border: "1px solid rgba\(122,90,72,0\.2\)"/g, 'border: `1px solid ${tBorder}`');

content = content.replace(/boxShadow: "0 4px 24px rgba\(61,43,31,0\.07\)"/g, 'boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(61,43,31,0.07)"');
content = content.replace(/boxShadow: "0 4px 20px rgba\(61,43,31,0\.06\)"/g, 'boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 20px rgba(61,43,31,0.06)"');
content = content.replace(/boxShadow: "0 8px 40px rgba\(61,43,31,0\.14\)"/g, 'boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 8px 40px rgba(61,43,31,0.14)"');

content = content.replace(/border: `1px solid \$\{inWishlist \? "#E8A0A8" : "rgba\\(61,43,31,0\\.15\\)"\}`/g, 'border: `1px solid ${inWishlist ? "#E8A0A8" : tBorder}`');

const lightInputClasses = 'bg-white/90 border-[#3D2B1F]/15 text-[#3D2B1F] focus:border-[#C9A028]/60 focus:bg-white placeholder:text-[#7A5A48]/60';
const darkInputClasses = 'dark:bg-[#1A0D06]/80 dark:border-[#C9A028]/20 dark:text-[#F2E9DE] dark:focus:bg-[#120A04] dark:placeholder:text-[#C8B89A]/60';

content = content.split(lightInputClasses).join(`${lightInputClasses} ${darkInputClasses}`);
content = content.split('hover:bg-black/5 text-lg" style={{ color: tTextMain }}>').join(`hover:bg-black/5 dark:hover:bg-white/5 text-lg" style={{ color: tTextMain }}>`);

fs.writeFileSync('app/products/[id]/page.tsx', content);
console.log('Done');
