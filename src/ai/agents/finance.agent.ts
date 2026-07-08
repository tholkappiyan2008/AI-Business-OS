import { financeSystemPrompt } from '../prompts/finance.prompt';
import { getFinanceContext } from '../tools/finance.tool';
import { geminiClient } from '../gemini/client';

export async function runFinanceAgent(userQuestion: string): Promise<string> {
  try {
    const context = await getFinanceContext();

    if (context.status === "There are currently no finance records available.") {
      return "There are currently no finance records available.";
    }

    const businessContext = `
Business Context:
Revenue: ₹${context.totalRevenue.toFixed(2)}
Expenses: ₹${context.totalExpenses.toFixed(2)}
Profit: ₹${context.netProfit.toFixed(2)}
Profit Margin: ${context.profitMargin.toFixed(2)}%
Total Orders: ${context.totalOrders}
Completed Orders: ${context.completedOrders}
Pending Orders: ${context.pendingOrders}
Average Order Value: ₹${context.averageOrderValue.toFixed(2)}
Status: ${context.status}
`;

    const prompt = `${businessContext}\n\nUser Question:\n${userQuestion}`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: financeSystemPrompt,
      },
    });

    if (!response.text) {
      throw new Error('Gemini returned an empty response.');
    }

    return response.text;
  } catch (error) {
    console.error('Error running Finance Agent:', error);
    throw new Error('Failed to generate response from Finance Agent.');
  }
}

