
import React from 'react';
import RealTimeStats from '@/components/RealTimeStats';
import CandidateChart from '@/components/CandidateChart';
import { ProcessingStats } from '@/types/tse';
import { TSEBoletim } from '@/types/tse';

interface AnalyticsTabProps {
  stats: ProcessingStats;
  totalVotes: number;
  voteRecords: TSEBoletim[];
}

const AnalyticsTab = ({ stats, totalVotes, voteRecords }: AnalyticsTabProps) => {
  return (
    <div className="space-y-6">
      <RealTimeStats stats={stats} totalVotes={totalVotes} />
      {voteRecords.length > 0 && (
        <CandidateChart boletins={voteRecords} />
      )}
    </div>
  );
};

export default AnalyticsTab;
