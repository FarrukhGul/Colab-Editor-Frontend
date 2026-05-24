import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerAPI } from '../services/api'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const Register = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await registerAPI(formData)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className='min-h-screen bg-dark-bg text-white flex flex-col md:flex-row relative overflow-hidden'>
            {/* Visual background glow elements */}
            <div className='absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none' />
            <div className='absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none' />

            {/* Left Side: Pitch Banner (Desktop Only) */}
            <div className='hidden md:flex md:w-[45%] lg:w-[50%] bg-[#08080d]/40 border-r border-dark-border flex-col justify-between p-12 lg:p-16 relative z-10 overflow-hidden'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_55%)]' />
                
                {/* Logo Area */}
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30'>
                        TE
                    </div>
                    <span className='font-display font-bold text-xl tracking-tight text-white'>
                        Teyzix <span className='text-indigo-400'>Editor</span>
                    </span>
                </div>

                {/* Tagline / Value Prop */}
                <div className='space-y-6 my-auto'>
                    <h2 className='text-4xl lg:text-5xl font-display font-extrabold leading-[1.1] tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent'>
                        Create, collaborate, <br />
                        and edit in <span className='bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent'>real-time</span>.
                    </h2>
                    <p className='text-slate-400 text-base leading-relaxed max-w-md'>
                        A premium workspace designed for teams to edit documents together seamlessly. Track versions, manage permissions, and stream updates instantly.
                    </p>

                    {/* Features pill stack */}
                    <div className='flex flex-wrap gap-2 pt-4'>
                        {['Socket.io Sync', 'Timeline History', 'Granular Access', 'Tiptap Rich-Text'].map((f) => (
                            <span key={f} className='text-xs font-semibold px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-indigo-300 backdrop-blur-sm'>
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer details */}
                <div className='text-xs text-slate-500 font-medium'>
                    © {new Date().getFullYear()} Teyzix Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side: Form (All devices) */}
            <div className='flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 relative z-10'>
                {/* Mobile logo (Mobile only) */}
                <div className='flex md:hidden items-center gap-3 mb-8'>
                    <div className='w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md'>
                        TE
                    </div>
                    <span className='font-display font-bold text-lg text-white'>
                        Teyzix <span className='text-indigo-400'>Editor</span>
                    </span>
                </div>

                <div className='w-full max-w-[420px] animate-scale-up'>
                    {/* Header */}
                    <div className='text-center md:text-left mb-8'>
                        <h1 className='text-3xl font-display font-extrabold tracking-tight text-white mb-2'>
                            Create <span className='text-indigo-400'>account</span>
                        </h1>
                        <p className='text-slate-400 text-sm'>
                            Get started by creating your collaborative editor account
                        </p>
                    </div>

                    {/* Glass card */}
                    <div className='bg-dark-card/60 backdrop-blur-xl border border-dark-border rounded-2xl p-6 sm:p-8 shadow-2xl relative'>
                        {error && (
                            <div className='bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs flex items-center gap-2 animate-fade-in'>
                                <span className='w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0' />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            {/* Full Name */}
                            <div className='space-y-2'>
                                <label className='text-xs text-slate-400 uppercase tracking-wider font-semibold'>Full Name</label>
                                <div className='relative group'>
                                    <MdPerson className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 text-lg transition-colors duration-200' />
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder='John Doe'
                                        required
                                        className='w-full bg-[#07070a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200'
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className='space-y-2'>
                                <label className='text-xs text-slate-400 uppercase tracking-wider font-semibold'>Email Address</label>
                                <div className='relative group'>
                                    <MdEmail className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 text-lg transition-colors duration-200' />
                                    <input
                                        type='email'
                                        name='email'
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder='you@example.com'
                                        required
                                        className='w-full bg-[#07070a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200'
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className='space-y-2'>
                                <label className='text-xs text-slate-400 uppercase tracking-wider font-semibold'>Password</label>
                                <div className='relative group'>
                                    <MdLock className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 text-lg transition-colors duration-200' />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name='password'
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder='••••••••'
                                        required
                                        className='w-full bg-[#07070a] border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowPassword(!showPassword)}
                                        className='absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors'
                                    >
                                        {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type='submit'
                                disabled={loading}
                                className='w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed pt-3 mt-4 cursor-pointer'
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className='animate-spin text-sm' />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        {/* Switch Page */}
                        <p className='text-center text-slate-400 text-sm mt-6 font-medium'>
                            Already have an account?{' '}
                            <Link to='/login' className='text-indigo-400 hover:text-indigo-300 hover:underline transition font-bold'>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Register