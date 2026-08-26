// import { useState } from 'react'
// import { Link, NavLink, useNavigate } from 'react-router-dom'
// import {
//   Home, Compass, Search, Bell, Plus, User,
//   LogOut, Settings, BarChart2, Bookmark, Menu, X, ShieldCheck, Library, 
//   Search as SearchIcon, 
//   ListMusic, 
//   Grid, 
//   Heart, 
//   Music2, 
//   User as UserIcon,
//   Disc3,
//   FolderDown 
// } from 'lucide-react'
// import { useAuthStore } from '../../store/auth.store'
// import { useNotifStore, useUiStore } from '../../store/index'
// import { authApi } from '../../api'
// import { tokenStorage } from '../../api/client'
// import { Avatar, Button } from '../ui'
// import { cn } from '../../utils'
// import toast from 'react-hot-toast'

// // ── Top Navbar ────────────────────────────────

// // export function Navbar() {
// //   const { user, isAuthenticated, logout } = useAuthStore()
// //   const { unreadCount } = useNotifStore()
// //   const { toggleSidebar, openPostModal } = useUiStore()
// //   const navigate = useNavigate()

// //   const handleLogout = async () => {
// //     try {
// //       await authApi.logout(tokenStorage.getRefresh() || undefined)
// //     } catch { /* ignore */ }
// //     logout()
// //     navigate('/login')
// //   }

// //   return (
// //     <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0F0F0F]/90 backdrop-blur border-b border-[#2E2E2E] flex items-center px-4 gap-3">
// //       {/* Logo */}
// //       <Link to="/" className="flex items-center gap-2 mr-2">
// //         <div className="w-8 h-8 bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-xl flex items-center justify-center text-white font-bold text-sm">S</div>
// //         <span className="font-bold text-white hidden sm:block">Sayari</span>
// //       </Link>

// //       {/* Search bar - desktop */}
// //       <Link to="/search" className="hidden md:flex flex-1 max-w-sm items-center gap-2 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl h-9 px-3 text-[#555] hover:border-[#6C63FF] transition-colors">
// //         <Search className="w-4 h-4" />
// //         <span className="text-sm">Search sayari, creators...</span>
// //       </Link>

// //       <div className="flex items-center gap-2 ml-auto">
// //         {isAuthenticated ? (
// //           <>
// //             <Button
// //               variant="primary" size="sm"
// //               icon={<Plus className="w-4 h-4" />}
// //               className="hidden sm:flex"
// //               onClick={() => openPostModal('image')}
// //             >
// //               Create
// //             </Button>

// //             {/* Notifications */}
// //             <Link to="/notifications" className="relative p-2 text-[#888] hover:text-white transition-colors">
// //               <Bell className="w-5 h-5" />
// //               {unreadCount > 0 && (
// //                 <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6584] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
// //                   {unreadCount > 9 ? '9+' : unreadCount}
// //                 </span>
// //               )}
// //             </Link>

// //             {/* Avatar menu */}
// //             <div className="relative group">
// //               <button className="flex items-center">
// //                 <Avatar user={user} size="sm" />
// //               </button>
// //               <div className="absolute right-0 top-full mt-2 w-52 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 overflow-hidden">
// //                 <div className="px-4 py-3 border-b border-[#2E2E2E]">
// //                   <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
// //                   <p className="text-xs text-[#888] truncate">@{user?.username}</p>
// //                 </div>
// //                 {[
// //                   { to: `/@${user?.username}`, icon: User, label: 'My Channel' },
// //                   { to: '/dashboard', icon: BarChart2, label: 'Creator Dashboard' },
// //                   { to: '/saved', icon: Bookmark, label: 'Saved' },
// //                   { to: '/settings', icon: Settings, label: 'Settings' },
// //                 ].map(item => (
// //                   <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#888] hover:text-white hover:bg-[#242424] transition-colors">
// //                     <item.icon className="w-4 h-4" />{item.label}
// //                   </Link>
// //                 ))}
// //                 <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-[#242424] transition-colors w-full border-t border-[#2E2E2E]">
// //                   <LogOut className="w-4 h-4" />Logout
// //                 </button>
// //               </div>
// //             </div>
// //           </>
// //         ) : (
// //           <div className="flex items-center gap-2">
// //             <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
// //             <Link to="/register"><Button variant="primary" size="sm">Sign Up</Button></Link>
// //           </div>
// //         )}

// //         <button onClick={toggleSidebar} className="p-2 text-[#888] hover:text-white md:hidden">
// //           <Menu className="w-5 h-5" />
// //         </button>
// //       </div>
// //     </header>
// //   )
// // }



// export function Navbar() {
//   const { user, isAuthenticated, logout } = useAuthStore()
//   const { unreadCount } = useNotifStore()
//   const { toggleSidebar, openPostModal } = useUiStore()
//   const navigate = useNavigate()

//   const handleLogout = async () => {
//     try {
//       await authApi.logout(tokenStorage.getRefresh() || undefined)
//     } catch { /* ignore */ }
//     logout()
//     navigate('/login')
//   }

//   return (
//     <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-bg flex items-center justify-between px-4 gap-4 select-none">

//       {/* Left: Logo / Home Icon (Spotify Style Header Structure) */}
//       <div className="flex items-center gap-3 shrink-0">
//         <Link 
//           to="/" 
//           className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-text hover:scale-105 hover:bg-surface2 transition-all shadow-md"
//           title="Home"
//         >
//           <Home className="w-5 h-5" />
//         </Link>
//       </div>

//       {/* Center: Spotify-style Search Bar */}
//       <div className="hidden md:flex flex-1 max-w-xl items-center">
//         <Link 
//           to="/search" 
//           className="w-full group flex items-center gap-3 bg-surface hover:bg-surface2 border border-transparent hover:border-border rounded-full h-11 px-4 text-muted transition-all shadow-inner"
//         >
//           <Search className="w-5 h-5 text-muted group-hover:text-text transition-colors shrink-0" />
//           <span className="text-sm tracking-wide truncate">What do you want to play?</span>
//         </Link>
//       </div>

//       {/* Right: Actions, Install App, Notifications & Profile/Login */}
//       <div className="flex items-center gap-3 shrink-0 ml-auto">

//         {/* Install App Button (Spotify style) */}
//         <button 
//           onClick={() => alert('Download app feature coming soon!')}
//           className="hidden lg:flex items-center gap-2 bg-surface hover:bg-surface2 text-text text-xs font-bold px-3.5 py-2 rounded-full transition-all border border-border/50"
//         >
//           <FolderDown className="w-4 h-4 text-primary" />
//           <span>Install App</span>
//         </button>

//         {isAuthenticated ? (
//           <>
//             {/* Create Post Button */}
//             <Button
//               variant="primary" 
//               size="sm"
//               icon={<Plus className="w-4 h-4" />}
//               className="hidden sm:flex !rounded-full !bg-text !text-bg hover:!bg-primary hover:!text-bg font-bold px-4 transition-all"
//               onClick={() => openPostModal('image')}
//             >
//               Create
//             </Button>

//             {/* Notifications */}
//             <Link 
//               to="/notifications" 
//               className="relative w-10 h-10 bg-surface hover:bg-surface2 flex items-center justify-center rounded-full text-muted hover:text-text transition-all"
//               title="Notifications"
//             >
//               <Bell className="w-5 h-5" />
//               {unreadCount > 0 && (
//                 <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-bg" />
//               )}
//             </Link>

//             {/* Avatar menu */}
//             <div className="relative group">
//               <button className="flex items-center p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all">
//                 <Avatar user={user} size="sm" />
//               </button>
//               <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden py-1 z-50">
//                 <div className="px-4 py-3 border-b border-border">
//                   <p className="text-sm font-semibold text-text truncate">{user?.displayName}</p>
//                   <p className="text-xs text-muted truncate font-mono">@{user?.username}</p>
//                 </div>
//                 {[
//                   { to: `/@${user?.username}`, icon: User, label: 'My Channel' },
//                   { to: '/dashboard', icon: BarChart2, label: 'Creator Dashboard' },
//                   { to: '/saved', icon: Bookmark, label: 'Saved' },
//                   { to: '/settings', icon: Settings, label: 'Settings' },
//                 ].map(item => (
//                   <Link 
//                     key={item.to} 
//                     to={item.to} 
//                     className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
//                   >
//                     <item.icon className="w-4 h-4" />{item.label}
//                   </Link>
//                 ))}
//                 <button 
//                   onClick={handleLogout} 
//                   className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-surface2 transition-colors w-full border-t border-border mt-1"
//                 >
//                   <LogOut className="w-4 h-4" />Logout
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           /* Unauthenticated state: Only Login Button (rounded white pill style) */
//           <div className="flex items-center gap-2">
//             <Link to="/login">
//               <button className="bg-text text-bg hover:scale-105 font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md">
//                 Log in
//               </button>
//             </Link>
//           </div>
//         )}

//         {/* Mobile Sidebar Toggle */}
//         <button 
//           onClick={toggleSidebar} 
//           className="w-10 h-10 bg-surface hover:bg-surface2 rounded-full flex items-center justify-center text-muted hover:text-text md:hidden transition-colors"
//           title="Toggle Sidebar"
//         >
//           <Menu className="w-5 h-5" />
//         </button>

//       </div>
//     </header>
//   )
// }

// // ── Bottom Nav (mobile) ───────────────────────

// export function BottomNav() {
//   const { isAuthenticated } = useAuthStore()
//   const { unreadCount } = useNotifStore()
//   const { openPostModal } = useUiStore()

//   const navItems = [
//     { to: '/',               icon: Home,     label: 'Home'   },
//     { to: '/explore',        icon: Compass,  label: 'Explore'},
//     ...(isAuthenticated ? [
//       { to: null,            icon: Plus,     label: 'Create', action: () => openPostModal('image') },
//       { to: '/notifications',icon: Bell,     label: 'Notifs', badge: unreadCount },
//       { to: '/dashboard',    icon: BarChart2,label: 'Studio' },
//     ] : [
//       { to: '/search',       icon: Search,   label: 'Search' },
//       { to: '/login',        icon: User,     label: 'Login'  },
//     ]),
//   ]

//   return (
//     <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0F0F0F]/95 backdrop-blur border-t border-[#2E2E2E] flex md:hidden">
//       {navItems.map(item => {
//         if (!item.to && item.action) {
//           return (
//             <button key="create" onClick={item.action} className="flex-1 flex flex-col items-center justify-center gap-1">
//               <div className="w-10 h-10 bg-[#6C63FF] rounded-xl flex items-center justify-center">
//                 <item.icon className="w-5 h-5 text-white" />
//               </div>
//             </button>
//           )
//         }
//         return (
//           <NavLink
//             key={item.to!}
//             to={item.to!}
//             end={item.to === '/'}
//             className={({ isActive }) => cn(
//               'flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors',
//               isActive ? 'text-[#6C63FF]' : 'text-[#555] hover:text-white'
//             )}
//           >
//             <div className="relative">
//               <item.icon className="w-5 h-5" />
//               {'badge' in item && item.badge && item.badge > 0 && (
//                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6584] rounded-full text-[9px] text-white flex items-center justify-center font-bold">
//                   {item.badge > 9 ? '9+' : item.badge}
//                 </span>
//               )}
//             </div>
//             <span className="text-[10px]">{item.label}</span>
//           </NavLink>
//         )
//       })}
//     </nav>
//   )
// }

// // ── Left Sidebar (desktop) ────────────────────

// // export function Sidebar() {
// //   const { user, isAuthenticated } = useAuthStore()
// //   const { unreadCount } = useNotifStore()
// //   const { openPostModal } = useUiStore()

// //   const navItems = [
// //     { to: '/',               icon: Home,     label: 'Home'         },
// //     { to: '/explore',        icon: Compass,  label: 'Explore'      },
// //     { to: '/search',         icon: Search,   label: 'Search'       },
// //     ...(isAuthenticated ? [
// //       { to: '/notifications',icon: Bell,     label: 'Notifications', badge: unreadCount },
// //       { to: '/dashboard',    icon: BarChart2,label: 'Dashboard'    },
// //       { to: '/saved',        icon: Bookmark, label: 'Saved'        },
// //       { to: '/settings',     icon: Settings, label: 'Settings'     },
// //     ] : [])
// //   ]

// //   return (
// //     <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-56 border-r border-[#2E2E2E] bg-[#0F0F0F] p-4 gap-2 overflow-y-auto">
// //       {isAuthenticated && (
// //         <Button
// //           variant="primary"
// //           icon={<Plus className="w-4 h-4" />}
// //           onClick={() => openPostModal('image')}
// //           className="mb-2"
// //         >
// //           Create Post
// //         </Button>
// //       )}

// //       {navItems.map(item => (
// //         <NavLink
// //           key={item.to}
// //           to={item.to}
// //           end={item.to === '/'}
// //           className={({ isActive }) => cn(
// //             'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative',
// //             isActive ? 'bg-[#6C63FF]/20 text-[#6C63FF]' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'
// //           )}
// //         >
// //           <item.icon className="w-5 h-5 shrink-0" />
// //           {item.label}
// //           {'badge' in item && item.badge && item.badge > 0 && (
// //             <span className="ml-auto w-5 h-5 bg-[#FF6584] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
// //               {item.badge > 9 ? '9+' : item.badge}
// //             </span>
// //           )}
// //         </NavLink>
// //       ))}

// //       {user && (
// //         <Link to={`/@${user.username}`} className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1A1A1A] transition-colors">
// //           <Avatar user={user} size="sm" />
// //           <div className="overflow-hidden">
// //             <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
// //             <p className="text-xs text-[#888] truncate">@{user.username}</p>
// //           </div>
// //         </Link>
// //       )}
// //     </aside>
// //   )
// // }









// // export function Sidebar() {
// //   const [isCollapsed, setIsCollapsed] = useState(false)
// //   const { user, isAuthenticated } = useAuthStore()
// //   const { unreadCount } = useNotifStore()
// //   const { openPostModal } = useUiStore()

// //   const navItems = [
// //     { to: '/',            icon: Home,      label: 'Home'          },
// //     { to: '/explore',     icon: Compass,   label: 'Explore'       },
// //     { to: '/search',      icon: Search,    label: 'Search'        },
// //     ...(isAuthenticated ? [
// //       { to: '/notifications', icon: Bell,      label: 'Notifications', badge: unreadCount },
// //       { to: '/dashboard',     icon: BarChart2, label: 'Dashboard'     },
// //       { to: '/saved',         icon: Bookmark,  label: 'Saved'         },
// //       { to: '/settings',      icon: Settings,  label: 'Settings'      },
// //     ] : [])
// //   ]

// //   return (
// //     <aside 
// //       className={cn(
// //         "hidden md:flex flex-col fixed left-4 top-4 bottom-4 bg-[#0A0A0A] border border-[#1F1F1F] rounded-[32px] p-4 gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl backdrop-blur-xl z-40",
// //         isCollapsed ? "w-24" : "w-64"
// //       )}
// //     >
// //       {/* Header / Toggle Area */}
// //       <div className="h-20 flex items-center justify-between px-2">
// //         {!isCollapsed && (
// //           <div className="flex items-center gap-3 px-2">
// //             <div className="w-8 h-8 bg-[#D8B26B] rounded-xl flex items-center justify-center text-[#0A0A0A]">
// //               <ShieldCheck className="w-5 h-5" />
// //             </div>
// //             <span className="font-bold text-white tracking-wide">SAYARI</span>
// //           </div>
// //         )}
// //         <button 
// //           onClick={() => setIsCollapsed(!isCollapsed)}
// //           className={cn(
// //             "w-10 h-10 flex items-center justify-center rounded-full border border-[#1F1F1F] text-[#71717A] hover:text-white hover:border-[#D8B26B] transition-all",
// //             isCollapsed && "mx-auto"
// //           )}
// //         >
// //           <Menu className="w-4 h-4" />
// //         </button>
// //       </div>

// //       {/* Action Button */}
// //       {isAuthenticated && (
// //         <Button
// //           variant="primary"
// //           icon={<Plus className="w-4 h-4" />}
// //           onClick={() => openPostModal('image')}
// //           className={cn(
// //             "!bg-[#D8B26B] !text-[#0A0A0A] font-bold rounded-2xl transition-all duration-300",
// //             isCollapsed ? "w-10 h-10 px-0 rounded-full" : "w-full"
// //           )}
// //         >
// //           {!isCollapsed && "Create Post"}
// //         </Button>
// //       )}

// //       {/* Navigation */}
// //       <nav className="flex-1 overflow-y-auto px-1 py-2 flex flex-col gap-1 scrollbar-hide">
// //         {navItems.map(item => (
// //           <NavLink
// //             key={item.to}
// //             to={item.to}
// //             end={item.to === '/'}
// //             className={({ isActive }) => cn(
// //               'group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative',
// //               isActive 
// //                 ? 'bg-[#1A1814] text-[#D8B26B] shadow-[inset_4px_0_0_#D8B26B]' 
// //                 : 'text-[#71717A] hover:bg-[#141414] hover:text-[#EAE5DB]',
// //               isCollapsed && "justify-center px-0"
// //             )}
// //           >
// //             <item.icon className={cn("w-5 h-5 shrink-0 transition-all duration-300", !isCollapsed && "group-hover:scale-110")} />
// //             {!isCollapsed && item.label}

// //             {!isCollapsed && 'badge' in item && item.badge !== undefined && item.badge > 0 && (
// //               <span className="ml-auto w-5 h-5 bg-[#D8B26B] rounded-full text-[10px] text-[#0A0A0A] flex items-center justify-center font-black">
// //                 {item.badge > 9 ? '9+' : item.badge}
// //               </span>
// //             )}
// //           </NavLink>
// //         ))}
// //       </nav>

// //       {/* User Profile */}
// //       {user && (
// //         <div className={cn("mt-auto p-2 border-t border-[#1F1F1F]", isCollapsed && "flex justify-center")}>
// //           <Link 
// //             to={`/@${user.username}`} 
// //             className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#141414] transition-all"
// //           >
// //             <Avatar user={user} size="sm" />
// //             {!isCollapsed && (
// //               <div className="overflow-hidden">
// //                 <p className="text-sm font-semibold text-[#EAE5DB] truncate">{user.displayName}</p>
// //                 <p className="text-[10px] text-[#71717A] truncate font-mono">@{user.username}</p>
// //               </div>
// //             )}
// //           </Link>
// //         </div>
// //       )}
// //     </aside>
// //   )
// // }







// // import { useState } from 'react'
// // import { NavLink, Link } from 'react-router-dom'
// // import { 
// //   Home, 
// //   Compass, 
// //   Search, 
// //   Bell, 
// //   BarChart2, 
// //   Bookmark, 
// //   Settings, 
// //   Menu, 
// //   Plus, 
// //   ShieldCheck, 
// //   Library, 
// //   Search as SearchIcon, 
// //   ListMusic, 
// //   Grid, 
// //   Heart, 
// //   Music2, 
// //   User as UserIcon,
// //   Disc3
// // } from 'lucide-react'
// // import { useAuthStore } from '@/store/useAuthStore'
// // import { useNotifStore } from '@/store/useNotifStore'
// // import { useUiStore } from '@/store/useUiStore'
// // import { Button } from '@/components/ui/Button'
// // import { Avatar } from '@/components/ui/Avatar'
// // import { cn } from '@/lib/utils'

// export function Sidebar() {
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const [libraryFilter, setLibraryFilter] = useState<'all' | 'playlists' | 'artists' | 'albums'>('all')
//   const [librarySearch, setLibrarySearch] = useState('')
//   const [isSearchOpen, setIsSearchOpen] = useState(false)

//   const { user, isAuthenticated } = useAuthStore()
//   const { unreadCount } = useNotifStore()
//   const { openPostModal } = useUiStore()

//   // Main navigation items
//   const navItems = [
//     { to: '/',            icon: Home,      label: 'Home'          },
//     { to: '/explore',     icon: Compass,   label: 'Explore'       },
//     { to: '/search',      icon: Search,    label: 'Search'        },
//     ...(isAuthenticated ? [
//       { to: '/notifications', icon: Bell,      label: 'Notifications', badge: unreadCount },
//       { to: '/dashboard',     icon: BarChart2, label: 'Dashboard'     },
//       { to: '/saved',         icon: Bookmark,  label: 'Saved'         },
//       { to: '/settings',      icon: Settings,  label: 'Settings'      },
//     ] : [])
//   ]

//   // Mock Spotify-style Library data (Playlists, Artists, Albums)
//   const libraryItems = [
//     { id: '1', title: 'Liked Songs', type: 'Playlist', meta: '13 songs', image: '', icon: Heart, isLiked: true, route: '/playlist/liked' },
//     { id: '2', title: 'Best Dandiya Hits', type: 'Playlist', meta: 'Filter India', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80', route: '/playlist/dandiya' },
//     { id: '3', title: 'Anuv Jain', type: 'Artist', meta: 'Artist', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', route: '/artist/anuv-jain', isCircle: true },
//     { id: '4', title: 'Us', type: 'Playlist', meta: 'Dadabhai', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80', route: '/playlist/us' },
//     { id: '5', title: 'Quiet Nights', type: 'Album', meta: 'Sleep tales', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&auto=format&fit=crop&q=80', route: '/album/quiet-nights' },
//     { id: '6', title: 'SleepTails', type: 'Album', meta: 'Jon E. Amber', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=80', route: '/album/sleeptails' },
//   ]

//   // Filter library items based on tab & search
//   const filteredLibrary = libraryItems.filter(item => {
//     const matchesFilter = 
//       libraryFilter === 'all' || 
//       (libraryFilter === 'playlists' && item.type === 'Playlist') ||
//       (libraryFilter === 'artists' && item.type === 'Artist') ||
//       (libraryFilter === 'albums' && item.type === 'Album')

//     const matchesSearch = item.title.toLowerCase().includes(librarySearch.toLowerCase())
//     return matchesFilter && matchesSearch
//   })

//   return (
//     <aside 
//       className={cn(
//         "hidden md:flex flex-col fixed left-4 top-4 bottom-4 bg-surface border border-border rounded-[32px] p-3 gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl backdrop-blur-xl z-40",
//         isCollapsed ? "w-24" : "w-80"
//       )}
//     >
//       {/* Top Header / Toggle Area */}
//       <div className="h-16 flex items-center justify-between px-2">
//         {!isCollapsed && (
//           <div className="flex items-center gap-3 px-1">
//             <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-bg shadow-md">
//               <ShieldCheck className="w-5 h-5" />
//             </div>
//             <span className="font-extrabold text-text tracking-wider text-base">SAYARI</span>
//           </div>
//         )}
//         <button 
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className={cn(
//             "w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted hover:text-text hover:border-primary transition-all bg-surface2/50",
//             isCollapsed && "mx-auto"
//           )}
//           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//         >
//           <Menu className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Primary Action Button */}
//       {isAuthenticated && (
//         <Button
//           variant="primary"
//           icon={<Plus className="w-4 h-4" />}
//           onClick={() => openPostModal('image')}
//           className={cn(
//             "!bg-primary !text-bg font-bold rounded-2xl transition-all duration-300 shadow-lg hover:opacity-90",
//             isCollapsed ? "w-10 h-10 px-0 rounded-full mx-auto" : "w-full"
//           )}
//         >
//           {!isCollapsed && "Create Post"}
//         </Button>
//       )}

//       {/* Section 1: Main Menu Navigation */}
//       <nav className="px-1 py-1 flex flex-col gap-1 border-b border-border pb-3">
//         {navItems.map(item => (
//           <NavLink
//             key={item.to}
//             to={item.to}
//             end={item.to === '/'}
//             className={({ isActive }) => cn(
//               'group flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative',
//               isActive 
//                 ? 'bg-surface2 text-primary shadow-[inset_3px_0_0_var(--color-primary)] font-semibold' 
//                 : 'text-muted hover:bg-surface2/60 hover:text-text',
//               isCollapsed && "justify-center px-0"
//             )}
//           >
//             <item.icon className={cn("w-5 h-5 shrink-0 transition-all duration-300", !isCollapsed && "group-hover:scale-110")} />
//             {!isCollapsed && <span className="truncate">{item.label}</span>}

//             {!isCollapsed && 'badge' in item && item.badge !== undefined && item.badge > 0 && (
//               <span className="ml-auto w-5 h-5 bg-primary rounded-full text-[10px] text-bg flex items-center justify-center font-black">
//                 {item.badge > 9 ? '9+' : item.badge}
//               </span>
//             )}
//           </NavLink>
//         ))}
//       </nav>

//       {/* Section 2: Spotify-Style "Your Library" & Playlists Section */}
//       <div className="flex-1 flex flex-col min-h-0 pt-2">
//         {/* Library Header */}
//         {!isCollapsed ? (
//           <div className="flex flex-col gap-2.5 px-2 pb-2">
//             <div className="flex items-center justify-between text-muted">
//               <div className="flex items-center gap-2.5 text-text font-semibold text-sm">
//                 <Library className="w-5 h-5 text-primary" />
//                 <span>Your Library</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <button 
//                   onClick={() => setIsSearchOpen(!isSearchOpen)}
//                   className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface2 text-muted hover:text-text transition-all"
//                   title="Search in Library"
//                 >
//                   <SearchIcon className="w-3.5 h-3.5" />
//                 </button>
//                 <button 
//                   className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface2 text-muted hover:text-text transition-all"
//                   title="Create Playlist"
//                 >
//                   <Plus className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             {/* Expandable Library Search Bar */}
//             {isSearchOpen && (
//               <div className="relative animate-slide-up">
//                 <input
//                   type="text"
//                   placeholder="Search in Library..."
//                   value={librarySearch}
//                   onChange={(e) => setLibrarySearch(e.target.value)}
//                   className="w-full bg-surface2/80 border border-border rounded-xl px-3 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-primary transition-all"
//                 />
//               </div>
//             )}

//             {/* Filter Pills (Playlists, Artists, Albums) */}
//             <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
//               <button
//                 onClick={() => setLibraryFilter('all')}
//                 className={cn(
//                   "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
//                   libraryFilter === 'all' ? "bg-primary text-bg font-semibold" : "bg-surface2 text-muted hover:text-text"
//                 )}
//               >
//                 All
//               </button>
//               <button
//                 onClick={() => setLibraryFilter('playlists')}
//                 className={cn(
//                   "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
//                   libraryFilter === 'playlists' ? "bg-primary text-bg font-semibold" : "bg-surface2 text-muted hover:text-text"
//                 )}
//               >
//                 Playlists
//               </button>
//               <button
//                 onClick={() => setLibraryFilter('artists')}
//                 className={cn(
//                   "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
//                   libraryFilter === 'artists' ? "bg-primary text-bg font-semibold" : "bg-surface2 text-muted hover:text-text"
//                 )}
//               >
//                 Artists
//               </button>
//               <button
//                 onClick={() => setLibraryFilter('albums')}
//                 className={cn(
//                   "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
//                   libraryFilter === 'albums' ? "bg-primary text-bg font-semibold" : "bg-surface2 text-muted hover:text-text"
//                 )}
//               >
//                 Albums
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="flex justify-center py-2 text-muted hover:text-text">
//             <Library className="w-5 h-5 text-primary" title="Your Library" />
//           </div>
//         )}

//         {/* Library Scrollable Items List */}
//         <div className="flex-1 overflow-y-auto px-1 py-1 flex flex-col gap-1 scrollbar-hide">
//           {filteredLibrary.map((item) => {
//             const IconComponent = item.icon
//             return (
//               <Link
//                 key={item.id}
//                 to={item.route}
//                 className={cn(
//                   "group flex items-center gap-3 p-2 rounded-2xl hover:bg-surface2/70 transition-all duration-200 relative",
//                   isCollapsed && "justify-center p-1.5"
//                 )}
//                 title={`${item.title} • ${item.meta}`}
//               >
//                 {/* Item Thumbnail / Artwork */}
//                 <div className={cn(
//                   "relative w-11 h-11 shrink-0 bg-surface2 overflow-hidden flex items-center justify-center shadow-sm",
//                   item.isCircle ? "rounded-full" : "rounded-xl"
//                 )}>
//                   {item.image ? (
//                     <img 
//                       src={item.image} 
//                       alt={item.title} 
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
//                     />
//                   ) : item.isLiked ? (
//                     <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-300 flex items-center justify-center text-white">
//                       <Heart className="w-5 h-5 fill-white" />
//                     </div>
//                   ) : (
//                     <Disc3 className="w-5 h-5 text-muted" />
//                   )}
//                 </div>

//                 {/* Item Details */}
//                 {!isCollapsed && (
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-text truncate group-hover:text-primary transition-colors">
//                       {item.title}
//                     </p>
//                     <div className="flex items-center gap-1.5 text-[11px] text-muted truncate">
//                       {item.isLiked && <span className="text-primary font-bold">•</span>}
//                       <span className="capitalize">{item.type}</span>
//                       <span>•</span>
//                       <span className="truncate">{item.meta}</span>
//                     </div>
//                   </div>
//                 )}
//               </Link>
//             )
//           })}

//           {filteredLibrary.length === 0 && !isCollapsed && (
//             <div className="text-center py-6 px-2 text-xs text-muted">
//               No matching playlists or albums found.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* User Profile Footer Section */}
//       {user && (
//         <div className={cn("mt-auto pt-2 border-t border-border", isCollapsed && "flex justify-center")}>
//           <Link 
//             to={`/@${user.username}`} 
//             className="flex items-center gap-3 p-2 rounded-2xl hover:bg-surface2 transition-all group"
//           >
//             <Avatar user={user} size="sm" />
//             {!isCollapsed && (
//               <div className="overflow-hidden flex-1">
//                 <p className="text-sm font-semibold text-text truncate group-hover:text-primary transition-colors">{user.displayName}</p>
//                 <p className="text-[10px] text-muted truncate font-mono">@{user.username}</p>
//               </div>
//             )}
//           </Link>
//         </div>
//       )}
//     </aside>
//   )
// }



// // ── App Layout Wrapper ────────────────────────

// // export function AppLayout({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div className="min-h-screen bg-[#0F0F0F]">
// //       <Navbar />
// //       <Sidebar />
// //       <main className="pt-14 md:pl-56 pb-20 md:pb-0 min-h-screen">
// //         <div className="max-w-2xl mx-auto px-4 py-6">
// //           {children}
// //         </div>
// //       </main>
// //       <BottomNav />
// //     </div>
// //   )
// // }









// export function AppLayout({ children }: { children: React.ReactNode }) {
//   // Assuming you have or can track collapse state in your useUiStore, 
//   // or you can manage it cleanly. Here we read from useUiStore or pass layout state.
//   // Let's assume useUiStore has an `isSidebarCollapsed` state or similar. 
//   // If you track it locally in Sidebar, lifting it to useUiStore is recommended 
//   // so both Navbar and Main content can adjust dynamically!

//   const { isSidebarCollapsed } = useUiStore()

//   return (
//     <div className="min-h-screen bg-bg text-text">
//       {/* Sidebar (Fixed width transitions from w-80 to w-24 based on collapse state) */}
//       <Sidebar />

//       {/* Navbar: Dynamic left positioning and padding matching the sidebar state */}
//       <header 
//         className={cn(
//           "fixed top-0 right-0 z-30 h-16 bg-bg/90 backdrop-blur-md px-6 flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",

//           isSidebarCollapsed ? "md:left-32" : "md:left-88",
//           "left-0" 
//         )}
//       >
//         <Navbar />
//       </header>

//       {/* Main Content Area: Adapts margin-left dynamically */}
//       <main 
//         className={cn(
//           "pt-20 pb-24 md:pb-12 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
//           isSidebarCollapsed ? "md:ml-32" : "md:ml-88",
//           "ml-0 px-4 md:px-8"
//         )}
//       >
//         <div className="max-w-4xl mx-auto">
//           {children}
//         </div>
//       </main>

//       {/* Mobile Bottom Navigation Bar */}
//       <BottomNav />
//     </div>
//   )
// }






























import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Compass, Search, Bell, Plus, User,
  LogOut, Settings, BarChart2, Bookmark, Menu, X, ShieldCheck, Library,
  Search as SearchIcon,
  ListMusic,
  Grid,
  Heart,
  Music2,
  User as UserIcon,
  Disc3,
  FolderDown,
  Moon,
  Sun
} from 'lucide-react'

import { useAuthStore } from '../../store/auth.store'
import { useNotifStore, useUiStore } from '../../store/index'
import { authApi } from '../../api'
import { tokenStorage } from '../../api/client'
import { Avatar, Button } from '../ui'
import { cn } from '../../utils'
import toast from 'react-hot-toast'

import LogoLight from '../../assets/logoLight.png'
import LogoDark from '../../assets/logoDark.png'






// export function Navbar() {
//   const { user, isAuthenticated, logout } = useAuthStore()
//   const { unreadCount } = useNotifStore()
//   const { toggleSidebar, openPostModal } = useUiStore()
//   const navigate = useNavigate()

//   const handleLogout = async () => {
//     try {
//       await authApi.logout(tokenStorage.getRefresh() || undefined)
//     } catch { /* ignore */ }
//     logout()
//     navigate('/login')
//   }

//   return (
//     <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-bg flex items-center justify-between px-4 gap-4 select-none">

//       {/* Left: Logo / Home Icon (Spotify Style Header Structure) */}
//       <div className="flex items-center gap-3 shrink-0">
//         <Link 
//           to="/" 
//           className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-text hover:scale-105 hover:bg-surface2 transition-all shadow-md"
//           title="Home"
//         >
//           <Home className="w-5 h-5" />
//         </Link>
//       </div>

//       {/* Center: Spotify-style Search Bar */}
//       <div className="hidden md:flex flex-1 max-w-xl items-center">
//         <Link 
//           to="/search" 
//           className="w-full group flex items-center gap-3 bg-surface hover:bg-surface2 border border-transparent hover:border-border rounded-full h-11 px-4 text-muted transition-all shadow-inner"
//         >
//           <Search className="w-5 h-5 text-muted group-hover:text-text transition-colors shrink-0" />
//           <span className="text-sm tracking-wide truncate">What do you want to play?</span>
//         </Link>
//       </div>

//       {/* Right: Actions, Install App, Notifications & Profile/Login */}
//       <div className="flex items-center gap-3 shrink-0 ml-auto">

//         {/* Install App Button (Spotify style) */}
//         <button 
//           onClick={() => alert('Download app feature coming soon!')}
//           className="hidden lg:flex items-center gap-2 bg-surface hover:bg-surface2 text-text text-xs font-bold px-3.5 py-2 rounded-full transition-all border border-border/50"
//         >
//           <FolderDown className="w-4 h-4 text-primary" />
//           <span>Install App</span>
//         </button>

//         {isAuthenticated ? (
//           <>
//             {/* Create Post Button */}
//             <Button
//               variant="primary" 
//               size="sm"
//               icon={<Plus className="w-4 h-4" />}
//               className="hidden sm:flex !rounded-full !bg-text !text-bg hover:!bg-primary hover:!text-bg font-bold px-4 transition-all"
//               onClick={() => openPostModal('image')}
//             >
//               Create
//             </Button>

//             {/* Notifications */}
//             <Link 
//               to="/notifications" 
//               className="relative w-10 h-10 bg-surface hover:bg-surface2 flex items-center justify-center rounded-full text-muted hover:text-text transition-all"
//               title="Notifications"
//             >
//               <Bell className="w-5 h-5" />
//               {unreadCount > 0 && (
//                 <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-bg" />
//               )}
//             </Link>

//             {/* Avatar menu */}
//             <div className="relative group">
//               <button className="flex items-center p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all">
//                 <Avatar user={user} size="sm" />
//               </button>
//               <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden py-1 z-50">
//                 <div className="px-4 py-3 border-b border-border">
//                   <p className="text-sm font-semibold text-text truncate">{user?.displayName}</p>
//                   <p className="text-xs text-muted truncate font-mono">@{user?.username}</p>
//                 </div>
//                 {[
//                   { to: `/@${user?.username}`, icon: User, label: 'My Channel' },
//                   { to: '/dashboard', icon: BarChart2, label: 'Creator Dashboard' },
//                   { to: '/saved', icon: Bookmark, label: 'Saved' },
//                   { to: '/settings', icon: Settings, label: 'Settings' },
//                 ].map(item => (
//                   <Link 
//                     key={item.to} 
//                     to={item.to} 
//                     className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
//                   >
//                     <item.icon className="w-4 h-4" />{item.label}
//                   </Link>
//                 ))}
//                 <button 
//                   onClick={handleLogout} 
//                   className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-surface2 transition-colors w-full border-t border-border mt-1"
//                 >
//                   <LogOut className="w-4 h-4" />Logout
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           /* Unauthenticated state: Only Login Button (rounded white pill style) */
//           <div className="flex items-center gap-2">
//             <Link to="/login">
//               <button className="bg-text text-bg hover:scale-105 font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md">
//                 Log in
//               </button>
//             </Link>
//           </div>
//         )}

//         {/* Mobile Sidebar Toggle */}
//         <button 
//           onClick={toggleSidebar} 
//           className="w-10 h-10 bg-surface hover:bg-surface2 rounded-full flex items-center justify-center text-muted hover:text-text md:hidden transition-colors"
//           title="Toggle Sidebar"
//         >
//           <Menu className="w-5 h-5" />
//         </button>

//       </div>
//     </header>
//   )
// }

// ── Bottom Nav (mobile) ───────────────────────

export function BottomNav() {
  const { isAuthenticated } = useAuthStore()
  const { unreadCount } = useNotifStore()
  const { openPostModal } = useUiStore()

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    ...(isAuthenticated ? [
      { to: null, icon: Plus, label: 'Create', action: () => openPostModal('image') },
      { to: '/notifications', icon: Bell, label: 'Notifs', badge: unreadCount },
      { to: '/dashboard', icon: BarChart2, label: 'Studio' },
    ] : [
      { to: '/search', icon: Search, label: 'Search' },
      { to: '/login', icon: User, label: 'Login' },
    ]),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0F0F0F]/95 backdrop-blur border-t border-[#2E2E2E] flex md:hidden">
      {navItems.map(item => {
        if (!item.to && item.action) {
          return (
            <button key="create" onClick={item.action} className="flex-1 flex flex-col items-center justify-center gap-1">
              <div className="w-10 h-10 bg-[#6C63FF] rounded-xl flex items-center justify-center">
                <item.icon className="w-5 h-5 text-white" />
              </div>
            </button>
          )
        }
        return (
          <NavLink
            key={item.to!}
            to={item.to!}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors',
              isActive ? 'text-[#6C63FF]' : 'text-[#555] hover:text-white'
            )}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {'badge' in item && item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6584] rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}








export function Sidebar() {
  // 1. USE GLOBAL STORE INSTEAD OF LOCAL useState
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUiStore()

  const [libraryFilter, setLibraryFilter] = useState<'all' | 'playlists' | 'artists' | 'albums'>('all')
  const [librarySearch, setLibrarySearch] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const { user, isAuthenticated } = useAuthStore()
  const { unreadCount } = useNotifStore()
  const { openPostModal } = useUiStore()

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/search', icon: Search, label: 'Search' },
    ...(isAuthenticated ? [
      { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
      { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
      // { to: '/saved', icon: Bookmark, label: 'Saved' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ] : [])
  ]

  const libraryItems = [
    { id: '1', title: 'Liked Songs', type: 'Playlist', meta: '13 songs', image: '', icon: Heart, isLiked: true, route: '/playlist/liked' },
    { id: '2', title: 'Best Dandiya Hits', type: 'Playlist', meta: 'Filter India', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80', route: '/playlist/dandiya' },
    { id: '3', title: 'Anuv Jain', type: 'Artist', meta: 'Artist', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', route: '/artist/anuv-jain', isCircle: true },
    { id: '4', title: 'Us', type: 'Playlist', meta: 'Dadabhai', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80', route: '/playlist/us' },
    { id: '5', title: 'Quiet Nights', type: 'Album', meta: 'Sleep tales', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&auto=format&fit=crop&q=80', route: '/album/quiet-nights' },
    { id: '6', title: 'SleepTails', type: 'Album', meta: 'Jon E. Amber', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=80', route: '/album/sleeptails' },
  ]

  const filteredLibrary = libraryItems.filter(item => {
    const matchesFilter =
      libraryFilter === 'all' ||
      (libraryFilter === 'playlists' && item.type === 'Playlist') ||
      (libraryFilter === 'artists' && item.type === 'Artist') ||
      (libraryFilter === 'albums' && item.type === 'Album')

    const matchesSearch = item.title.toLowerCase().includes(librarySearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed left-4 top-18 bottom-4 bg-surface border border-border rounded-[32px] p-3 gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl backdrop-blur-xl z-40",
        // 2. CHECK GLOBAL STATE FOR WIDTH
        isSidebarCollapsed ? "w-24" : "w-80"
      )}
    >
      <div className="h-16 flex items-center justify-between px-2">
        {!isSidebarCollapsed && (
          // <div className="flex items-center gap-3 px-1">
          //   <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-bg shadow-md">
          //     <ShieldCheck className="w-5 h-5" />
          //   </div>
          //   <span className="font-extrabold text-text tracking-wider text-base">SAYARI</span>
          // </div>

          <div className="flex items-center gap-3 px-1">
            <img
              src={LogoLight}
              alt="ALFAZ Logo"
              className="w-28 h-18 object-contain dark:hidden"
            />
            <img
              src={LogoDark}
              alt="ALFAZ Logo"
              className="w-28 h-18 object-contain hidden dark:block"
            />
            {/* <span className="font-extrabold text-text tracking-wider text-base">ALFAZ</span> */}
          </div>
        )}
        <button
          onClick={toggleSidebarCollapse} // 3. TRIGGER GLOBAL ACTION
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted hover:text-text hover:border-primary transition-all bg-surface2/50",
            isSidebarCollapsed && "mx-auto"
          )}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* {isAuthenticated && (
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openPostModal('image')}
          className={cn(
            "!bg-primary !text-bg font-bold rounded-2xl transition-all duration-300 shadow-lg hover:opacity-90",
            isSidebarCollapsed ? "w-10 h-10 px-0 rounded-full mx-auto" : "w-full"
          )}
        >
          {!isSidebarCollapsed && "Create Post"}
        </Button>
      )} */}

      <nav className="px-1 py-1 flex flex-col gap-1 border-b border-border  pb-3">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'group flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative',
              isActive
                ? 'bg-surface2 text-primary shadow-[inset_3px_0_0_var(--color-primary)] font-semibold'
                : 'text-muted hover:bg-surface2/60 hover:text-text',
              isSidebarCollapsed && "justify-center px-0"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0 transition-all duration-300", !isSidebarCollapsed && "group-hover:scale-110")} />
            {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}

            {!isSidebarCollapsed && 'badge' in item && item.badge !== undefined && item.badge > 0 && (
              <span className="ml-auto w-5 h-5 bg-primary rounded-full text-[10px] text-bg flex items-center justify-center font-black">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 flex flex-col min-h-0 pt-2">
        {!isSidebarCollapsed ? (
          <div className="flex flex-col gap-2.5 px-2 pb-2">
            <div className="flex items-center justify-between text-muted">
              <div className="flex items-center gap-2.5 text-text font-semibold text-sm">
                <Library className="w-5 h-5 text-primary" />
                <span>Your Library</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface2 text-muted hover:text-text transition-all"
                >
                  <SearchIcon className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface2 text-muted hover:text-text transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isSearchOpen && (
              <div className="relative animate-slide-up">
                <input
                  type="text"
                  placeholder="Search in Library..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full bg-surface2/80 border border-border rounded-xl px-3 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {['all', 'playlists', 'artists', 'albums'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLibraryFilter(tab as any)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap capitalize",
                    libraryFilter === tab ? "bg-primary text-bg font-semibold" : "bg-surface2 text-muted hover:text-text"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2 text-muted hover:text-text">
            <Library className="w-5 h-5 text-primary" title="Your Library" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-1 py-1 flex flex-col gap-1 scrollbar-hide">
          {filteredLibrary.map((item) => (
            <Link
              key={item.id}
              to={item.route}
              className={cn(
                "group flex items-center gap-3 p-2 rounded-2xl hover:bg-surface2/70 transition-all duration-200 relative",
                isSidebarCollapsed && "justify-center p-1.5"
              )}
            >
              <div className={cn(
                "relative w-11 h-11 shrink-0 bg-surface2 overflow-hidden flex items-center justify-center shadow-sm",
                item.isCircle ? "rounded-full" : "rounded-xl"
              )}>
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : item.isLiked ? (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-300 flex items-center justify-center text-white">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                ) : (
                  <Disc3 className="w-5 h-5 text-muted" />
                )}
              </div>

              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted truncate">
                    {item.isLiked && <span className="text-primary font-bold">•</span>}
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <span className="truncate">{item.meta}</span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {user && (
        <div className={cn("mt-auto pt-2 border-t border-border", isSidebarCollapsed && "flex justify-center")}>
          <Link to={`/@${user.username}`} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-surface2 transition-all group">
            <Avatar user={user} size="sm" />
            {!isSidebarCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-text truncate group-hover:text-primary transition-colors">{user.displayName}</p>
                <p className="text-[10px] text-muted truncate font-mono">@{user.username}</p>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Theme button  */}
      {/* <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-surface2/50 border border-border">
        <span className="text-sm font-medium text-text">Theme</span>
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="w-12 h-6 flex items-center rounded-full bg-surface2 border border-border p-1 transition-colors relative"
        >
          <div className="w-4 h-4 rounded-full bg-primary transition-transform transform dark:translate-x-6" />
        </button>
      </div> */}



    </aside>
  )
}









export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const { unreadCount } = useNotifStore()
  const { toggleSidebar, openPostModal } = useUiStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  return (
    /* Removed fixed positioning from here so AppLayout's wrapper header controls position & width smoothly */
    <div className="w-full h-full flex items-center justify-between gap-4 select-none bg-transparent">

      {/* Left: Home Icon */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/"
          className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-text hover:scale-105 hover:bg-surface2 transition-all shadow-md"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </Link>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xl items-center">
        <Link
          to="/search"
          className="w-full group flex items-center gap-3 bg-surface hover:bg-surface2 border border-transparent hover:border-border rounded-full h-11 px-4 text-muted transition-all shadow-inner"
        >
          <Search className="w-5 h-5 text-muted group-hover:text-text transition-colors shrink-0" />
          <span className="text-sm tracking-wide truncate">What do you want to play?</span>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <button
          onClick={() => alert('Download app feature coming soon!')}
          className="hidden lg:flex items-center gap-2 bg-surface hover:bg-surface2 text-text text-xs font-bold px-3.5 py-2 rounded-full transition-all border border-border/50"
        >
          <FolderDown className="w-4 h-4 text-primary" />
          <span>Install App</span>
        </button>

        {/* {isAuthenticated ? (
          <>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              className="hidden sm:flex !rounded-full !bg-text !text-bg hover:!bg-primary hover:!text-bg font-bold px-4 transition-all"
              onClick={() => openPostModal('image')}
            >
              Create
            </Button>

            <Link
              to="/notifications"
              className="relative w-10 h-10 bg-surface hover:bg-surface2 flex items-center justify-center rounded-full text-muted hover:text-text transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-bg" />
              )}
            </Link>

            <div className="relative group">
              <button className="flex items-center p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all">
                <Avatar user={user} size="sm" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text truncate">{user?.displayName}</p>
                  <p className="text-xs text-muted truncate font-mono">@{user?.username}</p>
                </div>
                {[
                  { to: `/@${user?.username}`, icon: User, label: 'My Channel' },
                  { to: '/dashboard', icon: BarChart2, label: 'Creator Dashboard' },
                  { to: '/saved', icon: Bookmark, label: 'Saved' },
                  { to: '/settings', icon: Settings, label: 'Settings' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />{item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-surface2 transition-colors w-full border-t border-border mt-1"
                >
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="bg-text text-bg hover:scale-105 font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md">
                Log in
              </button>
            </Link>
          </div>
        )} */}


        {isLoading ? (
          <div className="w-10 h-10 rounded-full bg-surface2 animate-pulse" />
        ) : isAuthenticated ? (
          <>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              className="hidden sm:flex !rounded-full !bg-text !text-bg hover:!bg-primary hover:!text-bg font-bold px-4 transition-all"
              onClick={() => openPostModal('image')}
            >
              Create
            </Button>

            <Link
              to="/notifications"
              className="relative w-10 h-10 bg-surface hover:bg-surface2 flex items-center justify-center rounded-full text-muted hover:text-text transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-bg" />
              )}
            </Link>

            <div className="relative group">
              <button className="flex items-center p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all">
                <Avatar user={user} size="sm" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text truncate">{user?.displayName}</p>
                  <p className="text-xs text-muted truncate font-mono">@{user?.username}</p>
                </div>
                {[
                  { to: `/@${user?.username}`, icon: User, label: 'My Channel' },
                  { to: '/dashboard', icon: BarChart2, label: 'Creator Dashboard' },
                  { to: '/saved', icon: Bookmark, label: 'Saved' },
                  { to: '/settings', icon: Settings, label: 'Settings' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />{item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-surface2 transition-colors w-full border-t border-border mt-1"
                >
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="bg-text text-bg hover:scale-105 font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md">
                Log in
              </button>
            </Link>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="w-10 h-10 bg-surface hover:bg-surface2 rounded-full flex items-center justify-center text-muted hover:text-text md:hidden transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}







// export function AppLayout({ children }: { children: React.ReactNode }) {
//   const { isSidebarCollapsed } = useUiStore()

//   return (
//     <div className="min-h-screen bg-bg text-text relative flex w-full overflow-x-hidden">
//       {/* 1. Sidebar (Fixed position) */}
//       <Sidebar />

//       {/* 2. Wrapper container for Header + Main Content that shifts automatically */}
//       <div 
//         className={cn(
//           "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
//           // When collapsed, sidebar takes less room (ml-28). When expanded, it takes more (ml-84).
//           isSidebarCollapsed ? "md:ml-28" : "md:ml-84",
//           "ml-0"
//         )}
//       >
//         {/* Dynamic Header */}
//         <header className="sticky top-4 z-30 mx-4 mb-4 h-16 bg-bg/85 backdrop-blur-xl border border-border/50 rounded-2xl px-4 flex items-center shadow-lg">
//           <Navbar />
//         </header>

//         {/* Main Content Area */}
//         <main className="flex-1 px-4 md:px-8 pb-24 md:pb-12">
//           <div className="max-w-4xl mx-auto">
//             {children}
//           </div>
//         </main>
//       </div>

//       {/* 3. Mobile Bottom Navigation */}
//       <BottomNav />
//     </div>
//   )
// }


// export function AppLayout({ children }: { children: React.ReactNode }) {
//   const { isSidebarCollapsed } = useUiStore()

//   return (
//     <div className="min-h-screen bg-bg text-text relative flex flex-col w-full overflow-x-hidden">
//       {/* 1. Header/Navbar - Fixed at top, full screen width */}
//       <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-bg/85 backdrop-blur-xl border-b border-border/50 px-4 flex items-center shadow-lg">
//         <div className="w-full">
//           <Navbar />
//         </div>
//       </header>

//       {/* 2. Main wrapper with sidebar */}
//       <div className="flex flex-1 pt-16">
//         {/* Sidebar */}
//         <Sidebar />

//         {/* Main Content - Width changes based on sidebar toggle */}
//         <div
//           className={cn(
//             "flex-1 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
//             // When collapsed, sidebar takes less room (ml-28). When expanded, it takes more (ml-84)
//             isSidebarCollapsed ? "md:ml-28" : "md:ml-84",
//             "ml-0"
//           )}
//         >
//           <main className="px-4 md:px-8 py-6 pb-24 md:pb-12">
//             <div className="max-w-7xl mx-auto w-full ">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* 3. Mobile Bottom Navigation */}
//       <BottomNav />
//     </div>
//   )
// }


// export function AppLayout({ children }: { children: React.ReactNode }) {
//   const { isSidebarCollapsed } = useUiStore()

//   return (
//     <div className="min-h-screen bg-bg text-text flex flex-col w-full overflow-hidden">
//       {/* 1. Header/Navbar - Fixed at top, full screen width */}
//       <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-bg/85 backdrop-blur-xl border-b border-border/50 px-4 flex items-center shadow-lg">
//         <div className="w-full">
//           <Navbar />
//         </div>
//       </header>

//       {/* 2. Main wrapper with sidebar */}
//       <div className="flex flex-1 pt-16 h-screen overflow-hidden">
//         {/* Sidebar - Fixed/sticky */}
//         <Sidebar />

//         {/* Main Content - Scrollable area */}
//         <div
//           className={cn(
//             "flex-1 h-full overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]  ",
//             // When collapsed, sidebar takes less room (ml-28). When expanded, it takes more (ml-84)
//             isSidebarCollapsed ? "md:ml-28" : "md:ml-84",
//             "ml-0"
//           )}
//         >
//           <main className="px-4 md:px-8 py-6 pb-24 md:pb-12 border">
//             <div className="max-w-7xl mx-auto w-full">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* 3. Mobile Bottom Navigation */}
//       <BottomNav />
//     </div>
//   )
// }


// export function AppLayout({ children }: { children: React.ReactNode }) {
//   const { isSidebarCollapsed } = useUiStore()

//   return (
//     <div className="min-h-screen bg-bg text-text flex flex-col w-full overflow-hidden">
//       {/* 1. Header/Navbar - Fixed at top, full screen width */}
//       <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-bg/85 backdrop-blur-xl border-b border-border/50 px-4 flex items-center shadow-lg">
//         <div className="w-full">
//           <Navbar />
//         </div>
//       </header>

//       {/* 2. Main wrapper with sidebar */}
//       <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)] overflow-hidden">
//         {/* Sidebar - Fixed/sticky */}
//         <Sidebar />

//         {/* Main Content - Scrollable area with fixed height */}
//         <div
//           className={cn(
//             "flex-1 h-full overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
//             // When collapsed, sidebar takes less room (ml-28). When expanded, it takes more (ml-84)
//             isSidebarCollapsed ? "md:ml-28" : "md:ml-84",
//             "ml-0"
//           )}
//         >
//           <main className="px-4 md:px-8 py-6 pb-24 md:pb-12 min-h-full">
//             <div className="max-w-7xl mx-auto w-full">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* 3. Mobile Bottom Navigation */}
//       <BottomNav />
//     </div>
//   )
// }


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUiStore()


  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const dark = !isDark;

    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  };

  return (
    <div className="h-screen bg-bg text-text flex flex-col w-full overflow-hidden">
      {/* 1. Header/Navbar - Fixed at top */}
      <header className="flex-shrink-0 h-16 bg-bg/85 backdrop-blur-xl border-b border-border/50 px-4 flex items-center shadow-lg">
        <div className="w-full">
          <Navbar />
        </div>
      </header>

      {/* 2. Main wrapper with sidebar */}
      <div className="flex flex-1 min-h-0 overflow-hidden ">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content - This container is FIXED in height, NO scrolling */}
        <div
          className={cn(
            "flex-1 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] p-2",
            isSidebarCollapsed ? "md:ml-28" : "md:ml-84",
            "ml-0"
          )}
        >
          {/* This main tag has FIXED height and contains the scrollable area */}
          <main className="h-full  overflow-hidden rounded-[32px] border border-border">
            <div className="max-w-7xl mx-auto w-full h-full overflow-hidden">
              {/* ONLY THIS INNER DIV IS SCROLLABLE */}
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-surface2 hover:scrollbar-thumb-border">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <BottomNav />


      {/* Theme navigation */}

      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-surface2 border border-border shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}