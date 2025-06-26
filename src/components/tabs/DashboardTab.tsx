
import React from 'react';
import Dashboard from '@/components/Dashboard';
import NotificationCenter from '@/components/NotificationCenter';
import { ProcessingStats } from '@/types/tse';

interface DashboardTabProps {
  stats: ProcessingStats;
  totalVotes: number;
}

const DashboardTab = ({ stats, totalVotes }: DashboardTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Dashboard stats={stats} totalVotes={totalVotes} />
        </div>
        <div>
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
