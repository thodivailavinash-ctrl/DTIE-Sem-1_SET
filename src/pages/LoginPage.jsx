import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Play,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import WalletScene from '../components/three/WalletScene';
import GradientButton from '../components/ui/GradientButton';
import { useFinance } from '../context/FinanceContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

const signupSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Za-z]/, 'Must contain at least one letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

function getPasswordStrength(password = '') {
  if (!password) return { score: 0, label: 'Enter password', color: '#94A3B8' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const map = [
    { label: 'Weak', color: '#FB7185' },
    { label: 'Fair', color: '#FBBF24' },
    { label: 'Good', color: '#22D3EE' },
    { label: 'Strong', color: '#34D399' },
    { label: 'Very Strong', color: '#34D399' }
  ];
  return { score: Math.max(1, score), ...map[score] };
}

export default function LoginPage() {
  const { currentUser, login, register: registerAccount, enterDemoMode, settings } = useFinance();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Refs for GSAP entrance and sliding transitions
  const pageBgRef = useRef(null);
  const logoRef = useRef(null);
  const formPanelRef = useRef(null);
  const trailRef = useRef(null);

  // Redirect if already authenticated and not playing login success animation
  useEffect(() => {
    if (currentUser && !loginSuccess && !isSubmitting) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loginSuccess, isSubmitting, navigate]);

  // Login Form Hook
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@myfinance.app',
      password: 'Demo@1234',
      rememberMe: true
    }
  });

  // Signup Form Hook
  const {
    register: regSignup,
    handleSubmit: handleSignupSubmit,
    watch: watchSignup,
    formState: { errors: signupErrors }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const watchedSignupPassword = watchSignup('password', '');
  const passwordStrength = useMemo(
    () => getPasswordStrength(watchedSignupPassword),
    [watchedSignupPassword]
  );

  // 3. LOGIN ENTRANCE ANIMATION (Coordinated GSAP timeline)
  useEffect(() => {
    if (settings?.reducedMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(pageBgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
        .fromTo(
          logoRef.current,
          { opacity: 0, y: -18 },
          { opacity: 1, y: 0, duration: 0.45 },
          '-=0.2'
        )
        .fromTo(
          formPanelRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.65 },
          '-=0.25'
        );
    });
    return () => ctx.revert();
  }, [settings?.reducedMotion]);

  // 4. LOGIN TO SIGN-UP SLIDING ANIMATION (GSAP Timeline 0.95s, power3.inOut)
  const toggleAuthMode = (targetSignup) => {
    if (targetSignup === isSignup || isSubmitting) return;

    const isDesktop = window.innerWidth >= 1024;
    if (settings?.reducedMotion || !isDesktop) {
      setIsSignup(targetSignup);
      return;
    }

    const tl = gsap.timeline({
      defaults: { duration: 1.0, ease: 'power3.inOut' }
    });

    // Light trail sweep across screen
    if (trailRef.current) {
      gsap.fromTo(
        trailRef.current,
        {
          opacity: 0.85,
          xPercent: targetSignup ? -60 : 60
        },
        {
          opacity: 0,
          xPercent: targetSignup ? 60 : -60,
          duration: 1.0,
          ease: 'power2.out'
        }
      );
    }

    // Swap state halfway for smooth content transformation while panels glide
    gsap.delayedCall(0.38, () => {
      setIsSignup(targetSignup);
    });

    if (targetSignup) {
      // Form panel (max-w-md or 48% width) slides from left side to right side smoothly
      // On 1024px+ screens, sliding xPercent shifts it to the right half
      tl.to(formPanelRef.current, { xPercent: 115 }, 0);
    } else {
      tl.to(formPanelRef.current, { xPercent: 0 }, 0);
    }
  };

  // Keep panel positions responsive if window resizes
  useEffect(() => {
    const handleResize = () => {
      if (!formPanelRef.current) return;
      if (window.innerWidth < 1024) {
        gsap.set(formPanelRef.current, { xPercent: 0 });
      } else if (isSignup) {
        gsap.set(formPanelRef.current, { xPercent: 115 });
      } else {
        gsap.set(formPanelRef.current, { xPercent: 0 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSignup]);

  // 6. LOGIN SUCCESS ANIMATION (1.2s sequence before routing to /dashboard)
  const triggerSuccessTransition = (welcomeName) => {
    setLoginSuccess(true);
    toast.success(`Welcome to MyFinance, ${welcomeName}!`);

    if (settings?.reducedMotion) {
      navigate('/dashboard', { replace: true });
      return;
    }

    gsap.to(formPanelRef.current, {
      scale: 0.96,
      opacity: 0,
      duration: 0.65,
      delay: 0.55,
      ease: 'power2.inOut'
    });

    gsap.to(pageBgRef.current, {
      opacity: 0,
      duration: 0.45,
      delay: 0.95,
      onComplete: () => {
        navigate('/dashboard', { replace: true });
      }
    });
  };

  const onLoginSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password, data.rememberMe);
      triggerSuccessTransition(user.name);
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await registerAccount({
        name: data.name,
        email: data.email,
        password: data.password,
        seedWithSampleData: true
      });
      triggerSuccessTransition(user.name);
    } catch (err) {
      toast.error(err.message || 'Could not create account');
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoMode = () => {
    setIsSubmitting(true);
    const user = enterDemoMode();
    triggerSuccessTransition(user.name);
  };

  const handleForgotPassword = () => {
    setLoginValue('email', 'demo@myfinance.app');
    setLoginValue('password', 'Demo@1234');
    toast.info('Demo credentials auto-filled: demo@myfinance.app / Demo@1234');
  };

  return (
    <div
      ref={pageBgRef}
      className="min-h-screen w-full bg-[#070B18] text-[#F8FAFC] relative overflow-hidden flex flex-col justify-between"
    >
      {/* FULL-VIEWPORT 3D CANVAS ANIMATION (Fills the entire size of the web page) */}
      <WalletScene
        isSignup={isSignup}
        isSuccess={loginSuccess}
        reducedMotion={settings?.reducedMotion}
      />

      {/* Ambient Background Gradients & Light Trail */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#22D3EE]/12 blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[480px] h-[480px] rounded-full bg-[#8B5CF6]/12 blur-[140px]" />
        {/* Cyan & Violet Sliding Light Trail */}
        <div
          ref={trailRef}
          className="opacity-0 absolute inset-y-0 left-1/4 w-1/2 bg-gradient-to-r from-transparent via-[#22D3EE]/25 to-[#8B5CF6]/25 blur-3xl pointer-events-none"
        />
      </div>

      {/* TOP FLOATING STATUS BAR & HUD PILL */}
      <div className="relative z-20 w-full px-6 sm:px-10 pt-6 flex items-center justify-between pointer-events-none">
        <div className="glass-panel rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10 pointer-events-auto shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
          <span className="text-xs font-medium text-[#F8FAFC]">
            Interactive 3D Smart Wallet • Live Full-Page Experience
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass-panel border border-[#22D3EE]/30 text-[#22D3EE]">
            <Sparkles className="w-3.5 h-3.5" />
            Drag & move mouse to tilt 3D scene
          </span>
        </div>
      </div>

      {/* FLOATING GLASS AUTHENTICATION FORM (Slides between left & right across full 3D canvas) */}
      <div className="w-full flex-1 flex items-center px-4 sm:px-10 lg:px-14 py-6 relative z-20 pointer-events-none">
        <div
          ref={formPanelRef}
          className="w-full max-w-md my-auto relative transition-all duration-300 pointer-events-auto"
        >
          <div
            className={`glass-panel animated-glass-border rounded-3xl p-6 sm:p-8 lg:p-9 w-full relative transition-shadow duration-500 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.6)] ${
              loginSuccess
                ? 'shadow-[0_0_50px_rgba(52,211,153,0.45)] border-[#34D399]/60'
                : ''
            }`}
          >
          {/* Brand Logo & Tagline */}
          <div ref={logoRef} className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                <Sparkles className="w-6 h-6 text-[#070B18]" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold tracking-tight text-[#F8FAFC] leading-none">
                  MyFinance
                </h1>
                <p className="text-[11px] font-medium tracking-wider text-[#22D3EE] mt-1">
                  Track • Plan • Save • Grow
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-[#94A3B8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              WebCrypto Demo
            </span>
          </div>

          {/* Login Success Checkmark Overlay */}
          {loginSuccess && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#34D399]/20 border border-[#34D399]/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                <CheckCircle2 className="w-9 h-9 text-[#34D399]" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-[#F8FAFC]">
                Authentication Verified
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Synchronizing your 3D financial workspace...
              </p>
            </div>
          )}

          {/* LOGIN FORM */}
          {!loginSuccess && !isSignup && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
                  Welcome Back
                </h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Take control of your money, one expense at a time.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="demo@myfinance.app"
                      {...regLogin('email')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm fintech-input"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-xs text-[#FB7185] mt-1">{loginErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...regLogin('password')}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm fintech-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-[#FB7185] mt-1">{loginErrors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-[#94A3B8] hover:text-[#F8FAFC]">
                    <input
                      type="checkbox"
                      {...regLogin('rememberMe')}
                      className="rounded border-white/20 bg-[#070B18] text-[#22D3EE] focus:ring-[#22D3EE]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[#22D3EE] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="pt-1 space-y-2.5">
                  <GradientButton
                    type="submit"
                    loading={isSubmitting}
                    className="w-full py-3"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </GradientButton>

                  <div className="grid grid-cols-2 gap-2.5">
                    <GradientButton
                      type="button"
                      variant="secondary"
                      onClick={() => toggleAuthMode(true)}
                      className="w-full"
                    >
                      Create Account
                    </GradientButton>

                    <GradientButton
                      type="button"
                      variant="success"
                      onClick={handleQuickDemoMode}
                      className="w-full"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Enter Demo Mode
                    </GradientButton>
                  </div>
                </div>
              </form>

              <p className="mt-5 text-[11px] text-center text-[#94A3B8] leading-relaxed">
                Local demonstration auth using salted Web Crypto PBKDF2 verifiers. No plaintext passwords stored.
              </p>
            </div>
          )}

          {/* REGISTRATION FORM */}
          {!loginSuccess && isSignup && (
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-heading font-bold text-[#F8FAFC]">
                  Create Account
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Start tracking your expenses with interactive 3D insights.
                </p>
              </div>

              <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-3.5" noValidate>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Riya Verma"
                      {...regSignup('name')}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-sm fintech-input"
                    />
                  </div>
                  {signupErrors.name && (
                    <p className="text-xs text-[#FB7185] mt-1">{signupErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="riya@college.edu"
                      {...regSignup('email')}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-sm fintech-input"
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-xs text-[#FB7185] mt-1">{signupErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#94A3B8]">Password</label>
                    <span className="text-[11px] font-medium" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 chars with letters & numbers"
                      {...regSignup('password')}
                      className="w-full pl-10 pr-10 py-2 rounded-xl text-sm fintech-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Bar */}
                  <div className="mt-1.5 grid grid-cols-4 gap-1.5 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="rounded-full transition-colors duration-300"
                        style={{
                          backgroundColor:
                            passwordStrength.score >= step
                              ? passwordStrength.color
                              : 'rgba(255,255,255,0.1)'
                        }}
                      />
                    ))}
                  </div>
                  {signupErrors.password && (
                    <p className="text-xs text-[#FB7185] mt-1">{signupErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      {...regSignup('confirmPassword')}
                      className="w-full pl-10 pr-10 py-2 rounded-xl text-sm fintech-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-xs text-[#FB7185] mt-1">
                      {signupErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 space-y-2.5">
                  <GradientButton type="submit" loading={isSubmitting} className="w-full py-2.5">
                    <span>Sign Up</span>
                    <ArrowRight className="w-4 h-4" />
                  </GradientButton>

                  <div className="text-center pt-1">
                    <span className="text-xs text-[#94A3B8]">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => toggleAuthMode(false)}
                      className="text-xs font-semibold text-[#22D3EE] hover:underline"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* BOTTOM FLOATING HOLOGRAPHIC FINANCIAL INSIGHT CARDS */}
      <div className="relative z-20 pb-6 px-6 sm:px-10 pointer-events-none">
        <div className="hidden sm:grid grid-cols-3 gap-3 max-w-2xl mx-auto w-full">
          <div className="glass-panel rounded-2xl p-3 border border-[#22D3EE]/30 backdrop-blur-md shadow-lg pointer-events-auto">
            <p className="text-[11px] text-[#94A3B8]">Sample Monthly Income</p>
            <p className="text-base font-heading font-bold text-[#34D399] mt-0.5">₹48,000</p>
          </div>
          <div className="glass-panel rounded-2xl p-3 border border-[#8B5CF6]/30 backdrop-blur-md shadow-lg pointer-events-auto">
            <p className="text-[11px] text-[#94A3B8]">Monthly Spending</p>
            <p className="text-base font-heading font-bold text-[#22D3EE] mt-0.5">₹22,000</p>
          </div>
          <div className="glass-panel rounded-2xl p-3 border border-[#34D399]/30 backdrop-blur-md shadow-lg pointer-events-auto">
            <p className="text-[11px] text-[#94A3B8]">Budget Used</p>
            <p className="text-base font-heading font-bold text-[#F8FAFC] mt-0.5">62.86%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
