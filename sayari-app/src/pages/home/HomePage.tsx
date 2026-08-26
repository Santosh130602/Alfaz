// import { useState } from 'react'
// import { Play, ChevronLeft, ChevronRight, Mic2, Music2 } from 'lucide-react'
// import { cn } from '../utils'

//  function HomePages() {
//   const [activeTab, setActiveTab] = useState<'all' | 'sayari' | 'story'>('all')

//   const editorPicks = [
//     { id: 1, title: '90s Sad Bolly', subtitle: 'Soothe your broken heart with these...', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
//     { id: 2, title: 'Filmy Covers', subtitle: 'Your favourite filmy tracks', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
//     { id: 3, title: "Fall in love with 00's", subtitle: 'Bollywood like never before', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
//   ]

//   const popularRadios = [
//     { id: 1, name: 'Arijit Singh', desc: 'With Pritam, Vishal-Shekhar, Shaarib Toshi...', color: 'bg-[#fbc531] text-black', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
//     { id: 2, name: 'A.R. Rahman', desc: 'With Unnikrishnan, Hariharan, Chinmayi...', color: 'bg-[#ffd32a] text-black', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
//     { id: 3, name: 'Kishore Kumar', desc: 'With Mukesh, Mohammed Rafi, Lata Mangeshkar...', color: 'bg-[#ff5252] text-black', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
//     { id: 4, name: 'KK', desc: 'With Pritam, Shankar-Ehsaan-Loy, Gajendra...', color: 'bg-[#34e7e4] text-black', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
//     { id: 5, name: 'Diljit Dosanjh', desc: 'With Karan Aujla, AP Dhillon, Harrdy Sandhu...', color: 'bg-[#0be881] text-black', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
//   ]

//   return (
//     <div className="space-y-10 pb-16 select-none max-w-[1600px] mx-auto">
      
//       {/* 1. Sticky Header Filter Tabs (All, Sayari, Story) */}
//       <div className="sticky top-16 bg-bg/95 backdrop-blur-md z-20 py-2 flex items-center gap-2">
//         <button
//           onClick={() => setActiveTab('all')}
//           className={cn(
//             "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200",
//             activeTab === 'all' ? "bg-white text-black shadow-md" : "bg-[#2a2a2a] text-white hover:bg-[#333]"
//           )}
//         >
//           All
//         </button>
//         <button
//           onClick={() => setActiveTab('sayari')}
//           className={cn(
//             "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2",
//             activeTab === 'sayari' ? "bg-white text-black shadow-md" : "bg-[#2a2a2a] text-white hover:bg-[#333]"
//           )}
//         >
//           <Music2 className="w-4 h-4" />
//           Sayari
//         </button>
//         <button
//           onClick={() => setActiveTab('story')}
//           className={cn(
//             "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2",
//             activeTab === 'story' ? "bg-white text-black shadow-md" : "bg-[#2a2a2a] text-white hover:bg-[#333]"
//           )}
//         >
//           <Mic2 className="w-4 h-4" />
//           Story
//         </button>
//       </div>

//       {/* 2. Getting Started Section */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-black text-white tracking-tight">Getting started</h2>
//           <div className="flex items-center gap-2">
//             <button className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] flex items-center justify-center text-white transition-colors">
//               <ChevronLeft className="w-5 h-5" />
//             </button>
//             <button className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] flex items-center justify-center text-white transition-colors">
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Feature Banner Card */}
//         <div className="relative w-full rounded-2xl bg-gradient-to-r from-[#81344e] via-[#593043] to-[#362432] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden shadow-2xl border border-white/5">
//           <div className="max-w-md z-10">
//             <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">4. Queue it up</h3>
//             <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed font-medium">
//               Add to your Queue, drag and drop, and control what plays next.
//             </p>
//             <button className="px-6 py-3 rounded-full bg-[#1ed760] text-black font-black text-sm hover:scale-105 transition-transform shadow-lg">
//               Open Queue
//             </button>
//           </div>

//           <div className="hidden lg:flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-10 w-[360px]">
//             <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-white">🎵</div>
//             <div className="flex-1 min-w-0">
//               <p className="text-[10px] uppercase font-black text-[#1ed760] tracking-wider">Queue • Recently played</p>
//               <p className="text-sm font-bold text-white truncate">Now playing: Chill Chill</p>
//               <p className="text-xs text-white/60 truncate">Brackem, Dazen</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 3. Editor's Picks Section */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-black text-white tracking-tight">Editor's Picks: No-Skip Playlists</h2>
//           <button className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider">
//             Show all
//           </button>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {editorPicks.map((pick) => (
//             <div 
//               key={pick.id}
//               className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col gap-3 shadow-lg"
//             >
//               <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
//                 <img 
//                   src={pick.image} 
//                   alt={pick.title}
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                 />
//                 <button className="absolute bottom-3 right-3 w-12 h-12 bg-[#1ed760] text-black rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:scale-105">
//                   <Play className="w-5 h-5 fill-current ml-0.5" />
//                 </button>
//               </div>
//               <div className="space-y-1">
//                 <h3 className="text-white font-bold text-base truncate">{pick.title}</h3>
//                 <p className="text-white/60 text-xs line-clamp-2 leading-snug">{pick.subtitle}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 4. Popular Radio Section */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-black text-white tracking-tight">Popular radio</h2>
//           <button className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider">
//             Show all
//           </button>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
//           {popularRadios.map((radio) => (
//             <div 
//               key={radio.id}
//               className={cn(
//                 "group p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xl hover:scale-[1.02] relative overflow-hidden h-[240px]",
//                 radio.color
//               )}
//             >
//               <div className="flex items-start justify-between z-10">
//                 <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full text-white">Radio</span>
//                 <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white shadow-md">
//                   <Play className="w-5 h-5 fill-current ml-0.5" />
//                 </div>
//               </div>

//               <div className="z-10 flex flex-col items-center text-center mt-4">
//                 <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl mb-3">
//                   <img src={radio.img} alt={radio.name} className="w-full h-full object-cover" />
//                 </div>
//                 <h3 className="text-lg font-black tracking-tight truncate w-full">{radio.name}</h3>
//                 <p className="text-xs opacity-80 line-clamp-2 font-medium mt-0.5">{radio.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//     </div>
//   )
// }

// export default HomePages












// import { useState, useRef } from 'react'
// import { Play, ChevronLeft, ChevronRight, Mic2, Music2, Sparkles, Flame, Clock } from 'lucide-react'
// import { cn } from '../utils'

// function HomePages() {
//   const [activeHeader, setActiveHeader] = useState<'all' | 'sayari' | 'story'>('all')
  
//   // Refs for horizontal scrolling sections
//   const editorScrollRef = useRef<HTMLDivElement>(null)
//   const popularScrollRef = useRef<HTMLDivElement>(null)

//   const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
//     if (ref.current) {
//       const { scrollLeft, clientWidth } = ref.current
//       const scrollAmount = clientWidth * 0.75
//       ref.current.scrollTo({
//         left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
//         behavior: 'smooth'
//       })
//     }
//   }

//   const editorPicks = [
//     { id: 1, title: '90s Sad Sayari', subtitle: 'Soothe your broken heart with classic verses...', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
//     { id: 2, title: 'Filmy Ghazals', subtitle: 'Your favourite poetic tracks reimagined...', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
//     { id: 3, title: 'Deep Sufi Verses', subtitle: 'Soul-stirring poetry from the masters...', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
//     { id: 4, title: 'Midnight Monologues', subtitle: 'Dark, ambient late night stories...', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
//     { id: 5, title: 'Romance & Ishq', subtitle: 'Heartfelt expressions of love and longing...', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
//   ]

//   const popularWriters = [
//     { id: 1, name: 'Faiz Ahmed Faiz', desc: 'Legendary revolutionary poetry & ghazals...', color: 'bg-[#fbc531] text-black', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
//     { id: 2, name: 'Mirza Ghalib', desc: 'Timeless classical Urdu couplets...', color: 'bg-[#ffd32a] text-black', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
//     { id: 3, name: 'Jaun Elia', desc: 'Raw, melancholic modern Urdu nazms...', color: 'bg-[#ff5252] text-black', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
//     { id: 4, name: 'Gulzar', desc: 'Whimsical Hindi/Urdu nazms and short stories...', color: 'bg-[#34e7e4] text-black', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
//     { id: 5, name: 'Ahmad Faraz', desc: 'Romantic and socio-political masterpieces...', color: 'bg-[#0be881] text-black', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
//   ]

//   return (
//     <div className="space-y-18  select-none max-w-[1600px] mx-auto bg-[#121212] text-white min-h-screen px-4 md:px-8">
      
//       {/* ── STICKY HEADER PILL NAVIGATION ── */}
//       <div className="sticky  bg-[#121212]/95 backdrop-blur-md z-30 py-3 flex items-center gap-3 border-b border-white/10 stich">
//         <button
//           onClick={() => setActiveHeader('all')}
//           className={cn(
//             "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200",
//             activeHeader === 'all' ? "bg-white text-black shadow-md" : "bg-[#2a2a2a] text-white hover:bg-[#333]"
//           )}
//         >
//           All
//         </button>
//         <button
//           onClick={() => setActiveHeader('sayari')}
//           className={cn(
//             "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2",
//             activeHeader === 'sayari' ? "bg-white text-black shadow-md" : "bg-[#2a2a2a] text-white hover:bg-[#333]"
//           )}
//         >
//           <Music2 className="w-4 h-4" />
//           Sayari
//         </button>
//         <button
//           onClick={() => setActiveHeader('story')}
//           className={cn(
//             "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2",
//             activeHeader === 'story' ? "bg-white text-black shadow-md" : "bg-[#2a2a2a] text-white hover:bg-[#333]"
//           )}
//         >
//           <Mic2 className="w-4 h-4" />
//           Story
//         </button>
//       </div>

//       {/* ── SECTION 1: GETTING STARTED (BANNER + SCROLLABLE RIGHT CARDS) ── */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-black text-white tracking-tight">Getting started</h2>
//           <div className="flex items-center gap-2">
//             <button 
//               onClick={() => scroll(editorScrollRef, 'left')}
//               className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] flex items-center justify-center text-white transition-colors border border-white/10"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </button>
//             <button 
//               onClick={() => scroll(editorScrollRef, 'right')}
//               className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] flex items-center justify-center text-white transition-colors border border-white/10"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Layout Grid: Left Banner & Right Scrollable Card Slicer */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
//           {/* Left Hero Banner */}
//           <div className="lg:col-span-5 relative rounded-2xl bg-gradient-to-r from-[#81344e] via-[#593043] to-[#362432] p-8 flex flex-col justify-between overflow-hidden shadow-2xl border border-white/5 min-h-[320px]">
//             <div>
//               <span className="text-[10px] font-black uppercase tracking-widest text-[#1ed760] bg-black/30 px-3 py-1 rounded-full mb-3 inline-block">Featured Guide</span>
//               <h3 className="text-4xl font-black text-white tracking-tight mb-3">4. Queue it up</h3>
//               <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium">
//                 Add to your Queue, drag and drop, and control what plays next in your poetry session.
//               </p>
//             </div>
//             <button className="mt-6 px-6 py-3 rounded-full bg-[#1ed760] text-black font-black text-sm hover:scale-105 transition-transform shadow-lg w-fit">
//               Open Queue
//             </button>
//           </div>

//           {/* Right Scrollable Card Slicer */}
//           <div className="lg:col-span-7 relative overflow-hidden flex items-center">
//             <div 
//               ref={editorScrollRef}
//               className="flex gap-4 overflow-x-auto scrollbar-hide w-full scroll-smooth pb-2"
//             >
//               {editorPicks.map((pick) => (
//                 <div 
//                   key={pick.id}
//                   className="flex-shrink-0 w-[220px] group bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col gap-3 shadow-lg border border-white/5"
//                 >
//                   <div className="relative aspect-square rounded-xl overflow-hidden shadow-md bg-[#222]">
//                     <img 
//                       src={pick.image} 
//                       alt={pick.title}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                     <button className="absolute bottom-3 right-3 w-12 h-12 bg-[#1ed760] text-black rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:scale-105">
//                       <Play className="w-5 h-5 fill-current ml-0.5" />
//                     </button>
//                   </div>
//                   <div className="space-y-1">
//                     <h3 className="text-white font-bold text-sm truncate">{pick.title}</h3>
//                     <p className="text-white/60 text-xs line-clamp-2 leading-snug">{pick.subtitle}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* ── SECTION 2: POPULAR SAYARI / WRITERS ── */}
//       <div className="space-y-4 pt-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-black text-white tracking-tight">Popular Sayari & Writers</h2>
//           <div className="flex items-center gap-2">
//             <button 
//               onClick={() => scroll(popularScrollRef, 'left')}
//               className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] flex items-center justify-center text-white transition-colors border border-white/10"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </button>
//             <button 
//               onClick={() => scroll(popularScrollRef, 'right')}
//               className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] flex items-center justify-center text-white transition-colors border border-white/10"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Scrollable Popular Cards Container */}
//         <div 
//           ref={popularScrollRef}
//           className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
//         >
//           {popularWriters.map((writer) => (
//             <div 
//               key={writer.id}
//               className={cn(
//                 "flex-shrink-0 w-[220px] group p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xl hover:scale-[1.02] relative overflow-hidden h-[260px]",
//                 writer.color
//               )}
//             >
//               <div className="flex items-start justify-between z-10">
//                 <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full text-white">Legend</span>
//                 <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white shadow-md">
//                   <Play className="w-5 h-5 fill-current ml-0.5" />
//                 </div>
//               </div>

//               <div className="z-10 flex flex-col items-center text-center mt-2">
//                 <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl mb-3">
//                   <img src={writer.img} alt={writer.name} className="w-full h-full object-cover" />
//                 </div>
//                 <h3 className="text-base font-black tracking-tight truncate w-full">{writer.name}</h3>
//                 <p className="text-xs opacity-80 line-clamp-2 font-medium mt-0.5">{writer.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//     </div>
//   )
// }

// export default HomePages





import { useState, useRef } from 'react'

import { Play, ChevronLeft, ChevronRight, Mic2, Music2 } from 'lucide-react'
import { cn } from '../../utils'
import { useNavigate } from 'react-router-dom'

export function HomePages() {
  const [activeHeader, setActiveHeader] = useState<'all' | 'sayari' | 'story'>('all')

  const navigation = useNavigate();

  
  // Refs for horizontal scrolling sections
  const bannerScrollRef = useRef<HTMLDivElement>(null)
  const editorScrollRef = useRef<HTMLDivElement>(null)
  const popularScrollRef = useRef<HTMLDivElement>(null)

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current
      const scrollAmount = clientWidth * 0.75
      ref.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Slicer cards for the Getting Started left banner section
  const gettingStartedBanners = [
    {
      id: 1,
      badge: 'Featured Guide',
      title: '4. Queue it up',
      desc: 'Add to your Queue, drag and drop, and control what plays next in your poetry session.',
      action: 'Open Queue',
      gradient: 'from-[#81344e] via-[#593043] to-[#362432]'
    },
    {
      id: 2,
      badge: 'Creator Masterclass',
      title: 'Publishing Shayari',
      desc: 'Learn how to format your verses, add background audio, and reach thousands of listeners.',
      action: 'Start Creating',
      gradient: 'from-[#3a506b] via-[#2c3e50] to-[#1f2937]'
    },
    {
      id: 3,
      badge: 'Community Pick',
      title: 'Explore Ghazals',
      desc: 'Dive into timeless classical rhythms and contemporary soulful performances.',
      action: 'Explore Now',
      gradient: 'from-[#5d4037] via-[#4e342e] to-[#3e2723]'
    }
  ]

  const editorPicks = [
    { id: 1, title: '90s Sad Sayari', subtitle: 'Soothe your broken heart with classic verses...', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
    { id: 2, title: 'Filmy Ghazals', subtitle: 'Your favourite poetic tracks reimagined...', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
    { id: 3, title: 'Deep Sufi Verses', subtitle: 'Soul-stirring poetry from the masters...', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
    { id: 4, title: 'Midnight Monologues', subtitle: 'Dark, ambient late night stories...', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { id: 5, title: 'Romance & Ishq', subtitle: 'Heartfelt expressions of love and longing...', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
  ]

  const popularWriters = [
    { id: 1, name: 'Faiz Ahmed Faiz', desc: 'Legendary revolutionary poetry & ghazals...', color: 'bg-primary/20 border border-primary/30 text-text', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { id: 2, name: 'Mirza Ghalib', desc: 'Timeless classical Urdu couplets...', color: 'bg-surface2/60 border border-border text-text', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
    { id: 3, name: 'Jaun Elia', desc: 'Raw, melancholic modern Urdu nazms...', color: 'bg-accent/10 border border-accent/20 text-text', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
    { id: 4, name: 'Gulzar', desc: 'Whimsical Hindi/Urdu nazms and short stories...', color: 'bg-surface2/60 border border-border text-text', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
    { id: 5, name: 'Ahmad Faraz', desc: 'Romantic and socio-political masterpieces...', color: 'bg-primary/15 border border-primary/20 text-text', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
  ]

  return (
    <div className="space-y-12 select-none max-w-[1600px] mx-auto bg-bg text-text min-h-screen px-4 md:px-8 pb-24">
      
      {/* ── TRUE STICKY HEADER PILL NAVIGATION (Floats correctly inside layout container) ── */}
      <div className="sticky top-0 bg-bg/90 backdrop-blur-xl z-40 py-4 flex items-center gap-3 border-b border-border/40 -mx-4 px-4 md:-mx-8 md:px-8">
        <button
          onClick={() => setActiveHeader('all')}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 shadow-sm",
            activeHeader === 'all' ? "bg-text text-bg" : "bg-surface hover:bg-surface2 text-text border border-border/50"
          )}
        >
          All
        </button>
        <button
          // onClick={() => setActiveHeader('sayari')}
          onClick={() => navigation('/sayari')}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm",
            activeHeader === 'sayari' ? "bg-text text-bg" : "bg-surface hover:bg-surface2 text-text border border-border/50"
          )}
        >
          <Music2 className="w-4 h-4 text-primary" />
          Sayari
        </button>
        <button
          // onClick={() => setActiveHeader('story')}
          onClick={() => navigation('/story')}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm",
            activeHeader === 'story' ? "bg-text text-bg" : "bg-surface hover:bg-surface2 text-text border border-border/50"
          )}
        >
          <Mic2 className="w-4 h-4 text-accent" />
          Story
        </button>
      </div>

      {/* ── SECTION 1: GETTING STARTED (SLIDER BANNER LEFT + SCROLLABLE RIGHT CARDS) ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-text tracking-tight">Getting started</h2>
          {/* Right section scroll navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll(editorScrollRef, 'left')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll(editorScrollRef, 'right')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout Grid: Left Banner Slider & Right Scrollable Card Slicer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Hero Banner Slider (with Top Slicer Navigation Buttons) */}
          <div className="lg:col-span-5 relative flex flex-col justify-between">
            
            {/* Top Banner Control Buttons */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Featured Guide</span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => scroll(bannerScrollRef, 'left')}
                  className="w-7 h-7 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scroll(bannerScrollRef, 'right')}
                  className="w-7 h-7 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Banner Container */}
            <div 
              ref={bannerScrollRef}
              className="flex overflow-x-auto scrollbar-hide w-full scroll-smooth rounded-2xl shadow-2xl border border-border/40 snap-x snap-mandatory flex-1"
            >
              {gettingStartedBanners.map((banner) => (
                <div 
                  key={banner.id}
                  className={cn(
                    "min-w-full flex-shrink-0 snap-start relative rounded-2xl bg-gradient-to-r p-8 flex flex-col justify-between min-h-[280px]",
                    banner.gradient
                  )}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-muted px-3 py-1 rounded-full mb-3 inline-block">
                      {banner.badge}
                    </span>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">{banner.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed font-medium">
                      {banner.desc}
                    </p>
                  </div>
                  <button className="mt-6 px-6 py-3 rounded-full bg-primary text-bg font-black text-sm hover:scale-105 transition-transform shadow-lg w-fit">
                    {banner.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Scrollable Card Slicer (Always visible cards with smooth scroll) */}
          <div className="lg:col-span-7 relative overflow-hidden flex items-center">
            <div 
              ref={editorScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide w-full scroll-smooth pb-2"
            >
              {editorPicks.map((pick) => (
                <div 
                  key={pick.id}
                  className="flex-shrink-0 w-[220px] group bg-surface hover:bg-surface2 p-4 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col gap-3 shadow-lg border border-border/50 hover:border-primary/50"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-md bg-surface2">
                    <img 
                      src={pick.image} 
                      alt={pick.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button className="absolute bottom-3 right-3 w-12 h-12 bg-primary text-bg rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:scale-105">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-text font-bold text-sm truncate">{pick.title}</h3>
                    <p className="text-muted text-xs line-clamp-2 leading-snug">{pick.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 2: POPULAR SAYARI & WRITERS ── */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-text tracking-tight">Popular Sayari & Writers</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll(popularScrollRef, 'left')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll(popularScrollRef, 'right')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Popular Cards Container */}
        <div 
          ref={popularScrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {popularWriters.map((writer) => (
            <div 
              key={writer.id}
              className={cn(
                "flex-shrink-0 w-[220px] group p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xl hover:scale-[1.02] relative overflow-hidden h-[260px]",
                writer.color
              )}
            >
              <div className="flex items-start justify-between z-10">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2.5 py-1 rounded-full text-white">Legend</span>
                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white shadow-md">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              <div className="z-10 flex flex-col items-center text-center mt-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border shadow-2xl mb-3">
                  <img src={writer.img} alt={writer.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-base font-black tracking-tight truncate w-full text-text">{writer.name}</h3>
                <p className="text-xs text-muted opacity-90 line-clamp-2 font-medium mt-0.5">{writer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default HomePages