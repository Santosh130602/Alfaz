// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { Image, Music, X, Upload, FileText } from 'lucide-react'
// import { useUiStore } from '../../store/index'
// import { postsApi } from '../../api'
// import { Modal, Button, Input, Textarea, Select } from '../ui'
// import { getErrorMessage } from '../../utils'
// import type { PostType, Language, Visibility } from '../../types'
// import toast from 'react-hot-toast'

// // ─────────────────────────────────────────────
// //  POST CREATE MODAL
// //  Phase 1: basic metadata entry (title, type, tags, visibility)
// //  → creates a draft post and routes to the dedicated editor
// //  Phase 2 will replace the "image" flow with the full Fabric.js
// //  canvas editor; Phase 4 will replace "audio" with the uploader
// // ─────────────────────────────────────────────

// export function PostCreateModal() {
//   const { postModalOpen, postModalType, closePostModal } = useUiStore()
//   const navigate    = useNavigate()
//   const queryClient = useQueryClient()

//   const [type, setType]       = useState<PostType>('sayari')
//   const [title, setTitle]     = useState('')
//   const [language, setLanguage] = useState<Language>('hi')
//   const [genre, setGenre]     = useState('')
//   const [tags, setTags]       = useState('')
//   const [visibility, setVisibility] = useState<Visibility>('public')

//   const isAudio = postModalType === 'audio'

//   const createMutation = useMutation({
//     mutationFn: () => postsApi.create({
//       type      : isAudio ? 'audio' : type,
//       title     : title || undefined,
//       language,
//       genre     : genre || undefined,
//       tags      : tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
//       visibility,
//     }),
//     onSuccess: (res) => {
//       const post = res.data.data.post
//       queryClient.invalidateQueries({ queryKey: ['myPosts'] })
//       closePostModal()
//       resetForm()
//       toast.success('Draft created!')
//       // Route to the appropriate editor (built out fully in Phase 2/4)
//       navigate(isAudio ? `/post/${post._id}/upload-audio` : `/post/${post._id}/edit`)
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })


//   console.log("POST")

//   const resetForm = () => {
//     setTitle(''); setGenre(''); setTags(''); setVisibility('public'); setType('sayari')
//   }

//   const handleClose = () => { closePostModal(); resetForm() }

//   if (!postModalOpen) return null

//   return (
//     <Modal open={postModalOpen} onClose={handleClose} title={isAudio ? '🎙️ New Audio Post' : '✨ New Post'} size="md">
//       <div className="p-6 flex flex-col gap-4">

//         {!isAudio && (
//           <div>
//             <label className="text-sm text-[#888] font-medium mb-2 block">Post Type</label>
//             <div className="grid grid-cols-3 gap-2">
//               {([
//                 { v: 'sayari', l: '📝 Sayari' }, { v: 'kavita', l: '🌸 Kavita' },
//                 { v: 'ghazal', l: '🎭 Ghazal' }, { v: 'nazm',   l: '🕊️ Nazm'   },
//                 { v: 'quote',  l: '💬 Quote'  }, { v: 'shayari',l: '✒️ Shayari' },
//               ] as const).map(t => (
//                 <button
//                   key={t.v}
//                   onClick={() => setType(t.v)}
//                   className={`py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
//                     type === t.v ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]' : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                   }`}
//                 >
//                   {t.l}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         <Input
//           label="Title (optional)"
//           placeholder={isAudio ? 'Audio title...' : 'Give your post a title...'}
//           value={title}
//           onChange={e => setTitle(e.target.value)}
//         />

//         <div className="grid grid-cols-2 gap-3">
//           <Select
//             label="Language"
//             value={language}
//             onChange={e => setLanguage(e.target.value as Language)}
//             options={[
//               { value: 'hi', label: 'हिंदी' }, { value: 'ur', label: 'اردو' },
//               { value: 'en', label: 'English' }, { value: 'mixed', label: 'Mixed' },
//             ]}
//           />
//           <Select
//             label="Visibility"
//             value={visibility}
//             onChange={e => setVisibility(e.target.value as Visibility)}
//             options={[
//               { value: 'public', label: '🌐 Public' },
//               { value: 'private', label: '🔒 Private' },
//               { value: 'followers_only', label: '👥 Followers' },
//             ]}
//           />
//         </div>

//         <Input
//           label="Tags (comma separated)"
//           placeholder="mohabbat, dard, ishq"
//           value={tags}
//           onChange={e => setTags(e.target.value)}
//         />

//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
//           <Button
//             className="flex-1"
//             icon={isAudio ? <Music className="w-4 h-4" /> : <Image className="w-4 h-4" />}
//             loading={createMutation.isPending}
//             onClick={() => createMutation.mutate()}
//           >
//             {isAudio ? 'Continue to Upload' : 'Continue to Editor'}
//           </Button>
//         </div>

//         <p className="text-xs text-[#555] text-center">
//           {isAudio
//             ? "Next: upload your audio file and cover image"
//             : "Next: design your post on the canvas editor"}
//         </p>
//       </div>
//     </Modal>
//   )
// }





// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { Image, Music, X, Upload, FileText } from 'lucide-react'
// import { useUiStore } from '../../store/index'
// import { postsApi } from '../../api'
// import { Modal, Button, Input, Textarea, Select } from '../ui'
// import { getErrorMessage } from '../../utils'
// import type { PostType, Language, Visibility } from '../../types'
// import toast from 'react-hot-toast'

// // ✅ Define moods matching the backend model
// const AVAILABLE_MOODS = [
//   { value: 'ishq', label: '💕 Ishq (Love)' },
//   { value: 'dard', label: '💔 Dard (Pain)' },
//   { value: 'khushi', label: '😊 Khushi (Happiness)' },
//   { value: 'udaasi', label: '😢 Udaasi (Sadness)' },
//   { value: 'gussa', label: '😠 Gussa (Anger)' },
//   { value: 'ummeed', label: '🌟 Ummeed (Hope)' },
//   { value: 'motivational', label: '💪 Motivational' },
//   { value: 'romantic', label: '🌹 Romantic' },
//   { value: 'funny', label: '😂 Funny' },
//   { value: 'religious', label: '🕌 Religious' },
//   { value: 'patriotic', label: '🇮🇳 Patriotic' },
//   { value: 'nature', label: '🌿 Nature' },
// ]

// export function PostCreateModal() {
//   const { postModalOpen, postModalType, closePostModal } = useUiStore()
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()

//   const [type, setType] = useState<PostType>('sayari')
//   const [title, setTitle] = useState('')
//   const [language, setLanguage] = useState<Language>('hi')
//   const [genre, setGenre] = useState('')
//   const [tags, setTags] = useState('')
//   const [selectedMoods, setSelectedMoods] = useState<string[]>([])  // ← Array for multiple moods
//   const [visibility, setVisibility] = useState<Visibility>('public')

//   const isAudio = postModalType === 'audio'

//   // Helper function to convert comma-separated string to array
//   const stringToArray = (str: string): string[] => {
//     return str ? str.split(',').map(item => item.trim()).filter(Boolean) : []
//   }

//   // ✅ Handle mood selection
//   const toggleMood = (mood: string) => {
//     setSelectedMoods(prev =>
//       prev.includes(mood)
//         ? prev.filter(m => m !== mood)
//         : [...prev, mood]
//     )
//   }

//   const createMutation = useMutation({
//     mutationFn: () => postsApi.create({
//       type: isAudio ? 'audio' : type,
//       title: title || undefined,
//       language,
//       genre: genre || undefined,
//       tags: stringToArray(tags),
//       mood: selectedMoods,  // ← Send as array
//       visibility,
//     }),
//     onSuccess: (res) => {
//       const post = res.data.data.post
//       queryClient.invalidateQueries({ queryKey: ['myPosts'] })
//       closePostModal()
//       resetForm()
//       toast.success('Draft created!')
//       navigate(isAudio ? `/post/${post._id}/upload-audio` : `/post/${post._id}/edit`)
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   const resetForm = () => {
//     setTitle('')
//     setGenre('')
//     setTags('')
//     setSelectedMoods([])  // ← Reset moods
//     setVisibility('public')
//     setType('sayari')
//   }

//   const handleClose = () => { closePostModal(); resetForm() }

//   if (!postModalOpen) return null

//   return (
//     <Modal open={postModalOpen} onClose={handleClose} title={isAudio ? '🎙️ New Audio Post' : '✨ New Post'} size="md">
//       <div className="p-6 flex flex-col gap-4">

//         {!isAudio && (
//           <div>
//             <label className="text-sm text-[#888] font-medium mb-2 block">Post Type</label>
//             <div className="grid grid-cols-3 gap-2">
//               {([
//                 { v: 'sayari', l: '📝 Sayari' }, { v: 'kavita', l: '🌸 Kavita' },
//                 { v: 'ghazal', l: '🎭 Ghazal' }, { v: 'nazm', l: '🕊️ Nazm' },
//                 { v: 'quote', l: '💬 Quote' }, { v: 'shayari', l: '✒️ Shayari' },
//               ] as const).map(t => (
//                 <button
//                   key={t.v}
//                   onClick={() => setType(t.v)}
//                   className={`py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
//                     type === t.v ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]' : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                   }`}
//                 >
//                   {t.l}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         <Input
//           label="Title (optional)"
//           placeholder={isAudio ? 'Audio title...' : 'Give your post a title...'}
//           value={title}
//           onChange={e => setTitle(e.target.value)}
//         />

//         <div className="grid grid-cols-2 gap-3">
//           <Select
//             label="Language"
//             value={language}
//             onChange={e => setLanguage(e.target.value as Language)}
//             options={[
//               { value: 'hi', label: 'हिंदी' },
//               { value: 'ur', label: 'اردو' },
//               { value: 'en', label: 'English' },
//               { value: 'pa', label: 'ਪੰਜਾਬੀ' },
//               { value: 'mixed', label: 'Mixed' },
//             ]}
//           />
//           <Select
//             label="Visibility"
//             value={visibility}
//             onChange={e => setVisibility(e.target.value as Visibility)}
//             options={[
//               { value: 'public', label: '🌐 Public' },
//               { value: 'private', label: '🔒 Private' },
//               { value: 'followers_only', label: '👥 Followers' },
//             ]}
//           />
//         </div>

//         <Input
//           label="Tags (comma separated)"
//           placeholder="mohabbat, dard, ishq"
//           value={tags}
//           onChange={e => setTags(e.target.value)}
//         />

//         {/* ✅ Mood Selection - Multi-select chips */}
//         <div>
//           <label className="text-sm text-[#888] font-medium mb-2 block">
//             Mood (select one or more)
//           </label>
//           <div className="flex flex-wrap gap-2">
//             {AVAILABLE_MOODS.map((mood) => (
//               <button
//                 key={mood.value}
//                 onClick={() => toggleMood(mood.value)}
//                 className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
//                   selectedMoods.includes(mood.value)
//                     ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
//                     : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                 }`}
//               >
//                 {mood.label}
//               </button>
//             ))}
//           </div>
//           {selectedMoods.length > 0 && (
//             <p className="text-xs text-[#555] mt-2">
//               Selected: {selectedMoods.join(', ')}
//             </p>
//           )}
//         </div>

//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={handleClose}>
//             Cancel
//           </Button>
//           <Button
//             className="flex-1"
//             icon={isAudio ? <Music className="w-4 h-4" /> : <Image className="w-4 h-4" />}
//             loading={createMutation.isPending}
//             onClick={() => createMutation.mutate()}
//           >
//             {isAudio ? 'Continue to Upload' : 'Continue to Editor'}
//           </Button>
//         </div>

//         <p className="text-xs text-[#555] text-center">
//           {isAudio
//             ? "Next: upload your audio file and cover image"
//             : "Next: design your post on the canvas editor"}
//         </p>
//       </div>
//     </Modal>
//   )
// }




// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { Image, Music } from 'lucide-react'
// import { useUiStore } from '../../store/index'
// import { postsApi, creatorApi } from '../../api'
// import { Modal, Button, Input, Select } from '../ui'
// import { getErrorMessage } from '../../utils'
// import type { PostType, Language, Visibility } from '../../types'
// import toast from 'react-hot-toast'

// // ✅ Simple interface for profile response
// interface UserProfileResponse {
//   data: {
//     user: {
//       _id: string
//       channel: {
//         _id: string
//         name: string
//         handle: string
//         isVerified: boolean
//         logo?: {
//           url: string | null
//           driveId: string | null
//           thumbnail: string | null
//         }
//         stats?: {
//           followersCount: number
//           postsCount: number
//           seriesCount: number
//           audioCount: number
//           totalViews: number
//           totalLikes: number
//         }
//       }
//     }
//   }
// }

// // ✅ Define moods matching the backend model
// const AVAILABLE_MOODS = [
//   { value: 'ishq', label: '💕 Ishq (Love)' },
//   { value: 'dard', label: '💔 Dard (Pain)' },
//   { value: 'khushi', label: '😊 Khushi (Happiness)' },
//   { value: 'udaasi', label: '😢 Udaasi (Sadness)' },
//   { value: 'gussa', label: '😠 Gussa (Anger)' },
//   { value: 'ummeed', label: '🌟 Ummeed (Hope)' },
//   { value: 'motivational', label: '💪 Motivational' },
//   { value: 'romantic', label: '🌹 Romantic' },
//   { value: 'funny', label: '😂 Funny' },
//   { value: 'religious', label: '🕌 Religious' },
//   { value: 'patriotic', label: '🇮🇳 Patriotic' },
//   { value: 'nature', label: '🌿 Nature' },
// ]

// export function PostCreateModal() {
//   const { postModalOpen, postModalType, closePostModal } = useUiStore()
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()

//   const [type, setType] = useState<PostType>('sayari')
//   const [title, setTitle] = useState('')
//   const [language, setLanguage] = useState<Language>('hi')
//   const [genre, setGenre] = useState('')
//   const [tags, setTags] = useState('')
//   const [selectedMoods, setSelectedMoods] = useState<string[]>([])
//   const [visibility, setVisibility] = useState<Visibility>('public')
//   const [channelId, setChannelId] = useState<string | null>(null)

//   const isAudio = postModalType === 'audio'

//   // ✅ Fetch user profile to get channel ID
//   const { 
//     data: userData, 
//     isLoading: isLoadingUser, 
//     isError: isUserError, 
//     refetch: refetchUser 
//   } = useQuery({
//     queryKey: ['userProfile', 'channel'],
//     queryFn: () => creatorApi.getMyProfile(),
//     enabled: postModalOpen,
//     retry: 1,
//   })

//   // ✅ Set channel ID when user data loads
//   useEffect(() => {
//     const profile = userData as UserProfileResponse | undefined
//     // const channelId = profile?.data?.user?.channel?._id
    
//     if (channelId) {
//       setChannelId(channelId)
//       console.log('✅ Channel ID loaded from profile:', channelId)
//     } else if (userData && !channelId) {
//       console.warn('⚠️ User has no channel')
//     }
//   }, [userData])


//   // ✅ Add this right after the useQuery


//   // Helper function to convert comma-separated string to array
//   const stringToArray = (str: string): string[] => {
//     return str ? str.split(',').map(item => item.trim()).filter(Boolean) : []
//   }

//   // ✅ Handle mood selection
//   const toggleMood = (mood: string) => {
//     setSelectedMoods(prev =>
//       prev.includes(mood)
//         ? prev.filter(m => m !== mood)
//         : [...prev, mood]
//     )
//   }

//   // ✅ Create mutation with channel ID
//   const createMutation = useMutation({
//     mutationFn: () => {
//       if (!channelId) {
//         toast.error('No channel found. Please create a channel first.')
//         throw new Error('No channel found')
//       }

//       console.log('📝 Creating post with channel:', channelId)
      
//       return postsApi.create({
//         channelId: channelId,
//         type: isAudio ? 'audio' : type,
//         title: title || undefined,
//         language,
//         genre: genre || undefined,
//         tags: stringToArray(tags),
//         mood: selectedMoods,
//         visibility,
//       })
//     },
//     onSuccess: (res) => {
//       const post = res.data.data.post
//       queryClient.invalidateQueries({ queryKey: ['myPosts'] })
//       closePostModal()
//       resetForm()
//       toast.success('Draft created! 🎉')
//       navigate(isAudio ? `/post/${post._id}/upload-audio` : `/post/${post._id}/edit`)
//     },
//     onError: (err) => {
//       console.error('❌ Post creation error:', err)
//       toast.error(getErrorMessage(err))
//     },
//   })

//   const resetForm = () => {
//     setTitle('')
//     setGenre('')
//     setTags('')
//     setSelectedMoods([])
//     setVisibility('public')
//     setType('sayari')
//   }

//   const handleClose = () => {
//     closePostModal()
//     resetForm()
//     setChannelId(null)
//   }

//   if (!postModalOpen) return null

//   return (
//     <Modal 
//       open={postModalOpen} 
//       onClose={handleClose} 
//       title={isAudio ? '🎙️ New Audio Post' : '✨ New Post'} 
//       size="md"
//     >
//       <div className="p-6 flex flex-col gap-4">
//         {isLoadingUser ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF] mx-auto mb-3"></div>
//             <p className="text-[#888]">Loading your profile...</p>
//           </div>
//         ) : isUserError ? (
//           <div className="text-center py-8">
//             <p className="text-red-500">Failed to load profile.</p>
//             <button
//               onClick={() => refetchUser()}
//               className="mt-2 text-[#6C63FF] hover:underline text-sm"
//             >
//               Retry
//             </button>
//           </div>
//         ) : (
//           <>
//             {!isAudio && (
//               <div>
//                 <label className="text-sm text-[#888] font-medium mb-2 block">Post Type</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {([
//                     { v: 'sayari', l: '📝 Sayari' },
//                     { v: 'kavita', l: '🌸 Kavita' },
//                     { v: 'ghazal', l: '🎭 Ghazal' },
//                     { v: 'nazm', l: '🕊️ Nazm' },
//                     { v: 'quote', l: '💬 Quote' },
//                     { v: 'shayari', l: '✒️ Shayari' },
//                   ] as const).map((t) => (
//                     <button
//                       key={t.v}
//                       onClick={() => setType(t.v)}
//                       className={`py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
//                         type === t.v
//                           ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
//                           : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                       }`}
//                     >
//                       {t.l}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <Input
//               label="Title (optional)"
//               placeholder={isAudio ? 'Audio title...' : 'Give your post a title...'}
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />

//             <div className="grid grid-cols-2 gap-3">
//               <Select
//                 label="Language"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value as Language)}
//                 options={[
//                   { value: 'hi', label: 'हिंदी' },
//                   { value: 'ur', label: 'اردو' },
//                   { value: 'en', label: 'English' },
//                   { value: 'pa', label: 'ਪੰਜਾਬੀ' },
//                   { value: 'mixed', label: 'Mixed' },
//                 ]}
//               />
//               <Select
//                 label="Visibility"
//                 value={visibility}
//                 onChange={(e) => setVisibility(e.target.value as Visibility)}
//                 options={[
//                   { value: 'public', label: '🌐 Public' },
//                   { value: 'private', label: '🔒 Private' },
//                   { value: 'followers_only', label: '👥 Followers' },
//                 ]}
//               />
//             </div>

//             <Input
//               label="Tags (comma separated)"
//               placeholder="mohabbat, dard, ishq"
//               value={tags}
//               onChange={(e) => setTags(e.target.value)}
//             />

//             {/* Mood Selection - Multi-select chips */}
//             <div>
//               <label className="text-sm text-[#888] font-medium mb-2 block">
//                 Mood (select one or more)
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {AVAILABLE_MOODS.map((mood) => (
//                   <button
//                     key={mood.value}
//                     onClick={() => toggleMood(mood.value)}
//                     className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
//                       selectedMoods.includes(mood.value)
//                         ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
//                         : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                     }`}
//                   >
//                     {mood.label}
//                   </button>
//                 ))}
//               </div>
//               {selectedMoods.length > 0 && (
//                 <p className="text-xs text-[#555] mt-2">
//                   Selected: {selectedMoods.join(', ')}
//                 </p>
//               )}
//             </div>

//             {/* Show channel info if available */}
//             {(channelId || userData) && (
//               <div className="text-xs text-[#555] bg-[#1A1A1A] p-2 rounded-lg">
//                 {channelId ? (
//                   <>
//                     <p>📢 Channel: <span className="text-white">
//                       {(userData as UserProfileResponse)?.data?.user?.channel?.name || 'My Channel'}
//                     </span></p>
//                     <p>🔗 Handle: @{(userData as UserProfileResponse)?.data?.user?.channel?.handle || 'myhandle'}</p>
//                   </>
//                 ) : (
//                   <p className="text-yellow-500">⚠️ No channel found. Please create a channel.</p>
//                 )}
//               </div>
//             )}

//             <div className="flex gap-3 mt-2">
//               <Button variant="outline" className="flex-1" onClick={handleClose}>
//                 Cancel
//               </Button>
//               <Button
//                 className="flex-1"
//                 icon={isAudio ? <Music className="w-4 h-4" /> : <Image className="w-4 h-4" />}
//                 loading={createMutation.isPending}
//                 onClick={() => createMutation.mutate()}
//                 disabled={!channelId || isLoadingUser}
//               >
//                 {!channelId ? 'Loading...' : isAudio ? 'Continue to Upload' : 'Continue to Editor'}
//               </Button>
//             </div>

//             {!channelId && !isLoadingUser && (
//               <p className="text-xs text-red-500 text-center">
//                 No channel found. Please create a channel first.
//               </p>
//             )}
//           </>
//         )}
//       </div>
//     </Modal>
//   )
// }












// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { Image, Music } from 'lucide-react'
// import { useUiStore } from '../../store/index'
// import { postsApi, creatorApi } from '../../api'
// import { Modal, Button, Input, Select } from '../ui'
// import { getErrorMessage } from '../../utils'
// import type { PostType, Language, Visibility } from '../../types'
// import toast from 'react-hot-toast'

// // ✅ Define moods matching the backend model
// const AVAILABLE_MOODS = [
//   { value: 'ishq', label: '💕 Ishq (Love)' },
//   { value: 'dard', label: '💔 Dard (Pain)' },
//   { value: 'khushi', label: '😊 Khushi (Happiness)' },
//   { value: 'udaasi', label: '😢 Udaasi (Sadness)' },
//   { value: 'gussa', label: '😠 Gussa (Anger)' },
//   { value: 'ummeed', label: '🌟 Ummeed (Hope)' },
//   { value: 'motivational', label: '💪 Motivational' },
//   { value: 'romantic', label: '🌹 Romantic' },
//   { value: 'funny', label: '😂 Funny' },
//   { value: 'religious', label: '🕌 Religious' },
//   { value: 'patriotic', label: '🇮🇳 Patriotic' },
//   { value: 'nature', label: '🌿 Nature' },
// ]

// export function PostCreateModal() {
//   const { postModalOpen, postModalType, closePostModal } = useUiStore()
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()

//   const [type, setType] = useState<PostType>('sayari')
//   const [title, setTitle] = useState('')
//   const [language, setLanguage] = useState<Language>('hi')
//   const [genre, setGenre] = useState('')
//   const [tags, setTags] = useState('')
//   const [selectedMoods, setSelectedMoods] = useState<string[]>([])
//   const [visibility, setVisibility] = useState<Visibility>('public')
//   const [channelId, setChannelId] = useState<string | null>(null)

//   const isAudio = postModalType === 'audio'

//   // ✅ Fetch user profile
//   const { data: userData, isLoading: isLoadingUser, isError: isUserError, refetch: refetchUser } = useQuery({
//     queryKey: ['userProfile', 'channel'],
//     queryFn: () => creatorApi.getMyProfile(),
//     enabled: postModalOpen,
//     retry: 1,
//   })

//   // ✅ Debug: Log the data structure
//   console.log('📊 userData:', userData)
//   console.log('📊 userData?.data:', userData?.data)
//   console.log('📊 userData?.data?.data:', userData?.data?.data)
//   console.log('📊 userData?.data?.data?.user:', userData?.data?.data?.user)
//   console.log('📊 userData?.data?.data?.user?.channel:', userData?.data?.data?.user?.channel)

//   // ✅ Set channel ID when user data loads - USING CORRECT PATH!
//   useEffect(() => {
//     if (userData) {
//       // ✅ CORRECT: Double 'data' because API wraps response
//       const channelId = userData?.data?.data?.user?.channel?._id
//       console.log('🔍 Extracted channelId:', channelId)
      
//       if (channelId) {
//         setChannelId(channelId)
//         console.log('✅ Channel ID loaded:', channelId)
//       } else {
//         console.warn('⚠️ No channel ID found in userData')
//       }
//     }
//   }, [userData])

//   // Helper function to convert comma-separated string to array
//   const stringToArray = (str: string): string[] => {
//     return str ? str.split(',').map(item => item.trim()).filter(Boolean) : []
//   }

//   const toggleMood = (mood: string) => {
//     setSelectedMoods(prev =>
//       prev.includes(mood)
//         ? prev.filter(m => m !== mood)
//         : [...prev, mood]
//     )
//   }

//   const createMutation = useMutation({
//     mutationFn: () => {
//       if (!channelId) {
//         console.error('❌ No channelId available!')
//         toast.error('No channel found. Please create a channel first.')
//         throw new Error('No channel found')
//       }

//       console.log('📝 Creating post with channel:', channelId)
      
//       return postsApi.create({
//         channelId: channelId,
//         type: isAudio ? 'audio' : type,
//         title: title || undefined,
//         language,
//         genre: genre || undefined,
//         tags: stringToArray(tags),
//         mood: selectedMoods,
//         visibility,
//       })
//     },
//     onSuccess: (res) => {
//       const post = res.data.data.post
//       queryClient.invalidateQueries({ queryKey: ['myPosts'] })
//       closePostModal()
//       resetForm()
//       toast.success('Draft created! 🎉')
//       navigate(isAudio ? `/post/${post._id}/upload-audio` : `/post/${post._id}/edit`)
//     },
//     onError: (err) => {
//       console.error('❌ Post creation error:', err)
//       toast.error(getErrorMessage(err))
//     },
//   })

//   const resetForm = () => {
//     setTitle('')
//     setGenre('')
//     setTags('')
//     setSelectedMoods([])
//     setVisibility('public')
//     setType('sayari')
//   }

//   const handleClose = () => {
//     closePostModal()
//     resetForm()
//     setChannelId(null)
//   }

//   if (!postModalOpen) return null

//   return (
//     <Modal 
//       open={postModalOpen} 
//       onClose={handleClose} 
//       title={isAudio ? '🎙️ New Audio Post' : '✨ New Post'} 
//       size="md"
//     >
//       <div className="p-6 flex flex-col gap-4">
//         {isLoadingUser ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF] mx-auto mb-3"></div>
//             <p className="text-[#888]">Loading your profile...</p>
//           </div>
//         ) : isUserError ? (
//           <div className="text-center py-8">
//             <p className="text-red-500">Failed to load profile.</p>
//             <button
//               onClick={() => refetchUser()}
//               className="mt-2 text-[#6C63FF] hover:underline text-sm"
//             >
//               Retry
//             </button>
//           </div>
//         ) : (
//           <>
//             {!isAudio && (
//               <div>
//                 <label className="text-sm text-[#888] font-medium mb-2 block">Post Type</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {([
//                     { v: 'sayari', l: '📝 Sayari' },
//                     { v: 'kavita', l: '🌸 Kavita' },
//                     { v: 'ghazal', l: '🎭 Ghazal' },
//                     { v: 'nazm', l: '🕊️ Nazm' },
//                     { v: 'quote', l: '💬 Quote' },
//                     { v: 'shayari', l: '✒️ Shayari' },
//                   ] as const).map((t) => (
//                     <button
//                       key={t.v}
//                       onClick={() => setType(t.v)}
//                       className={`py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
//                         type === t.v
//                           ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
//                           : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                       }`}
//                     >
//                       {t.l}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <Input
//               label="Title (optional)"
//               placeholder={isAudio ? 'Audio title...' : 'Give your post a title...'}
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />

//             <div className="grid grid-cols-2 gap-3">
//               <Select
//                 label="Language"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value as Language)}
//                 options={[
//                   { value: 'hi', label: 'हिंदी' },
//                   { value: 'ur', label: 'اردو' },
//                   { value: 'en', label: 'English' },
//                   { value: 'pa', label: 'ਪੰਜਾਬੀ' },
//                   { value: 'mixed', label: 'Mixed' },
//                 ]}
//               />
//               <Select
//                 label="Visibility"
//                 value={visibility}
//                 onChange={(e) => setVisibility(e.target.value as Visibility)}
//                 options={[
//                   { value: 'public', label: '🌐 Public' },
//                   { value: 'private', label: '🔒 Private' },
//                   { value: 'followers_only', label: '👥 Followers' },
//                 ]}
//               />
//             </div>

//             <Input
//               label="Tags (comma separated)"
//               placeholder="mohabbat, dard, ishq"
//               value={tags}
//               onChange={(e) => setTags(e.target.value)}
//             />

//             <div>
//               <label className="text-sm text-[#888] font-medium mb-2 block">
//                 Mood (select one or more)
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {AVAILABLE_MOODS.map((mood) => (
//                   <button
//                     key={mood.value}
//                     onClick={() => toggleMood(mood.value)}
//                     className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
//                       selectedMoods.includes(mood.value)
//                         ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
//                         : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                     }`}
//                   >
//                     {mood.label}
//                   </button>
//                 ))}
//               </div>
//               {selectedMoods.length > 0 && (
//                 <p className="text-xs text-[#555] mt-2">
//                   Selected: {selectedMoods.join(', ')}
//                 </p>
//               )}
//             </div>

//             <div className="flex gap-3 mt-2">
//               <Button variant="outline" className="flex-1" onClick={handleClose}>
//                 Cancel
//               </Button>
//               <Button
//                 className="flex-1"
//                 icon={isAudio ? <Music className="w-4 h-4" /> : <Image className="w-4 h-4" />}
//                 loading={createMutation.isPending}
//                 onClick={() => createMutation.mutate()}
//                 disabled={!channelId || isLoadingUser}
//               >
//                 {!channelId ? 'Loading...' : isAudio ? 'Continue to Upload' : 'Continue to Editor'}
//               </Button>
//             </div>

//             {!channelId && !isLoadingUser && (
//               <p className="text-xs text-red-500 text-center">
//                 No channel found. Please create a channel first.
//               </p>
//             )}
//           </>
//         )}
//       </div>
//     </Modal>
//   )
// }







// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { Image, Music } from 'lucide-react'
// import { useUiStore } from '../../store/index'
// import { postsApi, creatorApi } from '../../api'
// import { Modal, Button, Input, Select } from '../ui'
// import { getErrorMessage } from '../../utils'
// import type { PostType, Language, Visibility } from '../../types'
// import toast from 'react-hot-toast'

// // ✅ Define moods matching the backend model
// const AVAILABLE_MOODS = [
//   { value: 'ishq', label: '💕 Ishq (Love)' },
//   { value: 'dard', label: '💔 Dard (Pain)' },
//   { value: 'khushi', label: '😊 Khushi (Happiness)' },
//   { value: 'udaasi', label: '😢 Udaasi (Sadness)' },
//   { value: 'gussa', label: '😠 Gussa (Anger)' },
//   { value: 'ummeed', label: '🌟 Ummeed (Hope)' },
//   { value: 'motivational', label: '💪 Motivational' },
//   { value: 'romantic', label: '🌹 Romantic' },
//   { value: 'funny', label: '😂 Funny' },
//   { value: 'religious', label: '🕌 Religious' },
//   { value: 'patriotic', label: '🇮🇳 Patriotic' },
//   { value: 'nature', label: '🌿 Nature' },
// ]

// // ✅ Defensive extraction: tries every plausible response shape so it works
// // regardless of whether your axios client unwraps `.data` once, twice, or not at all.
// // Logs which path actually matched so you can see the real shape in console.
// function extractChannelId(res: any): string | undefined {
//   const candidates: { label: string; id: string | undefined }[] = [
//     { label: 'res.data.data.user.channel._id', id: res?.data?.data?.user?.channel?._id },
//     { label: 'res.data.user.channel._id', id: res?.data?.user?.channel?._id },
//     { label: 'res.user.channel._id', id: res?.user?.channel?._id },
//   ]

//   const match = candidates.find((c) => c.id)
//   console.log('🔍 Channel ID path check:', candidates)
//   if (match) {
//     console.log(`✅ Matched via: ${match.label} =`, match.id)
//   } else {
//     console.warn('⚠️ No channel ID found in any known path. Raw response:', res)
//   }
//   return match?.id
// }

// export function PostCreateModal() {
//   const { postModalOpen, postModalType, closePostModal } = useUiStore()
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()

//   const [type, setType] = useState<PostType>('sayari')
//   const [title, setTitle] = useState('')
//   const [language, setLanguage] = useState<Language>('hi')
//   const [genre, setGenre] = useState('')
//   const [tags, setTags] = useState('')
//   const [selectedMoods, setSelectedMoods] = useState<string[]>([])
//   const [visibility, setVisibility] = useState<Visibility>('public')
//   const [channelId, setChannelId] = useState<string | null>(null)

//   const isAudio = postModalType === 'audio'

//   // ✅ Fetch user profile
//   const {
//     data: userData,
//     isLoading: isLoadingUser,
//     isError: isUserError,
//     error: userError,
//     refetch: refetchUser,
//   } = useQuery({
//     queryKey: ['userProfile', 'channel'],
//     queryFn: () => creatorApi.getMyProfile(),
//     enabled: postModalOpen,
//     retry: 1,
//   })

//   // ✅ Debug: log on every render so you can see the query lifecycle live
//   console.log('📊 postModalOpen:', postModalOpen)
//   console.log('📊 isLoadingUser:', isLoadingUser, '| isUserError:', isUserError)
//   console.log('📊 userData (raw):', userData)
//   if (userError) console.error('📊 userError:', userError)

//   // ✅ Set channel ID when user data loads
//   useEffect(() => {
//     if (!userData) return

//     const id = extractChannelId(userData)

//     if (id) {
//       setChannelId(id)
//       console.log('✅ Channel ID loaded:', id)
//     } else {
//       console.warn('⚠️ No channel ID found in userData')
//     }
//   }, [userData])

//   // Helper function to convert comma-separated string to array
//   const stringToArray = (str: string): string[] => {
//     return str ? str.split(',').map(item => item.trim()).filter(Boolean) : []
//   }

//   const toggleMood = (mood: string) => {
//     setSelectedMoods(prev =>
//       prev.includes(mood)
//         ? prev.filter(m => m !== mood)
//         : [...prev, mood]
//     )
//   }

//   const createMutation = useMutation({
//     mutationFn: () => {
//       if (!channelId) {
//         console.error('❌ No channelId available!')
//         toast.error('No channel found. Please create a channel first.')
//         throw new Error('No channel found')
//       }

//       console.log('📝 Creating post with channel:', channelId)

//       return postsApi.create({
//         channelId: channelId,
//         type: isAudio ? 'audio' : type,
//         title: title || undefined,
//         language,
//         genre: genre || undefined,
//         tags: stringToArray(tags),
//         mood: selectedMoods,
//         visibility,
//       })
//     },
//     onSuccess: (res: any) => {
//       // Same defensive unwrap as extractChannelId, applied to the create response
//       const post = res?.data?.data?.post ?? res?.data?.post ?? res?.post
//       console.log('✅ Post created:', post)
//       queryClient.invalidateQueries({ queryKey: ['myPosts'] })
//       closePostModal()
//       resetForm()
//       toast.success('Draft created! 🎉')
//       navigate(isAudio ? `/post/${post._id}/upload-audio` : `/post/${post._id}/edit`)
//     },
//     onError: (err) => {
//       console.error('❌ Post creation error:', err)
//       toast.error(getErrorMessage(err))
//     },
//   })

//   const resetForm = () => {
//     setTitle('')
//     setGenre('')
//     setTags('')
//     setSelectedMoods([])
//     setVisibility('public')
//     setType('sayari')
//   }

//   const handleClose = () => {
//     closePostModal()
//     resetForm()
//     setChannelId(null)
//   }

//   if (!postModalOpen) return null

//   return (
//     <Modal 
//       open={postModalOpen} 
//       onClose={handleClose} 
//       title={isAudio ? '🎙️ New Audio Post' : '✨ New Post'} 
//       size="md"
//     >
//       <div className="p-6 flex flex-col gap-4">
//         {isLoadingUser ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF] mx-auto mb-3"></div>
//             <p className="text-[#888]">Loading your profile...</p>
//           </div>
//         ) : isUserError ? (
//           <div className="text-center py-8">
//             <p className="text-red-500">Failed to load profile.</p>
//             <p className="text-xs text-[#666] mt-1">{getErrorMessage(userError)}</p>
//             <button
//               onClick={() => refetchUser()}
//               className="mt-2 text-[#6C63FF] hover:underline text-sm"
//             >
//               Retry
//             </button>
//           </div>
//         ) : (
//           <>
//             {!isAudio && (
//               <div>
//                 <label className="text-sm text-[#888] font-medium mb-2 block">Post Type</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {([
//                     { v: 'sayari', l: '📝 Sayari' },
//                     { v: 'kavita', l: '🌸 Kavita' },
//                     { v: 'ghazal', l: '🎭 Ghazal' },
//                     { v: 'nazm', l: '🕊️ Nazm' },
//                     { v: 'quote', l: '💬 Quote' },
//                     { v: 'shayari', l: '✒️ Shayari' },
//                   ] as const).map((t) => (
//                     <button
//                       key={t.v}
//                       onClick={() => setType(t.v)}
//                       className={`py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
//                         type === t.v
//                           ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
//                           : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                       }`}
//                     >
//                       {t.l}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <Input
//               label="Title (optional)"
//               placeholder={isAudio ? 'Audio title...' : 'Give your post a title...'}
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />

//             <div className="grid grid-cols-2 gap-3">
//               <Select
//                 label="Language"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value as Language)}
//                 options={[
//                   { value: 'hi', label: 'हिंदी' },
//                   { value: 'ur', label: 'اردو' },
//                   { value: 'en', label: 'English' },
//                   { value: 'pa', label: 'ਪੰਜਾਬੀ' },
//                   { value: 'mixed', label: 'Mixed' },
//                 ]}
//               />
//               <Select
//                 label="Visibility"
//                 value={visibility}
//                 onChange={(e) => setVisibility(e.target.value as Visibility)}
//                 options={[
//                   { value: 'public', label: '🌐 Public' },
//                   { value: 'private', label: '🔒 Private' },
//                   { value: 'followers_only', label: '👥 Followers' },
//                 ]}
//               />
//             </div>

//             <Input
//               label="Tags (comma separated)"
//               placeholder="mohabbat, dard, ishq"
//               value={tags}
//               onChange={(e) => setTags(e.target.value)}
//             />

//             <div>
//               <label className="text-sm text-[#888] font-medium mb-2 block">
//                 Mood (select one or more)
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {AVAILABLE_MOODS.map((mood) => (
//                   <button
//                     key={mood.value}
//                     onClick={() => toggleMood(mood.value)}
//                     className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
//                       selectedMoods.includes(mood.value)
//                         ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
//                         : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
//                     }`}
//                   >
//                     {mood.label}
//                   </button>
//                 ))}
//               </div>
//               {selectedMoods.length > 0 && (
//                 <p className="text-xs text-[#555] mt-2">
//                   Selected: {selectedMoods.join(', ')}
//                 </p>
//               )}
//             </div>

//             <div className="flex gap-3 mt-2">
//               <Button variant="outline" className="flex-1" onClick={handleClose}>
//                 Cancel
//               </Button>
//               <Button
//                 className="flex-1"
//                 icon={isAudio ? <Music className="w-4 h-4" /> : <Image className="w-4 h-4" />}
//                 loading={createMutation.isPending}
//                 onClick={() => createMutation.mutate()}
//                 disabled={!channelId || isLoadingUser}
//               >
//                 {!channelId ? 'Loading...' : isAudio ? 'Continue to Upload' : 'Continue to Editor'}
//               </Button>
//             </div>

//             {!channelId && !isLoadingUser && (
//               <p className="text-xs text-red-500 text-center">
//                 No channel found. Please create a channel first.
//               </p>
//             )}
//           </>
//         )}
//       </div>
//     </Modal>
//   )
// }










import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  Image, 
  Music, 
  PenTool, 
  Feather, 
  MessageSquare, 
  Quote, 
  BookHeart,
  Heart,
  HeartCrack,
  Smile,
  Frown,
  Angry,
  Sparkles,
  Flame,
  Flower2,
  Laugh,
  MoonStar,
  Flag,
  Leaf
} from 'lucide-react'
import { useUiStore } from '../../store/index'
import { postsApi, creatorApi } from '../../api'
import { Modal, Button, Input, Select } from '../ui'
import { getErrorMessage, cn } from '../../utils'
import type { PostType, Language, Visibility } from '../../types'
import toast from 'react-hot-toast'

// ✅ Define moods with Lucide Icons for the ALFAZ Theme
const AVAILABLE_MOODS = [
  { value: 'ishq', label: 'Ishq', icon: <Heart className="w-3.5 h-3.5" /> },
  { value: 'dard', label: 'Dard', icon: <HeartCrack className="w-3.5 h-3.5" /> },
  { value: 'khushi', label: 'Khushi', icon: <Smile className="w-3.5 h-3.5" /> },
  { value: 'udaasi', label: 'Udaasi', icon: <Frown className="w-3.5 h-3.5" /> },
  { value: 'gussa', label: 'Gussa', icon: <Angry className="w-3.5 h-3.5" /> },
  { value: 'ummeed', label: 'Ummeed', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { value: 'motivational', label: 'Motivation', icon: <Flame className="w-3.5 h-3.5" /> },
  { value: 'romantic', label: 'Romantic', icon: <Flower2 className="w-3.5 h-3.5" /> },
  { value: 'funny', label: 'Funny', icon: <Laugh className="w-3.5 h-3.5" /> },
  { value: 'religious', label: 'Religious', icon: <MoonStar className="w-3.5 h-3.5" /> },
  { value: 'patriotic', label: 'Patriotic', icon: <Flag className="w-3.5 h-3.5" /> },
  { value: 'nature', label: 'Nature', icon: <Leaf className="w-3.5 h-3.5" /> },
]

function extractChannelId(res: any): string | undefined {
  const candidates: { label: string; id: string | undefined }[] = [
    { label: 'res.data.data.user.channel._id', id: res?.data?.data?.user?.channel?._id },
    { label: 'res.data.user.channel._id', id: res?.data?.user?.channel?._id },
    { label: 'res.user.channel._id', id: res?.user?.channel?._id },
  ]
  const match = candidates.find((c) => c.id)
  return match?.id
}

export function PostCreateModal() {
  const { postModalOpen, postModalType, closePostModal } = useUiStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [type, setType] = useState<PostType>('sayari')
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState<Language>('hi')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [channelId, setChannelId] = useState<string | null>(null)

  const isAudio = postModalType === 'audio'

  const { data: userData, isLoading: isLoadingUser, isError: isUserError, error: userError, refetch: refetchUser } = useQuery({
    queryKey: ['userProfile', 'channel'],
    queryFn: () => creatorApi.getMyProfile(),
    enabled: postModalOpen,
    retry: 1,
  })


  console.log('📊 postModalOpen:', postModalOpen)
  console.log('📊 isLoadingUser:', isLoadingUser, '| isUserError:', isUserError)
  console.log('📊 userData (raw):', userData)
  if (userError) console.error('📊 userError:', userError)

  useEffect(() => {
    if (!userData) return
    const id = extractChannelId(userData)
    if (id) {
      setChannelId(id)
    }
  }, [userData])

  const stringToArray = (str: string): string[] => {
    return str ? str.split(',').map(item => item.trim()).filter(Boolean) : []
  }

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    )
  }

  const createMutation = useMutation({
    mutationFn: () => {
      if (!channelId) {
        toast.error('No channel found. Please create a channel first.')
        throw new Error('No channel found')
      }
      return postsApi.create({
        channelId: channelId,
        type: isAudio ? 'audio' : type,
        title: title || undefined,
        language,
        genre: genre || undefined,
        tags: stringToArray(tags),
        mood: selectedMoods,
        visibility,
      })
    },
    onSuccess: (res: any) => {
      const post = res?.data?.data?.post ?? res?.data?.post ?? res?.post
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
      closePostModal()
      resetForm()
      toast.success('Draft created! 🎉')
      navigate(isAudio ? `/post/${post._id}/upload-audio` : `/post/${post._id}/edit`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const resetForm = () => {
    setTitle('')
    setGenre('')
    setTags('')
    setSelectedMoods([])
    setVisibility('public')
    setType('sayari')
  }

  const handleClose = () => {
    closePostModal()
    resetForm()
    setChannelId(null)
  }

  if (!postModalOpen) return null

  return (
    <Modal 
      open={postModalOpen} 
      onClose={handleClose} 
      title={isAudio ? 'Create Audio Recitation' : 'Compose New Piece'} 
      size="lg"
    >
      {/* 
        Responsive fixes applied here:
        - overflow-auto: Enables X and Y scrolling if content overflows
        - max-h-[85vh]: Limits the maximum height to 85% of the viewport so it never bleeds off screen
        - p-4 md:p-6: Dynamic padding for mobile vs desktop
      */}
      <div className="p-4 md:p-6 flex flex-col gap-6 animate-slide-up bg-bg text-text rounded-b-2xl overflow-auto max-h-[85vh] w-full">
        
        {isLoadingUser ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted font-medium font-serif italic">Preparing your canvas...</p>
          </div>
        ) : isUserError ? (
          <div className="text-center py-12 bg-surface2 rounded-2xl border border-border/50">
            <p className="text-red-400 font-medium">Failed to load creator profile.</p>
            <p className="text-xs text-muted mt-2">{getErrorMessage(userError)}</p>
            <Button onClick={() => refetchUser()} variant="outline" className="mt-4 border-border hover:border-primary">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 min-w-0">
              
              {/* Left Column: Core Details */}
              <div className="space-y-5">
                {/* Post Type Selector */}
                {!isAudio && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                      <PenTool className="w-3.5 h-3.5" /> Literary Form
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { v: 'sayari', l: 'Sayari', i: <Feather className="w-3.5 h-3.5" /> },
                        { v: 'kavita', l: 'Kavita', i: <Flower2 className="w-3.5 h-3.5" /> },
                        { v: 'ghazal', l: 'Ghazal', i: <BookHeart className="w-3.5 h-3.5" /> },
                        { v: 'nazm', l: 'Nazm', i: <MoonStar className="w-3.5 h-3.5" /> },
                        { v: 'quote', l: 'Quote', i: <Quote className="w-3.5 h-3.5" /> },
                        { v: 'shayari', l: 'Shayari', i: <MessageSquare className="w-3.5 h-3.5" /> },
                      ] as const).map((t) => (
                        <button
                          key={t.v}
                          onClick={() => setType(t.v)}
                          className={cn(
                            "py-2 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-semibold border flex flex-col items-center justify-center gap-1.5 transition-all duration-300",
                            type === t.v
                              ? "border-primary bg-primary/10 text-primary shadow-sm scale-[0.98] ring-1 ring-primary/30"
                              : "border-border/50 text-muted hover:text-text hover:bg-surface2 hover:border-border bg-surface"
                          )}
                        >
                          {t.i}
                          <span className="truncate w-full text-center">{t.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title Input */}
                <div className="space-y-1">
                  <Input
                    label="Title (optional)"
                    placeholder={isAudio ? "E.g., Midnight Monologue..." : "E.g., The Silent Rain..."}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-surface2 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary font-serif text-base placeholder:font-sans placeholder:text-sm placeholder:italic py-2.5"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <Input
                    label="Keywords & Tags"
                    placeholder="mohabbat, dard, classic (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-surface2 border-border/50 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Right Column: Settings & Moods */}
              <div className="space-y-5">
                {/* Language & Visibility */}
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    options={[
                      { value: 'hi', label: 'हिंदी (Hindi)' },
                      { value: 'ur', label: 'اردو (Urdu)' },
                      { value: 'en', label: 'English' },
                      { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
                      { value: 'mixed', label: 'Mixed Script' },
                    ]}
                    className="bg-surface2 border-border/50 py-2 text-sm"
                  />
                  <Select
                    label="Visibility"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as Visibility)}
                    options={[
                      { value: 'public', label: 'Public' },
                      { value: 'private', label: 'Private (Draft)' },
                      { value: 'followers_only', label: 'Followers Only' },
                    ]}
                    className="bg-surface2 border-border/50 py-2 text-sm"
                  />
                </div>

                {/* Mood Selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">
                      Emotional Tone
                    </label>
                    {selectedMoods.length > 0 && (
                      <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                        {selectedMoods.length} Selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_MOODS.map((mood) => {
                      const isSelected = selectedMoods.includes(mood.value);
                      return (
                        <button
                          key={mood.value}
                          onClick={() => toggleMood(mood.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary text-bg shadow-sm"
                              : "border-border/60 text-muted hover:text-text hover:bg-surface2 hover:border-border bg-surface"
                          )}
                        >
                          <span className={isSelected ? "text-bg" : "text-muted opacity-80"}>
                            {mood.icon}
                          </span>
                          <span className="whitespace-nowrap">{mood.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 pt-5 border-t border-border/40 shrink-0">
              <Button 
                variant="outline" 
                className="w-full sm:flex-1 border-border/50 text-text hover:bg-surface2 rounded-xl py-3 text-sm" 
                onClick={handleClose}
              >
                Discard
              </Button>
              <Button
                className="w-full sm:flex-1 bg-primary text-bg hover:bg-primary-dark rounded-xl py-3 text-sm font-bold shadow-lg hover:shadow-xl hover:gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                icon={isAudio ? <Music className="w-4 h-4" /> : <Feather className="w-4 h-4" />}
                loading={createMutation.isPending}
                onClick={() => createMutation.mutate()}
                disabled={!channelId || isLoadingUser}
              >
                {!channelId ? 'Loading...' : isAudio ? 'Continue to Audio' : 'Enter Editor'}
              </Button>
            </div>

            {!channelId && !isLoadingUser && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center -mt-2">
                 <p className="text-xs text-red-400 font-medium">
                  Cannot compose: No channel found. Please set up your channel profile first.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}