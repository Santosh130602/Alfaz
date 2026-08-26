import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { templatesApi } from '../../api'
import { Spinner, EmptyState } from '../ui'
import { cn, driveImg } from '../../utils'
import type { Template } from '../../types'

const CATEGORIES = [
  { v: 'all',         l: '✨ All'       },
  { v: 'sayari',      l: '📝 Sayari'    },
  { v: 'kavita',      l: '🌸 Kavita'    },
  { v: 'minimal',     l: '⬜ Minimal'   },
  { v: 'dark',        l: '🌙 Dark'      },
  { v: 'romantic',    l: '🌹 Romantic'  },
  { v: 'religious',   l: '🕌 Religious' },
  { v: 'festival',    l: '🎉 Festival'  },
  { v: 'nature',      l: '🌿 Nature'    },
]

interface TemplatePickerProps {
  onSelect: (template: Template) => void
  selectedId?: string | null
}

export function TemplatePicker({ onSelect, selectedId }: TemplatePickerProps) {
  const [category, setCategory] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['templates', category],
    queryFn : () => templatesApi.list({
      category: category === 'all' ? undefined : category,
      limit: 40,
    }).then(r => r.data.data.templates),
  })

  return (
    <div className="flex flex-col h-full">
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 px-1 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c.v}
            onClick={() => setCategory(c.v)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              category === c.v ? 'bg-[#6C63FF] text-white' : 'bg-[#242424] text-[#888] hover:text-white'
            )}
          >
            {c.l}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto mt-2">
        {isLoading ? (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#242424] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !data?.length ? (
          <EmptyState icon="🎨" title="No templates found" />
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {data.map(t => (
              <button
                key={t._id}
                onClick={() => onSelect(t)}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                  selectedId === t._id ? 'border-[#6C63FF] scale-52' : 'border-transparent hover:border-[#444]'
                )}
              >
                {/* <img src={t.image.thumbnail} alt={t.name} className="w-full h-full object-cover" loading="lazy" /> */}
                <img src={driveImg(t.image.driveId)} alt={t.name} className="w-full h-full object-cover" loading="lazy" />

                {t.isPremium && (
                  <span className="absolute top-1 right-1 text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                    PRO
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sticker Picker ────────────────────────────

const STICKER_CATEGORIES = [
  { v: 'all',     l: 'All'     }, { v: 'dil',     l: '❤️ Dil'    },
  { v: 'phool',   l: '🌸 Phool'}, { v: 'sitaara', l: '⭐ Sitaara'},
  { v: 'moon',    l: '🌙 Moon' }, { v: 'urdu_calligraphy', l: '✒️ Calligraphy' },
  { v: 'islamic', l: '🕌 Islamic' }, { v: 'nature', l: '🌿 Nature' },
]

interface StickerPickerProps {
  onSelect: (url: string) => void
}

export function StickerPicker({ onSelect }: StickerPickerProps) {
  const [category, setCategory] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['assets', 'sticker', category],
    queryFn : () => templatesApi.listAssets({
      assetType: 'sticker',
      category : category === 'all' ? undefined : category,
      limit: 40,
    }).then(r => r.data.data.assets),
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 overflow-x-auto pb-3 px-1 scrollbar-hide">
        {STICKER_CATEGORIES.map(c => (
          <button
            key={c.v}
            onClick={() => setCategory(c.v)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              category === c.v ? 'bg-[#6C63FF] text-white' : 'bg-[#242424] text-[#888] hover:text-white'
            )}
          >
            {c.l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square bg-[#242424] rounded-xl animate-pulse" />)}
          </div>
        ) : !data?.length ? (
          <EmptyState icon="🎨" title="No stickers found" />
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {data.map(s => (
              <button
                key={s._id}
                onClick={() => onSelect(s.file.url)}
                className="aspect-square rounded-xl bg-[#242424] p-2 hover:bg-[#2E2E2E] transition-colors flex items-center justify-center"
              >
                {/* <img src={s.file.thumbnail || s.file.url} alt={s.name} className="max-w-full max-h-full object-contain" loading="lazy" /> */}
                <img src={driveImg(s.file.driveId)} alt={s.name} className="max-w-full max-h-full object-contain" loading="lazy" />

              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Font Picker ────────────────────────────────

interface FontPickerProps {
  selectedFont: string
  onSelect: (fontFamily: string) => void
}

const BUILTIN_FONTS = [
  { family: 'Noto Nastaliq Urdu', label: 'Noto Nastaliq (Urdu)', preview: 'نمونہ متن' },
  { family: 'Inter',              label: 'Inter (English)',      preview: 'Sample Text' },
]

export function FontPicker({ selectedFont, onSelect }: FontPickerProps) {
  const { data: customFonts, isLoading } = useQuery({
    queryKey: ['assets', 'font'],
    queryFn : () => templatesApi.listAssets({ assetType: 'font', limit: 50 }).then(r => r.data.data.assets),
  })

  return (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
      {BUILTIN_FONTS.map(f => (
        <button
          key={f.family}
          onClick={() => onSelect(f.family)}
          className={cn(
            'flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors',
            selectedFont === f.family ? 'bg-[#6C63FF]/20 border border-[#6C63FF]' : 'bg-[#242424] hover:bg-[#2E2E2E] border border-transparent'
          )}
        >
          <span className="text-xs text-[#888]">{f.label}</span>
          <span style={{ fontFamily: f.family }} className="text-white text-base">{f.preview}</span>
        </button>
      ))}

      {isLoading ? (
        <div className="flex justify-center py-4"><Spinner size="sm" /></div>
      ) : (
        customFonts?.map(font => (
          <button
            key={font._id}
            onClick={() => onSelect(font.fontMeta?.fontFamily || font.name)}
            className={cn(
              'flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors',
              selectedFont === font.fontMeta?.fontFamily ? 'bg-[#6C63FF]/20 border border-[#6C63FF]' : 'bg-[#242424] hover:bg-[#2E2E2E] border border-transparent'
            )}
          >
            <span className="text-xs text-[#888]">{font.name}</span>
            <span className="text-white">{font.fontMeta?.previewText || 'Aa'}</span>
          </button>
        ))
      )}
    </div>
  )
}
