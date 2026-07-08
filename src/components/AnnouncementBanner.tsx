'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, XCircle } from 'lucide-react';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isDismissed = localStorage.getItem('ai-business-os-banner-dismissed');
    if (!isDismissed) {
      // Add a small delay for the fade-in animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('ai-business-os-banner-dismissed', 'true');
  };

  // Prevent hydration mismatch by not rendering anything on the server
  if (!isMounted) return null;
  
  if (!isVisible && !isModalOpen) return null;

  return (
    <>
      {/* Banner */}
      <div 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl transition-all duration-700 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600/95 to-purple-600/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-2 bg-white/10 rounded-xl shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">🚀 AI Business OS – Early Access Preview</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-white/20 text-white rounded-full uppercase shadow-sm">
                  EARLY ACCESS
                </span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed max-w-3xl hidden sm:block">
                Welcome to the early preview of AI Business OS. The platform is fully functional for core business management, including CRM, Inventory, Orders, Finance, Marketing, Operations, Reports, and Notifications. Our first intelligent Finance AI Agent is now live.
              </p>
              <p className="text-sm text-white/90 leading-relaxed max-w-3xl sm:hidden line-clamp-2">
                Welcome to the early preview. The platform is fully functional for core business management.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-brand-blue border border-white/20 text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap backdrop-blur-sm"
            >
              View Roadmap
            </button>
            <button 
              onClick={handleDismiss}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(139,92,246,0.15)] relative transform transition-all duration-300 opacity-100 scale-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/5">
                  <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">AI Business OS Roadmap</h2>
                  <p className="text-gray-400 text-sm mt-1">Explore the current features and future vision.</p>
                </div>
              </div>
              
              <div className="space-y-10">
                {/* Current Release Section */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold text-green-400 mb-5 flex items-center gap-2">
                    Current Release
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-gray-300">
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Authentication</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Dashboard</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> CRM</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Inventory</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Orders</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Finance</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Marketing</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Reports</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Operations</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> Notifications</div>
                    <div className="flex items-center gap-3"><span className="text-xl">✅</span> AI Chat</div>
                    <div className="flex items-center gap-3 text-white font-medium bg-white/5 p-2 -m-2 rounded-lg"><span className="text-xl">✅</span> Finance AI Agent</div>
                  </div>
                </div>

                {/* Coming Soon Section */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-5 flex items-center gap-2">
                    Coming Soon
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-gray-400 text-sm">
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> CEO Agent</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> CRM Agent</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> Inventory Agent</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> Marketing Agent</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> Operations Agent</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> LangChain Tool Calling</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> LangGraph Multi-Agent Orchestration</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> Long-Term Memory</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> Autonomous Workflows</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> Predictive Business Analytics</div>
                    <div className="flex items-center gap-3"><span className="text-xl opacity-70">🚧</span> Voice AI Assistant</div>
                  </div>
                  <div className="mt-6 text-xs text-gray-500 italic">
                    Additional AI Agents, workflow automation, LangGraph orchestration, and advanced autonomous capabilities are currently under active development and will be released in upcoming updates.
                  </div>
                </div>

                {/* Future Vision Section */}
                <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3">
                    Future Vision
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Build a complete autonomous AI Operating System capable of assisting businesses with intelligent decision-making, automation, and strategic planning. Thank you for exploring the future of intelligent business management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
