"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { User, Building, Eye, EyeOff, Plus, Key, Bot, CreditCard, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { settings, updateSettings } = useClientStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'api' | 'ai' | 'billing'>('profile');
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  
  // Local form states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  
  const [aiModel, setAiModel] = useState('');
  const [aiTemp, setAiTemp] = useState(0.2);

  const [apiKeys, setApiKeys] = useState<{ name: string; key: string; created: string; status: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    if (settings) {
      setProfileName(settings.profile.name);
      setProfileEmail(settings.profile.email);
      setProfileRole(settings.profile.role);
      
      setCompanyName(settings.company.name);
      setCompanyWebsite(settings.company.website);
      
      setAiModel(settings.aiSettings.defaultModel);
      setAiTemp(settings.aiSettings.temperature);

      setApiKeys(settings.apiKeys);
    }
  }, [settings]);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings('profile', { name: profileName, email: profileEmail, role: profileRole });
    alert('Profile configurations updated successfully.');
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings('company', { name: companyName, website: companyWebsite });
    alert('Company configurations updated successfully.');
  };

  const handleSaveAISettings = () => {
    updateSettings('aiSettings', { defaultModel: aiModel, temperature: aiTemp });
    alert('AI Cognitive constraints updated successfully.');
  };

  const handleToggleKey = (name: string) => {
    setShowKeys(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleGenerateApiKey = () => {
    const newKey = {
      name: `Custom Dev Sync Token (${apiKeys.length + 1})`,
      key: `AIzaSyA${Math.random().toString(36).substring(2, 7)}...keyX`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active'
    };
    setApiKeys(prev => [...prev, newKey]);
    updateSettings('apiKeys', [...apiKeys, newKey]);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Tab panel navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 max-w-2xl">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Profile
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'company' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Company
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'api' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" /> API Keys
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'ai' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" /> AI Config
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'billing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Subscription
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-6 rounded-2xl max-w-2xl bg-slate-900/30">
          <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3">User Profile Console</h3>
          
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400">Personal Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2.5 text-xs glass-input focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400">Corporate Title</label>
                <input
                  type="text"
                  required
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full p-2.5 text-xs glass-input focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400">Workstation Email Address</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full p-2.5 text-xs glass-input focus:outline-none"
              />
            </div>

            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all shadow shadow-blue-500/10">
              Update Profile details
            </button>
          </form>
        </div>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="glass-panel p-6 rounded-2xl max-w-2xl bg-slate-900/30">
          <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3">Company Metadata</h3>

          <form onSubmit={handleSaveCompany} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400">Organization Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 text-xs glass-input focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400">Corporate Web Endpoint</label>
              <input
                type="text"
                required
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full p-2.5 text-xs glass-input focus:outline-none"
              />
            </div>

            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all shadow shadow-blue-500/10">
              Update Company details
            </button>
          </form>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 bg-slate-900/30">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Integrations Keys Registry</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Integrate database credentials to load active feeds</p>
            </div>
            <button
              onClick={handleGenerateApiKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all"
            >
              Add Token Key <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((k, idx) => {
              const show = showKeys[k.name];
              return (
                <div key={idx} className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-white">{k.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[10px]">
                        {show ? k.key : '••••••••••••••••••••••••'}
                      </span>
                      <button
                        onClick={() => handleToggleKey(k.name)}
                        className="text-slate-400 hover:text-white"
                      >
                        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500">Created: {k.created}</span>
                    <p className={`text-[9px] font-bold mt-1 uppercase ${k.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                      {k.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Config Tab */}
      {activeTab === 'ai' && (
        <div className="glass-panel p-6 rounded-2xl max-w-2xl bg-slate-900/30 space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3">AI Engine Directives</h3>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400">Default Baseline LLM Model</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-900 border border-white/5 rounded-lg text-white focus:outline-none"
              >
                <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Strategic Analysis)</option>
                <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Workflow Execution)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>LLM Temperature Threshold</span>
                <span>{aiTemp}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={aiTemp}
                onChange={(e) => setAiTemp(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-1 rounded-lg"
              />
              <p className="text-[9px] text-slate-500">Lower values prioritize deterministic calculations; higher values increase speculative creativity.</p>
            </div>

            <button
              onClick={handleSaveAISettings}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all"
            >
              Update AI Parameters
            </button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="glass-panel p-6 rounded-2xl max-w-2xl bg-slate-900/30 space-y-5 text-left">
          <div className="flex justify-between items-start border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Billing & Operational Plan</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Enterprise OS package constraints</p>
            </div>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Active Tier
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1">
              <p className="text-slate-500">Active Plan</p>
              <p className="text-sm font-bold text-white">Enterprise OS</p>
              <p className="text-[9px] text-slate-400 mt-1">Next bill: August 1, 2026</p>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1">
              <p className="text-slate-500">Billing frequency</p>
              <p className="text-sm font-bold text-white">$999 / mo (Yearly)</p>
              <p className="text-[9px] text-slate-400 mt-1">Payment method: Visa •••• 4820</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-slate-400 leading-relaxed">
            <Shield className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              Your plan authorizes all 8 specialized AI agents and grants unlimited background workflow executions. Account controls can be configured to manage team permissions.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
