// Mock Data for AI Business OS

export interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'thinking';
  accuracy: number;
  executionCount: number;
  specialty: string;
  avatar: string;
  model: string;
  description: string;
  prompt: string;
  memoryLogs: string[];
  kpis: { label: string; value: string; change: string; isPositive: boolean }[];
}

export interface Workflow {
  id: string;
  name: string;
  status: string;
  trigger: string;
  steps: number;
  lastRun: string;
  successRate: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  workflow: string;
  event: string;
  level: string;
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  type: string;
  category: string;
  time: string;
  actionRequired: boolean;
  approved?: boolean;
}


export const MOCK_AGENTS: AIAgent[] = [
  {
    id: 'ceo-agent',
    name: 'Executive Mind',
    role: 'CEO Agent',
    status: 'thinking',
    accuracy: 99.4,
    executionCount: 1420,
    specialty: 'Strategic decisions, cross-department synthesis, macro forecasting',
    avatar: '🤖',
    model: 'Gemini 1.5 Pro (Custom tuning)',
    description: 'Synthesizes intelligence across all other specialized agents to provide high-level company guidance, strategic suggestions, and auto-composed executive briefings.',
    prompt: 'You are the primary coordinator of the AI Executive Operating System. Synthesize reports from Finance, Sales, Operations, and Marketing. Prioritize profit optimization and long-term risk mitigations.',
    memoryLogs: [
      '[16:45:02] Analyzed Marketing ROI for Q2 campaigns.',
      '[16:48:15] Synthesizing Sales forecasts with Finance cash reserves.',
      '[16:50:00] Identifying cash-flow optimization opportunity: detected $45,000 idle capital.',
      '[16:51:00] Formulating recommendation: trigger auto-restock for critical inventory levels.'
    ],
    kpis: [
      { label: 'Strategic Alignment', value: '98%', change: '+1.5%', isPositive: true },
      { label: 'Decision Automation Rate', value: '42.5%', change: '+4.2%', isPositive: true },
      { label: 'Anomaly Detection Sensitivity', value: 'High', change: 'Stable', isPositive: true }
    ]
  },
  {
    id: 'finance-agent',
    name: 'Vault Master',
    role: 'Finance Agent',
    status: 'idle',
    accuracy: 99.8,
    executionCount: 4890,
    specialty: 'Capital allocation, burn rate analysis, cash flow prediction, invoice auditing',
    avatar: '🪙',
    model: 'Gemini 1.5 Flash',
    description: 'Tracks bank feeds, automates invoices checking, computes runaways, identifies cost saving pools, and projects cash reserves 12 months ahead.',
    prompt: 'Monitor all transactions and invoices. Flag expenses exceeding department thresholds. Provide daily runway estimations and suggest cash management actions.',
    memoryLogs: [
      '[12:00:10] Executed daily reconciliation of bank feeds.',
      '[13:15:40] Verified invoice #INV-4920 from Acme Supplies.',
      '[15:30:22] Completed tax liability forecasting for next quarter.',
      '[16:30:00] Alert: Cloud infrastructure cost rose 12% above monthly forecast.'
    ],
    kpis: [
      { label: 'Runaway Estimator', value: '22 Months', change: '+2 mos', isPositive: true },
      { label: 'Audit Accuracy', value: '99.98%', change: '0.00%', isPositive: true },
      { label: 'Cost Reduction Identified', value: '$8,400/mo', change: 'New', isPositive: true }
    ]
  },
  {
    id: 'sales-agent',
    name: 'Growth Catalyst',
    role: 'Sales Agent',
    status: 'running',
    accuracy: 97.5,
    executionCount: 8430,
    specialty: 'Lead scoring, funnel optimization, pipeline projections, churn forecasting',
    avatar: '📈',
    model: 'Gemini 1.5 Pro',
    description: 'Monitors the sales funnel in real-time. Predicts deal closing probabilities, scores incoming leads, and provides automated suggestions to win deals.',
    prompt: 'Analyze client CRM records and interactions. Flag high-churn-risk customers. Auto-score incoming enterprise queries.',
    memoryLogs: [
      '[14:10:00] Scored 15 incoming enterprise inquiries (3 high priority).',
      '[14:35:10] Updated pipeline win probability based on demo completions.',
      '[15:55:00] Flagged Customer #C-293 (Tech Corp) as high-churn risk due to drop in usage.',
      '[16:22:18] Generating sales predictions for Q3.'
    ],
    kpis: [
      { label: 'Pipeline Velocity', value: '$120K/wk', change: '+12%', isPositive: true },
      { label: 'Lead Match Accuracy', value: '94.2%', change: '+1.8%', isPositive: true },
      { label: 'Predicted Q3 Close Rate', value: '68%', change: '+3%', isPositive: true }
    ]
  },
  {
    id: 'marketing-agent',
    name: 'Brand Architect',
    role: 'Marketing Agent',
    status: 'idle',
    accuracy: 96.2,
    executionCount: 3210,
    specialty: 'Campaign attribution, social analytics, content scheduling, copy generation',
    avatar: '🎯',
    model: 'Gemini 1.5 Flash',
    description: 'Tracks ROI across ad networks. Automates social postings, scores ad creatives, analyzes audience responses, and generates engaging content outlines.',
    prompt: 'Optimize bidding strategies on active ad sets. Auto-generate weekly marketing reports. Highlight channels with ROI > 3.0.',
    memoryLogs: [
      '[10:00:00] Scheduled LinkedIn & Twitter posts.',
      '[11:30:15] Analyzed Meta Ads performance: ROI for "Launch Campaign" reached 3.4.',
      '[14:45:00] Generated email copy options for summer newsletter.',
      '[16:00:05] Budget reallocation suggestion: Shift $2,000 from low ROI Google AdSet to LinkedIn.'
    ],
    kpis: [
      { label: 'Blended CAC', value: '$45.20', change: '-8.5%', isPositive: true },
      { label: 'Ad Engagement', value: '4.8%', change: '+0.6%', isPositive: true },
      { label: 'Average Campaign ROI', value: '3.1x', change: '+0.3x', isPositive: true }
    ]
  },
  {
    id: 'inventory-agent',
    name: 'Supply Commander',
    role: 'Inventory Agent',
    status: 'idle',
    accuracy: 99.1,
    executionCount: 11040,
    specialty: 'Stock forecasting, supplier ratings, order automation, logistics routing',
    avatar: '📦',
    model: 'Gemini 1.5 Flash',
    description: 'Ensures optimal stock levels, computes order frequencies, scores suppliers based on lead times, and triggers restock orders when safety thresholds are breached.',
    prompt: 'Track warehouse inventory in real-time. Calculate restock levels based on sales velocity. Flag shipping delays.',
    memoryLogs: [
      '[09:10:00] Received warehouse shipment log: 400 units of Model-A added.',
      '[12:30:15] Calculated safety stock for Model-X: Threshold is 50 units.',
      '[15:00:20] LOW STOCK ALERT: Model-B stock dropped to 12 units (safety level: 30).',
      '[15:05:00] Auto-composed Purchase Order draft for 200 units of Model-B.'
    ],
    kpis: [
      { label: 'Inventory Turnover', value: '8.4x', change: '+0.5x', isPositive: true },
      { label: 'Out of Stock Incidents', value: '1', change: '-4', isPositive: true },
      { label: 'Supplier Lead Time', value: '4.2 days', change: '-0.3 days', isPositive: true }
    ]
  },
  {
    id: 'operations-agent',
    name: 'Grid Director',
    role: 'Operations Agent',
    status: 'running',
    accuracy: 98.9,
    executionCount: 15400,
    specialty: 'Process workflows, server load monitoring, ticket routing, system health',
    avatar: '⚙️',
    model: 'Gemini 1.5 Flash',
    description: 'Keeps company infrastructure, systems, and workflow engines running smoothly. Automates tickets assignment and alerts engineers of issues.',
    prompt: 'Monitor all workflow executions and active server clusters. Auto-resolve standard execution faults. Escalation on failure.',
    memoryLogs: [
      '[15:40:00] Monitored 250 active automation runs: all succeeded.',
      '[16:10:00] Scaled web server cluster to 4 instances due to traffic spike.',
      '[16:30:12] Detected execution error in Node-9 (Email Trigger). Attempted auto-retry...',
      '[16:30:15] Auto-retry succeeded. Workflow resumed.'
    ],
    kpis: [
      { label: 'Workflow Success Rate', value: '99.94%', change: '+0.02%', isPositive: true },
      { label: 'Avg Execution Latency', value: '124ms', change: '-12ms', isPositive: true },
      { label: 'System Uptime', value: '99.99%', change: 'Stable', isPositive: true }
    ]
  },
  {
    id: 'analytics-agent',
    name: 'Oracle Mind',
    role: 'Analytics Agent',
    status: 'thinking',
    accuracy: 98.6,
    executionCount: 5120,
    specialty: 'Anomaly detection, seasonal pattern matching, statistical projections',
    avatar: '📊',
    model: 'Gemini 1.5 Pro',
    description: 'Uncovers deep business insights, builds predictive heatmaps, correlates events (e.g., ad spends to support tickets), and discovers trend changes early.',
    prompt: 'Search for anomalies in historical database. Highlight correlations. Generate weekly mathematical forecasts.',
    memoryLogs: [
      '[13:00:00] Scanned database for sales anomalies. None found.',
      '[14:45:00] Found positive correlation (r=0.82) between email marketing campaigns and organic search spikes.',
      '[16:00:00] Running multivariate regression for Q4 sales projections.',
      '[16:48:00] Processing seasonal sales coefficients.'
    ],
    kpis: [
      { label: 'Insights Generated', value: '45/mo', change: '+12', isPositive: true },
      { label: 'Forecasting R-Squared', value: '0.94', change: '+0.02', isPositive: true },
      { label: 'Correlation Detectors', value: '16 Active', change: 'Stable', isPositive: true }
    ]
  },
  {
    id: 'hr-agent',
    name: 'People Sync',
    role: 'HR Agent',
    status: 'idle',
    accuracy: 98.1,
    executionCount: 2130,
    specialty: 'Candidate screening, policy Q&A, onboarding tracks, team sentiment index',
    avatar: '👥',
    model: 'Gemini 1.5 Flash',
    description: 'Speeds up hiring by matching resume parameters, answers staff handbook queries, schedules reviews, and calculates aggregated team sentiment metrics.',
    prompt: 'Process incoming applicant resumes. Answer employees policy questions based on company handbook document. Monitor training milestones.',
    memoryLogs: [
      '[09:00:00] Screened 24 engineering applicants: matched 4 candidates.',
      '[11:00:12] Answered staff query regarding maternity leave policies.',
      '[14:00:00] Calculated monthly sentiment score (aggregated anonymized check-ins): 8.4/10.',
      '[15:30:10] Sent reminder to Engineering managers: Q3 review window is opening.'
    ],
    kpis: [
      { label: 'Time to Screen Resume', value: '1.2 mins', change: '-4 mins', isPositive: true },
      { label: 'Employee Inquiry SLA', value: '<30 secs', change: 'Stable', isPositive: true },
      { label: 'Team Sentiment Score', value: '8.4/10', change: '+0.2', isPositive: true }
    ]
  }
];

export const MOCK_DASHBOARD_STATS = {
  summary: 'AI Operating System is running optimally. The Finance Agent detected $45,000 in idle cash suitable for short-term yield accounts. Inventory Agent flagged critical stock level on Model-B in Warehouse A, and drafted a Purchase Order. Sales velocity remains strong at $120,000/week. We recommend executing the automated restock and re-allocating $2,000 in underperforming Google Ads.',
  kpis: [
    { label: 'Monthly Revenue', value: '$482,900', change: '+14.2%', isPositive: true, subtext: 'vs last month', chartData: [410, 425, 438, 442, 460, 482] },
    { label: 'Net Profit Margin', value: '28.4%', change: '+2.1%', isPositive: true, subtext: 'vs last month', chartData: [26.0, 26.5, 27.2, 27.0, 28.0, 28.4] },
    { label: 'Active Workflows', value: '45 Active', change: '+12.5%', isPositive: true, subtext: 'with 99.9% uptime', chartData: [32, 35, 38, 40, 42, 45] },
    { label: 'Completed Orders', value: '3,842', change: '+8.3%', isPositive: true, subtext: 'this billing cycle', chartData: [3100, 3250, 3400, 3520, 3700, 3842] }
  ]
};

export const MOCK_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    title: 'Automate Low-Stock Restocking',
    agent: 'Inventory Agent',
    description: 'Model-B stock is at 12 units (minimum safety level: 30). Supplier lead time is 4.2 days. Auto-order 200 units from Supplier TechParts to prevent order fulfillment delays.',
    urgency: 'high',
    actionLabel: 'Approve Purchase Order',
    category: 'Inventory',
    impact: 'Avoids $8,500 in potential lost revenue',
    approved: false
  },
  {
    id: 'rec-2',
    title: 'Reallocate Meta & Google Ad Budgets',
    agent: 'Marketing Agent',
    description: 'AdSet "Summer Promotion" on Meta is yielding a 3.4x ROI, while "Google Search Intent" yields 1.2x. Shift $2,000 monthly budget to Meta immediately.',
    urgency: 'medium',
    actionLabel: 'Reallocate Budget',
    category: 'Marketing',
    impact: 'Increases projected leads by 22%',
    approved: false
  },
  {
    id: 'rec-3',
    title: 'Invest Excess Capital in Yield Account',
    agent: 'Finance Agent',
    description: 'Identified $45,000 cash balance sitting idle in checking account. Move into treasury-backed liquid yield account yielding 5.1% APY.',
    urgency: 'low',
    actionLabel: 'Transfer Capital',
    category: 'Finance',
    impact: 'Generates $2,295 additional annual yield',
    approved: false
  }
];

export const MOCK_ACTIVITIES = [
  { id: 'act-1', text: 'Finance Agent verified invoice #INV-4920 from Acme Supplies.', time: '15 mins ago', type: 'finance' },
  { id: 'act-2', text: 'Operations Agent auto-scaled server cluster due to load spike.', time: '30 mins ago', type: 'operations' },
  { id: 'act-3', text: 'Sales Agent scored lead "Enterprise TechCorp" as High Fit (95/100).', time: '1 hour ago', type: 'sales' },
  { id: 'act-4', text: 'Marketing Agent posted weekly product highlight to LinkedIn.', time: '2 hours ago', type: 'marketing' },
  { id: 'act-5', text: 'CEO Agent completed daily company performance synthesis.', time: '3 hours ago', type: 'ceo' }
];

export const MOCK_UPCOMING_TASKS = [
  { id: 'task-1', text: 'Q3 Tax Liabilities review with Finance Agent', date: 'Jul 5, 2026', priority: 'high' },
  { id: 'task-2', text: 'Supplier contract renewal approval', date: 'Jul 7, 2026', priority: 'medium' },
  { id: 'task-3', text: 'Social campaign copy review', date: 'Jul 10, 2026', priority: 'low' }
];

export const MOCK_CHAT_HISTORY: ChatThread[] = [
  {
    id: 'c-1',
    title: 'Q2 Cash Flow Review',
    messages: [
      { sender: 'user', text: 'Can you show me our cash flow breakdown for last quarter?' },
      { sender: 'agent', text: 'Certainly. In Q2, our total cash inflow was **$1,320,000**, with cash outflow at **$945,000**, leaving a net cash increase of **$375,000**.\n\nHere is the major cost breakdown:\n- **Operations & Server Costs**: $340,000\n- **Payroll**: $420,000\n- **Marketing Ads**: $185,000\n\nOur cash runway currently sits at **22 months** under our baseline burn rate.' }
    ]
  },
  {
    id: 'c-2',
    title: 'Model-B Inventory Restock',
    messages: [
      { sender: 'user', text: 'Why was Model-B stock low?' },
      { sender: 'agent', text: 'Inventory Agent reports a **32% spike** in Model-B orders during the mid-month promotional campaign. Safety stock levels of 30 units were breached on July 3rd. I have prepared a Purchase Order draft for 200 units to restore stock levels to 212.' }
    ]
  }
];

export const SUGGESTED_QUESTIONS = [
  'How is our cash flow forecasting for Q3?',
  'Which marketing campaign has the highest ROI?',
  'Show me low stock items and draft restocks.',
  'What are the critical system warnings today?'
];

// Finance Specifics
export const MOCK_FINANCE_CASHFLOW = [
  { month: 'Jan', revenue: 320000, expenses: 240000, cash: 1500000 },
  { month: 'Feb', revenue: 350000, expenses: 245000, cash: 1605000 },
  { month: 'Mar', revenue: 380000, expenses: 260000, cash: 1725000 },
  { month: 'Apr', revenue: 410000, expenses: 280000, cash: 1855000 },
  { month: 'May', revenue: 440000, expenses: 310000, cash: 1985000 },
  { month: 'Jun', revenue: 482900, expenses: 320000, cash: 2147900 }
];

export const MOCK_FINANCE_EXPENSES = [
  { name: 'Payroll & HR', value: 160000, color: '#3B82F6' },
  { name: 'Cloud Infrastructure', value: 75000, color: '#8B5CF6' },
  { name: 'Ad Spend', value: 50000, color: '#22C55E' },
  { name: 'SaaS Software Licenses', value: 20000, color: '#F59E0B' },
  { name: 'Office & Travel', value: 15000, color: '#EF4444' }
];

export const MOCK_INVOICES = [
  { id: 'INV-4920', client: 'Acme Supplies', date: 'Jul 4, 2026', amount: '$12,400', status: 'pending', agentVerified: true },
  { id: 'INV-4919', client: 'Alpha Corp', date: 'Jul 2, 2026', amount: '$45,000', status: 'paid', agentVerified: true },
  { id: 'INV-4918', client: 'Beta Logistics', date: 'Jun 28, 2026', amount: '$8,120', status: 'paid', agentVerified: true },
  { id: 'INV-4917', client: 'TechCorp SA', date: 'Jun 24, 2026', amount: '$18,900', status: 'overdue', agentVerified: false }
];

// Sales Specifics
export const MOCK_SALES_FUNNEL = [
  { stage: 'Leads', value: 12000, fill: '#3B82F6' },
  { stage: 'MQLs', value: 5400, fill: '#60A5FA' },
  { stage: 'SQLs', value: 2200, fill: '#8B5CF6' },
  { stage: 'Demo Scheduled', value: 850, fill: '#A78BFA' },
  { stage: 'Proposal Sent', value: 420, fill: '#F59E0B' },
  { stage: 'Deals Won', value: 180, fill: '#22C55E' }
];

export const MOCK_SALES_TREND = [
  { name: 'Wk 1', baseline: 90000, forecast: 95000, actual: 110000 },
  { name: 'Wk 2', baseline: 95000, forecast: 100000, actual: 105000 },
  { name: 'Wk 3', baseline: 100000, forecast: 115000, actual: 120000 },
  { name: 'Wk 4', baseline: 110000, forecast: 120000, actual: 122000 }
];

export const MOCK_TOP_CUSTOMERS = [
  { name: 'Nova Technology', volume: '$182,000', sales: 48, status: 'Active' },
  { name: 'Apex Retail', volume: '$120,500', sales: 32, status: 'Active' },
  { name: 'Global Tech SA', volume: '$98,000', sales: 19, status: 'Active' },
  { name: 'Omni Retail Ltd', volume: '$76,400', sales: 12, status: 'At Risk' }
];

// Inventory Specifics
export const MOCK_INVENTORY_ITEMS = [
  { id: 'P-101', name: 'Model-A Terminal Unit', sku: 'TERM-MDLA-01', stock: 450, safetyLevel: 100, status: 'Healthy', supplier: 'TechParts Corp' },
  { id: 'P-102', name: 'Model-B Sensor Assembly', sku: 'SENS-MDLB-09', stock: 12, safetyLevel: 30, status: 'Low Stock', supplier: 'TechParts Corp' },
  { id: 'P-103', name: 'Model-C Glass Housing', sku: 'GLAS-MDLC-12', stock: 89, safetyLevel: 50, status: 'Healthy', supplier: 'Global Optics' },
  { id: 'P-104', name: 'Model-X Processing Node', sku: 'PROC-MDLX-99', stock: 145, safetyLevel: 50, status: 'Healthy', supplier: 'NodeMatrix LLC' },
  { id: 'P-105', name: 'Model-Y Power Adaptor', sku: 'POWR-MDLY-33', stock: 4, safetyLevel: 20, status: 'Critical', supplier: 'PowerLine Ltd' }
];

export const MOCK_PURCHASE_ORDERS = [
  { id: 'PO-9021', item: 'Model-B Sensor Assembly', qty: 200, cost: '$4,200', supplier: 'TechParts Corp', date: 'Jul 4, 2026', status: 'Drafting (AI)' },
  { id: 'PO-9020', item: 'Model-A Terminal Unit', qty: 500, cost: '$15,000', supplier: 'TechParts Corp', date: 'Jun 28, 2026', status: 'In Transit' },
  { id: 'PO-9019', item: 'Model-X Processing Node', qty: 100, cost: '$12,500', supplier: 'NodeMatrix LLC', date: 'Jun 15, 2026', status: 'Delivered' }
];

// Marketing Specifics
export const MOCK_CAMPAIGN_PERFORMANCE = [
  { name: 'LinkedIn Enterprise', spent: 12000, revenue: 42000, roi: 3.5, channel: 'LinkedIn' },
  { name: 'Google Intent Search', spent: 15000, revenue: 18000, roi: 1.2, channel: 'Google' },
  { name: 'Meta Lookalike Conversions', spent: 8000, revenue: 27200, roi: 3.4, channel: 'Meta' },
  { name: 'Dev Newsletter Sponsorship', spent: 3000, revenue: 10500, roi: 3.5, channel: 'Newsletter' },
  { name: 'Twitter Developer Ads', spent: 5000, revenue: 4000, roi: 0.8, channel: 'Twitter' }
];

export const MOCK_EMAIL_ANALYTICS = [
  { campaign: 'Product Launch Update', sent: 24500, openRate: '42.8%', clickRate: '12.4%', conversions: 310 },
  { campaign: 'Monthly Developer Digest', sent: 23200, openRate: '38.5%', clickRate: '8.2%', conversions: 145 },
  { campaign: 'CEO Agent Spotlight', sent: 25100, openRate: '51.2%', clickRate: '16.9%', conversions: 489 }
];

// Operations Specifics
export const MOCK_SERVER_NODES = [
  { id: 'N-1', name: 'Primary Cognitive Engine', location: 'us-east-1', cpu: 62, memory: 78, status: 'healthy', load: 88 },
  { id: 'N-2', name: 'Analytical Query Node', location: 'us-west-2', cpu: 34, memory: 45, status: 'healthy', load: 40 },
  { id: 'N-3', name: 'Task Automation Worker', location: 'eu-central-1', cpu: 12, memory: 31, status: 'healthy', load: 15 },
  { id: 'N-4', name: 'Scoring Inference Cluster', location: 'ap-northeast-1', cpu: 89, memory: 91, status: 'warning', load: 95 }
];

export const MOCK_OPERATIONS_TIMELINE = [
  { time: '16:51:00', title: 'Task Automated', desc: 'Auto-composed PO-9021 for low stock Model-B', status: 'success' },
  { time: '16:48:00', title: 'Data Ingestion', desc: 'Reconciled 145 new CRM records', status: 'success' },
  { time: '16:30:12', title: 'Workflow Executed', desc: 'Node-9 (Email Trigger) failed on SMTP connection, retrying...', status: 'warning' },
  { time: '16:30:15', title: 'Auto-Correction', desc: 'Node-9 recovered and succeeded on second attempt', status: 'success' }
];

// Automation Specifics
export const MOCK_WORKFLOWS = [
  { id: 'wf-1', name: 'Critical Inventory Restocking Trigger', status: 'Active', trigger: 'Stock drops below safety limit', steps: 3, lastRun: '15 mins ago', successRate: '100%' },
  { id: 'wf-2', name: 'High-Value Lead Enrichment & Alert', status: 'Active', trigger: 'New CRM contact signed up', steps: 4, lastRun: '45 mins ago', successRate: '98.5%' },
  { id: 'wf-3', name: 'Invoice Automatic Reconciliation Feed', status: 'Active', trigger: 'Daily bank feed received', steps: 3, lastRun: '4 hours ago', successRate: '100%' },
  { id: 'wf-4', name: 'Customer Churn Alert Escalation', status: 'Paused', trigger: 'Activity drops by 40%', steps: 5, lastRun: '2 days ago', successRate: '94.2%' }
];

export const MOCK_AUTOMATION_LOGS = [
  { id: 'L-101', timestamp: '16:51:02', workflow: 'Inventory Restocking', event: 'Calculated Model-B stock level (12). Trigger threshold is 30.', level: 'info' },
  { id: 'L-102', timestamp: '16:51:03', workflow: 'Inventory Restocking', event: 'Drafted PO-9021 for 200 units with TechParts Corp. Saved to draft state.', level: 'success' },
  { id: 'L-103', timestamp: '16:45:12', workflow: 'Lead Enrichment', event: 'Fetched firmographic details for techcorp.com. Score: 95/100.', level: 'info' },
  { id: 'L-104', timestamp: '16:45:15', workflow: 'Lead Enrichment', event: 'Sent Slack notification to Sales team (#enterprise-leads).', level: 'success' },
  { id: 'L-105', timestamp: '16:30:12', workflow: 'Invoice Reconciliation', event: 'SMTP connection timed out while sending reconciliation report. Retrying in 3s...', level: 'warning' }
];

// Settings Defaults
export const DEFAULT_SETTINGS = {
  profile: { name: 'Tholkappiyan S', email: 'tholkappiyan@company.com', role: 'Chief Executive Officer', avatar: '👨‍💼' },
  company: { name: 'AI Business OS Technologies', website: 'https://aibusinessos.com', size: '50-100 employees', industry: 'Artificial Intelligence & SaaS' },
  apiKeys: [
    { name: 'Gemini Pro API Engine Key', key: 'AIzaSyA8b...920xX', created: 'June 1, 2026', status: 'Active' },
    { name: 'Stripe Accounting Integration Key', key: 'rk_live_51M...849sS', created: 'June 5, 2026', status: 'Active' },
    { name: 'Hubspot Contacts Syncer Key', key: 'pat-na2-d8...028uW', created: 'June 10, 2026', status: 'Revoked' }
  ],
  aiSettings: { defaultModel: 'Gemini 1.5 Pro', temperature: 0.25, autoExecuteHighUrgency: false, cognitiveLimit: 95 }
};
