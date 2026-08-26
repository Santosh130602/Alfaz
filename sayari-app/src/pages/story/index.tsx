import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play, ChevronLeft, ChevronRight, Radio, Disc3 } from 'lucide-react'
import { cn } from '../../utils'

export function StoryPage() {
  const radioScrollRef = useRef<HTMLDivElement>(null)
  const albumScrollRef = useRef<HTMLDivElement>(null)

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

  const popularRadioStations = [
    { id: 1, name: 'Arijit Singh', desc: 'With Pritam, Vishal-Shekhar, Shaarib Toshi...', color: 'bg-amber-300 text-neutral-900', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { id: 2, name: 'A.R. Rahman', desc: 'By Spotify', color: 'bg-yellow-400 text-neutral-900', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
    { id: 3, name: 'Kishore Kumar', desc: 'With Mukesh, Mohammed Rafi,...', color: 'bg-rose-400 text-neutral-900', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
    { id: 4, name: 'KK', desc: 'With Pritam, Shankar-Ehsaan-Loy, Gajendra...', color: 'bg-teal-300 text-neutral-900', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
    { id: 5, name: 'Diljit Dosanjh', desc: 'With Karan Aujla, AP Dhillon, Harrdy Sandhu...', color: 'bg-emerald-300 text-neutral-900', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
  ]

  const popularAlbumsAndSingles = [
    { id: 1, title: 'Aashiqui 2', desc: 'Mithoon, Ankit Tiwari, Jeet Gannguli', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
    { id: 2, title: 'Sanam Teri Kasam (Original Motion...', desc: 'Himesh Reshammiya, Sameer Anjaan, Subrat...', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
    { id: 3, title: 'Raanjhan (From "Do Patti")', desc: 'Sachet-Parampara, Parampara Tandon, Kaus...', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
    { id: 4, title: 'Finding Her', desc: 'Kushagra, Bharath, Saaheal', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { id: 5, title: 'Ultimate Love Songs - Arijit Singh', desc: 'Arijit Singh', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
  ]

  return (
    <div className="space-y-12 select-none max-w-[1600px] mx-auto bg-bg text-text min-h-screen px-4 md:px-8 pb-24">
      
      {/* ── SECTION 1: POPULAR RADIO ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-text tracking-tight">Popular radio</h2>
          <div className="flex items-center gap-2">
            <Link to="/explore" className="text-xs font-bold text-muted hover:text-text transition-colors uppercase tracking-wider mr-2">
              Show all
            </Link>
            <button 
              onClick={() => scroll(radioScrollRef, 'left')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll(radioScrollRef, 'right')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Radio Cards Container */}
        <div 
          ref={radioScrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {popularRadioStations.map((radio) => (
            <div 
              key={radio.id}
              className={cn(
                "flex-shrink-0 w-[220px] group p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xl hover:scale-[1.02] relative overflow-hidden h-[280px]",
                radio.color
              )}
            >
              <div className="flex items-start justify-between z-10">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full text-black">RADIO</span>
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-black shadow-md">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              <div className="z-10 flex flex-col items-center text-center mt-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-black/20 shadow-2xl mb-3">
                  <img src={radio.img} alt={radio.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-black tracking-tight truncate w-full">{radio.name}</h3>
                <p className="text-xs opacity-80 line-clamp-2 font-medium mt-0.5">{radio.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: POPULAR ALBUMS AND SINGLES ── */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-text tracking-tight">Popular albums and singles</h2>
          <div className="flex items-center gap-2">
            <Link to="/explore" className="text-xs font-bold text-muted hover:text-text transition-colors uppercase tracking-wider mr-2">
              Show all
            </Link>
            <button 
              onClick={() => scroll(albumScrollRef, 'left')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll(albumScrollRef, 'right')}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface2 flex items-center justify-center text-text transition-colors border border-border/60 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Album Cards Container */}
        <div 
          ref={albumScrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {popularAlbumsAndSingles.map((album) => (
            <div 
              key={album.id}
              className="flex-shrink-0 w-[220px] group bg-surface hover:bg-surface2 p-4 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col gap-3 shadow-lg border border-border/50 hover:border-primary/50"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md bg-surface2">
                <img 
                  src={album.img} 
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button className="absolute bottom-3 right-3 w-12 h-12 bg-primary text-bg rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:scale-105">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-text font-bold text-sm truncate">{album.title}</h3>
                <p className="text-muted text-xs line-clamp-2 leading-snug">{album.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

