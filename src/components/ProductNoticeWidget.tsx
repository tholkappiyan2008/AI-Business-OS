'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ChevronRight, ChevronUp, ChevronDown, Info } from 'lucide-react';

export default function ProductNoticeWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isDismissed = localStorage.getItem('ai-business-os-widget-dismissed');
    if (!isDismissed) {
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('ai-business-os-widget-dismissed', 'true');
  };

  if (!isMounted) return null;
  if (!isVisible && !isModalOpen) return null;

  return (
    <>
      {/* Floating Widget */}
      <div 
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[90] w-full max-w-[340px] sm:max-w-[380px] transition-all duration-700 ease-out transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative rounded-2xl bg-[#0B0F19]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-transparent" style={{ backgroundClip: 'padding-box' }}>
          {/* Gradient Border Hack */}
          <div className="absolute inset-0 rounded-2xl -z-10 bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-blue-500/10 m-[-1px]"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02] rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">🚀 AI Business OS</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold tracking-wider bg-white/10 text-white/90 px-1.5 py-0.5 rounded text-xs">v0.1</span>
                  <span className="text-[10px] text-purple-400 font-medium">Early Access</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={handleDismiss} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'max-h-0' : 'max-h-[70vh] overflow-y-auto'}`}>
            <div className="p-5 space-y-5">
              <p className="text-xs text-gray-300 leading-relaxed">
                Welcome to AI Business OS Version 0.1. This release includes the complete business management platform with:
              </p>
              
              {/* Important Notice */}
              <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl p-3 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-blue-400 mb-2">
                  <Info className="w-3.5 h-3.5" />
                  Important Notice
                </h4>
                <div className="space-y-1.5 text-[11px] text-gray-300 leading-relaxed">
                  <p>• Please log in using your registered email address.</p>
                  <p>• If you experience any issues while using AI Business OS, please contact our support team.</p>
                  <div className="pt-1 flex items-center gap-1">
                    <span className="text-gray-400">Support Email:</span>
                    <a href="mailto:nxtgen811@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1">
                      📧 nxtgen811@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Authentication</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Dashboard</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> CRM</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Inventory</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Orders</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Order Items</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Finance</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Marketing</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Reports</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Operations</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> Notifications</div>
                <div className="flex items-center gap-1.5"><span className="text-green-400 text-[10px]">✅</span> AI Business Chat</div>
                <div className="flex items-center gap-1.5 text-white bg-white/5 rounded px-1 -mx-1"><span className="text-green-400 text-[10px]">✅</span> Finance AI Agent (Live)</div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
                This version demonstrates the core architecture of AI Business OS and its AI-powered financial analysis capabilities.
              </p>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

              <div>
                <h4 className="text-xs font-bold text-purple-400 mb-3 flex items-center justify-between">
                  <span>Coming Soon</span>
                  <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">v0.2</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> CEO Agent</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> CRM Agent</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> Inventory Agent</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> Marketing Agent</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> Operations Agent</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> LangChain Integration</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> LangGraph Multi-Agent</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> AI Memory</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> Tool Calling</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> Autonomous Workflows</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> Predictive Analytics</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-60">🚧</span> Voice Assistant</div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-[10px] text-gray-400 leading-relaxed">
                <span className="text-blue-400 font-semibold">Note:</span> AI Business OS is under active development. Version 0.2 will introduce multiple specialized AI Agents and advanced business automation.
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 pt-0 flex gap-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-white hover:bg-gray-100 text-brand-bg text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                View Roadmap
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleDismiss}
                className="flex-[0.4] bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium py-2.5 rounded-xl transition-colors border border-white/5"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(59,130,246,0.15)] relative transform transition-all duration-300 opacity-100 scale-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">AI Business OS Development Roadmap</h2>
              
              <div className="relative border-l border-white/10 pl-6 ml-3 space-y-10 py-2">
                {/* V0.1 */}
                <div className="relative">
                  <div className="absolute -left-[35px] bg-green-500/20 w-5 h-5 rounded-full flex items-center justify-center border border-green-500/50">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-4">Version 0.1</h3>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                      <div className="flex items-center gap-2"><span className="text-green-400">✅</span> Core SaaS Platform</div>
                      <div className="flex items-center gap-2"><span className="text-green-400">✅</span> Finance AI Agent</div>
                    </div>
                  </div>
                </div>

                {/* V0.2 */}
                <div className="relative">
                  <div className="absolute -left-[35px] bg-blue-500/20 w-5 h-5 rounded-full flex items-center justify-center border border-blue-500/50">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-4">Version 0.2</h3>
                  <div className="bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-blue-500/20 rounded-xl p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-2"><span>🚧</span> Multi-Agent AI System</div>
                      <div className="flex items-center gap-2"><span>🚧</span> CEO Agent</div>
                      <div className="flex items-center gap-2"><span>🚧</span> CRM Agent</div>
                      <div className="flex items-center gap-2"><span>🚧</span> Inventory Agent</div>
                      <div className="flex items-center gap-2"><span>🚧</span> Marketing Agent</div>
                      <div className="flex items-center gap-2"><span>🚧</span> Operations Agent</div>
                      <div className="flex items-center gap-2"><span>🚧</span> LangChain</div>
                      <div className="flex items-center gap-2"><span>🚧</span> LangGraph</div>
                      <div className="flex items-center gap-2"><span>🚧</span> AI Memory</div>
                      <div className="flex items-center gap-2"><span>🚧</span> Tool Calling</div>
                      <div className="flex items-center gap-2"><span>🚧</span> Workflow Automation</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Future Vision */}
              <div className="mt-10 p-5 bg-white/5 rounded-xl border border-white/5 text-center">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Future Vision</h3>
                <p className="text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
                  Autonomous AI Business Operating System capable of managing, analyzing, and assisting businesses using specialized AI Agents.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
