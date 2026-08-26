import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react'
import { authApi } from '../../api'
import { useAdminAuthStore, ADMIN_ROLES } from '../../store/auth.store'
import { Button, Input } from '../../components/ui'
import { getErrorMessage } from '../../utils'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email   : z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})
type LoginForm = z.infer<typeof loginSchema>

export function AdminLoginPage() {
  const [showPass, setShowPass] = useState(false)
  const { setAuth } = useAdminAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const res  = await authApi.login(data)
      const user = res.data.data.user

      if (!ADMIN_ROLES.includes(user.role)) {
        toast.error('This account does not have admin access')
        return
      }

      setAuth(user, res.data.data.tokens)
      toast.success(`Welcome, ${user.displayName}`)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }


  return (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
    {/* Subtle ambient red glow behind the card */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E60000] rounded-full blur-[150px] opacity-10 pointer-events-none" />

    {/* Main Login Card */}
    <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 shadow-2xl relative z-10 animate-slide-up">
      <div className="text-center mb-10">
        {/* Temporary Red/Black Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#E60000] to-[#FF3366] rounded-xl flex items-center justify-center text-white mx-auto mb-5 shadow-[0_4px_20px_rgba(230,0,0,0.3)] border border-[#ff6688] border-opacity-20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sayari Admin</h1>
        <p className="text-[#A1A1AA] text-sm mt-2 font-medium">Platform management console</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Admin Email"
          type="email"
          placeholder="admin@sayari.app"
          icon={<Mail className="w-5 h-5 text-[#E60000]" />}
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          placeholder="Your password"
          icon={<Lock className="w-5 h-5 text-[#E60000]" />}
          suffix={
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="text-[#A1A1AA] hover:text-[#E60000] transition-colors focus:outline-none"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
        
        {/* If your Button component accepts className, this will override it with a glowing red style */}
        <Button 
          type="submit" 
          loading={isSubmitting} 
          className="w-full mt-6 bg-[#E60000] hover:bg-[#B30000] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 shadow-[0_4px_14px_rgba(230,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(230,0,0,0.4)]"
        >
          Sign In
        </Button>
      </form>

      {/* Footer / Security Note */}
      <div className="mt-8 pt-6 border-t border-[#2A2A2A]">
        <p className="text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse"></span>
          Restricted access — admin & moderator roles only
        </p>
      </div>
    </div>
  </div>
)


  // return (
  //   <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
  //     <div className="w-full max-w-sm">
  //       <div className="text-center mb-8">
  //         <div className="w-14 h-14 bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
  //           <ShieldCheck className="w-7 h-7" />
  //         </div>
  //         <h1 className="text-2xl font-bold text-white">Sayari Admin</h1>
  //         <p className="text-[#888] text-sm mt-1">Platform management console</p>
  //       </div>

  //       <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
  //         <Input
  //           label="Admin Email"
  //           type="email"
  //           placeholder="admin@sayari.app"
  //           icon={<Mail className="w-4 h-4" />}
  //           error={errors.email?.message}
  //           {...register('email')}
  //         />
  //         <Input
  //           label="Password"
  //           type={showPass ? 'text' : 'password'}
  //           placeholder="Your password"
  //           icon={<Lock className="w-4 h-4" />}
  //           suffix={
  //             <button type="button" onClick={() => setShowPass(!showPass)}>
  //               {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  //             </button>
  //           }
  //           error={errors.password?.message}
  //           {...register('password')}
  //         />
  //         <Button type="submit" loading={isSubmitting} className="w-full mt-2">
  //           Sign In
  //         </Button>
  //       </form>

  //       <p className="text-center text-xs text-[#555] mt-6">
  //         Restricted access — admin, superadmin, and moderator roles only
  //       </p>
  //     </div>
  //   </div>
  // )
}

// ── Protected Route ───────────────────────────

export function AdminProtectedRoute({ children, requireSuperAdmin = false }: {
  children: React.ReactNode
  requireSuperAdmin?: boolean
}) {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAdminAuthStore()
  const navigate = useNavigate()

  if (isLoading) return (
    // <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
    //   <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
    // </div>
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      {/* Updated spinner to vibrant red */}
      <div className="w-8 h-8 border-2 border-[#E60000] border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(230,0,0,0.5)]" />
    </div>
  )

  if (!isAuthenticated) {
    navigate('/login', { replace: true })
    return null
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      // <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      //   <p className="text-[#888]">Superadmin access required</p>
      // </div>
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        {/* Updated text and added a small red icon for the unauthorized state */}
        <p className="text-[#A1A1AA] flex items-center gap-2 font-medium">
          <ShieldCheck className="w-5 h-5 text-[#E60000]" />
          Superadmin access required
        </p>
      </div>
    )
  }

  return <>{children}</>
}
