import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Trash2, Plus, Image as ImageIcon, Smile, Type, Palette } from 'lucide-react'
import { templatesApi, assetsApi } from '../../api'
import { Button, Input, Select, Modal, Card, EmptyState, Spinner, Tabs } from '../../components/ui'
import { cn, getErrorMessage, driveImg } from '../../utils'
import type { Template, Asset } from '../../types'
import toast from 'react-hot-toast'


// export function TemplatesPage() {
//   const [tab, setTab] = useState('templates')

//   const tabs = [
//     { id: 'templates', label: 'Templates',  icon: <ImageIcon className="w-4 h-4" /> },
//     { id: 'stickers',  label: 'Stickers',   icon: <Smile className="w-4 h-4" />     },
//     { id: 'fonts',     label: 'Fonts',      icon: <Type className="w-4 h-4" />      },
//   ]

//   return (
//     <div>
//       <h1 className="text-xl font-bold text-white mb-6">Templates & Assets</h1>
//       <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />
//       {tab === 'templates' && <TemplatesList />}
//       {tab === 'stickers'  && <AssetsList assetType="sticker" />}
//       {tab === 'fonts'     && <AssetsList assetType="font"    />}
//     </div>
//   )
// }




export function TemplatesPage() {
  const [tab, setTab] = useState('templates')

  const tabs = [
    { id: 'templates', label: 'Templates',  icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'stickers',  label: 'Stickers',   icon: <Smile className="w-4 h-4" />     },
    { id: 'fonts',     label: 'Fonts',      icon: <Type className="w-4 h-4" />      },
  ]

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
            <Palette className="w-5 h-5 text-[#E60000]" />
          </div>
          Templates & Assets
        </h1>
      </div>
      
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-8" />
      
      {tab === 'templates' && <TemplatesList />}
      {tab === 'stickers'  && <AssetsList assetType="sticker" />}
      {tab === 'fonts'     && <AssetsList assetType="font"    />}
    </div>
  )
}




// ── Templates List ─────────────────────────────

function TemplatesList() {
  const [showUpload, setShowUpload] = useState(false)
  const [category, setCategory]     = useState('')
  const [orientation, setOrientation] = useState('')
  const [page, setPage]             = useState(1)
  const queryClient                  = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'templates', category, orientation, page],
    queryFn : () => templatesApi.list({ category: category || undefined, orientation: orientation || undefined, page, limit: 24 }).then(r => r.data.data),
  })


  console.log('template data ', data?.templates.length)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] })
      toast.success('Template deleted')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  const togglePremiumMutation = useMutation({
    mutationFn: ({ id, isPremium }: { id: string; isPremium: boolean }) => templatesApi.update(id, { isPremium }),
    onSuccess : () => queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] }),
  })


  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={category} onChange={e => setCategory(e.target.value)}
          options={[
            { value: '', label: 'All Categories' }, { value: 'sayari', label: 'Sayari' },
            { value: 'kavita', label: 'Kavita' }, { value: 'minimal', label: 'Minimal' },
            { value: 'dark', label: 'Dark' }, { value: 'romantic', label: 'Romantic' },
            { value: 'religious', label: 'Religious' }, { value: 'nature', label: 'Nature' },
          ]} className="w-44" />
        <Select value={orientation} onChange={e => setOrientation(e.target.value)}
          options={[
            { value: '', label: 'All Orientations' }, { value: 'square', label: 'Square' },
            { value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' },
            { value: 'story', label: 'Story' },
          ]} className="w-44" />
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowUpload(true)} className="ml-auto">
          Upload Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !data?.templates.length ? (
        <EmptyState icon="🎨" title="No templates yet" action={<Button onClick={() => setShowUpload(true)}>Upload First Template</Button>} />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {data.templates.map(t => (
            <TemplateCard
              key={t._id}
              template={t}
              onDelete={() => deleteMutation.mutate(t._id)}
              onTogglePremium={() => togglePremiumMutation.mutate({ id: t._id, isPremium: !t.isPremium })}
            />
          ))}
        </div>
      )}

      {data && (data.pagination as { pages: number }).pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-3 py-1.5 text-sm text-[#888]">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {showUpload && <UploadTemplateModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}

function TemplateCard({ template, onDelete, onTogglePremium }: {
  template: Template; onDelete: () => void; onTogglePremium: () => void
}) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl overflow-hidden group hover:border-[#3E3E3E] transition-colors">
      <div className="aspect-square relative overflow-hidden bg-[#0F0F0F]">
        {/* <img src={template.image.thumbnail} alt={template.name} className="w-full h-full object-cover" /> */}
        {/* <img src={driveImg(template.image.driveId)} alt={template.name} /> */}
        <img src={driveImg(template.image.driveId)} alt={template.name} className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={onDelete} className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {template.isPremium && (
          <span className="absolute top-2 right-2 text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">PRO</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-white truncate">{template.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-[#888] capitalize">{template.category} · {template.orientation}</span>
          <button onClick={onTogglePremium} className={cn('text-[10px] font-medium transition-colors', template.isPremium ? 'text-yellow-400 hover:text-yellow-600' : 'text-[#555] hover:text-yellow-400')}>
            {template.isPremium ? 'PRO' : 'Free'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Upload Template Modal ─────────────────────

function UploadTemplateModal({ onClose }: { onClose: () => void }) {
  const queryClient   = useQueryClient()
  const fileRef       = useRef<HTMLInputElement>(null)
  const [file, setFile]     = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [name, setName]         = useState('')
  const [category, setCategory] = useState('sayari')
  const [orientation, setOrientation] = useState('square')
  const [tags, setTags]         = useState('')
  const [isPremium, setIsPremium] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { toast.error('Select an image file'); return }
    if (f.size > 15 * 1024 * 1024) { toast.error('File must be under 15MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''))
  }

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected')
      const fd = new FormData()
      fd.append('image', file)
      fd.append('name', name)
      fd.append('category', category)
      fd.append('orientation', orientation)
      // fd.append('tags', tags)
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      fd.append('tags', JSON.stringify(tagsArray))
      fd.append('isPremium', String(isPremium))
      return templatesApi.upload(fd, setProgress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] })
      toast.success('Template uploaded!')
      onClose()
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal open onClose={onClose} title="Upload Template" size="md">
      <div className="p-6 flex flex-col gap-4">
        {/* File picker */}
        <button onClick={() => fileRef.current?.click()}
          className="aspect-video border-2 border-dashed border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors overflow-hidden relative">
          {preview
            ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#888]">
                <Upload className="w-6 h-6" />
                <span className="text-sm">Click to select image</span>
              </div>
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <Input label="Name" placeholder="Twilight Sayari" value={name} onChange={e => setName(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" value={category} onChange={e => setCategory(e.target.value)}
            options={[
              { value: 'sayari', label: 'Sayari' }, { value: 'kavita', label: 'Kavita' },
              { value: 'minimal', label: 'Minimal' }, { value: 'dark', label: 'Dark' },
              { value: 'romantic', label: 'Romantic' }, { value: 'religious', label: 'Religious' },
              { value: 'festival', label: 'Festival' }, { value: 'nature', label: 'Nature' },
            ]} />
          <Select label="Orientation" value={orientation} onChange={e => setOrientation(e.target.value)}
            options={[
              { value: 'square', label: 'Square (1:1)' }, { value: 'portrait', label: 'Portrait (4:5)' },
              { value: 'landscape', label: 'Landscape (5:4)' }, { value: 'story', label: 'Story (9:16)' },
            ]} />
        </div>

        <Input label="Tags (comma separated)" placeholder="dark, night, stars, urdu" value={tags} onChange={e => setTags(e.target.value)} />

        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="accent-yellow-500 w-4 h-4" />
          Premium only (requires subscription)
        </label>

        {uploadMutation.isPending && (
          <div className="h-2 bg-[#242424] rounded-full overflow-hidden">
            <div className="h-full bg-[#6C63FF] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" icon={<Upload className="w-4 h-4" />} disabled={!file || !name}
            loading={uploadMutation.isPending} onClick={() => uploadMutation.mutate()}>
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Assets List (Stickers / Fonts) ─────────────

function AssetsList({ assetType }: { assetType: 'sticker' | 'font' }) {
  const [showUpload, setShowUpload] = useState(false)
  const [category, setCategory]     = useState('')
  const queryClient                 = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'assets', assetType, category],
    queryFn : () => assetsApi.list({ assetType, category: category || undefined, limit: 40 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'assets'] })
      toast.success('Asset deleted')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <Input placeholder={`Search ${assetType}s...`} className="flex-1" onChange={() => {}} />
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowUpload(true)}>
          Upload {assetType === 'sticker' ? 'Sticker' : 'Font'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !data?.assets.length ? (
        <EmptyState icon={assetType === 'sticker' ? '🎨' : '✍️'} title={`No ${assetType}s yet`} action={<Button onClick={() => setShowUpload(true)}>Upload First</Button>} />
      ) : assetType === 'sticker' ? (
        <div className="grid grid-cols-6 gap-3">
          {data.assets.map(a => (
            <div key={a._id} className="group relative aspect-square bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-2 flex items-center justify-center">
              {/* <img src={a.file.thumbnail || a.file.url} alt={a.name} className="max-w-full max-h-full object-contain" /> */}
              <img src={driveImg(a.file.driveId)} alt={a.name} className="max-w-full max-h-full object-contain" />

              <button onClick={() => deleteMutation.mutate(a._id)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center text-white hidden group-hover:flex">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.assets.map(a => (
            <div key={a._id} className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">{a.name}</p>
                {a.fontMeta && (
                  <p style={{ fontFamily: a.fontMeta.fontFamily }} className="text-lg text-[#ccc] mt-1">
                    {a.fontMeta.previewText || 'نمونہ متن — Sample'}
                  </p>
                )}
                <div className="flex gap-2 mt-1">
                  {a.fontMeta?.supportsUrdu && <span className="text-[10px] bg-[#6C63FF]/20 text-[#6C63FF] px-1.5 py-0.5 rounded">Urdu</span>}
                  {a.fontMeta?.supportsHindi && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Hindi</span>}
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(a._id)} className="p-2 text-[#888] hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUpload && <UploadAssetModal assetType={assetType} onClose={() => setShowUpload(false)} />}
    </div>
  )
}

// ── Upload Asset Modal ─────────────────────────

function UploadAssetModal({ assetType, onClose }: { assetType: 'sticker' | 'font'; onClose: () => void }) {
  const queryClient = useQueryClient()
  const fileRef     = useRef<HTMLInputElement>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [name, setName]       = useState('')
  const [category, setCategory] = useState('general')
  const [tags, setTags]       = useState('')
  const [fontFamily, setFontFamily] = useState('')
  const [supportsUrdu, setSupportsUrdu]   = useState(false)
  const [supportsHindi, setSupportsHindi] = useState(false)
  const [previewText, setPreviewText]     = useState('')
  const [progress, setProgress] = useState(0)

  const accept = assetType === 'sticker' ? 'image/*' : '.ttf,.otf,.woff,.woff2'

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('name', name)
      fd.append('assetType', assetType)
      fd.append('category', category)
      // fd.append('tags', tags)
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      fd.append('tags', JSON.stringify(tagsArray))
      if (assetType === 'font') {
        fd.append('fontFamily', fontFamily)
        fd.append('supportsUrdu', String(supportsUrdu))
        fd.append('supportsHindi', String(supportsHindi))
        fd.append('previewText', previewText)
      }
      return assetsApi.upload(fd, setProgress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'assets'] })
      toast.success(`${assetType} uploaded!`)
      onClose()
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal open onClose={onClose} title={`Upload ${assetType === 'sticker' ? 'Sticker' : 'Font'}`} size="md">
      <div className="p-6 flex flex-col gap-4">
        <button onClick={() => fileRef.current?.click()}
          className="h-24 border-2 border-dashed border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors flex items-center justify-center gap-3 text-[#888]">
          <Upload className="w-5 h-5" />
          <span className="text-sm">{file ? file.name : `Select ${assetType} file`}</span>
        </button>
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!name) setName(f.name.replace(/\.[^.]+$/, '')) } }} />

        <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />

        {assetType === 'font' && (
          <>
            <Input label="CSS Font Family Name" placeholder="Noto Nastaliq Urdu" value={fontFamily} onChange={e => setFontFamily(e.target.value)} />
            <Input label="Preview Text" placeholder="نمونہ متن — Sample Text" value={previewText} onChange={e => setPreviewText(e.target.value)} />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" checked={supportsUrdu} onChange={e => setSupportsUrdu(e.target.checked)} className="accent-[#6C63FF]" />
                Supports Urdu
              </label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" checked={supportsHindi} onChange={e => setSupportsHindi(e.target.checked)} className="accent-[#6C63FF]" />
                Supports Hindi
              </label>
            </div>
          </>
        )}

        {uploadMutation.isPending && (
          <div className="h-2 bg-[#242424] rounded-full overflow-hidden">
            <div className="h-full bg-[#6C63FF] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!file || !name} loading={uploadMutation.isPending} onClick={() => uploadMutation.mutate()}>
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  )
}
