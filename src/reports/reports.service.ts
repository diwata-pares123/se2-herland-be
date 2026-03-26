import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, ServiceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    // 1. Fetch all non-deleted transactions, including the service details
    const transactions = await this.prisma.transaction.findMany({
      where: { isDeleted: false },
      include: {
        items: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Separate them into the buckets your UI tabs need
    const unpaidTransactions = transactions.filter((t) => t.paymentStatus === PaymentStatus.UNPAID);
    const paidTransactions = transactions.filter((t) => t.paymentStatus === PaymentStatus.PAID);
    const claimedTransactions = transactions.filter((t) => t.serviceStatus === ServiceStatus.CLAIMED);

    // 3. Calculate Totals for the bottom of the tables
    const totalUnpaidAmount = unpaidTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPaidAmount = paidTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalClaimedAmount = claimedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

    // 4. Build the Graph Data (Grouping by Month)
    // We will initialize the first three months to match your UI placeholder
    const graphData = {
      Jan: { count: 0, revenue: 0 },
      Feb: { count: 0, revenue: 0 },
      March: { count: 0, revenue: 0 }, // Exact spelling from your UI
      // You can add more months here later!
    };

    // Map JavaScript month numbers (0-11) perfectly to your UI labels
    const monthLabels = [
      "Jan", "Feb", "March", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    transactions.forEach((t) => {
      // t.createdAt.getMonth() returns an index (e.g., 2 for March)
      // This forces the backend to use your UI's exact spelling ("March")
      const monthName = monthLabels[t.createdAt.getMonth()];
      
      // If the month exists in our graphData object, add to it
      if (graphData[monthName]) {
        graphData[monthName].count += 1; // For your 0-120 graph
        
        // Only count paid revenue for the money graph
        if (t.paymentStatus === PaymentStatus.PAID) {
           graphData[monthName].revenue += t.totalAmount;
        }
      }
    });

    // 5. Send the perfectly formatted JSON to the frontend
    return {
      overview: {
        totalSalesAmount: totalPaidAmount,
        totalCustomers: transactions.length, // Can represent "New Customers" count for now
      },
      graphData: graphData,
      salesReportTabs: {
        unpaid: {
          totalAmount: totalUnpaidAmount,
          entries: unpaidTransactions,
        },
        paid: {
          totalAmount: totalPaidAmount,
          entries: paidTransactions,
        },
        claimed: {
          totalAmount: totalClaimedAmount,
          entries: claimedTransactions,
        },
      },
    };
  }
}