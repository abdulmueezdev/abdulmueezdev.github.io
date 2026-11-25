import React from 'react'
import logosData from './officialLogosData.json'

export interface LogoMeta {
  title: string
  hex: string
  path: string
}

export const OFFICIAL_LOGOS = logosData as Record<string, LogoMeta>

export function BrandLogoIcon({ id, size = 26 }: { id: string; size?: number }) {
  const item = OFFICIAL_LOGOS[id]
  if (!item) return null

  // Maintain crisp contrast on white disc
  const isPureDark = item.hex === '#000000' || item.hex === '#181717'
  const fillColor = isPureDark ? '#161616' : item.hex

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fillColor}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path d={item.path} />
    </svg>
  )
}

export const TechLogos: Record<string, React.ReactNode> = {
  git: <BrandLogoIcon id="git" size={26} />,
  github: <BrandLogoIcon id="github" size={26} />,
  python: <BrandLogoIcon id="python" size={26} />,
  cpp: <BrandLogoIcon id="cpp" size={26} />,
  react: <BrandLogoIcon id="react" size={26} />,
  nodejs: <BrandLogoIcon id="nodejs" size={26} />,
  html: <BrandLogoIcon id="html" size={26} />,
  css: <BrandLogoIcon id="css" size={26} />,
  javascript: <BrandLogoIcon id="javascript" size={26} />,
  cloudflare: <BrandLogoIcon id="cloudflare" size={26} />,
  vercel: <BrandLogoIcon id="vercel" size={26} />,
  postgresql: <BrandLogoIcon id="postgresql" size={26} />,
  supabase: <BrandLogoIcon id="supabase" size={26} />,
}
