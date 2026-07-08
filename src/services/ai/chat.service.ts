import { getCustomers } from '../customers/customers.service';
import { getProducts } from '../inventory/inventory.service';
import { getOrders } from '../orders/orders.service';
import { getExpenses } from '../expenses/expenses.service';
import { getCampaigns } from '../marketing/marketing.service';
import { getOperations } from '../operations/operations.service';
import { getReports } from '../reports/report.service';
import { getUnreadNotificationCount } from '../notifications/notifications.service';

export async function sendMessage(message: string): Promise<string> {
  try {
    const lowerMsg = message.toLowerCase();
    
    // 1. Detect user intent
    const isCustomers = /customer|crm|client|buyer|user/.test(lowerMsg);
    const isInventory = /inventory|stock|product|item/.test(lowerMsg);
    const isSales = /order|purchase|sale/.test(lowerMsg);
    const isFinance = /finance|revenue|expense|money|cash|profit/.test(lowerMsg);
    const isMarketing = /marketing|campaign|ad|promotion/.test(lowerMsg);
    const isReports = /report|document|brief/.test(lowerMsg);
    const isOperations = /operation|task|cluster|system|workflow/.test(lowerMsg);
    const isNotifications = /notification|alert|warning|message/.test(lowerMsg);
    const isSummary = /summary|overview|dashboard/.test(lowerMsg) || 
      (!isCustomers && !isInventory && !isSales && !isFinance && !isMarketing && !isReports && !isOperations && !isNotifications);

    const contextBlocks: string[] = [];

    // 2. Fetch Live Data for relevant intents
    if (isCustomers || isSummary) {
      try {
        const customers = await getCustomers();
        if (customers.length > 0) {
          contextBlocks.push(`Customers: ${customers.length}`);
        } else {
          contextBlocks.push('There are currently no customer records in your CRM.');
        }
      } catch (e) { console.warn('Failed to fetch customers', e); }
    }

    if (isFinance || isSales || isSummary) {
      try {
        const orders = await getOrders();
        const expenses = await getExpenses();
        
        if (isFinance || isSummary) {
          if (orders.length > 0 || expenses.length > 0) {
            const revenue = orders.reduce((acc, o) => acc + o.total, 0);
            const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
            const netProfit = revenue - totalExp;
            
            contextBlocks.push(`Revenue: ₹${revenue.toFixed(0)}`);
            if (expenses.length > 0) {
              contextBlocks.push(`Expenses: ₹${totalExp.toFixed(0)}`);
              contextBlocks.push(`Net Profit: ₹${netProfit.toFixed(0)}`);
            } else if (isFinance && !isSummary) {
              contextBlocks.push('There are currently no expenses recorded.');
            }
          } else if (isFinance && !isSummary) {
            contextBlocks.push('There are currently no expenses recorded.');
          }
        }

        if (isSales || isSummary) {
          if (orders.length > 0) {
            const todayStr = new Date().toDateString();
            const ordersToday = orders.filter(o => new Date(o.created_at).toDateString() === todayStr).length;
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            
            contextBlocks.push(`Orders Today: ${ordersToday}`);
            contextBlocks.push(`Pending Orders: ${pendingOrders}`);
          } else {
            contextBlocks.push('There are currently no orders in your Sales module.');
          }
        }
      } catch (e) { console.warn('Failed to fetch finance/sales', e); }
    }

    if (isInventory || isSummary) {
      try {
        const products = await getProducts();
        if (products.length > 0) {
          const lowStock = products.filter(p => p.quantity <= (p.reorder_level || 0)).length;
          contextBlocks.push(`Products: ${products.length}`);
          contextBlocks.push(`Low Stock Products: ${lowStock}`);
        }
      } catch (e) { console.warn('Failed to fetch inventory', e); }
    }

    if (isMarketing || isSummary) {
      try {
        const campaigns = await getCampaigns();
        if (campaigns.length > 0) {
          contextBlocks.push(`Campaigns: ${campaigns.length}`);
        }
      } catch (e) { console.warn('Failed to fetch marketing', e); }
    }

    if (isOperations || isSummary) {
      try {
        const ops = await getOperations();
        if (ops.length > 0) {
          const pending = ops.filter(o => o.status === 'pending').length;
          contextBlocks.push(`Pending Operations: ${pending}`);
        }
      } catch (e) { console.warn('Failed to fetch operations', e); }
    }
    
    if (isNotifications || isSummary) {
      try {
        const unreadCount = await getUnreadNotificationCount();
        contextBlocks.push(`Unread Notifications: ${unreadCount}`);
      } catch (e) { console.warn('Failed to fetch notifications', e); }
    }
    
    if (isReports && !isSummary) {
      try {
        const reports = await getReports();
        if (reports.length > 0) {
          contextBlocks.push(`Reports Available: ${reports.length}`);
        }
      } catch (e) { console.warn('Failed to fetch reports', e); }
    }

    // 3. Construct Business Context
    const contextStr = contextBlocks.length > 0 ? contextBlocks.join('\n\n') : undefined;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        context: contextStr 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    const data = await response.json();
    return data.reply;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Chat Service Error:', error);
    throw error;
  }
}
