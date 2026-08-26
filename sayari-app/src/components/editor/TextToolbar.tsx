import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import {
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Type, Minus, Plus, Palette
} from 'lucide-react'
import { cn } from '../../utils'
import { FontPicker } from './Pickers'
import type { TextStyle } from '../../hooks/useCanvasEditor'

interface TextToolbarProps {
  style: TextStyle
  onChange: (updates: Partial<TextStyle>) => void
}

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF6584', '#6C63FF', '#FFD700',
  '#FF3B30', '#34C759', '#5856D6', '#FF9500', '#FF2D92',
]

export function TextToolbar({ style, onChange }: TextToolbarProps) {
  const [showFontPicker, setShowFontPicker]   = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#1A1A1A] border-t border-[#2E2E2E]">
      {/* Font + Size row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFontPicker(!showFontPicker)}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-[#242424] rounded-xl text-sm text-white"
        >
          <span className="truncate" style={{ fontFamily: style.fontFamily }}>{style.fontFamily}</span>
          <Type className="w-4 h-4 text-[#888] shrink-0" />
        </button>

        <div className="flex items-center bg-[#242424] rounded-xl">
          <button onClick={() => onChange({ fontSize: Math.max(12, style.fontSize - 4) })} className="p-2 text-[#888] hover:text-white">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm text-white w-8 text-center">{style.fontSize}</span>
          <button onClick={() => onChange({ fontSize: Math.min(200, style.fontSize + 4) })} className="p-2 text-[#888] hover:text-white">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Font picker dropdown */}
      {showFontPicker && (
        <div className="bg-[#242424] rounded-xl p-2">
          <FontPicker
            selectedFont={style.fontFamily}
            onSelect={(f) => { onChange({ fontFamily: f }); setShowFontPicker(false) }}
          />
        </div>
      )}

      {/* Style controls row */}
      <div className="flex items-center gap-2">
        {/* Bold */}
        <button
          onClick={() => onChange({ fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' })}
          className={cn('p-2 rounded-lg transition-colors', style.fontWeight === 'bold' ? 'bg-[#6C63FF] text-white' : 'bg-[#242424] text-[#888] hover:text-white')}
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          onClick={() => onChange({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={cn('p-2 rounded-lg transition-colors', style.fontStyle === 'italic' ? 'bg-[#6C63FF] text-white' : 'bg-[#242424] text-[#888] hover:text-white')}
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#2E2E2E]" />

        {/* Alignment */}
        {([
          { v: 'left',   icon: AlignLeft   },
          { v: 'center', icon: AlignCenter },
          { v: 'right',  icon: AlignRight  },
        ] as const).map(a => (
          <button
            key={a.v}
            onClick={() => onChange({ textAlign: a.v })}
            className={cn('p-2 rounded-lg transition-colors', style.textAlign === a.v ? 'bg-[#6C63FF] text-white' : 'bg-[#242424] text-[#888] hover:text-white')}
          >
            <a.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-px h-6 bg-[#2E2E2E]" />

        {/* Colour */}
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="relative p-2 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] transition-colors"
        >
          <div className="w-4 h-4 rounded-full border border-[#444]" style={{ backgroundColor: style.fill }} />
        </button>
      </div>

      {/* Colour picker dropdown */}
      {showColorPicker && (
        <div className="bg-[#242424] rounded-xl p-3">
          <HexColorPicker color={style.fill} onChange={(c) => onChange({ fill: c })} className="!w-full mb-3" />
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => onChange({ fill: c })}
                className={cn('w-7 h-7 rounded-full border-2 transition-transform', style.fill === c ? 'border-white scale-110' : 'border-transparent')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Background Picker (color / gradient) ──────

interface BackgroundPickerProps {
  onColorSelect: (color: string) => void
  onGradientSelect: (colors: [string, string]) => void
}

const GRADIENT_PRESETS: [string, string][] = [
  ['#6C63FF', '#FF6584'], ['#1A1A2E', '#16213E'], ['#FF6584', '#FFD93D'],
  ['#0F2027', '#2C5364'], ['#8E2DE2', '#4A00E0'], ['#FC466B', '#3F5EFB'],
  ['#11998E', '#38EF7D'], ['#FF512F', '#DD2476'],
]

export function BackgroundPicker({ onColorSelect, onGradientSelect }: BackgroundPickerProps) {
  const [mode, setMode] = useState<'color' | 'gradient'>('gradient')
  const [color, setColor] = useState('#1A1A2E')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button onClick={() => setMode('gradient')} className={cn('flex-1 py-2 rounded-xl text-sm font-medium transition-colors', mode === 'gradient' ? 'bg-[#6C63FF] text-white' : 'bg-[#242424] text-[#888]')}>
          Gradient
        </button>
        <button onClick={() => setMode('color')} className={cn('flex-1 py-2 rounded-xl text-sm font-medium transition-colors', mode === 'color' ? 'bg-[#6C63FF] text-white' : 'bg-[#242424] text-[#888]')}>
          Solid
        </button>
      </div>

      {mode === 'gradient' ? (
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((g, i) => (
            <button
              key={i}
              onClick={() => onGradientSelect(g)}
              className="aspect-square rounded-xl border-2 border-transparent hover:border-white transition-colors"
              style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
            />
          ))}
        </div>
      ) : (
        <div>
          <HexColorPicker color={color} onChange={c => { setColor(c); onColorSelect(c) }} className="!w-full mb-3" />
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => { setColor(c); onColorSelect(c) }}
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white transition-colors" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
