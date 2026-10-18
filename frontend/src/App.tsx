import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import DailyPlanner from './pages/DailyPlanner';
import WeeklyTimetable from './pages/WeeklyTimetable';
import WeeklyTodoList from './pages/WeeklyTodoList';
import Goals from './pages/Goals';
import StickyNotes from './pages/StickyNotes';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';

// Protected Route wrapper with automatic demo access
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-surface-container border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, redirect to login unless in preview
  if (!isAuthenticated && !localStorage.getItem('achieveros_user')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Authenticated Workspace Pages inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/daily-planner" element={<DailyPlanner />} />
        <Route path="/weekly-timetable" element={<WeeklyTimetable />} />
        <Route path="/weekly-todo" element={<WeeklyTodoList />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/sticky-notes" element={<StickyNotes />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
