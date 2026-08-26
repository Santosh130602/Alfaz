// import React from 'react'
// import { cn, getInitials, getAvatarUrl } from '../../utils'
// import type { AuthUser, BadgeType } from '../../types'
// import { Loader2 } from 'lucide-react'

// // ─────────────────────────────────────────────
// //  BUTTON
// // ─────────────────────────────────────────────

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
//   size?   : 'sm' | 'md' | 'lg'
//   loading?: boolean
//   icon?   : React.ReactNode
// }

// export function Button({
//   variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props
// }: ButtonProps) {
//   const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

//   const variants = {
//     primary  : 'bg-[#6C63FF] text-white hover:bg-[#5A52D5]',
//     secondary: 'bg-[#242424] text-white hover:bg-[#2E2E2E]',
//     ghost    : 'text-[#888] hover:text-white hover:bg-[#242424]',
//     danger   : 'bg-red-600 text-white hover:bg-red-700',
//     outline  : 'border border-[#2E2E2E] text-white hover:bg-[#242424]',
//   }

//   const sizes = {
//     sm: 'h-8 px-3 text-sm',
//     md: 'h-10 px-4 text-sm',
//     lg: 'h-12 px-6 text-base',
//   }

//   return (
//     <button
//       className={cn(base, variants[variant], sizes[size], className)}
//       disabled={disabled || loading}
//       {...props}
//     >
//       {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
//       {children}
//     </button>
//   )
// }

// // ─────────────────────────────────────────────
// //  INPUT
// // ─────────────────────────────────────────────

// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?  : string
//   error?  : string
//   icon?   : React.ReactNode
//   suffix? : React.ReactNode
// }

// export const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ label, error, icon, suffix, className, ...props }, ref) => (
//     <div className="flex flex-col gap-1.5">
//       {label && <label className="text-sm text-[#888] font-medium">{label}</label>}
//       <div className="relative">
//         {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]">{icon}</span>}
//         <input
//           ref={ref}
//           className={cn(
//             'w-full h-11 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl text-white placeholder-[#555] outline-none',
//             'focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-colors',
//             icon ? 'pl-10' : 'pl-4',
//             suffix ? 'pr-10' : 'pr-4',
//             error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
//             className
//           )}
//           {...props}
//         />
//         {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]">{suffix}</span>}
//       </div>
//       {error && <p className="text-xs text-red-400">{error}</p>}
//     </div>
//   )
// )
// Input.displayName = 'Input'

// // ─────────────────────────────────────────────
// //  TEXTAREA
// // ─────────────────────────────────────────────

// interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
//   label?: string
//   error?: string
// }

// export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
//   ({ label, error, className, ...props }, ref) => (
//     <div className="flex flex-col gap-1.5">
//       {label && <label className="text-sm text-[#888] font-medium">{label}</label>}
//       <textarea
//         ref={ref}
//         className={cn(
//           'w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl text-white placeholder-[#555] outline-none p-4 resize-none',
//           'focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-colors',
//           error && 'border-red-500',
//           className
//         )}
//         {...props}
//       />
//       {error && <p className="text-xs text-red-400">{error}</p>}
//     </div>
//   )
// )
// Textarea.displayName = 'Textarea'

// // ─────────────────────────────────────────────
// //  SPINNER
// // ─────────────────────────────────────────────

// export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
//   const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
//   return <Loader2 className={cn('animate-spin text-[#6C63FF]', sizes[size], className)} />
// }

// export function PageSpinner() {
//   return (
//     <div className="flex items-center justify-center min-h-[60vh]">
//       <Spinner size="lg" />
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  AVATAR
// // ─────────────────────────────────────────────

// interface AvatarProps {
//   user?  : Pick<AuthUser, 'displayName' | 'avatar'> | null
//   src?   : string | null
//   name?  : string
//   size?  : 'xs' | 'sm' | 'md' | 'lg' | 'xl'
//   className?: string
// }

// export function Avatar({ user, src, name, size = 'md', className }: AvatarProps) {
//   const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }
//   const imgSrc = src || (user ? getAvatarUrl(user.avatar) : null)
//   const label  = name || user?.displayName || '?'

//   if (imgSrc) {
//     return (
//       <img
//         src={imgSrc}
//         alt={label}
//         className={cn('rounded-full object-cover bg-[#242424] shrink-0', sizes[size], className)}
//       />
//     )
//   }
//   return (
//     <div className={cn('rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF6584] flex items-center justify-center font-semibold text-white shrink-0', sizes[size], className)}>
//       {getInitials(label)}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  BADGE PILL
// // ─────────────────────────────────────────────

// const BADGE_META: Record<BadgeType, { emoji: string; label: string }> = {
//   verified    : { emoji: '✅', label: 'Verified'    },
//   rising_star : { emoji: '🌟', label: 'Rising Star' },
//   top_creator : { emoji: '🏆', label: 'Top Creator' },
//   voice_artist: { emoji: '🎙️', label: 'Voice Artist'},
//   author      : { emoji: '📚', label: 'Author'      },
//   admin_pick  : { emoji: '⭐', label: 'Admin Pick'  },
// }

// export function BadgePill({ type, showLabel = false }: { type: BadgeType; showLabel?: boolean }) {
//   const meta = BADGE_META[type]
//   return (
//     <span className="inline-flex items-center gap-1 bg-[#242424] border border-[#2E2E2E] rounded-full px-2 py-0.5 text-xs">
//       <span>{meta.emoji}</span>
//       {showLabel && <span className="text-[#888]">{meta.label}</span>}
//     </span>
//   )
// }

// // ─────────────────────────────────────────────
// //  MODAL
// // ─────────────────────────────────────────────

// interface ModalProps {
//   open     : boolean
//   onClose  : () => void
//   title?   : string
//   children : React.ReactNode
//   size?    : 'sm' | 'md' | 'lg' | 'xl' | 'full'
//   className?: string
// }

// export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
//   const sizes = {
//     sm  : 'max-w-sm',
//     md  : 'max-w-md',
//     lg  : 'max-w-2xl',
//     xl  : 'max-w-4xl',
//     full: 'max-w-[95vw] max-h-[95vh]',
//   }

//   if (!open) return null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
//       <div className={cn('relative bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl w-full shadow-2xl overflow-hidden', sizes[size], className)}>
//         {title && (
//           <div className="flex items-center justify-between px-6 py-4 border-b border-[#2E2E2E]">
//             <h2 className="text-lg font-semibold text-white">{title}</h2>
//             <button onClick={onClose} className="text-[#888] hover:text-white transition-colors">
//               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         )}
//         {children}
//       </div>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  CARD
// // ─────────────────────────────────────────────

// export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
//   return (
//     <div className={cn('bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl', className)}>
//       {children}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  SELECT
// // ─────────────────────────────────────────────

// interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
//   label?  : string
//   error?  : string
//   options : { value: string; label: string }[]
// }

// export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
//   ({ label, error, options, className, ...props }, ref) => (
//     <div className="flex flex-col gap-1.5">
//       {label && <label className="text-sm text-[#888] font-medium">{label}</label>}
//       <select
//         ref={ref}
//         className={cn(
//           'w-full h-11 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl text-white outline-none px-4',
//           'focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-colors',
//           error && 'border-red-500',
//           className
//         )}
//         {...props}
//       >
//         {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//       </select>
//       {error && <p className="text-xs text-red-400">{error}</p>}
//     </div>
//   )
// )
// Select.displayName = 'Select'

// // ─────────────────────────────────────────────
// //  EMPTY STATE
// // ─────────────────────────────────────────────

// export function EmptyState({ icon, title, description, action }: {
//   icon?: React.ReactNode
//   title: string
//   description?: string
//   action?: React.ReactNode
// }) {
//   return (
//     <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
//       {icon && <div className="text-4xl mb-4 opacity-50">{icon}</div>}
//       <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
//       {description && <p className="text-[#888] text-sm mb-6 max-w-sm">{description}</p>}
//       {action}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  TABS
// // ─────────────────────────────────────────────

// interface TabsProps {
//   tabs    : { id: string; label: string; icon?: React.ReactNode }[]
//   active  : string
//   onChange: (id: string) => void
//   className?: string
// }

// export function Tabs({ tabs, active, onChange, className }: TabsProps) {
//   return (
//     <div className={cn('flex border-b border-[#2E2E2E]', className)}>
//       {tabs.map(tab => (
//         <button
//           key={tab.id}
//           onClick={() => onChange(tab.id)}
//           className={cn(
//             'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
//             active === tab.id
//               ? 'text-[#6C63FF] border-[#6C63FF]'
//               : 'text-[#888] border-transparent hover:text-white'
//           )}
//         >
//           {tab.icon}
//           {tab.label}
//         </button>
//       ))}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  TOGGLE
// // ─────────────────────────────────────────────

// export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
//   return (
//     <label className="flex items-center gap-3 cursor-pointer">
//       <div
//         onClick={() => onChange(!checked)}
//         className={cn(
//           'relative w-11 h-6 rounded-full transition-colors',
//           checked ? 'bg-[#6C63FF]' : 'bg-[#2E2E2E]'
//         )}
//       >
//         <div className={cn(
//           'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
//           checked ? 'left-6' : 'left-1'
//         )} />
//       </div>
//       {label && <span className="text-sm text-white">{label}</span>}
//     </label>
//   )
// }


















































import React, { useState, useRef, useEffect } from 'react'
import { cn, getInitials, getAvatarUrl } from '../../utils'
import type { AuthUser, BadgeType } from '../../types'
// import { Loader2 } from 'lucide-react'
import { 
  BadgeCheck, 
  Sparkles, 
  Trophy, 
  Mic, 
  BookOpen, 
  Star ,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-react'

// ─────────────────────────────────────────────
//  BUTTON
// ─────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?   : 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?   : React.ReactNode
}

export function Button({
  variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-sans tracking-wide'

  const variants = {
    // Vibrant Red with subtle shadow for depth
    primary  : 'bg-[#E60000] text-white hover:bg-[#B30000] shadow-[0_4px_14px_rgba(230,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(230,0,0,0.4)]',
    // Dark Bento surface
    secondary: 'bg-[#141414] text-white hover:bg-[#1F1F1F] border border-[#1F1F1F] hover:border-[#E60000]/30',
    ghost    : 'text-[#71717A] hover:text-white hover:bg-[#141414]',
    danger   : 'bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_14px_rgba(220,38,38,0.25)]',
    // Tech-style outline that glows red on hover
    outline  : 'border border-[#2A2A2A] text-white hover:border-[#E60000] hover:bg-[#E60000]/10 hover:shadow-[inset_0_0_20px_rgba(230,0,0,0.1)]',
  }

  const sizes = {
    sm: 'h-8 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-14 px-8 text-base font-semibold',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
//  INPUT
// ─────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?  : string
  error?  : string
  icon?   : React.ReactNode
  suffix? : React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, className, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs text-[#71717A] font-mono uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] group-focus-within:text-[#E60000] transition-colors">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-white placeholder-[#3F3F46] outline-none font-sans',
            'focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] focus:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all duration-300',
            icon ? 'pl-11' : 'pl-4',
            suffix ? 'pr-11' : 'pr-4',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
            className
          )}
          {...props}
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A]">{suffix}</span>}
      </div>
      {error && <p className="text-[11px] font-mono text-red-500 mt-0.5">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─────────────────────────────────────────────
//  TEXTAREA
// ─────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs text-[#71717A] font-mono uppercase tracking-wider">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-white placeholder-[#3F3F46] outline-none p-4 resize-none font-sans',
          'focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] focus:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all duration-300',
          error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-[11px] font-mono text-red-500 mt-0.5">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─────────────────────────────────────────────
//  SPINNER
// ─────────────────────────────────────────────

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return <Loader2 className={cn('animate-spin text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]', sizes[size], className)} />
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

// ─────────────────────────────────────────────
//  AVATAR
// ─────────────────────────────────────────────

interface AvatarProps {
  user?  : Pick<AuthUser, 'displayName' | 'avatar'> | null
  src?   : string | null
  name?  : string
  size?  : 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ user, src, name, size = 'md', className }: AvatarProps) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }
  const imgSrc = src || (user ? getAvatarUrl(user.avatar) : null)
  const label  = name || user?.displayName || '?'

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={label}
        className={cn('rounded-full object-cover bg-[#141414] border border-[#1F1F1F] shrink-0', sizes[size], className)}
      />
    )
  }
  return (
    <div className={cn('rounded-full bg-gradient-to-br from-[#E60000] to-[#FF3366] flex items-center justify-center font-display font-bold text-white shrink-0 shadow-[0_2px_10px_rgba(230,0,0,0.3)]', sizes[size], className)}>
      {getInitials(label)}
    </div>
  )
}

// ─────────────────────────────────────────────
//  BADGE PILL
// ─────────────────────────────────────────────

// const BADGE_META: Record<BadgeType, { emoji: string; label: string }> = {
//   verified    : { emoji: '✅', label: 'Verified'    },
//   rising_star : { emoji: '🌟', label: 'Rising Star' },
//   top_creator : { emoji: '🏆', label: 'Top Creator' },
//   voice_artist: { emoji: '🎙️', label: 'Voice Artist'},
//   author      : { emoji: '📚', label: 'Author'      },
//   admin_pick  : { emoji: '⭐', label: 'Admin Pick'  },
// }

// export function BadgePill({ type, showLabel = false }: { type: BadgeType; showLabel?: boolean }) {
//   const meta = BADGE_META[type]
//   return (
//     <span className="inline-flex items-center gap-1.5 bg-[#141414] border border-[#1F1F1F] rounded-full px-2.5 py-1 text-[11px] font-mono tracking-wide shadow-sm">
//       <span>{meta.emoji}</span>
//       {showLabel && <span className="text-[#A1A1AA] uppercase">{meta.label}</span>}
//     </span>
//   )
// }



// ─────────────────────────────────────────────
//  BADGE PILL
// ─────────────────────────────────────────────

// We replace the emoji string with a React Element type and add a color class
const BADGE_META: Record<BadgeType, { icon: React.ElementType; label: string; color: string }> = {
  verified    : { icon: BadgeCheck, label: 'Verified',     color: 'text-[#3B82F6]' }, // Tech Blue
  rising_star : { icon: Sparkles,   label: 'Rising Star',  color: 'text-[#FBBF24]' }, // Neon Gold
  top_creator : { icon: Trophy,     label: 'Top Creator',  color: 'text-[#F97316]' }, // Vibrant Orange
  voice_artist: { icon: Mic,        label: 'Voice Artist', color: 'text-[#A855F7]' }, // Deep Purple
  author      : { icon: BookOpen,   label: 'Author',       color: 'text-[#10B981]' }, // Emerald Green
  admin_pick  : { icon: Star,       label: 'Admin Pick',   color: 'text-[#E60000]' }, // Our Theme Red
}

export function BadgePill({ type, showLabel = false }: { type: BadgeType; showLabel?: boolean }) {
  const meta = BADGE_META[type]
  const Icon = meta.icon

  return (
    <span className="inline-flex items-center gap-1.5 bg-[#141414] border border-[#1F1F1F] rounded-full px-2.5 py-1 text-[11px] font-mono tracking-wide shadow-sm group hover:border-[#2A2A2A] transition-colors">
      <Icon className={cn("w-3.5 h-3.5", meta.color)} />
      {showLabel && (
        <span className="text-[#A1A1AA] uppercase group-hover:text-white transition-colors">
          {meta.label}
        </span>
      )}
    </span>
  )
}

// ─────────────────────────────────────────────
//  MODAL
// ─────────────────────────────────────────────

interface ModalProps {
  open     : boolean
  onClose  : () => void
  title?   : string
  children : React.ReactNode
  size?    : 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const sizes = {
    sm  : 'max-w-sm',
    md  : 'max-w-md',
    lg  : 'max-w-2xl',
    xl  : 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darker, more intense backdrop blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      
      <div className={cn('relative bg-[#0A0A0A] border border-[#1F1F1F] rounded-[24px] w-full shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_40px_rgba(230,0,0,0.05)] overflow-hidden animate-slide-up', sizes[size], className)}>
        {/* Subtle top red edge glow */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E60000]/50 to-transparent" />
        
        {title && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#1F1F1F] bg-[#050505]">
            <h2 className="text-xl font-display font-bold text-white tracking-tight">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-[#71717A] hover:text-white hover:bg-[#141414] hover:border hover:border-[#1F1F1F] transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  CARD
// ─────────────────────────────────────────────

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#0A0A0A] border border-[#1F1F1F] rounded-[24px] shadow-lg', className)}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
//  SELECT
// ─────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?  : string
  error?  : string
  options : { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs text-[#71717A] font-mono uppercase tracking-wider">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full h-12 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-white outline-none px-4 font-sans appearance-none',
          'focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] focus:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all duration-300',
          error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-[#0A0A0A]">{o.label}</option>)}
      </select>
      {error && <p className="text-[11px] font-mono text-red-500 mt-0.5">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'





// interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
//   label?  : string
//   error?  : string
//   options : { value: string; label: string }[]
// }

// export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
//   ({ label, error, options, className, ...props }, ref) => (
//     <div className="flex flex-col gap-2">
//       {label && <label className="text-xs text-[#71717A] font-mono uppercase tracking-wider">{label}</label>}
      
//       {/* Added relative group wrapper for the custom arrow */}
//       <div className="relative group">
//         <select
//           ref={ref}
//           className={cn(
//             'w-full h-12 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-white outline-none px-4 font-sans appearance-none cursor-pointer',
//             'focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] focus:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all duration-300',
//             // Added pr-10 so the text doesn't overlap the custom arrow
//             'pr-10',
//             error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
//             className
//           )}
//           {...props}
//         >
//           {/* Explicitly added text-white to options so they don't inherit default dark browser text */}
//           {options.map(o => <option key={o.value} value={o.value} className="bg-[#141414] text-white py-2">{o.label}</option>)}
//         </select>
        
//         {/* The Custom Dropdown Arrow */}
//         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A] group-focus-within:text-[#E60000] transition-colors duration-300">
//           <ChevronDown className="w-4 h-4" />
//         </div>
//       </div>
      
//       {error && <p className="text-[11px] font-mono text-red-500 mt-0.5">{error}</p>}
//     </div>
//   )
// )
// Select.displayName = 'Select'

// ─────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────




// custom selector 




export interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
  placeholder?: string
}

export function CustomSelect({ value, onChange, options, className, placeholder = "Select..." }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className={cn("relative", className)} ref={selectRef}>
      {/* The visible button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-12 bg-[#0A0A0A] border rounded-xl px-4 font-sans flex items-center justify-between transition-all duration-300 outline-none',
          isOpen 
            ? 'border-[#E60000] shadow-[0_0_15px_rgba(230,0,0,0.15)] text-white' 
            : 'border-[#1F1F1F] text-[#A1A1AA] hover:border-[#2A2A2A] hover:text-white'
        )}
      >
        <span className={cn("truncate text-sm font-medium", selectedOption ? "text-white" : "text-[#71717A]")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isOpen ? "rotate-180 text-[#E60000]" : "text-[#71717A]")} />
      </button>

      {/* The custom floating dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#050505]/95 backdrop-blur-xl border border-[#1F1F1F] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.9),_0_0_15px_rgba(230,0,0,0.05)] max-h-64 overflow-y-auto scrollbar-hide py-2 animate-slide-up origin-top">
          {options.map((option) => {
            const isSelected = value === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm font-sans transition-all duration-200 group text-left",
                  isSelected 
                    ? "bg-[#141414] text-white" 
                    : "text-[#A1A1AA] hover:bg-[#141414] hover:text-white"
                )}
              >
                <span className={cn("transition-colors duration-200", isSelected && "font-semibold text-[#E60000]")}>
                  {option.label}
                </span>
                
                {/* Custom checkmark instead of the native OS blue highlight */}
                {isSelected && (
                  <Check className="w-4 h-4 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.8)] animate-in zoom-in duration-200" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

























export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && (
        <div className="w-20 h-20 bg-[#141414] border border-[#1F1F1F] rounded-3xl flex items-center justify-center text-[#3F3F46] mb-6 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-display font-bold text-white mb-2 tracking-tight">{title}</h3>
      {description && <p className="text-[#71717A] text-sm mb-8 max-w-sm font-sans">{description}</p>}
      {action}
    </div>
  )
}

// ─────────────────────────────────────────────
//  TABS
// ─────────────────────────────────────────────

interface TabsProps {
  tabs    : { id: string; label: string; icon?: React.ReactNode }[]
  active  : string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-[#1F1F1F]', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2 -mb-px relative overflow-hidden font-sans',
            active === tab.id
              ? 'text-white border-[#E60000]'
              : 'text-[#71717A] border-transparent hover:text-white hover:border-[#1F1F1F]'
          )}
        >
          {/* Subtle glow on active tab */}
          {active === tab.id && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#E60000] blur-[20px] opacity-20 pointer-events-none" />
          )}
          
          <span className={cn("transition-colors duration-300", active === tab.id ? "text-[#E60000]" : "text-[#71717A]")}>
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  TOGGLE
// ─────────────────────────────────────────────

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-all duration-300 border border-transparent',
          checked 
            ? 'bg-[#E60000] shadow-[0_0_10px_rgba(230,0,0,0.4)] border-[#FF3366]/30' 
            : 'bg-[#141414] border-[#1F1F1F] group-hover:border-[#2A2A2A]'
        )}
      >
        <div className={cn(
          'absolute top-[2px] w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm',
          checked ? 'left-[26px]' : 'left-1'
        )} />
      </div>
      {label && <span className="text-sm font-sans text-[#A1A1AA] group-hover:text-white transition-colors">{label}</span>}
    </label>
  )
}