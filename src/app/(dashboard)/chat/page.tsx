"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { SUGGESTED_QUESTIONS } from '@/data/mockData';
import {
  Send,
  Plus,
  Paperclip,
  Mic,
  Copy,
  Check,
  Bot,
  MessageSquare,
  ChevronRight,
  FileText,
  X,
  RefreshCcw
} from 'lucide-react';

export default function AIChatPage() {
  const {
    chatThreads,
    activeThreadId,
    setActiveThreadId,
    sendChatMessage,
    createNewChat
  } = useClientStore();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = chatThreads.find(t => t.id === activeThreadId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() && !attachedFile) return;

    let messageText = input;
    if (attachedFile) {
      messageText = `[Uploaded File: ${attachedFile}] ${input}`;
    }

    sendChatMessage(messageText);
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    // Turn off typing indicator after a short delay (matches response delay in store)
    setTimeout(() => {
      setIsTyping(false);
    }, 1100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
    
    // Automatically send the suggestion when clicked
    setTimeout(() => {
      sendChatMessage(question);
      setInput('');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1100);
    }, 100);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Helper to render markdown-like formatting in messages
  const renderMessageText = (text: string) => {
    // Regex parsing for code blocks and basic markdown
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.substring(3, part.length - 3).replace(/^\w+\n/, ''); // remove language identifier if present
        return (
          <pre key={idx} className="my-2 p-3 rounded-lg bg-slate-900 overflow-x-auto text-slate-300 font-mono text-[11px] border border-white/10">
            <code>{codeContent.trim()}</code>
          </pre>
        );
      }

      // regular text
      const lines = part.split('\n');
      return (
        <div key={idx}>
          {lines.map((line, lIdx) => {
            if (line.trim() === '') return <br key={lIdx} />;
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return (
                <li key={lIdx} className="ml-4 list-disc text-slate-300 my-1">
                  {parseBoldText(line.substring(2))}
                </li>
              );
            }
            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="text-sm font-bold text-white mt-3 mb-1">
                  {line.substring(4)}
                </h4>
              );
            }
            return (
              <p key={lIdx} className="my-1 text-slate-300 leading-relaxed">
                {parseBoldText(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-white font-bold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex border border-white/5 rounded-2xl overflow-hidden glass-panel bg-slate-950/40">
      {/* 1. Chat Threads Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col bg-slate-950/60 hidden md:flex">
        <div className="p-4 border-b border-white/5">
          <button
            onClick={() => createNewChat('')}
            className="w-full py-2 px-4 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-600/20 text-xs font-semibold text-blue-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Business Strategy
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                  isActive ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{thread.title}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Chat Panel */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/10 relative">
        {/* Chat Header */}
        <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-slate-950/20">
          <div className="flex items-center gap-2">
            <Bot className="w-4.5 h-4.5 text-blue-400" />
            <span className="text-xs font-bold text-white">{activeThread?.title || 'AI Business OS'}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Cognitive Pipeline Sync: 100%</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeThread?.messages.map((msg, idx) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={idx}
                className={`flex gap-4 max-w-3xl ${isAgent ? '' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs ${
                  isAgent
                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                    : 'bg-purple-600/10 border-purple-500/20 text-purple-400'
                }`}>
                  {isAgent ? <Bot className="w-4 h-4" /> : 'ME'}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl text-xs space-y-2 border shadow-sm flex-1 ${
                  isAgent
                    ? 'bg-slate-900/35 border-white/5'
                    : 'bg-purple-950/10 border-purple-500/15'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[10px] text-slate-400">
                        {isAgent ? 'AI Business OS Assistant' : 'CEO'}
                      </span>
                      {msg.timestamp && (
                        <span className="text-[9px] text-slate-500 font-medium">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                    {isAgent && (
                      <button
                        onClick={() => handleCopyText(msg.text, idx)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        {copiedId === idx ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <div className={msg.isError ? 'text-red-400' : ''}>{renderMessageText(msg.text)}</div>
                  {msg.isError && !isAgent && (
                    <button 
                      onClick={() => sendChatMessage(msg.text)}
                      className="mt-2 flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded transition-colors"
                    >
                      <RefreshCcw className="w-3 h-3" /> Retry Message
                    </button>
                  )}
                  {msg.isError && isAgent && (
                    <button 
                      onClick={() => {
                        // Find the previous user message to retry
                        const prevUserMsg = activeThread?.messages[idx - 1];
                        if (prevUserMsg && prevUserMsg.sender === 'user') {
                          sendChatMessage(prevUserMsg.text);
                        }
                      }}
                      className="mt-2 flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded transition-colors"
                    >
                      <RefreshCcw className="w-3 h-3" /> Retry Message
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Animation */}
          {isTyping && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-blue-600/10 border-blue-500/20 text-blue-400 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/35 border border-white/5 flex items-center justify-center gap-1.5 w-20">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action Panel Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30 space-y-3">
          {/* Suggestion Chips */}
          {activeThread?.messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {SUGGESTED_QUESTIONS.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestionClick(question)}
                  className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-all duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Attached file indicator */}
          {attachedFile && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400">
              <FileText className="w-3.5 h-3.5" />
              <span>{attachedFile}</span>
              <button onClick={() => setAttachedFile(null)} className="hover:text-white ml-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input field */}
          <div className="flex items-center gap-3">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttach}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Main Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask your AI Operating System to analyze records..."
                rows={1}
                className="w-full pl-4 pr-10 py-2.5 text-xs glass-input focus:outline-none resize-none overflow-y-hidden"
              />
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-400 hover:text-white transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
              >
                <Mic className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center transition-all shadow-md shadow-blue-500/10"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
