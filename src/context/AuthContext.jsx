import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AUTH_KEY = 'recallx_auth';
const USERS_KEY = 'recallx_users';

function loadAuth() {
    try {
        const stored = localStorage.getItem(AUTH_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

function loadUsers() {
    try {
        const stored = localStorage.getItem(USERS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveAuth(user) {
    if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(AUTH_KEY);
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = loadAuth();
        if (stored) {
            setUser(stored);
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const users = loadUsers();
        const found = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) {
            return { success: false, error: 'Invalid email or password' };
        }
        const session = { id: found.id, name: found.name, email: found.email, avatar: found.avatar };
        setUser(session);
        saveAuth(session);
        return { success: true };
    };

    const signup = (name, email, password) => {
        const users = loadUsers();
        const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            return { success: false, error: 'An account with this email already exists' };
        }
        const newUser = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
            name,
            email,
            password,
            avatar: name.charAt(0).toUpperCase(),
            createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        saveUsers(users);
        const session = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
        setUser(session);
        saveAuth(session);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        saveAuth(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
