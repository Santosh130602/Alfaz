// import { useState, useEffect, useCallback } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import {
//   Type, Image as ImageIcon, Smile, Palette, Undo2, Redo2,
//   Trash2, Copy, ChevronUp, ChevronDown, X, Check, Eye,
//   Square, RectangleVertical, RectangleHorizontal, Layers
// } from 'lucide-react'
// import { postsApi } from '../../api'
// import { useCanvasEditor } from '../../hooks/useCanvasEditor'
// import { TemplatePicker, StickerPicker } from '../../components/editor/Pickers'
// import { TextToolbar, BackgroundPicker } from '../../components/editor/TextToolbar'
// import { Button, Modal, Select, Spinner } from '../../components/ui'
// import { cn, getErrorMessage } from '../../utils'
// import type { Template, Visibility } from '../../types'
// import toast from 'react-hot-toast'

// type DrawerTab = 'templates' | 'text' | 'stickers' | 'background' | null

// const ORIENTATIONS = {
//   square    : { width: 1080, height: 1080, icon: Square },
//   portrait  : { width: 1080, height: 1350, icon: RectangleVertical },
//   landscape : { width: 1350, height: 1080, icon: RectangleHorizontal },
//   story     : { width: 1080, height: 1920, icon: RectangleVertical },
// } as const

// export function CanvasEditorPage() {
//   const { id } = useParams<{ id: string }>()
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()

//   const [orientation, setOrientation] = useState<keyof typeof ORIENTATIONS>('square')
//   const dims = ORIENTATIONS[orientation]

//   const editor = useCanvasEditor(dims.width, dims.height)
//   const [activeDrawer, setActiveDrawer]   = useState<DrawerTab>('templates')
//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
//   const [showPublishModal, setShowPublishModal] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [canvasReady, setCanvasReady] = useState(false)

//   // Load existing post if editing
//   const { data: post, isLoading: postLoading } = useQuery({
//     queryKey: ['post', id, 'edit'],
//     queryFn : () => postsApi.get(id!).then(r => r.data.data.post),
//     enabled : !!id,
//   })

//   // Load saved canvas state once editor + post data are ready
//   useEffect(() => {
//     if (!editor.ready || canvasReady) return
//     if (post?.canvasState?.fabricJson) {
//       editor.loadFromJSON(post.canvasState.fabricJson as object)
//     }
//     setCanvasReady(true)
//   }, [editor.ready, post, canvasReady])

//   // ── Save draft (canvasState only, no render trigger needed every time) ──
//   const saveDraftMutation = useMutation({
//     mutationFn: () => {
//       const fabricJson = editor.exportJSON()
//       return postsApi.update(id!, {
//         canvasState: {
//           fabricJson,
//           canvasWidth : dims.width,
//           canvasHeight: dims.height,
//           backgroundType: selectedTemplate ? 'template_image' : 'color',
//           templateId  : selectedTemplate?._id,
//         } as never,
//       })
//     },
//     onSuccess: () => {
//       toast.success('Draft saved!')
//       queryClient.invalidateQueries({ queryKey: ['myPosts'] })
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   // ── Select template → apply background ──────
//   const handleTemplateSelect = useCallback(async (template: Template) => {
//     setSelectedTemplate(template)
//     await editor.setBackgroundImage(template.image.url)
//     toast.success(`Applied: ${template.name}`)
//   }, [editor])

//   // ── Keyboard shortcuts ────────────────────────
//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === 'Delete' || e.key === 'Backspace') {
//         const active = document.activeElement
//         if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
//           editor.deleteSelected()
//         }
//       }
//       if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); editor.undo() }
//       if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); editor.redo() }
//       if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); editor.duplicateSelected() }
//     }
//     window.addEventListener('keydown', handleKey)
//     return () => window.removeEventListener('keydown', handleKey)
//   }, [editor])

//   if (postLoading) return (
//     <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
//       <Spinner size="lg" />
//     </div>
//   )

//   return (
//     <div className="fixed inset-0 bg-[#0F0F0F] flex flex-col z-50">
//       {/* ── Top bar ─────────────────────────────── */}
//       <div className="h-14 flex items-center justify-between px-4 border-b border-[#2E2E2E] shrink-0">
//         <button onClick={() => navigate(-1)} className="p-2 text-[#888] hover:text-white transition-colors">
//           <X className="w-5 h-5" />
//         </button>

//         <div className="flex items-center gap-2">
//           <button onClick={editor.undo} disabled={!editor.canUndo} className="p-2 text-[#888] hover:text-white disabled:opacity-30 transition-colors">
//             <Undo2 className="w-4 h-4" />
//           </button>
//           <button onClick={editor.redo} disabled={!editor.canRedo} className="p-2 text-[#888] hover:text-white disabled:opacity-30 transition-colors">
//             <Redo2 className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="sm" onClick={() => saveDraftMutation.mutate()} loading={saveDraftMutation.isPending}>
//             Save Draft
//           </Button>
//           <Button size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => setShowPublishModal(true)}>
//             Next
//           </Button>
//         </div>
//       </div>

//       {/* ── Orientation selector ────────────────── */}
//       <div className="flex items-center justify-center gap-2 py-2 border-b border-[#2E2E2E] shrink-0">
//         {(Object.keys(ORIENTATIONS) as (keyof typeof ORIENTATIONS)[]).map(o => {
//           const Icon = ORIENTATIONS[o].icon
//           return (
//             <button
//               key={o}
//               onClick={() => setOrientation(o)}
//               className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
//                 orientation === o ? 'bg-[#6C63FF] text-white' : 'text-[#888] hover:text-white'
//               )}
//             >
//               <Icon className="w-3.5 h-3.5" />{o}
//             </button>
//           )
//         })}
//       </div>

//       {/* ── Canvas area ─────────────────────────── */}
//       <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-[#080808]">
//         <div className="shadow-2xl" style={{ maxWidth: '100%', maxHeight: '100%' }}>
//           <canvas ref={editor.canvasElRef} className="rounded-lg" style={{ maxWidth: '70vw', maxHeight: '60vh' }} />
//         </div>
//       </div>

//       {/* ── Object toolbar (when selected) ──────── */}
//       {editor.selectedObject && (
//         <div className="flex items-center justify-center gap-2 py-2 border-t border-[#2E2E2E] shrink-0">
//           <button onClick={editor.duplicateSelected} className="p-2 text-[#888] hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
//           <button onClick={editor.bringForward} className="p-2 text-[#888] hover:text-white transition-colors"><ChevronUp className="w-4 h-4" /></button>
//           <button onClick={editor.sendBackward} className="p-2 text-[#888] hover:text-white transition-colors"><ChevronDown className="w-4 h-4" /></button>
//           <button onClick={editor.deleteSelected} className="p-2 text-[#888] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
//         </div>
//       )}

//       {/* ── Text style toolbar (when text selected) ── */}
//       {editor.selectedObject?.type === 'textbox' && (
//         <TextToolbar style={editor.textStyle} onChange={editor.updateTextStyle} />
//       )}

//       {/* ── Bottom tool tabs ─────────────────────── */}
//       <div className="flex items-center justify-around border-t border-[#2E2E2E] py-2 shrink-0 bg-[#0F0F0F]">
//         {([
//           { id: 'templates',  icon: ImageIcon, label: 'Background' },
//           { id: 'background', icon: Palette,   label: 'Colour'     },
//           { id: 'text',       icon: Type,      label: 'Add Text'   },
//           { id: 'stickers',   icon: Smile,     label: 'Stickers'   },
//         ] as const).map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => {
//               if (tab.id === 'text') { editor.addText(); return }
//               setActiveDrawer(activeDrawer === tab.id ? null : tab.id)
//             }}
//             className={cn('flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors',
//               activeDrawer === tab.id ? 'text-[#6C63FF]' : 'text-[#888] hover:text-white'
//             )}
//           >
//             <tab.icon className="w-5 h-5" />
//             <span className="text-[10px]">{tab.label}</span>
//           </button>
//         ))}
//       </div>

//       {/* ── Drawer (templates / stickers / background) ── */}
//       {activeDrawer && activeDrawer !== 'text' && (
//         <div className="absolute bottom-0 left-0 right-0 h-[45vh] bg-[#1A1A1A] border-t border-[#2E2E2E] rounded-t-3xl p-4 flex flex-col animate-slide-up">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-sm font-semibold text-white capitalize">{activeDrawer}</h3>
//             <button onClick={() => setActiveDrawer(null)} className="text-[#888] hover:text-white"><X className="w-4 h-4" /></button>
//           </div>

//           {activeDrawer === 'templates' && (
//             <TemplatePicker onSelect={handleTemplateSelect} selectedId={selectedTemplate?._id} />
//           )}
//           {activeDrawer === 'stickers' && (
//             <StickerPicker onSelect={(url) => editor.addSticker(url)} />
//           )}
//           {activeDrawer === 'background' && (
//             <BackgroundPicker
//               onColorSelect={editor.setBackgroundColor}
//               onGradientSelect={editor.setBackgroundGradient}
//             />
//           )}
//         </div>
//       )}

//       {/* ── Publish modal ────────────────────────── */}
//       {showPublishModal && (
//         <PublishModal
//           postId={id!}
//           editor={editor}
//           onClose={() => setShowPublishModal(false)}
//           selectedTemplate={selectedTemplate}
//           dims={dims}
//         />
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  PUBLISH MODAL
// // ─────────────────────────────────────────────

// function PublishModal({ postId, editor, onClose, selectedTemplate, dims }: {
//   postId: string
//   editor: ReturnType<typeof useCanvasEditor>
//   onClose: () => void
//   selectedTemplate: Template | null
//   dims: { width: number; height: number }
// }) {
//   const navigate     = useNavigate()
//   const queryClient   = useQueryClient()
//   const [visibility, setVisibility] = useState<Visibility>('public')
//   const [scheduling, setScheduling]  = useState(false)
//   const [scheduledAt, setScheduledAt] = useState('')
//   const previewUrl = editor.exportPNG(1)

//   const publishMutation = useMutation({
//     mutationFn: async () => {
//       // 1. Save canvas state
//       const fabricJson = editor.exportJSON()
//       await postsApi.update(postId, {
//         canvasState: {
//           fabricJson,
//           canvasWidth : dims.width,
//           canvasHeight: dims.height,
//           backgroundType: selectedTemplate ? 'template_image' : 'color',
//           templateId  : selectedTemplate?._id,
//         } as never,
//         visibility,
//       })

//       // 2. Trigger render
//       await postsApi.triggerRender(postId)

//       // 3. Publish (or schedule)
//       return postsApi.publish(postId, scheduling ? scheduledAt : undefined)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['myPosts'] })
//       toast.success(scheduling ? 'Post scheduled! Image is rendering in the background.' : 'Published! Image is rendering...')
//       navigate(`/post/${postId}`)
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   return (
//     <Modal open onClose={onClose} title="Ready to publish?" size="sm">
//       <div className="p-6 flex flex-col gap-4">
//         {/* Preview */}
//         {previewUrl && (
//           <div className="rounded-2xl overflow-hidden border border-[#2E2E2E] max-h-48 flex items-center justify-center bg-[#0F0F0F]">
//             <img src={previewUrl} alt="Preview" className="max-h-48 object-contain" />
//           </div>
//         )}

//         <Select
//           label="Who can see this?"
//           value={visibility}
//           onChange={e => setVisibility(e.target.value as Visibility)}
//           options={[
//             { value: 'public',         label: '🌐 Public — Everyone'   },
//             { value: 'followers_only', label: '👥 Followers only'      },
//             { value: 'private',        label: '🔒 Private — Only me'   },
//           ]}
//         />

//         <label className="flex items-center gap-2 text-sm text-[#888]">
//           <input type="checkbox" checked={scheduling} onChange={e => setScheduling(e.target.checked)} className="accent-[#6C63FF]" />
//           Schedule for later
//         </label>

//         {scheduling && (
//           <input
//             type="datetime-local"
//             value={scheduledAt}
//             onChange={e => setScheduledAt(e.target.value)}
//             min={new Date().toISOString().slice(0, 16)}
//             className="w-full h-11 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl text-white px-4 outline-none focus:border-[#6C63FF]"
//           />
//         )}

//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button
//             className="flex-1"
//             icon={<Check className="w-4 h-4" />}
//             loading={publishMutation.isPending}
//             disabled={scheduling && !scheduledAt}
//             onClick={() => publishMutation.mutate()}
//           >
//             {scheduling ? 'Schedule' : 'Publish'}
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }















































import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Type, Image as ImageIcon, Smile, Palette, Undo2, Redo2,
  Trash2, Copy, ChevronUp, ChevronDown, X, Check, Eye,
  Square, RectangleVertical, RectangleHorizontal, Layers, Sparkles
} from 'lucide-react'
import { postsApi } from '../../api'
import { useCanvasEditor } from '../../hooks/useCanvasEditor'
import { TemplatePicker, StickerPicker } from '../../components/editor/Pickers'
import { TextToolbar, BackgroundPicker } from '../../components/editor/TextToolbar'
import { Button, Modal, Select, Spinner } from '../../components/ui'
import { cn, getErrorMessage } from '../../utils'
import type { Template, Visibility } from '../../types'
import toast from 'react-hot-toast'

type DrawerTab = 'templates' | 'text' | 'stickers' | 'background' | null

const ORIENTATIONS = {
  square    : { width: 1080, height: 1080, icon: Square },
  portrait  : { width: 1080, height: 1350, icon: RectangleVertical },
  landscape : { width: 1350, height: 1080, icon: RectangleHorizontal },
  story     : { width: 1080, height: 1920, icon: RectangleVertical },
} as const

export function CanvasEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [orientation, setOrientation] = useState<keyof typeof ORIENTATIONS>('square')
  const dims = ORIENTATIONS[orientation]

  const editor = useCanvasEditor(dims.width, dims.height)
  const [activeDrawer, setActiveDrawer]   = useState<DrawerTab>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  // Load existing post if editing
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', id, 'edit'],
    queryFn : () => postsApi.get(id!).then(r => r.data.data.post),
    enabled : !!id,
  })

  // Load saved canvas state once editor + post data are ready
  useEffect(() => {
    if (!editor.ready || canvasReady) return
    if (post?.canvasState?.fabricJson) {
      editor.loadFromJSON(post.canvasState.fabricJson as object)
    }
    setCanvasReady(true)
  }, [editor.ready, post, canvasReady])

  // ── Save draft (canvasState only, no render trigger needed every time) ──
  const saveDraftMutation = useMutation({
    mutationFn: () => {
      const fabricJson = editor.exportJSON()
      return postsApi.update(id!, {
        canvasState: {
          fabricJson,
          canvasWidth : dims.width,
          canvasHeight: dims.height,
          backgroundType: selectedTemplate ? 'template_image' : 'color',
          templateId  : selectedTemplate?._id,
        } as never,
      })
    },
    onSuccess: () => {
      toast.success('Draft saved! ✨')
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  // ── Select template → apply background ──────
  const handleTemplateSelect = useCallback(async (template: Template) => {
    setSelectedTemplate(template)
    await editor.setBackgroundImage(template.image.url)
    toast.success(`Applied: ${template.name}`)
  }, [editor])

  // ── Keyboard shortcuts ────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = document.activeElement
        if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
          editor.deleteSelected()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); editor.undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); editor.redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); editor.duplicateSelected() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [editor])

  if (postLoading) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      <p className="text-muted font-serif italic text-lg">Unfurling the canvas...</p>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-bg flex flex-col z-50 text-text">
      
      {/* ── Top bar ─────────────────────────────── */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/40 bg-bg/80 backdrop-blur-xl shrink-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 text-muted hover:text-text hover:bg-surface2 rounded-full transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 bg-surface2/50 p-1 rounded-full border border-border/30 shadow-inner">
          <button onClick={editor.undo} disabled={!editor.canUndo} className="p-2 rounded-full text-text hover:bg-surface disabled:text-muted/30 disabled:hover:bg-transparent transition-all">
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button onClick={editor.redo} disabled={!editor.canRedo} className="p-2 rounded-full text-text hover:bg-surface disabled:text-muted/30 disabled:hover:bg-transparent transition-all">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => saveDraftMutation.mutate()} 
            loading={saveDraftMutation.isPending}
            className="border-border/60 text-muted hover:text-text hover:border-border rounded-full hidden sm:flex"
          >
            Save Draft
          </Button>
          <Button 
            size="sm" 
            icon={<Eye className="w-4 h-4" />} 
            onClick={() => setShowPublishModal(true)}
            className="bg-primary text-bg hover:bg-primary-dark hover:gold-glow rounded-full font-bold shadow-md transition-all"
          >
            Preview & Publish
          </Button>
        </div>
      </div>

      {/* ── Orientation selector ────────────────── */}
      <div className="flex items-center justify-center gap-3 py-3 border-b border-border/30 bg-surface/30 shrink-0 shadow-sm z-10">
        {(Object.keys(ORIENTATIONS) as (keyof typeof ORIENTATIONS)[]).map(o => {
          const Icon = ORIENTATIONS[o].icon
          return (
            <button
              key={o}
              onClick={() => setOrientation(o)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border',
                orientation === o 
                  ? 'bg-primary text-bg border-primary shadow-sm scale-105' 
                  : 'text-muted hover:text-text border-transparent hover:border-border hover:bg-surface2'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{o}</span>
            </button>
          )
        })}
      </div>

      {/* ── Canvas area ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4 md:p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface via-bg to-bg relative">
        <div className="shadow-2xl ring-1 ring-border/50 rounded-lg overflow-hidden transition-all duration-500" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <canvas ref={editor.canvasElRef} className="rounded-lg" style={{ maxWidth: '80vw', maxHeight: '65vh' }} />
        </div>

        {/* ── Floating Object Toolbar (when selected) ──────── */}
        {editor.selectedObject && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 bg-surface2/95 backdrop-blur-md rounded-full border border-border/60 shadow-xl animate-slide-up z-20">
            <button onClick={editor.duplicateSelected} className="p-2.5 rounded-full text-muted hover:text-text hover:bg-surface transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button>
            <div className="w-px h-5 bg-border/50 mx-1" />
            <button onClick={editor.bringForward} className="p-2.5 rounded-full text-muted hover:text-text hover:bg-surface transition-colors" title="Bring Forward"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={editor.sendBackward} className="p-2.5 rounded-full text-muted hover:text-text hover:bg-surface transition-colors" title="Send Backward"><ChevronDown className="w-4 h-4" /></button>
            <div className="w-px h-5 bg-border/50 mx-1" />
            <button onClick={editor.deleteSelected} className="p-2.5 rounded-full text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* ── Text style toolbar (when text selected) ── */}
      {editor.selectedObject?.type === 'textbox' && (
        <div className="border-t border-border/40 bg-surface/80 backdrop-blur-md">
          <TextToolbar style={editor.textStyle} onChange={editor.updateTextStyle} />
        </div>
      )}

      {/* ── Bottom tool tabs ─────────────────────── */}
      <div className="flex items-center justify-around border-t border-border/50 pt-3 pb-safe-bottom bg-bg/90 backdrop-blur-xl shrink-0 relative z-30">
        {([
          { id: 'templates',  icon: Layers,    label: 'Themes' },
          { id: 'background', icon: Palette,   label: 'Backdrop' },
          { id: 'text',       icon: Type,      label: 'Add Text' },
          { id: 'stickers',   icon: Sparkles,  label: 'Elements' },
        ] as const).map(tab => {
          const isActive = activeDrawer === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'text') { editor.addText(); return }
                setActiveDrawer(isActive ? null : tab.id)
              }}
              className={cn(
                'flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-300',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted hover:text-text hover:bg-surface2'
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-bold tracking-widest uppercase">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Drawer (templates / stickers / background) ── */}
      {activeDrawer && activeDrawer !== 'text' && (
        <div className="absolute bottom-[72px] left-0 right-0 h-[45vh] bg-surface2/95 backdrop-blur-2xl border-t border-border/60 rounded-t-3xl p-5 flex flex-col animate-slide-up shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] z-20">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
            <h3 className="text-sm font-bold tracking-widest uppercase text-primary">{activeDrawer}</h3>
            <button onClick={() => setActiveDrawer(null)} className="p-1.5 bg-surface rounded-full text-muted hover:text-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeDrawer === 'templates' && (
              <TemplatePicker onSelect={handleTemplateSelect} selectedId={selectedTemplate?._id} />
            )}
            {activeDrawer === 'stickers' && (
              <StickerPicker onSelect={(url) => editor.addSticker(url)} />
            )}
            {activeDrawer === 'background' && (
              <BackgroundPicker
                onColorSelect={editor.setBackgroundColor}
                onGradientSelect={editor.setBackgroundGradient}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Publish modal ────────────────────────── */}
      {showPublishModal && (
        <PublishModal
          postId={id!}
          editor={editor}
          onClose={() => setShowPublishModal(false)}
          selectedTemplate={selectedTemplate}
          dims={dims}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  PUBLISH MODAL
// ─────────────────────────────────────────────

function PublishModal({ postId, editor, onClose, selectedTemplate, dims }: {
  postId: string
  editor: ReturnType<typeof useCanvasEditor>
  onClose: () => void
  selectedTemplate: Template | null
  dims: { width: number; height: number }
}) {
  const navigate     = useNavigate()
  const queryClient   = useQueryClient()
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [scheduling, setScheduling]  = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const previewUrl = editor.exportPNG(1)

  const publishMutation = useMutation({
    mutationFn: async () => {
      // 1. Save canvas state
      const fabricJson = editor.exportJSON()
      await postsApi.update(postId, {
        canvasState: {
          fabricJson,
          canvasWidth : dims.width,
          canvasHeight: dims.height,
          backgroundType: selectedTemplate ? 'template_image' : 'color',
          templateId  : selectedTemplate?._id,
        } as never,
        visibility,
      })

      // 2. Trigger render
      await postsApi.triggerRender(postId)

      // 3. Publish (or schedule)
      return postsApi.publish(postId, scheduling ? scheduledAt : undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
      toast.success(scheduling ? 'Scheduled successfully! ✨' : 'Published! Rendering artwork... 🎨')
      navigate(`/post/${postId}`)
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal open onClose={onClose} title="Finalize Masterpiece" size="sm">
      <div className="p-6 flex flex-col gap-6 bg-bg text-text rounded-b-2xl animate-slide-up">
        
        {/* Preview Area */}
        {previewUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-border/50 max-h-56 flex items-center justify-center bg-surface shadow-inner group">
            <img src={previewUrl} alt="Preview" className="max-h-56 object-contain group-hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        <div className="space-y-4">
          <Select
            label="Who can view this piece?"
            value={visibility}
            onChange={e => setVisibility(e.target.value as Visibility)}
            className="bg-surface2 border-border/50 font-medium"
            options={[
              { value: 'public',         label: '🌐 Public Showcase'   },
              { value: 'followers_only', label: '👥 Followers Only'      },
              { value: 'private',        label: '🔒 Private Collection'  },
            ]}
          />

          <div className="bg-surface2 p-4 rounded-xl border border-border/40 space-y-3">
            <label className="flex items-center gap-3 text-sm font-semibold text-text cursor-pointer">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={scheduling} 
                  onChange={e => setScheduling(e.target.checked)} 
                  className="peer sr-only" 
                />
                <div className="w-5 h-5 rounded border-2 border-border/60 peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-bg opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              Schedule for a later date
            </label>

            {scheduling && (
              <div className="animate-slide-up pt-1">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full h-11 bg-surface border border-border/50 rounded-lg text-text px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 border-border/50 text-text hover:bg-surface2 rounded-xl py-3.5" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary text-bg hover:bg-primary-dark rounded-xl py-3.5 font-bold shadow-lg hover:shadow-xl hover:gold-glow transition-all"
            icon={<Check className="w-4 h-4" />}
            loading={publishMutation.isPending}
            disabled={scheduling && !scheduledAt}
            onClick={() => publishMutation.mutate()}
          >
            {scheduling ? 'Schedule Post' : 'Publish Now'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}