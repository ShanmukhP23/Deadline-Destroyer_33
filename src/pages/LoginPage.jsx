import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login, signup } = useAuth();
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Brief delay for feel
        await new Promise((r) => setTimeout(r, 600));

        let result;
        if (isSignup) {
            if (!name.trim()) {
                setError('Please enter your name');
                setIsLoading(false);
                return;
            }
            result = signup(name.trim(), email.trim(), password);
        } else {
            result = login(email.trim(), password);
        }

        if (!result.success) {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const toggleMode = () => {
        setIsSignup(!isSignup);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="login-page">
            {/* Animated background orbs */}
            <div className="login-bg-orb login-bg-orb-1" />
            <div className="login-bg-orb login-bg-orb-2" />
            <div className="login-bg-orb login-bg-orb-3" />

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Logo Section */}
                <div className="login-header">
                    <motion.div
                        className="login-logo"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    >
                        <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
                            <rect width="28" height="28" rx="8" fill="url(#loginLogoGrad)" />
                            <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop stopColor="#6366F1" />
                                    <stop offset="1" stopColor="#8B5CF6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </motion.div>
                    <motion.h1
                        className="login-title"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        RecallX
                    </motion.h1>
                    <motion.p
                        className="login-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {isSignup ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
                    </motion.p>
                </div>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    className="login-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    <AnimatePresence mode="wait">
                        {isSignup && (
                            <motion.div
                                key="name-field"
                                className="login-field"
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="login-input-wrapper">
                                    <HiOutlineUser className="login-input-icon" />
                                    <input
                                        type="text"
                                        className="login-input"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="name"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="login-field">
                        <div className="login-input-wrapper">
                            <HiOutlineMail className="login-input-icon" />
                            <input
                                type="email"
                                className="login-input"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <div className="login-input-wrapper">
                            <HiOutlineLockClosed className="login-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={4}
                                autoComplete={isSignup ? 'new-password' : 'current-password'}
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="login-error"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        className="login-submit-btn"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <div className="login-spinner" />
                        ) : isSignup ? (
                            'Create Account'
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </motion.form>

                {/* Toggle */}
                <motion.div
                    className="login-toggle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <span>
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button type="button" className="login-toggle-btn" onClick={toggleMode}>
                        {isSignup ? 'Sign In' : 'Sign Up'}
                    </button>
                </motion.div>

                {/* Demo hint */}
                <motion.div
                    className="login-demo-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p>✨ Create a new account to get started with pre-loaded demo data!</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
