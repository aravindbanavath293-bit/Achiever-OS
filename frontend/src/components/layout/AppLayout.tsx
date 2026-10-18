import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import TaskModal from '../shared/TaskModal';
import { useAppData } from '../../context/AppDataContext';

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { addTask } = useAppData();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar onCreateTask={() => setTaskModalOpen(true)} />

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[180px] w-full">
        <TopBar
          onMenuClick={() => setMobileNavOpen(true)}
          onSearch={(query) => {
            if (query.trim()) {
              navigate(`/tasks?search=${encodeURIComponent(query.trim())}`);
            }
          }}
        />
        <main className="flex-1 p-3 md:p-5 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={(taskData) => addTask(taskData)}
        mode="create"
      />
    </div>
  );
}
