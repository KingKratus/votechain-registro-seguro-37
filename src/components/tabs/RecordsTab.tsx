
import React from 'react';
import VoteHistoryTable from '@/components/VoteHistoryTable';
import { TSEBoletim } from '@/types/tse';

interface RecordsTabProps {
  voteRecords: TSEBoletim[];
  onRegister: (data: TSEBoletim) => void;
}

const RecordsTab = ({ voteRecords, onRegister }: RecordsTabProps) => {
  return (
    <div className="space-y-6">
      <VoteHistoryTable voteRecords={voteRecords} />
    </div>
  );
};

export default RecordsTab;
