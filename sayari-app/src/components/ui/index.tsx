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

















































import React from 'react'
import { cn, getInitials, getAvatarUrl } from '../../utils'
import type { AuthUser, BadgeType } from '../../types'
import { Loader2 } from 'lucide-react'

// ─────────────────────────────────────────────
//  BUTTON (Spotify Pill Style)
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
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md'

  const variants = {
    primary  : 'bg-primary text-bg hover:opacity-90 shadow-primary/20',
    secondary: 'bg-surface2 text-text hover:bg-border/60',
    ghost    : 'text-muted hover:text-text hover:bg-surface2/50 shadow-none',
    danger   : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20',
    outline  : 'border border-border text-text hover:bg-surface2 shadow-none',
  }

  const sizes = {
    sm: 'h-8 px-4 text-xs',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
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
//  INPUT (Spotify Rounded Field Style)
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
      {label && <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 bg-surface hover:bg-surface2 focus:bg-surface2 border border-border/60 rounded-2xl text-text placeholder-muted outline-none font-medium',
            'focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-sm',
            icon ? 'pl-11' : 'pl-4',
            suffix ? 'pr-11' : 'pr-4',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">{suffix}</span>}
      </div>
      {error && <p className="text-xs font-bold text-rose-400 ml-1">{error}</p>}
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
      {label && <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-surface hover:bg-surface2 focus:bg-surface2 border border-border/60 rounded-2xl text-text placeholder-muted outline-none p-4 resize-none font-medium',
          'focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-sm',
          error && 'border-rose-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-bold text-rose-400 ml-1">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─────────────────────────────────────────────
//  SPINNER
// ─────────────────────────────────────────────

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return <Loader2 className={cn('animate-spin text-primary', sizes[size], className)} />
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
        className={cn('rounded-full object-cover bg-surface2 shrink-0 border border-border/40 shadow-md', sizes[size], className)}
      />
    )
  }
  return (
    <div className={cn('rounded-full bg-primary text-bg font-black flex items-center justify-center shrink-0 shadow-md', sizes[size], className)}>
      {getInitials(label)}
    </div>
  )
}

// ─────────────────────────────────────────────
//  BADGE PILL
// ─────────────────────────────────────────────

const BADGE_META: Record<BadgeType, { emoji: string; label: string }> = {
  verified    : { emoji: '✅', label: 'Verified'    },
  rising_star : { emoji: '🌟', label: 'Rising Star' },
  top_creator : { emoji: '🏆', label: 'Top Creator' },
  voice_artist: { emoji: '🎙️', label: 'Voice Artist'},
  author      : { emoji: '📚', label: 'Author'      },
  admin_pick  : { emoji: '⭐', label: 'Admin Pick'  },
}

export function BadgePill({ type, showLabel = false }: { type: BadgeType; showLabel?: boolean }) {
  const meta = BADGE_META[type]
  return (
    <span className="inline-flex items-center gap-1.5 bg-surface2 border border-border/60 rounded-full px-2.5 py-1 text-xs font-bold text-text shadow-sm">
      <span>{meta.emoji}</span>
      {showLabel && <span className="text-muted">{meta.label}</span>}
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className={cn('relative bg-surface border border-border/80 rounded-[32px] w-full shadow-2xl overflow-hidden backdrop-blur-2xl animate-scale-up', sizes[size], className)}>
        {title && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-border/50">
            <h2 className="text-xl font-black text-text tracking-tight">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface2 hover:bg-border flex items-center justify-center text-muted hover:text-text transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 md:p-8">
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
    <div className={cn('bg-surface border border-border/60 rounded-2xl shadow-xl hover:border-border transition-all duration-300', className)}>
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
      {label && <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full h-12 bg-surface hover:bg-surface2 focus:bg-surface2 border border-border/60 rounded-2xl text-text outline-none px-4 font-bold cursor-pointer',
          'focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-sm',
          error && 'border-rose-500',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-surface text-text">{o.label}</option>)}
      </select>
      {error && <p className="text-xs font-bold text-rose-400 ml-1">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && <div className="text-5xl mb-5 opacity-60 bg-surface p-6 rounded-full border border-border/40 shadow-inner">{icon}</div>}
      <h3 className="text-xl font-black text-text tracking-tight mb-2">{title}</h3>
      {description && <p className="text-muted text-sm mb-8 max-w-sm leading-relaxed">{description}</p>}
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
    <div className={cn('flex border-b border-border/40 gap-6', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 pb-3 text-sm font-extrabold transition-all border-b-2 -mb-px',
            active === tab.id
              ? 'text-text border-primary'
              : 'text-muted border-transparent hover:text-text'
          )}
        >
          {tab.icon}
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
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-7 rounded-full transition-colors shadow-inner',
          checked ? 'bg-primary' : 'bg-surface2 border border-border/60'
        )}
      >
        <div className={cn(
          'absolute top-1 w-5 h-5 bg-bg rounded-full transition-all shadow-md',
          checked ? 'left-6' : 'left-1'
        )} />
      </div>
      {label && <span className="text-sm font-bold text-text">{label}</span>}
    </label>
  )
}