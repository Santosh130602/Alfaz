// // import { NavLink, useNavigate } from 'react-router-dom'
// // import {
// //   LayoutDashboard, Users, FileText, Flag, Image as ImageIcon,
// //   Megaphone, ScrollText, Settings, LogOut, ShieldCheck
// // } from 'lucide-react'
// // import { useAdminAuthStore } from '../../store/auth.store'
// // import { authApi } from '../../api'
// // import { tokenStorage } from '../../api/client'
// // import { Avatar } from '../ui'
// // import { cn } from '../../utils'

// // const NAV_ITEMS = [
// //   { to: '/',              icon: LayoutDashboard, label: 'Dashboard'     },
// //   { to: '/users',         icon: Users,           label: 'Users'         },
// //   { to: '/posts',         icon: FileText,        label: 'Content'       },
// //   { to: '/reports',       icon: Flag,            label: 'Reports'       },
// //   { to: '/templates',     icon: ImageIcon,       label: 'Templates'     },
// //   { to: '/announcements', icon: Megaphone,       label: 'Announcements' },
// //   { to: '/audit-log',     icon: ScrollText,      label: 'Audit Log'     },
// //   { to: '/config',        icon: Settings,        label: 'App Config'    },
// // ]

// // export function AdminLayout({ children }: { children: React.ReactNode }) {
// //   const { user, logout } = useAdminAuthStore()
// //   const navigate = useNavigate()

// //   const handleLogout = async () => {
// //     try { await authApi.logout(tokenStorage.getRefresh() || undefined) } catch {}
// //     logout()
// //     navigate('/login')
// //   }

// //   return (
// //     <div className="min-h-screen bg-[#0F0F0F] flex">
// //       {/* Sidebar */}
// //       <aside className="w-60 shrink-0 border-r border-[#2E2E2E] flex flex-col h-screen sticky top-0">
// //         {/* Logo */}
// //         <div className="h-16 flex items-center gap-2 px-5 border-b border-[#2E2E2E]">
// //           <div className="w-8 h-8 bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-xl flex items-center justify-center text-white">
// //             <ShieldCheck className="w-4 h-4" />
// //           </div>
// //           <div>
// //             <p className="text-sm font-bold text-white leading-none">Sayari</p>
// //             <p className="text-[10px] text-[#888] mt-0.5">Admin Console</p>
// //           </div>
// //         </div>

// //         {/* Nav */}
// //         <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
// //           {NAV_ITEMS.map(item => (
// //             <NavLink
// //               key={item.to}
// //               to={item.to}
// //               end={item.to === '/'}
// //               className={({ isActive }) => cn(
// //                 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
// //                 isActive ? 'bg-[#6C63FF]/20 text-[#6C63FF]' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'
// //               )}
// //             >
// //               <item.icon className="w-4.5 h-4.5 shrink-0" />
// //               {item.label}
// //             </NavLink>
// //           ))}
// //         </nav>

// //         {/* User info + logout */}
// //         <div className="p-3 border-t border-[#2E2E2E]">
// //           <div className="flex items-center gap-3 px-2 py-2 mb-1">
// //             <Avatar user={user} size="sm" />
// //             <div className="overflow-hidden">
// //               <p className="text-xs font-medium text-white truncate">{user?.displayName}</p>
// //               <p className="text-[10px] text-[#888] capitalize">{user?.role}</p>
// //             </div>
// //           </div>
// //           <button
// //             onClick={handleLogout}
// //             className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors"
// //           >
// //             <LogOut className="w-4 h-4" />
// //             Log Out
// //           </button>
// //         </div>
// //       </aside>

// //       {/* Main content */}
// //       <main className="flex-1 min-w-0">
// //         <div className="max-w-6xl mx-auto p-6">
// //           {children}
// //         </div>
// //       </main>
// //     </div>
// //   )
// // }






// import { useState } from 'react'
// import { NavLink, useNavigate } from 'react-router-dom'
// import {
//   LayoutDashboard, Users, FileText, Flag, Image as ImageIcon,
//   Megaphone, ScrollText, Settings, LogOut, ShieldCheck, Menu
// } from 'lucide-react'
// import { useAdminAuthStore } from '../../store/auth.store'
// import { authApi } from '../../api'
// import { tokenStorage } from '../../api/client'
// import { Avatar } from '../ui'
// import { cn } from '../../utils'

// const NAV_ITEMS = [
//   { to: '/',              icon: LayoutDashboard, label: 'Dashboard'     },
//   { to: '/users',         icon: Users,           label: 'Users'         },
//   { to: '/posts',         icon: FileText,        label: 'Content'       },
//   { to: '/reports',       icon: Flag,            label: 'Reports'       },
//   { to: '/templates',     icon: ImageIcon,       label: 'Templates'     },
//   { to: '/announcements', icon: Megaphone,       label: 'Announcements' },
//   { to: '/audit-log',     icon: ScrollText,      label: 'Audit Log'     },
//   { to: '/config',        icon: Settings,        label: 'App Config'    },
// ]

// export function AdminLayout({ children }: { children: React.ReactNode }) {
//   // State to control sidebar toggle
//   const [isCollapsed, setIsCollapsed] = useState(false)
  
//   const { user, logout } = useAdminAuthStore()
//   const navigate = useNavigate()

//   const handleLogout = async () => {
//     try { await authApi.logout(tokenStorage.getRefresh() || undefined) } catch {}
//     logout()
//     navigate('/login')
//   }

//   return (
//     <div className="min-h-screen bg-[#0A0A0A] flex">
//       {/* Sidebar with dynamic width and smooth transition */}
//       <aside 
//         className={cn(
//           "shrink-0 border-r border-[#2A2A2A] flex flex-col h-screen sticky top-0 bg-[#0A0A0A] transition-all duration-300 ease-in-out z-20",
//           isCollapsed ? "w-20" : "w-64"
//         )}
//       >
//         {/* Header / Logo Area */}
//         <div className={cn(
//           "h-20 flex items-center px-4 border-b border-[#2A2A2A] transition-all",
//           isCollapsed ? "justify-center" : "justify-between"
//         )}>
//           {/* Logo - Hides when collapsed */}
//           {!isCollapsed && (
//             <div className="flex items-center gap-3 overflow-hidden animate-slide-up">
//               <div className="w-9 h-9 bg-gradient-to-br from-[#E60000] to-[#FF3366] rounded-xl flex items-center justify-center text-white shadow-[0_2px_10px_rgba(230,0,0,0.3)] shrink-0">
//                 <ShieldCheck className="w-5 h-5" />
//               </div>
//               <div>
//                 <p className="text-sm font-bold text-white leading-none tracking-wide">Sayari</p>
//                 <p className="text-[10px] text-[#A1A1AA] mt-1 font-medium tracking-wider uppercase">Admin</p>
//               </div>
//             </div>
//           )}

//           {/* Toggle Button */}
//           <button 
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#141414] rounded-lg transition-colors focus:outline-none"
//             title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//           >
//             <Menu className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 scrollbar-hide">
//           {NAV_ITEMS.map(item => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               end={item.to === '/'}
//               title={isCollapsed ? item.label : undefined}
//               className={({ isActive }) => cn(
//                 'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group overflow-hidden',
//                 isActive 
//                   ? 'bg-[#141414] text-[#E60000]' 
//                   : 'text-[#A1A1AA] hover:text-white hover:bg-[#141414]',
//                 isCollapsed ? 'justify-center' : 'justify-start'
//               )}
//             >
//               {({ isActive }) => (
//                 <>
//                   {/* Active Indicator Line */}
//                   {isActive && !isCollapsed && (
//                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#E60000] rounded-r-md shadow-[0_0_8px_rgba(230,0,0,0.6)]" />
//                   )}
                  
//                   <item.icon className={cn(
//                     "w-5 h-5 shrink-0 transition-transform duration-200", 
//                     isActive && "scale-110"
//                   )} />
                  
//                   {!isCollapsed && (
//                     <span className="whitespace-nowrap transition-opacity duration-300">
//                       {item.label}
//                     </span>
//                   )}
//                 </>
//               )}
//             </NavLink>
//           ))}
//         </nav>

//         {/* User Info & Logout */}
//         <div className="p-3 border-t border-[#2A2A2A] bg-[#0A0A0A]">
//           <div className={cn(
//             "flex items-center gap-3 px-2 py-2 mb-2",
//             isCollapsed ? "justify-center" : "justify-start"
//           )}>
//             <div className="shrink-0">
//               <Avatar user={user} size="sm" />
//             </div>
//             {!isCollapsed && (
//               <div className="overflow-hidden">
//                 <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
//                 <p className="text-[11px] text-[#A1A1AA] capitalize mt-0.5">{user?.role}</p>
//               </div>
//             )}
//           </div>
          
//           <button
//             onClick={handleLogout}
//             title={isCollapsed ? "Log Out" : undefined}
//             className={cn(
//               "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#E60000] hover:bg-[#E60000]/10 transition-colors",
//               isCollapsed ? "justify-center" : "justify-start"
//             )}
//           >
//             <LogOut className="w-5 h-5 shrink-0" />
//             {!isCollapsed && <span>Log Out</span>}
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 min-w-0 bg-[#0A0A0A]">
//         <div className="max-w-7xl mx-auto p-6 md:p-8">
//           {children}
//         </div>
//       </main>
//     </div>
//   )
// }






import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Flag, Image as ImageIcon,
  Megaphone, ScrollText, Settings, LogOut, ShieldCheck, Menu, User
} from 'lucide-react'
import { useAdminAuthStore } from '../../store/auth.store'
import { authApi } from '../../api'
import { tokenStorage } from '../../api/client'
import { cn } from '../../utils'

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/users',         icon: Users,           label: 'Users'         },
  { to: '/posts',         icon: FileText,        label: 'Content'       },
  { to: '/reports',       icon: Flag,            label: 'Reports'       },
  { to: '/templates',     icon: ImageIcon,       label: 'Templates'     },
  { to: '/announcements', icon: Megaphone,       label: 'Announcements' },
  { to: '/audit-log',     icon: ScrollText,      label: 'Audit Log'     },
  { to: '/config',        icon: Settings,        label: 'App Config'    },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const { user, logout } = useAdminAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout(tokenStorage.getRefresh() || undefined) } catch {}
    logout()
    navigate('/login')
  }

  return (
    // The absolute background - pure black to make the floating islands pop
    <div className="h-screen w-full bg-[#000000] p-4 flex gap-4 overflow-hidden font-sans relative">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#E60000] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />

      {/* Floating Island Sidebar */}
      <aside 
        className={cn(
          "h-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-[32px] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl relative z-10 backdrop-blur-xl",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        {/* Header / Logo Area */}
        <div className="h-24 flex items-center justify-between px-6 pt-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E60000] rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(230,0,0,0.4)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-wide">SAYARI</span>
                <span className="text-[10px] text-[#E60000] font-mono tracking-widest uppercase">Admin_OS</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full border border-[#1F1F1F] text-[#71717A] hover:text-white hover:border-[#E60000] hover:shadow-[0_0_15px_rgba(230,0,0,0.3)] transition-all duration-300 bg-[#0F0F0F]",
              isCollapsed && "mx-auto w-12 h-12"
            )}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation - Pill Shaped */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2 scrollbar-hide">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                'group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative',
                isActive 
                  ? 'bg-gradient-to-r from-[#1A0505] to-[#0A0A0A] text-white border border-[#E60000]/30 shadow-[inset_4px_0_0_#E60000]' 
                  : 'text-[#71717A] hover:bg-[#141414] hover:text-white border border-transparent',
                isCollapsed ? 'justify-center px-0' : 'justify-start'
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110", 
                    isActive ? "text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.8)]" : "text-[#71717A] group-hover:text-white"
                  )} />
                  
                  {!isCollapsed && (
                    <span className="whitespace-nowrap tracking-wide">
                      {item.label}
                    </span>
                  )}

                  {/* Hover Glow Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] from-[#E60000]/10 to-transparent pointer-events-none" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile - Detached Card Style */}
        <div className="p-4 mt-auto">
          <div className={cn(
            "bg-[#141414] border border-[#1F1F1F] rounded-2xl p-2 transition-all duration-300",
            isCollapsed ? "flex flex-col items-center gap-4" : "flex items-center justify-between"
          )}>
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
              <div className="w-10 h-10 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                 {/* Replaced Avatar component with an icon for the creative layout, but you can swap your Avatar back in */}
                 <User className="w-5 h-5 text-[#A1A1AA]" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white truncate">{user?.displayName || 'Admin User'}</span>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider">{user?.role || 'Superadmin'}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl text-[#71717A] hover:bg-[#E60000] hover:text-white transition-all duration-300",
                isCollapsed && "w-full"
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Floating Bento Box */}
      <main className="flex-1 h-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col">
        {/* Subtle top inner glow for depth */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000]/20 to-transparent" />
        
        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
          {children}
        </div>
      </main>
      
    </div>
  )
}