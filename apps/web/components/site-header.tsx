'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FolderKanban,
    Building2,
    Clock,
    FileText,
    Truck,
    Globe,
    Settings,
    LogOut,
    Menu,
    Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function SiteHeader() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setUserMenuOpen(false);
        };
        // Add listener only when menu is open
        if (userMenuOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [userMenuOpen]);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Candidates', href: '/candidates', icon: Users },
        { name: 'Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Clients', href: '/clients', icon: Building2 },
        { name: 'Timesheets', href: '/timesheets', icon: Clock },
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Vendors', href: '/vendors', icon: Truck },
        { name: 'Immigration', href: '/immigration', icon: Globe },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (!user) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm font-sans">
            <div className="flex h-16 items-center px-4 md:px-6">

                {/* Home Button & Logo */}
                <div className="mr-6 flex items-center gap-4">
                    {/* Explicit Home Button as requested */}
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hidden md:block"
                        title="Home"
                    >
                        <LayoutDashboard size={20} />
                    </button>

                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
                            A
                        </div>
                        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-accent tracking-tight hidden lg:block">
                            ATS Portal
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden xl:flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-2 text-[0.9rem] font-medium rounded-lg transition-all duration-200 whitespace-nowrap group
                                    ${isActive
                                        ? 'bg-primary/10 text-primary-dark'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    size={18}
                                    className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-1" />

                {/* Right Actions */}
                <div className="flex items-center gap-3 ml-4">
                    {/* User Profile Dropdown */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                        >
                            <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
                                ) : (
                                    user.firstName?.[0] || 'U'
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                {user.firstName || 'User'}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {userMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                    <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                                    <Settings size={16} />
                                    Account Settings
                                </Link>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:hover:text-primary text-left">
                                    <Globe size={16} />
                                    Theme: Default
                                </button>
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="xl:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileMenuOpen && (
                <div className="xl:hidden border-t p-4 bg-white space-y-2 absolute w-full shadow-lg h-[calc(100vh-4rem)] overflow-y-auto z-50 animate-slide-in">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3 text-base font-medium rounded-xl transition-all
                                    ${isActive
                                        ? 'bg-primary/10 text-primary-dark'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}

export default SiteHeader;
