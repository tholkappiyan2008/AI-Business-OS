import { getServerOrders as getOrders } from '../../services/orders/orders.server';
import { getServerExpenses as getExpenses } from '../../services/expenses/expenses.server';

export async function getFinanceContext() {
  try {
    const orders = await getOrders();
    const expenses = await getExpenses();

    if (orders.length === 0 && expenses.length === 0) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        averageOrderValue: 0,
        status: "There are currently no finance records available."
      };
    }

    const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'confirmed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      totalOrders,
      completedOrders,
      pendingOrders,
      averageOrderValue,
      status: "Success"
    };
  } catch (error) {
    console.error("Error collecting finance context:", error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      averageOrderValue: 0,
      status: "There are currently no finance records available."
    };
  }
}

