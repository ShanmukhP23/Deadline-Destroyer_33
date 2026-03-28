import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopicProvider } from './context/TopicContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddTopic from './pages/AddTopic';
import AllTopics from './pages/AllTopics';
import Revision from './pages/Revision';
import Analytics from './pages/Analytics';
import LoginPage from './pages/LoginPage';
import { useEffect, useRef } from 'react';
import { seedIfEmpty } from './utils/seedData';

function ProtectedApp() {
    const { isAuthenticated, loading } = useAuth();
    const seeded = useRef(false);

    useEffect(() => {
        if (isAuthenticated && !seeded.current) {
            const didSeed = seedIfEmpty();
            if (didSeed) {
                // Force reload to pick up seeded data into TopicContext
                window.location.reload();
            }
            seeded.current = true;
        }
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div className="login-spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <TopicProvider>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/add" element={<AddTopic />} />
                        <Route path="/topics" element={<AllTopics />} />
                        <Route path="/revision" element={<Revision />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </TopicProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <ProtectedApp />
            </Router>
        </AuthProvider>
    );
}

export default App;
