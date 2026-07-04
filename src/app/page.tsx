"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Zap,
  Shield,
  TrendingUp,
  MessageSquare,
  Check,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: Cpu,
    title: "Specialized AI Agents",
    desc: "Deploy autonomous agents trained in finance, inventory logistics, sales pipelines, marketing attribution, and HR policies."
  },
  {
    icon: Zap,
    title: "Actionable Workflows",
    desc: "Define rule-based triggers and let AI verify data, auto-draft purchase orders, shift ad-budgets, and alert engineers."
  },
  {
    icon: TrendingUp,
    title: "Executive Foresight",
    desc: "Go beyond standard dashboards. Get mathematical forecast modeling, anomaly alerts, and capital optimization recommendations."
  }
];

const AGENT_SHOWCASE = [
  { role: "CEO Agent", desc: "Synthesizes intelligence across departments into auto-composed executive briefings.", icon: "🤖" },
  { role: "Finance Agent", desc: "Projects cash flows, manages runaways, audits invoices, and spots idle capital.", icon: "🪙" },
  { role: "Sales Agent", desc: "Predicts deal closing, ranks high-churn risks, and scores incoming business queries.", icon: "📈" },
  { role: "Inventory Agent", desc: "Monitors warehouse safety levels, scores lead times, and triggers restock orders.", icon: "📦" }
];

const FAQS = [
  { q: "Is AI Business OS a CRM or ERP?", a: "No. CRM and ERP systems store records. AI Business OS sits on top of your databases to analyze patterns, make decisions, execute workflows, and report like a seasoned executive." },
  { q: "How secure is my company data?", a: "Data security is our primary focus. All data ingestion pipelines use end-to-end encryption. You choose which operations AI agents can execute autonomously versus which require manual approval." },
  { q: "Can I customize agent prompts?", a: "Yes. Every agent features a tunable parameters pane and cognitive limit controls inside the Settings page to align them with your company policies." },
  { q: "Do you support custom API integrations?", a: "Absolutely. You can plug in custom API credentials for Stripe, Hubspot, Shopify, Slack, and your cloud infrastructure provider." }
];

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Growth",
      price: billingPeriod === 'monthly' ? "$499" : "$399",
      desc: "For startups looking to automate operations.",
      features: [
        "4 Specialized AI Agents (Finance, Sales, Inventory, CEO)",
        "10 Active Automation Workflows",
        "Standard Core integrations (Stripe, HubSpot)",
        "98% Recommendation Accuracy SLA",
        "Email Support"
      ],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Enterprise OS",
      price: billingPeriod === 'monthly' ? "$1,299" : "$999",
      desc: "Full autonomy for scaling mid-market enterprises.",
      features: [
        "All 8 Specialized AI Agents",
        "Unlimited Automation Workflows",
        "Custom Database & Webhook Integrations",
        "Dedicated Tunable Prompt Settings",
        "99.5% Recommendation Accuracy SLA",
        "Slack & Dedicated Support Manager"
      ],
      cta: "Deploy Enterprise",
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6] relative overflow-hidden bg-grid-pattern">
      {/* Decorative Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-semibold text-sm tracking-wider uppercase text-white">
            AI Business OS
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#agents" className="hover:text-white transition-colors">AI Agents</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="glow-btn px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all flex items-center gap-1.5"
          >
            Deploy OS <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>The Next Frontier of Corporate Operations</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6"
        >
          The Autonomous Operating System for Modern Enterprise
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Synthesize intelligence, verify financial records, automate supply ordering, optimize marketing campaigns, and execute executive-level decisions with a network of specialized AI agents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/login"
            className="glow-btn w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            Initialize Platform <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all font-medium text-sm flex items-center justify-center"
          >
            Explore Capabilities
          </a>
        </motion.div>

        {/* Dashboard Mockup Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full relative rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl p-2 bg-slate-900/20"
        >
          <div className="rounded-xl border border-white/5 overflow-hidden relative aspect-[16/9] bg-[#0E1321] flex flex-col">
            {/* Mock Dashboard Layout */}
            <div className="h-10 border-b border-white/5 bg-slate-950/60 flex items-center px-4 justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[10px] text-slate-500 bg-white/5 rounded px-6 py-1 font-mono">
                aibusinessos.com/dashboard
              </div>
              <div className="w-10" />
            </div>

            <div className="flex-1 flex overflow-hidden text-left">
              {/* Mock Sidebar */}
              <div className="w-36 border-r border-white/5 p-3 space-y-2 bg-slate-950/40 hidden sm:block">
                <div className="h-4 bg-blue-500/20 rounded w-16" />
                <div className="space-y-1.5 pt-4">
                  <div className="h-3 bg-white/5 rounded w-20" />
                  <div className="h-3 bg-white/5 rounded w-16" />
                  <div className="h-3 bg-white/10 rounded w-24 border-l border-blue-500" />
                  <div className="h-3 bg-white/5 rounded w-18" />
                  <div className="h-3 bg-white/5 rounded w-22" />
                </div>
              </div>
              {/* Mock Core Body */}
              <div className="flex-1 p-4 space-y-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 bg-white/15 rounded w-32" />
                    <div className="h-2 bg-white/5 rounded w-48" />
                  </div>
                  <div className="h-6 bg-blue-500/20 border border-blue-500/30 rounded px-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <div className="text-[8px] font-mono text-blue-400">AGENTS SYNCED</div>
                  </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card p-3 space-y-2 rounded-xl bg-slate-900/50">
                      <div className="h-2.5 bg-white/10 rounded w-12" />
                      <div className="h-5 bg-white/20 rounded w-16" />
                      <div className="h-1.5 bg-green-500/20 rounded w-8" />
                    </div>
                  ))}
                </div>

                {/* Big panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 glass-panel p-4 rounded-xl space-y-3 bg-slate-900/30">
                    <div className="h-3.5 bg-white/15 rounded w-28" />
                    <div className="space-y-1.5">
                      <div className="h-2 bg-white/10 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-11/12" />
                      <div className="h-2 bg-white/10 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl space-y-3 bg-slate-900/30">
                    <div className="h-3.5 bg-white/15 rounded w-20" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-2 bg-white/10 rounded w-12" />
                        <div className="h-3 bg-green-500/30 rounded w-8" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-2 bg-white/10 rounded w-16" />
                        <div className="h-3 bg-blue-500/30 rounded w-10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Built for High-Velocity Growth Teams
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to automate corporate analysis, logistics cycles, and financial management in one console.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl bg-slate-900/30 text-left border border-white/5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* AI Agents Showcase Section */}
      <section id="agents" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Meet the Executive Squad
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Each agent has specialized memory, capabilities, and customized model directives.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AGENT_SHOWCASE.map((agent, i) => (
            <motion.div
              key={i}
              className="glass-card p-5 rounded-2xl bg-slate-900/20 text-left relative flex flex-col justify-between"
              whileHover={{ scale: 1.02 }}
            >
              <div className="space-y-3">
                <div className="text-3xl">{agent.icon}</div>
                <h3 className="text-base font-semibold text-white">{agent.role}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Active</span>
                <span className="text-[10px] text-slate-500">Gemini 1.5 Tuning</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Choose the operational bandwidth suitable for your organization.
          </p>

          {/* Toggle button */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 mt-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                billingPeriod === 'yearly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly (20% Off)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`glass-panel p-8 rounded-2xl text-left flex flex-col justify-between relative ${
                plan.highlight ? 'border-blue-500/50 bg-slate-900/40 shadow-blue-500/5' : 'bg-slate-900/20'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-[10px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-400">/ month</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-white/5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/login"
                  className={`w-full block text-center py-3 rounded-xl font-medium text-xs transition-all ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Understand how our autonomous agents work to elevate company visibility.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-xl overflow-hidden bg-slate-900/20 border border-white/5 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 border-t border-white/5">
                    <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-white/5 border border-white/10">
            <Sparkles className="w-3 h-3 text-blue-400" />
          </div>
          <span className="font-semibold text-[10px] tracking-wider uppercase text-white">
            AI Business OS
          </span>
        </div>

        <p>&copy; 2026 AI Business OS Inc. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
