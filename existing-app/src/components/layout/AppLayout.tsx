import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav.tsx'; // Mobile navigation component
import TaskModal from '../shared/TaskModal';

export default function AppLayout() {
  const [showTaskModal, setShowTaskModal] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCreateTask={() => setShowTaskModal(true)} />
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <MobileNav />
      </div>
      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} />
      )}
    </div>
  );
}
