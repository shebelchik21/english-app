import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import WelcomePage from './pages/WelcomePage';
import StudentDashboard from './pages/StudentDashboard';
import BookingPage from './pages/BookingPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav from './components/BottomNav';
import './index.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  // Show loading/welcome while authenticating
  if (loading || !user) {
    return <WelcomePage />;
  }

  const isAdmin = user.role === 'ADMIN';

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  };

  // Admin pages
  if (isAdmin) {
    const adminPageMap: Record<string, string> = {
      schedule: 'schedule',
      students: 'students',
      bookings: 'bookings',
    };
    const adminTab = adminPageMap[currentPage] || 'schedule';

    return (
      <>
        <AdminDashboard initialTab={adminTab as 'schedule' | 'students' | 'bookings'} />
        <BottomNav currentPage={currentPage} onNavigate={handleNavigate} isAdmin={true} />
      </>
    );
  }

  // Student pages
  const renderStudentPage = () => {
    switch (currentPage) {
      case 'booking':  return <BookingPage />;
      case 'history':  return <HistoryPage />;
      default:         return <StudentDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {renderStudentPage()}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} isAdmin={false} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
