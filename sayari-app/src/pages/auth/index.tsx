// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
// import { authApi } from '../../api'
// import { useAuthStore } from '../../store/auth.store'
// import { Button, Input } from '../../components/ui'
// import { getErrorMessage } from '../../utils'
// import toast from 'react-hot-toast'

// // ── Shared Auth Layout ────────────────────────

// function AuthLayout({ title, subtitle, children }: {
//   title: string; subtitle: string; children: React.ReactNode
// }) {
//   return (
//     <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
//       <div className="w-full max-w-sm">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="w-14 h-14 bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
//             S
//           </div>
//           <h1 className="text-2xl font-bold text-white">{title}</h1>
//           <p className="text-[#888] text-sm mt-1">{subtitle}</p>
//         </div>
//         {children}
//       </div>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  LOGIN PAGE
// // ─────────────────────────────────────────────

// const loginSchema = z.object({
//   email   : z.string().email('Invalid email'),
//   password: z.string().min(1, 'Password required'),
// })

// type LoginForm = z.infer<typeof loginSchema>


// export function LoginPage() {
//   const [showPass, setShowPass] = useState(false)
//   const [tab, setTab] = useState<'email' | 'whatsapp'>('email')
//   const { setAuth } = useAuthStore()
//   const navigate = useNavigate()

//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//   })

//   const onSubmit = async (data: LoginForm) => {
//     try {
//       const res = await authApi.login(data)
//       setAuth(res.data.data.user, res.data.data.tokens)
//       toast.success('Welcome back!')
//       navigate('/')
//     } catch (err) {
//       toast.error(getErrorMessage(err))
//     }
//   }

//   return (
//     <AuthLayout title="Welcome back" subtitle="Login to your Sayari account">
      
//       {/* Modern Pill-Style Tab Switcher */}
//       <div className="flex p-1.5 bg-surface2/40 backdrop-blur-md rounded-2xl mb-8 ring-1 ring-border/30">
//         {(['email', 'whatsapp'] as const).map(t => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ease-out ${
//               tab === t 
//                 ? 'bg-surface text-primary shadow-sm ring-1 ring-border/50' 
//                 : 'text-muted hover:text-text'
//             }`}
//           >
//             {t === 'email' ? 'Email' : 'WhatsApp'}
//           </button>
//         ))}
//       </div>

//       <div className="min-h-[220px]">
//         {tab === 'email' ? (
//           <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 animate-slide-up">
//             <Input
//               label="Email"
//               type="email"
//               placeholder="you@email.com"
//               icon={<Mail className="w-4 h-4 text-muted" />}
//               error={errors.email?.message}
//               {...register('email')}
//             />
            
//             <div className="flex flex-col gap-1">
//               <Input
//                 label="Password"
//                 type={showPass ? 'text' : 'password'}
//                 placeholder="Your password"
//                 icon={<Lock className="w-4 h-4 text-muted" />}
//                 suffix={
//                   <button 
//                     type="button" 
//                     onClick={() => setShowPass(!showPass)}
//                     className="text-muted hover:text-text transition-colors p-1 rounded-md"
//                   >
//                     {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 }
//                 error={errors.password?.message}
//                 {...register('password')}
//               />
//               <div className="text-right mt-1">
//                 <Link to="/forgot-password" className="text-xs text-muted hover:text-primary transition-colors">
//                   Forgot password?
//                 </Link>
//               </div>
//             </div>
            
//             <Button 
//               type="submit" 
//               loading={isSubmitting} 
//               className="w-full mt-2 py-4 bg-text text-bg hover:bg-primary hover:text-surface rounded-xl font-semibold transition-all duration-200"
//             >
//               Log in securely
//             </Button>
//           </form>
//         ) : (
//           <div className="animate-slide-up flex justify-center items-center h-full pt-4">
//             <WhatsAppLogin />
//           </div>
//         )}
//       </div>

//       {/* Minimalist Divider */}
//       <div className="relative flex items-center justify-center py-8">
//         <div className="absolute inset-0 flex items-center">
//           <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
//         </div>
//         <div className="relative bg-bg px-4 text-xs font-medium text-muted uppercase tracking-widest">
//           or
//         </div>
//       </div>

//       {/* Google Button Container */}
//       <div className="w-full">
//         <GoogleAuthButton mode="login" />
//       </div>

//       {/* Clean Footer */}
//       <div className="mt-8 text-center">
//         <p className="text-sm text-muted">
//           New to Sayari?{' '}
//           <Link to="/register" className="text-text font-medium underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary transition-colors">
//             Create an account
//           </Link>
//         </p>
//       </div>
      
//     </AuthLayout>
//   )
// }

// // export function LoginPage() {
// //   const [showPass, setShowPass] = useState(false)
// //   const [tab, setTab] = useState<'email' | 'whatsapp'>('email')
// //   const { setAuth } = useAuthStore()
// //   const navigate = useNavigate()

// //   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
// //     resolver: zodResolver(loginSchema),
// //   })

// //   const onSubmit = async (data: LoginForm) => {
// //     try {
// //       const res = await authApi.login(data)
// //       setAuth(res.data.data.user, res.data.data.tokens)
// //       toast.success('Welcome back!')
// //       navigate('/')
// //     } catch (err) {
// //       toast.error(getErrorMessage(err))
// //     }
// //   }

// //   return (
// //     <AuthLayout title="Welcome back" subtitle="Login to your Sayari account">
// //       {/* Tab switch */}
// //       <div className="flex bg-[#1A1A1A] rounded-xl p-1 mb-6">
// //         {(['email', 'whatsapp'] as const).map(t => (
// //           <button
// //             key={t}
// //             onClick={() => setTab(t)}
// //             className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
// //               tab === t ? 'bg-[#6C63FF] text-white' : 'text-[#888] hover:text-white'
// //             }`}
// //           >
// //             {t === 'email' ? '📧 Email' : '📱 WhatsApp'}
// //           </button>
// //         ))}
// //       </div>

// //       {tab === 'email' ? (
// //         <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
// //           <Input
// //             label="Email"
// //             type="email"
// //             placeholder="you@email.com"
// //             icon={<Mail className="w-4 h-4" />}
// //             error={errors.email?.message}
// //             {...register('email')}
// //           />
// //           <Input
// //             label="Password"
// //             type={showPass ? 'text' : 'password'}
// //             placeholder="Your password"
// //             icon={<Lock className="w-4 h-4" />}
// //             suffix={
// //               <button type="button" onClick={() => setShowPass(!showPass)}>
// //                 {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
// //               </button>
// //             }
// //             error={errors.password?.message}
// //             {...register('password')}
// //           />
// //           <div className="text-right">
// //             <Link to="/forgot-password" className="text-sm text-[#6C63FF] hover:underline">
// //               Forgot password?
// //             </Link>
// //           </div>
// //           <Button type="submit" loading={isSubmitting} className="w-full mt-2">
// //             Login
// //           </Button>
// //         </form>
// //       ) : (
// //         <WhatsAppLogin />
// //       )}

// //       {/* Divider */}
// //       <div className="flex items-center gap-3 my-6">
// //         <div className="flex-1 h-px bg-[#2E2E2E]" />
// //         <span className="text-xs text-[#555]">or continue with</span>
// //         <div className="flex-1 h-px bg-[#2E2E2E]" />
// //       </div>

// //       {/* Google */}
// //       <GoogleAuthButton mode="login" />

// //       <p className="text-center text-sm text-[#888] mt-6">
// //         Don't have an account?{' '}
// //         <Link to="/register" className="text-[#6C63FF] hover:underline font-medium">Sign up</Link>
// //       </p>
// //     </AuthLayout>
// //   )
// // }

// // ── WhatsApp Login ────────────────────────────



// export function WhatsAppLogin() {
//   const [step, setStep]         = useState<'phone' | 'otp'>('phone')
//   const [phone, setPhone]       = useState('')
//   const [otp, setOtp]           = useState('')
//   const [loading, setLoading]   = useState(false)
//   const [countdown, setCountdown] = useState(0)
//   const { setAuth } = useAuthStore()
//   const navigate = useNavigate()

//   const startCountdown = () => {
//     setCountdown(60)
//     const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
//   }

//   const sendOtp = async () => {
//     if (!phone.match(/^\+?[1-9]\d{7,14}$/)) { toast.error('Enter a valid phone number with country code'); return }
//     setLoading(true)
//     try {
//       await authApi.sendOtp(phone, 'login')
//       setStep('otp')
//       startCountdown()
//       toast.success('OTP sent to WhatsApp!')
//     } catch (err) { toast.error(getErrorMessage(err)) }
//     finally { setLoading(false) }
//   }

//   const verifyOtp = async () => {
//     if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return }
//     setLoading(true)
//     try {
//       const res = await authApi.verifyOtp(phone, otp, 'login')
//       if (res.data.data.action === 'logged_in' && res.data.data.user && res.data.data.tokens) {
//         setAuth(res.data.data.user, res.data.data.tokens)
//         toast.success('Login successful!')
//         navigate('/')
//       }
//     } catch (err) { toast.error(getErrorMessage(err)) }
//     finally { setLoading(false) }
//   }

//   if (step === 'phone') {
//     return (
//       <div className="flex flex-col gap-5 w-full">
//         <Input
//           label="WhatsApp Number"
//           type="tel"
//           placeholder="+91 98765 43210"
//           value={phone}
//           onChange={e => setPhone(e.target.value)}
//           icon={<Phone className="w-4 h-4 text-muted" />}
//         />
//         <Button 
//           onClick={sendOtp} 
//           loading={loading} 
//           className="w-full mt-2 py-4 bg-text text-bg hover:bg-primary hover:text-surface rounded-xl font-semibold transition-all duration-200"
//         >
//           Send OTP
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col gap-5 w-full animate-slide-up">
//       <div className="flex flex-col gap-2 mb-1">
//         <button 
//           onClick={() => setStep('phone')} 
//           className="flex items-center gap-2 text-sm font-medium text-muted hover:text-text transition-colors w-fit"
//         >
//           <ArrowLeft className="w-4 h-4" /> Change number
//         </button>
//         <p className="text-sm text-muted">
//           OTP sent to <span className="text-text font-semibold">{phone}</span>
//         </p>
//       </div>
      
//       <Input
//         label="Enter OTP"
//         type="text"
//         placeholder="••••••"
//         maxLength={6}
//         value={otp}
//         onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
//         className="text-center text-2xl tracking-[0.5em] font-medium"
//       />
      
//       <Button 
//         onClick={verifyOtp} 
//         loading={loading} 
//         className="w-full mt-2 py-4 bg-text text-bg hover:bg-primary hover:text-surface rounded-xl font-semibold transition-all duration-200"
//       >
//         Verify OTP
//       </Button>
      
//       <div className="text-center mt-1">
//         <button
//           onClick={sendOtp}
//           disabled={countdown > 0 || loading}
//           className="text-sm font-medium text-primary hover:text-primary-dark hover:underline underline-offset-4 disabled:text-muted/50 disabled:no-underline transition-colors"
//         >
//           {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
//         </button>
//       </div>
//     </div>
//   )
// }






// // function WhatsAppLogin() {
// //   const [step, setStep]         = useState<'phone' | 'otp'>('phone')
// //   const [phone, setPhone]       = useState('')
// //   const [otp, setOtp]           = useState('')
// //   const [loading, setLoading]   = useState(false)
// //   const [countdown, setCountdown] = useState(0)
// //   const { setAuth } = useAuthStore()
// //   const navigate = useNavigate()

// //   const startCountdown = () => {
// //     setCountdown(60)
// //     const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
// //   }

// //   const sendOtp = async () => {
// //     if (!phone.match(/^\+?[1-9]\d{7,14}$/)) { toast.error('Enter a valid phone number with country code'); return }
// //     setLoading(true)
// //     try {
// //       await authApi.sendOtp(phone, 'login')
// //       setStep('otp')
// //       startCountdown()
// //       toast.success('OTP sent to WhatsApp!')
// //     } catch (err) { toast.error(getErrorMessage(err)) }
// //     finally { setLoading(false) }
// //   }

// //   const verifyOtp = async () => {
// //     if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return }
// //     setLoading(true)
// //     try {
// //       const res = await authApi.verifyOtp(phone, otp, 'login')
// //       if (res.data.data.action === 'logged_in' && res.data.data.user && res.data.data.tokens) {
// //         setAuth(res.data.data.user, res.data.data.tokens)
// //         toast.success('Login successful!')
// //         navigate('/')
// //       }
// //     } catch (err) { toast.error(getErrorMessage(err)) }
// //     finally { setLoading(false) }
// //   }

// //   if (step === 'phone') {
// //     return (
// //       <div className="flex flex-col gap-4">
// //         <Input
// //           label="WhatsApp Number"
// //           type="tel"
// //           placeholder="+91 98765 43210"
// //           value={phone}
// //           onChange={e => setPhone(e.target.value)}
// //           icon={<Phone className="w-4 h-4" />}
// //         />
// //         <Button onClick={sendOtp} loading={loading} className="w-full">
// //           Send OTP
// //         </Button>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="flex flex-col gap-4">
// //       <button onClick={() => setStep('phone')} className="flex items-center gap-2 text-sm text-[#888] hover:text-white">
// //         <ArrowLeft className="w-4 h-4" /> Change number
// //       </button>
// //       <p className="text-sm text-[#888]">OTP sent to <span className="text-white">{phone}</span></p>
// //       <Input
// //         label="Enter OTP"
// //         type="text"
// //         placeholder="6-digit OTP"
// //         maxLength={6}
// //         value={otp}
// //         onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
// //         className="text-center text-2xl tracking-[0.5em]"
// //       />
// //       <Button onClick={verifyOtp} loading={loading} className="w-full">Verify OTP</Button>
// //       <button
// //         onClick={sendOtp}
// //         disabled={countdown > 0 || loading}
// //         className="text-sm text-[#6C63FF] hover:underline disabled:text-[#555] disabled:no-underline"
// //       >
// //         {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
// //       </button>
// //     </div>
// //   )
// // }




// // ─────────────────────────────────────────────
// //  REGISTER PAGE
// // ─────────────────────────────────────────────

// const registerSchema = z.object({
//   displayName: z.string().min(2, 'Min 2 chars').max(60),
//   username   : z.string().min(3, 'Min 3 chars').max(30).regex(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, _ and .'),
//   email      : z.string().email('Invalid email'),
//   password   : z.string().min(8, 'Min 8 chars')
//     .regex(/[A-Z]/, 'Need uppercase').regex(/[a-z]/, 'Need lowercase').regex(/\d/, 'Need number'),
//   language   : z.enum(['hi', 'ur', 'en', 'mixed']),
// })

// type RegisterForm = z.infer<typeof registerSchema>


// export function RegisterPage() {
//   const [showPass, setShowPass] = useState(false)
//   const { setAuth } = useAuthStore()
//   const navigate = useNavigate()

//   const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<RegisterForm>({
//     resolver    : zodResolver(registerSchema),
//     defaultValues: { language: 'hi' },
//   })

//   const onSubmit = async (data: RegisterForm) => {
//     try {
//       const res = await authApi.register(data)
//       setAuth(res.data.data.user, res.data.data.tokens)
//       toast.success('Account created! Welcome to Sayari 🎉')
//       navigate('/')
//     } catch (err) { toast.error(getErrorMessage(err)) }
//   }

//   return (
//     <AuthLayout title="Join Sayari" subtitle="Create your creative space">
//       <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 animate-slide-up">
//         <Input
//           label="Display Name"
//           placeholder="Faiz Ahmed"
//           icon={<User className="w-4 h-4 text-muted" />}
//           error={errors.displayName?.message}
//           {...register('displayName')}
//         />
//         <Input
//           label="Username"
//           placeholder="faiz_ahmed"
//           error={errors.username?.message}
//           {...register('username')}
//           onChange={e => setValue('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
//         />
//         <Input
//           label="Email"
//           type="email"
//           placeholder="you@email.com"
//           icon={<Mail className="w-4 h-4 text-muted" />}
//           error={errors.email?.message}
//           {...register('email')}
//         />
//         <Input
//           label="Password"
//           type={showPass ? 'text' : 'password'}
//           placeholder="Min 8 chars"
//           icon={<Lock className="w-4 h-4 text-muted" />}
//           suffix={
//             <button 
//               type="button" 
//               onClick={() => setShowPass(!showPass)}
//               className="text-muted hover:text-text transition-colors p-1 rounded-md"
//             >
//               {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//             </button>
//           }
//           error={errors.password?.message}
//           {...register('password')}
//         />

//         {/* Language selector */}
//         <div className="flex flex-col gap-2 mt-1">
//           <label className="text-sm font-medium text-text ml-1">Preferred Language</label>
//           <div className="grid grid-cols-4 gap-2">
//             {[{ v: 'hi', l: 'हिंदी' }, { v: 'ur', l: 'اردو' }, { v: 'en', l: 'English' }, { v: 'mixed', l: 'Mixed' }].map(lang => (
//               <button
//                 key={lang.v} 
//                 type="button"
//                 onClick={() => setValue('language', lang.v as RegisterForm['language'])}
//                 className={`py-2 px-1 rounded-xl text-sm font-semibold border transition-all duration-200 ${
//                   watch('language') === lang.v
//                     ? 'border-primary bg-primary/10 text-primary shadow-sm scale-[0.98]'
//                     : 'border-border text-muted hover:text-text hover:border-border/80 bg-surface2/30'
//                 }`}
//               >
//                 {lang.l}
//               </button>
//             ))}
//           </div>
//         </div>

//         <Button 
//           type="submit" 
//           loading={isSubmitting} 
//           className="w-full mt-3 py-4 bg-primary text-surface hover:bg-primary-dark rounded-xl font-semibold transition-all duration-200"
//         >
//           Create Account
//         </Button>
//       </form>

//       {/* Minimalist Divider */}
//       <div className="relative flex items-center justify-center py-8">
//         <div className="absolute inset-0 flex items-center">
//           <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
//         </div>
//         <div className="relative bg-bg px-4 text-xs font-medium text-muted uppercase tracking-widest">
//           or
//         </div>
//       </div>

//       <div className="w-full">
//         <GoogleAuthButton mode="register" />
//       </div>

//       <p className="text-center text-sm text-muted mt-8">
//         Already have an account?{' '}
//         <Link to="/login" className="text-text font-medium underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary transition-colors">
//           Login
//         </Link>
//       </p>
//     </AuthLayout>
//   )
// }



// // export function RegisterPage() {
// //   const [showPass, setShowPass] = useState(false)
// //   const { setAuth } = useAuthStore()
// //   const navigate = useNavigate()

// //   const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<RegisterForm>({
// //     resolver    : zodResolver(registerSchema),
// //     defaultValues: { language: 'hi' },
// //   })

// //   const onSubmit = async (data: RegisterForm) => {
// //     try {
// //       const res = await authApi.register(data)
// //       setAuth(res.data.data.user, res.data.data.tokens)
// //       toast.success('Account created! Welcome to Sayari 🎉')
// //       navigate('/')
// //     } catch (err) { toast.error(getErrorMessage(err)) }
// //   }

// //   return (
// //     <AuthLayout title="Join Sayari" subtitle="Create your creative space">
// //       <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
// //         <Input
// //           label="Display Name"
// //           placeholder="Faiz Ahmed"
// //           icon={<User className="w-4 h-4" />}
// //           error={errors.displayName?.message}
// //           {...register('displayName')}
// //         />
// //         <Input
// //           label="Username"
// //           placeholder="faiz_ahmed"
// //           error={errors.username?.message}
// //           {...register('username')}
// //           onChange={e => setValue('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
// //         />
// //         <Input
// //           label="Email"
// //           type="email"
// //           placeholder="you@email.com"
// //           icon={<Mail className="w-4 h-4" />}
// //           error={errors.email?.message}
// //           {...register('email')}
// //         />
// //         <Input
// //           label="Password"
// //           type={showPass ? 'text' : 'password'}
// //           placeholder="Min 8 chars"
// //           icon={<Lock className="w-4 h-4" />}
// //           suffix={
// //             <button type="button" onClick={() => setShowPass(!showPass)}>
// //               {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
// //             </button>
// //           }
// //           error={errors.password?.message}
// //           {...register('password')}
// //         />

// //         {/* Language selector */}
// //         <div className="flex flex-col gap-1.5">
// //           <label className="text-sm text-[#888] font-medium">Preferred Language</label>
// //           <div className="grid grid-cols-4 gap-2">
// //             {[{ v: 'hi', l: 'हिंदी' }, { v: 'ur', l: 'اردو' }, { v: 'en', l: 'English' }, { v: 'mixed', l: 'Mixed' }].map(lang => (
// //               <button
// //                 key={lang.v} type="button"
// //                 onClick={() => setValue('language', lang.v as RegisterForm['language'])}
// //                 className={`py-2 px-3 rounded-xl text-sm border transition-colors ${
// //                   watch('language') === lang.v
// //                     ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
// //                     : 'border-[#2E2E2E] text-[#888] hover:border-[#444]'
// //                 }`}
// //               >
// //                 {lang.l}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         <Button type="submit" loading={isSubmitting} className="w-full mt-2">
// //           Create Account
// //         </Button>
// //       </form>

// //       <div className="flex items-center gap-3 my-6">
// //         <div className="flex-1 h-px bg-[#2E2E2E]" />
// //         <span className="text-xs text-[#555]">or</span>
// //         <div className="flex-1 h-px bg-[#2E2E2E]" />
// //       </div>

// //       <GoogleAuthButton mode="register" />

// //       <p className="text-center text-sm text-[#888] mt-6">
// //         Already have an account?{' '}
// //         <Link to="/login" className="text-[#6C63FF] hover:underline font-medium">Login</Link>
// //       </p>
// //     </AuthLayout>
// //   )
// // }

// // ─────────────────────────────────────────────
// //  FORGOT PASSWORD
// // ─────────────────────────────────────────────




// export function ForgotPasswordPage() {
//   const [email, setEmail]       = useState('')
//   const [sent, setSent]         = useState(false)
//   const [loading, setLoading]   = useState(false)

//   const submit = async () => {
//     if (!email.includes('@')) { toast.error('Enter a valid email'); return }
//     setLoading(true)
//     try {
//       await authApi.forgotPassword(email)
//       setSent(true)
//     } catch (err) { toast.error(getErrorMessage(err)) }
//     finally { setLoading(false) }
//   }

//   return (
//     <AuthLayout title="Reset Password" subtitle="We'll send you a reset link">
//       {sent ? (
//         <div className="text-center py-8 animate-slide-up">
//           <div className="w-16 h-16 bg-surface2/50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-border/50">
//             📧
//           </div>
//           <p className="text-text font-semibold text-lg mb-2">Check your email</p>
//           <p className="text-muted text-sm mb-8">
//             Reset link sent to <span className="text-text font-medium">{email}</span>
//           </p>
//           <Link to="/login" className="block w-full">
//             <Button 
//               variant="outline" 
//               className="w-full py-4 border-border text-text hover:bg-surface2 rounded-xl font-semibold transition-all duration-200"
//             >
//               Back to Login
//             </Button>
//           </Link>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-5 animate-slide-up">
//           <Input
//             label="Email Address"
//             type="email"
//             placeholder="you@email.com"
//             icon={<Mail className="w-4 h-4 text-muted" />}
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//           />
          
//           <Button 
//             onClick={submit} 
//             loading={loading} 
//             className="w-full mt-2 py-4 bg-primary text-surface hover:bg-primary-dark rounded-xl font-semibold transition-all duration-200"
//           >
//             Send Reset Link
//           </Button>
          
//           <div className="flex justify-center mt-2">
//             <Link to="/login">
//               <Button 
//                 variant="ghost" 
//                 className="text-sm font-medium text-muted hover:text-text transition-colors bg-transparent hover:bg-transparent" 
//                 icon={<ArrowLeft className="w-4 h-4" />}
//               >
//                 Back to Login
//               </Button>
//             </Link>
//           </div>
//         </div>
//       )}
//     </AuthLayout>
//   )
// }



// // export function ForgotPasswordPage() {
// //   const [email, setEmail]       = useState('')
// //   const [sent, setSent]         = useState(false)
// //   const [loading, setLoading]   = useState(false)

// //   const submit = async () => {
// //     if (!email.includes('@')) { toast.error('Enter a valid email'); return }
// //     setLoading(true)
// //     try {
// //       await authApi.forgotPassword(email)
// //       setSent(true)
// //     } catch (err) { toast.error(getErrorMessage(err)) }
// //     finally { setLoading(false) }
// //   }

// //   return (
// //     <AuthLayout title="Reset Password" subtitle="We'll send you a reset link">
// //       {sent ? (
// //         <div className="text-center py-6">
// //           <div className="text-5xl mb-4">📧</div>
// //           <p className="text-white font-semibold mb-2">Check your email</p>
// //           <p className="text-[#888] text-sm mb-6">Reset link sent to <span className="text-white">{email}</span></p>
// //           <Link to="/login"><Button variant="outline" className="w-full">Back to Login</Button></Link>
// //         </div>
// //       ) : (
// //         <div className="flex flex-col gap-4">
// //           <Input
// //             label="Email Address"
// //             type="email"
// //             placeholder="you@email.com"
// //             icon={<Mail className="w-4 h-4" />}
// //             value={email}
// //             onChange={e => setEmail(e.target.value)}
// //           />
// //           <Button onClick={submit} loading={loading} className="w-full">Send Reset Link</Button>
// //           <Link to="/login">
// //             <Button variant="ghost" className="w-full" icon={<ArrowLeft className="w-4 h-4" />}>
// //               Back to Login
// //             </Button>
// //           </Link>
// //         </div>
// //       )}
// //     </AuthLayout>
// //   )
// // }

// // ─────────────────────────────────────────────
// //  GOOGLE AUTH BUTTON
// // ─────────────────────────────────────────────





// function GoogleAuthButton({ mode }: { mode: 'login' | 'register' }) {
//   const { setAuth } = useAuthStore()
//   const navigate    = useNavigate()
//   const [loading, setLoading] = useState(false)

//   const handleGoogle = async () => {
//     // In production, use @react-oauth/google or redirect flow
//     // This shows the pattern
//     toast('Google OAuth requires client ID setup', { icon: 'ℹ️' })
//   }

//   return (
//     <button
//       onClick={handleGoogle}
//       disabled={loading}
//       className="w-full flex items-center justify-center gap-3 h-11 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl text-white text-sm font-medium hover:bg-[#242424] transition-colors disabled:opacity-50"
//     >
//       <svg className="w-5 h-5" viewBox="0 0 24 24">
//         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//       </svg>
//       {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
//     </button>
//   )
// }

// // ─────────────────────────────────────────────
// //  PROTECTED ROUTE
// // ─────────────────────────────────────────────

// export function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { isAuthenticated, isLoading } = useAuthStore()
//   const navigate = useNavigate()

//   if (isLoading) return (
//     <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
//       <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
//     </div>
//   )

//   if (!isAuthenticated) {
//     navigate('/login', { replace: true })
//     return null
//   }

//   return <>{children}</>
// }











import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react'
import { authApi } from '../../api'
import { useAuthStore } from '../../store/auth.store'
import { Button, Input } from '../../components/ui'
import { getErrorMessage } from '../../utils'
import toast from 'react-hot-toast'

// ── Shared Spotify-Inspired Premium Auth Layout ────────────────────────

function AuthLayout({ title, subtitle, children }: {
  title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      
      {/* Background Ambient Glow Effects (Spotify aesthetic) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-surface/80 backdrop-blur-2xl border border-border/60 rounded-[32px] p-8 sm:p-10 shadow-2xl relative z-10 transition-all">
        
        {/* Header / Brand Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary text-bg rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-lg shadow-primary/20 ring-4 ring-primary/20">
            S
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">{title}</h1>
          <p className="text-muted text-sm mt-1.5">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────────

const loginSchema = z.object({
  email   : z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [tab, setTab] = useState<'email' | 'whatsapp'>('email')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data)
      setAuth(res.data.data.user, res.data.data.tokens)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your journey">
      
      {/* Modern Pill-Style Tab Switcher */}
      <div className="flex p-1 bg-surface2 rounded-2xl mb-6 ring-1 ring-border/50">
        {(['email', 'whatsapp'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
              tab === t 
                ? 'bg-primary text-bg shadow-md' 
                : 'text-muted hover:text-text'
            }`}
          >
            {t === 'email' ? 'Email Address' : 'WhatsApp OTP'}
          </button>
        ))}
      </div>

      <div className="min-h-[220px]">
        {tab === 'email' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 animate-slide-up">
            <Input
              label="Email"
              type="email"
              placeholder="you@email.com"
              icon={<Mail className="w-4 h-4 text-muted" />}
              error={errors.email?.message}
              {...register('email')}
            />
            
            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4 text-muted" />}
                suffix={
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="text-muted hover:text-text transition-colors p-1 rounded-md"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-muted hover:text-primary transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <Button 
              type="submit" 
              loading={isSubmitting} 
              className="w-full mt-3 py-3.5 bg-primary text-bg hover:opacity-90 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Log In
            </Button>
          </form>
        ) : (
          <div className="animate-slide-up flex justify-center items-center h-full pt-2">
            <WhatsAppLogin />
          </div>
        )}
      </div>

      {/* Spotify Style Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-border" />
        </div>
        <div className="relative bg-surface px-3 text-[11px] font-bold text-muted uppercase tracking-wider">
          or
        </div>
      </div>

      {/* Google Button Container */}
      <div className="w-full">
        <GoogleAuthButton mode="login" />
      </div>

      {/* Footer link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-text font-bold hover:text-primary transition-colors underline underline-offset-4">
            Sign up for Sayari
          </Link>
        </p>
      </div>
      
    </AuthLayout>
  )
}

// ── WhatsApp Login ────────────────────────────

export function WhatsAppLogin() {
  const [step, setStep]         = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const startCountdown = () => {
    setCountdown(60)
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
  }

  const sendOtp = async () => {
    if (!phone.match(/^\+?[1-9]\d{7,14}$/)) { toast.error('Enter a valid phone number with country code'); return }
    setLoading(true)
    try {
      await authApi.sendOtp(phone, 'login')
      setStep('otp')
      startCountdown()
      toast.success('OTP sent to WhatsApp!')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(phone, otp, 'login')
      if (res.data.data.action === 'logged_in' && res.data.data.user && res.data.data.tokens) {
        setAuth(res.data.data.user, res.data.data.tokens)
        toast.success('Login successful!')
        navigate('/')
      }
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  if (step === 'phone') {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Input
          label="WhatsApp Number"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          icon={<Phone className="w-4 h-4 text-muted" />}
        />
        <Button 
          onClick={sendOtp} 
          loading={loading} 
          className="w-full mt-2 py-3.5 bg-primary text-bg hover:opacity-90 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-primary/20"
        >
          Send Code via WhatsApp
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-slide-up">
      <div className="flex flex-col gap-1 mb-1">
        <button 
          onClick={() => setStep('phone')} 
          className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-text transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Change number
        </button>
        <p className="text-xs text-muted">
          Code sent to <span className="text-text font-bold">{phone}</span>
        </p>
      </div>
      
      <Input
        label="Enter Verification Code"
        type="text"
        placeholder="••••••"
        maxLength={6}
        value={otp}
        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
        className="text-center text-2xl tracking-[0.5em] font-mono font-bold"
      />
      
      <Button 
        onClick={verifyOtp} 
        loading={loading} 
        className="w-full mt-2 py-3.5 bg-primary text-bg hover:opacity-90 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-primary/20"
      >
        Verify & Log In
      </Button>
      
      <div className="text-center mt-1">
        <button
          onClick={sendOtp}
          disabled={countdown > 0 || loading}
          className="text-xs font-bold text-primary hover:underline disabled:text-muted disabled:no-underline transition-colors"
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  REGISTER PAGE
// ─────────────────────────────────────────────

const registerSchema = z.object({
  displayName: z.string().min(2, 'Min 2 chars').max(60),
  username   : z.string().min(3, 'Min 3 chars').max(30).regex(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, _ and .'),
  email      : z.string().email('Invalid email'),
  password   : z.string().min(8, 'Min 8 chars')
    .regex(/[A-Z]/, 'Need uppercase').regex(/[a-z]/, 'Need lowercase').regex(/\d/, 'Need number'),
  language   : z.enum(['hi', 'ur', 'en', 'mixed']),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<RegisterForm>({
    resolver    : zodResolver(registerSchema),
    defaultValues: { language: 'hi' },
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await authApi.register(data)
      setAuth(res.data.data.user, res.data.data.tokens)
      toast.success('Account created! Welcome to Sayari 🎉')
      navigate('/')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join the ultimate creative platform">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 animate-slide-up">
        <Input
          label="Display Name"
          placeholder="Faiz Ahmed"
          icon={<User className="w-4 h-4 text-muted" />}
          error={errors.displayName?.message}
          {...register('displayName')}
        />
        <Input
          label="Username"
          placeholder="faiz_ahmed"
          error={errors.username?.message}
          {...register('username')}
          onChange={e => setValue('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@email.com"
          icon={<Mail className="w-4 h-4 text-muted" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          placeholder="Min 8 chars (Uppercase, Lowercase, Number)"
          icon={<Lock className="w-4 h-4 text-muted" />}
          suffix={
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="text-muted hover:text-text transition-colors p-1 rounded-md"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Language selector */}
        <div className="flex flex-col gap-1.5 mt-1">
          <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Preferred Language</label>
          <div className="grid grid-cols-4 gap-2">
            {[{ v: 'hi', l: 'हिंदी' }, { v: 'ur', l: 'اردو' }, { v: 'en', l: 'English' }, { v: 'mixed', l: 'Mixed' }].map(lang => (
              <button
                key={lang.v} 
                type="button"
                onClick={() => setValue('language', lang.v as RegisterForm['language'])}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  watch('language') === lang.v
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border text-muted hover:text-text bg-surface2/40'
                }`}
              >
                {lang.l}
              </button>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          loading={isSubmitting} 
          className="w-full mt-3 py-3.5 bg-primary text-bg hover:opacity-90 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-primary/20"
        >
          Sign Up
        </Button>
      </form>

      {/* Spotify Style Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-border" />
        </div>
        <div className="relative bg-surface px-3 text-[11px] font-bold text-muted uppercase tracking-wider">
          or
        </div>
      </div>

      <div className="w-full">
        <GoogleAuthButton mode="register" />
      </div>

      <p className="text-center text-sm text-muted mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-text font-bold hover:text-primary transition-colors underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

// ─────────────────────────────────────────────
//  FORGOT PASSWORD
// ─────────────────────────────────────────────

export function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)

  const submit = async () => {
    if (!email.includes('@')) { toast.error('Enter a valid email'); return }
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a recovery link">
      {sent ? (
        <div className="text-center py-6 animate-slide-up">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-5 text-2xl shadow-inner border border-primary/20">
            ✉️
          </div>
          <p className="text-text font-bold text-lg mb-1">Check your inbox</p>
          <p className="text-muted text-xs sm:text-sm mb-6">
            We've sent a reset link to <span className="text-text font-bold">{email}</span>
          </p>
          <Link to="/login" className="block w-full">
            <Button 
              variant="outline" 
              className="w-full py-3.5 border-border text-text hover:bg-surface2 rounded-full font-bold text-sm transition-all duration-200"
            >
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-slide-up">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            icon={<Mail className="w-4 h-4 text-muted" />}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          
          <Button 
            onClick={submit} 
            loading={loading} 
            className="w-full mt-2 py-3.5 bg-primary text-bg hover:opacity-90 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-primary/20"
          >
            Send Reset Link
          </Button>
          
          <div className="flex justify-center mt-3">
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="text-xs font-bold text-muted hover:text-text transition-colors bg-transparent hover:bg-transparent" 
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}

// ─────────────────────────────────────────────
//  GOOGLE AUTH BUTTON
// ─────────────────────────────────────────────

function GoogleAuthButton({ mode }: { mode: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    toast('Google OAuth requires client ID setup', { icon: 'ℹ️' })
  }

  return (
    <button
      onClick={handleGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 h-12 bg-surface2/60 hover:bg-surface2 border border-border/60 rounded-full text-text text-sm font-bold transition-all duration-200 shadow-sm disabled:opacity-50 hover:border-primary/50 group"
    >
      <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
    </button>
  )
}

// ─────────────────────────────────────────────
//  PROTECTED ROUTE
// ─────────────────────────────────────────────

// export function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { isAuthenticated, isLoading } = useAuthStore()
//   const navigate = useNavigate()

//   if (isLoading) return (
//     <div className="min-h-screen bg-bg flex items-center justify-center">
//       <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//     </div>
//   )

//   if (!isAuthenticated) {
//     navigate('/login', { replace: true })
//     return null
//   }

//   return <>{children}</>
// }









import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}