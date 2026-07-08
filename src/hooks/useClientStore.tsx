"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  MOCK_RECOMMENDATIONS,
  MOCK_CHAT_HISTORY,
  MOCK_WORKFLOWS,
  MOCK_AUTOMATION_LOGS,
  DEFAULT_SETTINGS,
  MOCK_ACTIVITIES,
  MOCK_UPCOMING_TASKS,
  AIAgent,
  MOCK_AGENTS,
  ChatThread,
  Workflow,
  AutomationLog,
} from '../data/mockData';
import {
  getUnreadNotificationCount,
  subscribeToNotificationsChanged,
} from '@/services/notifications/notifications.service';
import { sendMessage as sendAiMessage } from '@/services/ai/chat.service';

interface Recommendation {
  id: string;
  title: string;
  agent: string;
  description: string;
  urgency: string;
  actionLabel: string;
  category: string;
  impact: string;
  approved: boolean;
}

interface StoreContextProps {
  recommendations: Recommendation[];
  approveRecommendation: (id: string) => void;
  chatThreads: ChatThread[];
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  sendChatMessage: (text: string) => Promise<void>;
  createNewChat: (title: string) => string;
  workflows: typeof MOCK_WORKFLOWS;
  toggleWorkflow: (id: string) => void;
  addWorkflow: (wf: Omit<Workflow, 'id' | 'lastRun' | 'successRate'>) => void;
  logs: typeof MOCK_AUTOMATION_LOGS;
  addLog: (log: AutomationLog) => void;
  // Notification badge count from DB (unread count)
  unreadNotificationCount: number;
  refreshNotificationCount: () => Promise<void>;
  settings: typeof DEFAULT_SETTINGS;
  updateSettings: (section: string, data: Partial<typeof DEFAULT_SETTINGS[keyof typeof DEFAULT_SETTINGS]>) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  agents: AIAgent[];
  updateAgentStatus: (id: string, status: 'idle' | 'running' | 'thinking') => void;
  activities: typeof MOCK_ACTIVITIES;
  addActivity: (text: string, type: string) => void;
  upcomingTasks: typeof MOCK_UPCOMING_TASKS;
  dismissTask: (id: string) => void;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(MOCK_CHAT_HISTORY);
  const [activeThreadId, setActiveThreadId] = useState<string>(MOCK_CHAT_HISTORY[0]?.id || '');
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);
  const [logs, setLogs] = useState(MOCK_AUTOMATION_LOGS);
  const [agents, setAgents] = useState<AIAgent[]>(MOCK_AGENTS);
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const [upcomingTasks, setUpcomingTasks] = useState(MOCK_UPCOMING_TASKS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const refreshNotificationCount = useCallback(async () => {
    try {
      const unread = await getUnreadNotificationCount();
      setUnreadNotificationCount(unread);
    } catch {
      // Silently fail — user may not be authenticated yet
    }
  }, []);

  useEffect(() => {
    refreshNotificationCount();
    const interval = setInterval(refreshNotificationCount, 30_000);
    const unsubscribe = subscribeToNotificationsChanged(refreshNotificationCount);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [refreshNotificationCount]);

  const approveRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, approved: true } : rec))
    );
    const rec = recommendations.find(r => r.id === id);
    if (rec) {
      addActivity(`Approved AI recommendation: "${rec.title}"`, rec.category.toLowerCase());
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!activeThreadId) return;

    // Add user message
    setChatThreads(prev =>
      prev.map(thread => {
        if (thread.id === activeThreadId) {
          return {
            ...thread,
            messages: [...thread.messages, { 
              sender: 'user', 
              text, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]
          };
        }
        return thread;
      })
    );

    // Call Gemini API
    try {
      const replyText = await sendAiMessage(text);
      setChatThreads(prev =>
        prev.map(thread => {
          if (thread.id === activeThreadId) {
            return {
              ...thread,
              messages: [...thread.messages, { 
                sender: 'agent', 
                text: replyText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              }]
            };
          }
          return thread;
        })
      );
      addActivity('AI Agent responded in chat thread.', 'ceo');
    } catch (err) {
      console.error('Failed to fetch AI response:', err);
      // Optional: add a failure message in the UI
      setChatThreads(prev =>
        prev.map(thread => {
          if (thread.id === activeThreadId) {
            return {
              ...thread,
              messages: [...thread.messages, { 
                sender: 'agent', 
                text: 'Error: Could not reach the AI service.', 
                isError: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              }]
            };
          }
          return thread;
        })
      );
    }
  };

  const createNewChat = (title: string) => {
    const newId = `c-${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: title || `New Business Strategy (${chatThreads.length + 1})`,
      messages: [{ 
        sender: 'agent', 
        text: '👋 Welcome to AI Business OS.\n\nI\'m your executive AI assistant.\n\nI can help you with:\n• Business Strategy\n• Customer Management\n• Inventory\n• Finance\n• Marketing\n• Reports\n• Operations\n• Productivity\n• AI Recommendations\n\nHow can I help your business today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]
    };
    setChatThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newId);
    return newId;
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev =>
      prev.map(wf => (wf.id === id ? { ...wf, status: wf.status === 'Active' ? 'Paused' : 'Active' } : wf))
    );
    const wf = workflows.find(w => w.id === id);
    if (wf) {
      addActivity(`Toggled workflow: "${wf.name}" to ${wf.status === 'Active' ? 'Paused' : 'Active'}.`, 'operations');
    }
  };

  const addWorkflow = (wf: Omit<Workflow, 'id' | 'lastRun' | 'successRate'>) => {
    setWorkflows(prev => [...prev, { ...wf, id: `wf-${Date.now()}`, lastRun: 'Never', successRate: '100%' }]);
    addActivity(`Created new automation workflow: "${wf.name}"`, 'operations');
  };

  const addLog = (log: AutomationLog) => {
    setLogs(prev => [log, ...prev]);
  };

  const updateSettings = (section: string, data: Partial<typeof DEFAULT_SETTINGS[keyof typeof DEFAULT_SETTINGS]>) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof DEFAULT_SETTINGS], ...data }
    }));
    addActivity(`Updated configuration settings for ${section}.`, 'ceo');
  };

  const updateAgentStatus = (id: string, status: 'idle' | 'running' | 'thinking') => {
    setAgents(prev =>
      prev.map(a => (a.id === id ? { ...a, status } : a))
    );
  };

  const addActivity = (text: string, type: string) => {
    const newAct = {
      id: `act-${Date.now()}`,
      text,
      time: 'Just now',
      type
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const dismissTask = (id: string) => {
    setUpcomingTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        recommendations,
        approveRecommendation,
        chatThreads,
        activeThreadId,
        setActiveThreadId,
        sendChatMessage,
        createNewChat,
        workflows,
        toggleWorkflow,
        addWorkflow,
        logs,
        addLog,
        unreadNotificationCount,
        refreshNotificationCount,
        settings,
        updateSettings,
        sidebarOpen,
        setSidebarOpen,
        agents,
        updateAgentStatus,
        activities,
        addActivity,
        upcomingTasks,
        dismissTask
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useClientStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useClientStore must be used within a StoreProvider');
  }
  return context;
};
