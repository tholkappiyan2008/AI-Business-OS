"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { Bell, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const {
    notifications,
    dismissNotification,
    approveNotificationAction
  } = useClientStore();

  const [activeTab, setActiveTab] = useState<'all' | 'approvals' | 'warnings' | 'alerts'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  // Filter notifications based on tab
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'approvals') return notif.type === 'approval';
    if (activeTab === 'warnings') return notif.type === 'warning';
    if (activeTab === 'alerts') return notif.type === 'alert';
    return true;
  });

  const getNotifIcon = (type: string) => {
    if (type === 'approval') return <ShieldCheck className="w-4 h-4 text-blue-400" />;
    if (type === 'warning') return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    return <Bell className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Tab Filter Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
          {(['all', 'approvals', 'warnings', 'alerts'] as const).map((tab) => {
            const count = tab === 'all'
              ? notifications.length
              : notifications.filter(n => n.type === (tab === 'approvals' ? 'approval' : tab === 'warnings' ? 'warning' : 'alert')).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            notifications.forEach(n => dismissNotification(n.id));
          }}
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          Clear all alerts
        </button>
      </div>

      {/* Notifications List */}
      <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/5">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="flex justify-center text-slate-500">
              <Bell className="w-10 h-10 rounded-full bg-white/5 p-2 border border-white/5" />
            </div>
            <p className="text-xs font-semibold text-slate-400">All caught up</p>
            <p className="text-[10px] text-slate-500">No operational alerts requiring validation are pending.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isApproved = notif.approved;
            return (
              <div
                key={notif.id}
                className="p-5 flex items-start justify-between gap-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/5 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white leading-tight">{notif.title}</h4>
                      <span className="text-[9px] font-semibold text-slate-500 bg-white/5 border border-white/5 rounded px-1.5 py-0.5 uppercase">
                        {notif.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{notif.desc}</p>
                    <p className="text-[9px] text-slate-500 pt-0.5">{notif.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {notif.actionRequired && (
                    <>
                      {isApproved ? (
                        <span className="text-[9px] font-bold text-slate-500 uppercase px-2 py-1">Reconciled</span>
                      ) : (
                        <button
                          onClick={() => approveNotificationAction(notif.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all shadow shadow-blue-500/10 flex items-center gap-0.5"
                        >
                          Approve <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => dismissNotification(notif.id)}
                    className="p-1 rounded text-slate-500 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
