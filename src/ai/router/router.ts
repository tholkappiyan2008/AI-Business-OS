import { runFinanceAgent } from '../agents/finance.agent';

type AgentHandler = (message: string) => Promise<string>;

interface AgentConfig {
  name: string;
  keywords: string[];
  handler: AgentHandler;
}

const registeredAgents: AgentConfig[] = [
  {
    name: 'Finance',
    keywords: [
      'profit', 'revenue', 'expense', 'expenses', 'cash', 'cash flow', 'income', 
      'loss', 'budget', 'financial', 'finance', 'sales', 'order value', 'margin', 
      'roi', 'cost', 'earnings', 'balance'
    ],
    handler: runFinanceAgent
  }
  // Future agents (CRM Agent, Inventory Agent, Marketing Agent, Operations Agent, CEO Agent) will be registered here.
];

export async function routeAgent(userMessage: string): Promise<string> {
  try {
    const lowerMessage = userMessage.toLowerCase();

    // Iterate through registered agents to find a match
    for (const agent of registeredAgents) {
      const isMatch = agent.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
      if (isMatch) {
        return await agent.handler(userMessage);
      }
    }

    // Default Fallback
    return await runFinanceAgent(userMessage);
  } catch (error) {
    console.error('Routing Error:', error);
    throw new Error('Failed to route user message to an agent.');
  }
}

