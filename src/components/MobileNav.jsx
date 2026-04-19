import { NavLink } from 'react-router-dom';
import {
    HiOutlineViewGrid,
    HiOutlinePlusCircle,
    HiOutlineCollection,
    HiOutlineRefresh,
    HiOutlineChartBar
} from 'react-icons/hi';
import { motion } from 'framer-motion';

const navItems = [
    { path: '/', icon: HiOutlineViewGrid, label: 'Dash' },
    { path: '/add', icon: HiOutlinePlusCircle, label: 'Add' },
    { path: '/topics', icon: HiOutlineCollection, label: 'Topics' },
    { path: '/revision', icon: HiOutlineRefresh, label: 'Revise' },
    { path: '/analytics', icon: HiOutlineChartBar, label: 'Stats' },
];

export default function MobileNav() {
    return (
        <nav className="mobile-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                    end={item.path === '/'}
                >
                    {({ isActive }) => (
                        <>
                            <div className="mobile-nav-icon-wrapper">
                                <item.icon className="mobile-nav-icon" />
                                {isActive && (
                                    <motion.div
                                        className="mobile-nav-active-dot"
                                        layoutId="activeMobileNav"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </div>
                            <span className="mobile-nav-label">{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
