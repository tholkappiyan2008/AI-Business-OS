"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell, ShieldAlert, Check, X, ShieldCheck, Info, RefreshCw,
  Trash2, CheckCheck, Clock, AlertTriangle
} from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
  markAllAsRead,
  subscribeToNotificationsChanged,
  type DBNotification,
} from '@/services/notifications/notifications.service';

type TabType = 'all' | 'unread';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function getTypeIcon(type: string) {
  if (type === 'approval') return <ShieldCheck className="w-4 h-4 text-blue-400" />;
  if (type === 'warning') return <ShieldAlert className="w-4 h-4 text-amber-400" />;
  if (type === 'info') return <Info className="w-4 h-4 text-emerald-400" />;
  return <Bell className="w-4 h-4 text-purple-400" />;
}

function getTypeAccent(type: string): string {
  if (type === 'approval') return 'border-l-blue-500/60';
  if (type === 'warning') return 'border-l-amber-500/60';
  if (type === 'info') return 'border-l-emerald-500/60';
  return 'border-l-purple-500/60';
}

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    const unsubscribe = subscribeToNotificationsChanged(fetchNotifications);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setActionInProgress(id + '-read');
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Mark read failed:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionInProgress(id + '-delete');
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleClearAll = async () => {
    setActionInProgress('clear-all');
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Clear all failed:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionInProgress('mark-all-read');
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read failed:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    return true;
  });

  const tabCount = (tab: TabType): number => {
    if (tab === 'all') return notifications.length;
    if (tab === 'unread') return notifications.filter(n => !n.is_read).length;
    return 0;
  };

  const TABS: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
  ];

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header with Tab Navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
          {TABS.map(({ key, label }) => {
            const count = tabCount(key);
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  activeTab === key
                    ? 'bg-blue-600 text-white shadow shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    activeTab === key ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            title="Refresh notifications"
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              disabled={actionInProgress === 'mark-all-read'}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={actionInProgress === 'clear-all'}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/5">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm font-semibold text-slate-300">No notifications available.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isProcessing = actionInProgress?.startsWith(notif.id);

            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                className={`relative p-5 flex items-start justify-between gap-4 transition-colors text-left border-l-2 ${getTypeAccent(notif.type)} ${
                  !notif.is_read
                    ? 'bg-white/[0.03] hover:bg-white/[0.05] cursor-pointer'
                    : 'hover:bg-white/[0.02]'
                } ${isProcessing ? 'opacity-60' : ''}`}
              >
                {/* Unread Dot */}
                {!notif.is_read && (
                  <span className="absolute top-5 right-5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/5 mt-0.5 shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs font-bold leading-tight ${notif.is_read ? 'text-slate-300' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(notif.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleDelete(notif.id)}
                    disabled={isProcessing}
                    title="Delete notification"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
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
