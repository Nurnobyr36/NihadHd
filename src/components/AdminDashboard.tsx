import React, { useState } from 'react';
import { PlayoutState } from '../types';
import { QuickControlBar } from './QuickControlBar';
import { PlaylistManager } from './PlaylistManager';
import { SidebarPreview } from './SidebarPreview';
import { TickerEditModal } from './TickerEditModal';
import { DisplaySettingsModal } from './DisplaySettingsModal';

interface AdminDashboardProps {
  state: PlayoutState;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ state }) => {
  const [editingTickerId, setEditingTickerId] = useState<string | null>(null);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);

  const tickerToEdit = state.tickers.find(t => t.id === editingTickerId) || null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Quick Control Bar */}
      <QuickControlBar
        state={state}
        onOpenDisplaySettings={() => setShowDisplaySettings(true)}
        onEditTicker={(tickerId) => setEditingTickerId(tickerId)}
      />

      {/* Main Grid: Left 2 Cols Playlist Queue, Right 1 Col Live Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PlaylistManager state={state} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <SidebarPreview state={state} />
        </div>
      </div>

      {/* Modals */}
      {editingTickerId && (
        <TickerEditModal
          ticker={tickerToEdit}
          onClose={() => setEditingTickerId(null)}
        />
      )}

      {showDisplaySettings && (
        <DisplaySettingsModal
          settings={state.displaySettings}
          onClose={() => setShowDisplaySettings(false)}
        />
      )}
    </div>
  );
};
