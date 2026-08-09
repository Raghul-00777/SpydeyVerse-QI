import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <SpiderWebBackground />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
