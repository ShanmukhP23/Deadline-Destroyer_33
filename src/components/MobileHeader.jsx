import { useAuth } from '../context/AuthContext';
import { HiOutlineLogout } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function MobileHeader() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="mobile-header">
            <div className="mobile-header-logo">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="8" fill="url(#logoGradMobile)" />
                    <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                        <linearGradient id="logoGradMobile" x1="0" y1="0" x2="28" y2="28">
                            <stop stopColor="#6366F1" />
                            <stop offset="1" stopColor="#8B5CF6" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="mobile-header-title">RecallX</span>
            </div>
            
            <div className="mobile-header-actions">
                <div className="mobile-header-user">
                    <span className="user-initial">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
                <button className="mobile-logout-btn" onClick={logout}>
                    <HiOutlineLogout />
                </button>
            </div>
        </header>
    );
}
