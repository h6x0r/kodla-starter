import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   * Returns: total users, new users (last 30 days), active users (DAU/WAU/MAU)
   */
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await this.prisma.user.count();

    // New users in last 30 days
    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Daily Active Users (users with activity in last 24 hours)
    const dailyActiveUsers = await this.prisma.user.count({
      where: {
        lastActivityAt: {
          gte: oneDayAgo,
        },
      },
    });

    // Weekly Active Users (users with activity in last 7 days)
    const weeklyActiveUsers = await this.prisma.user.count({
      where: {
        lastActivityAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Monthly Active Users (users with activity in last 30 days)
    const monthlyActiveUsers = await this.prisma.user.count({
      where: {
        lastActivityAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Premium users
    const premiumUsers = await this.prisma.user.count({
      where: {
        isPremium: true,
      },
    });

    return {
      totalUsers,
      newUsers,
      premiumUsers,
      activeUsers: {
        daily: dailyActiveUsers,
        weekly: weeklyActiveUsers,
        monthly: monthlyActiveUsers,
      },
    };
  }

  /**
   * Get course analytics
   * Returns: course popularity, completion rates, average progress
   * Optimized: Single query for all userCourses with groupBy
   * Includes translations for localization
   */
  async getCourseAnalytics() {
    // Get all courses with translations
    const courses = await this.prisma.course.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        translations: true,
      },
    });

    // Single query for all course stats using groupBy
    const courseProgressStats = await this.prisma.userCourse.groupBy({
      by: ["courseSlug"],
      _count: { _all: true },
      _avg: { progress: true },
    });

    // Get completed counts in a single query
    const completedStats = await this.prisma.userCourse.groupBy({
      by: ["courseSlug"],
      where: {
        completedAt: { not: null },
      },
      _count: { _all: true },
    });

    // Create lookup maps for O(1) access
    const progressMap = new Map(
      courseProgressStats.map((stat) => [
        stat.courseSlug,
        { count: stat._count._all, avgProgress: stat._avg.progress || 0 },
      ]),
    );

    const completedMap = new Map(
      completedStats.map((stat) => [stat.courseSlug, stat._count._all]),
    );

    // Build course stats using the lookup maps
    const courseStats = courses.map((course) => {
      const progress = progressMap.get(course.slug) || {
        count: 0,
        avgProgress: 0,
      };
      const completed = completedMap.get(course.slug) || 0;
      const totalEnrolled = progress.count;

      return {
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        category: course.category,
        totalEnrolled,
        completed,
        completionRate:
          totalEnrolled > 0 ? (completed / totalEnrolled) * 100 : 0,
        averageProgress: Math.round(progress.avgProgress * 100) / 100,
        translations: course.translations as Record<
          string,
          { title?: string; description?: string }
        > | null,
      };
    });

    // Sort by popularity (total enrolled)
    courseStats.sort((a, b) => b.totalEnrolled - a.totalEnrolled);

    return {
      courses: courseStats,
      totalCourses: courses.length,
    };
  }

  /**
   * Get task analytics
   * Returns: hardest tasks (low pass rate), most popular tasks
   * Optimized: Uses groupBy queries instead of N+1 individual queries
   */
  async getTaskAnalytics() {
    // Get all tasks
    const tasks = await this.prisma.task.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        isPremium: true,
      },
    });

    // Single query for total submissions per task
    const totalSubmissionsStats = await this.prisma.submission.groupBy({
      by: ["taskId"],
      _count: { _all: true },
    });

    // Single query for passed submissions per task
    const passedSubmissionsStats = await this.prisma.submission.groupBy({
      by: ["taskId"],
      where: { status: "passed" },
      _count: { _all: true },
    });

    // Single query for unique users per task
    const uniqueUsersStats = await this.prisma.submission.groupBy({
      by: ["taskId", "userId"],
    });

    // Create lookup maps for O(1) access
    const totalSubmissionsMap = new Map(
      totalSubmissionsStats.map((stat) => [stat.taskId, stat._count._all]),
    );

    const passedSubmissionsMap = new Map(
      passedSubmissionsStats.map((stat) => [stat.taskId, stat._count._all]),
    );

    // Count unique users per task from the groupBy result
    const uniqueUsersMap = new Map<string, number>();
    uniqueUsersStats.forEach((stat) => {
      const current = uniqueUsersMap.get(stat.taskId) || 0;
      uniqueUsersMap.set(stat.taskId, current + 1);
    });

    // Build task stats using the lookup maps
    const taskStats = tasks.map((task) => {
      const totalSubmissions = totalSubmissionsMap.get(task.id) || 0;
      const passedSubmissions = passedSubmissionsMap.get(task.id) || 0;
      const uniqueUsers = uniqueUsersMap.get(task.id) || 0;
      const passRate =
        totalSubmissions > 0 ? (passedSubmissions / totalSubmissions) * 100 : 0;

      return {
        taskId: task.id,
        taskSlug: task.slug,
        taskTitle: task.title,
        difficulty: task.difficulty,
        isPremium: task.isPremium,
        totalSubmissions,
        passedSubmissions,
        uniqueUsers,
        passRate: Math.round(passRate * 100) / 100,
      };
    });

    // Filter tasks with at least some submissions
    const tasksWithSubmissions = taskStats.filter(
      (t) => t.totalSubmissions > 0,
    );

    // Sort by hardest (lowest pass rate)
    const hardestTasks = [...tasksWithSubmissions]
      .sort((a, b) => a.passRate - b.passRate)
      .slice(0, 10);

    // Sort by easiest (highest pass rate)
    const easiestTasks = [...tasksWithSubmissions]
      .sort((a, b) => b.passRate - a.passRate)
      .slice(0, 10);

    // Sort by most popular (most unique users)
    const mostPopularTasks = [...tasksWithSubmissions]
      .sort((a, b) => b.uniqueUsers - a.uniqueUsers)
      .slice(0, 10);

    return {
      hardestTasks,
      easiestTasks,
      mostPopularTasks,
      totalTasks: tasks.length,
      tasksWithSubmissions: tasksWithSubmissions.length,
    };
  }

  /**
   * Get submission statistics
   * Returns: total submissions, by status, by language
   */
  async getSubmissionStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total submissions
    const totalSubmissions = await this.prisma.submission.count();

    // Submissions in last 30 days
    const recentSubmissions = await this.prisma.submission.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Group by status
    const submissionsByStatus = await this.prisma.submission.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const statusStats = submissionsByStatus.map((stat) => ({
      status: stat.status,
      count: stat._count.status,
      percentage:
        totalSubmissions > 0
          ? Math.round((stat._count.status / totalSubmissions) * 10000) / 100
          : 0,
    }));

    // Get submissions per day for the last 30 days
    const submissionsPerDay = await this.prisma.submission.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Create a map of date -> count
    const dailySubmissions: { [key: string]: number } = {};
    submissionsPerDay.forEach((submission) => {
      const date = submission.createdAt.toISOString().split("T")[0];
      dailySubmissions[date] =
        (dailySubmissions[date] || 0) + submission._count.id;
    });

    return {
      totalSubmissions,
      recentSubmissions,
      byStatus: statusStats,
      dailySubmissions,
    };
  }

  /**
   * Get subscription statistics
   * Returns: active subscriptions, new this month, revenue
   */
  async getSubscriptionStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Active subscriptions
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        status: "active",
      },
    });

    // New subscriptions this month
    const newSubscriptionsThisMonth = await this.prisma.subscription.count({
      where: {
        status: "active",
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Subscriptions by plan
    const subscriptionsByPlan = await this.prisma.subscription.groupBy({
      by: ["planId"],
      where: {
        status: "active",
      },
      _count: {
        planId: true,
      },
    });

    // Get all relevant plan details in a single query
    const planIds = subscriptionsByPlan.map((stat) => stat.planId);
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { id: { in: planIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        priceMonthly: true,
      },
    });

    // Create lookup map for O(1) access
    const planMap = new Map(plans.map((plan) => [plan.id, plan]));

    // Build plan stats using the lookup map
    const planStats = subscriptionsByPlan.map((stat) => {
      const plan = planMap.get(stat.planId);
      return {
        planId: stat.planId,
        planName: plan?.name || "Unknown",
        planSlug: plan?.slug || "unknown",
        planType: plan?.type || "unknown",
        count: stat._count.planId,
        monthlyRevenue: (plan?.priceMonthly || 0) * stat._count.planId,
      };
    });

    // Calculate total monthly revenue
    const totalMonthlyRevenue = planStats.reduce(
      (sum, plan) => sum + plan.monthlyRevenue,
      0,
    );

    // Get payment stats
    const completedPayments = await this.prisma.payment.count({
      where: {
        status: "completed",
      },
    });

    const totalRevenue = await this.prisma.payment.aggregate({
      where: {
        status: "completed",
      },
      _sum: {
        amount: true,
      },
    });

    return {
      activeSubscriptions,
      newSubscriptionsThisMonth,
      byPlan: planStats,
      totalMonthlyRevenue, // in tiyn
      completedPayments,
      totalRevenue: totalRevenue._sum.amount || 0, // in tiyn
    };
  }

  /**
   * Get AI usage statistics
   * Returns: AI tutor usage by day
   */
  async getAiUsageStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total AI usage count
    const totalUsage = await this.prisma.aiUsage.aggregate({
      _sum: {
        count: true,
      },
    });

    // AI usage in last 30 days
    const recentUsage = await this.prisma.aiUsage.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        date: true,
        count: true,
      },
    });

    // Group by date
    const usageByDay: { [key: string]: number } = {};
    recentUsage.forEach((usage) => {
      usageByDay[usage.date] = (usageByDay[usage.date] || 0) + usage.count;
    });

    // Convert to array and sort by date
    const dailyUsage = Object.entries(usageByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Unique users using AI
    const uniqueUsers = await this.prisma.aiUsage.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });

    // Average usage per user
    const averageUsagePerUser =
      uniqueUsers.length > 0
        ? (totalUsage._sum.count || 0) / uniqueUsers.length
        : 0;

    return {
      totalUsage: totalUsage._sum.count || 0,
      uniqueUsers: uniqueUsers.length,
      averageUsagePerUser: Math.round(averageUsagePerUser * 100) / 100,
      dailyUsage,
    };
  }

  /**
   * Search users by email or name
   * Returns: matching users with basic info and stats
   */
  async searchUsers(query: string, limit = 20) {
    if (!query || query.length < 2) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
        createdAt: true,
        lastActivityAt: true,
        _count: {
          select: {
            submissions: true,
            courses: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isPremium: user.isPremium,
      isBanned: user.isBanned,
      bannedAt: user.bannedAt,
      bannedReason: user.bannedReason,
      createdAt: user.createdAt,
      lastActivityAt: user.lastActivityAt,
      submissionsCount: user._count.submissions,
      coursesCount: user._count.courses,
    }));
  }

  /**
   * Get user by ID with full details
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
        bannedBy: true,
        createdAt: true,
        lastActivityAt: true,
        xp: true,
        level: true,
        currentStreak: true,
        _count: {
          select: {
            submissions: true,
            courses: true,
            bugReports: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      submissionsCount: user._count.submissions,
      coursesCount: user._count.courses,
      bugReportsCount: user._count.bugReports,
    };
  }

  /**
   * Ban a user
   */
  async banUser(userId: string, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isBanned: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "ADMIN") {
      throw new Error("Cannot ban admin users");
    }

    if (user.isBanned) {
      throw new Error("User is already banned");
    }

    // Ban the user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason,
        bannedBy: adminId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
      },
    });

    // Invalidate all user sessions
    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return updatedUser;
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBanned: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isBanned) {
      throw new Error("User is not banned");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        bannedBy: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get list of banned users
   */
  async getBannedUsers(limit = 50, offset = 0) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isBanned: true },
        select: {
          id: true,
          email: true,
          name: true,
          bannedAt: true,
          bannedReason: true,
          bannedBy: true,
          createdAt: true,
        },
        orderBy: { bannedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where: { isBanned: true } }),
    ]);

    return { users, total };
  }

  // ============================================
  // PAYMENTS MANAGEMENT (Admin Panel Phase 2.2)
  // ============================================

  /**
   * Get all payments with filtering and pagination
   */
  async getPayments(params: {
    status?: string;
    provider?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, provider, limit = 50, offset = 0 } = params;

    const where: {
      status?: string;
      provider?: string;
    } = {};

    if (status) where.status = status;
    if (provider) where.provider = provider;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          subscription: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
              plan: {
                select: { id: true, name: true, slug: true, type: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        provider: p.provider,
        providerTxId: p.providerTxId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: p.subscription.user,
        plan: p.subscription.plan,
        subscriptionId: p.subscriptionId,
      })),
      total,
    };
  }

  /**
   * Get all purchases (one-time payments) with filtering
   */
  async getPurchases(params: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, type, limit = 50, offset = 0 } = params;

    const where: {
      status?: string;
      type?: string;
    } = {};

    if (status) where.status = status;
    if (type) where.type = type;

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return { purchases, total };
  }

  /**
   * Get payment by ID with full details
   */
  async getPaymentById(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                isPremium: true,
              },
            },
            plan: true,
          },
        },
      },
    });

    if (!payment) return null;

    // Get related transactions for audit trail
    const transactions = await this.prisma.paymentTransaction.findMany({
      where: {
        orderId: payment.subscriptionId,
        orderType: "subscription",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      ...payment,
      transactions,
    };
  }

  /**
   * Get all subscriptions with filtering
   */
  async getSubscriptions(params: {
    status?: string;
    planId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, planId, limit = 50, offset = 0 } = params;

    const where: {
      status?: string;
      planId?: string;
    } = {};

    if (status) where.status = status;
    if (planId) where.planId = planId;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true, isPremium: true },
          },
          plan: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              priceMonthly: true,
            },
          },
          _count: {
            select: { payments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
        autoRenew: s.autoRenew,
        createdAt: s.createdAt,
        user: s.user,
        plan: s.plan,
        paymentsCount: s._count.payments,
      })),
      total,
    };
  }

  /**
   * Get subscription by ID with payment history
   */
  async getSubscriptionById(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isPremium: true,
            createdAt: true,
          },
        },
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    return subscription;
  }

  /**
   * Extend subscription manually (admin action)
   */
  async extendSubscription(subscriptionId: string, days: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Calculate new end date
    const currentEndDate = subscription.endDate;
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + days);

    // Update subscription
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        endDate: newEndDate,
        status: "active", // Reactivate if expired
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: { select: { id: true, name: true, slug: true } },
      },
    });

    // Update user premium status
    await this.prisma.user.update({
      where: { id: subscription.userId },
      data: { isPremium: true },
    });

    return updated;
  }

  /**
   * Cancel subscription manually (admin action)
   */
  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status === "cancelled") {
      throw new Error("Subscription is already cancelled");
    }

    // Cancel the subscription
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "cancelled",
        autoRenew: false,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: { select: { id: true, name: true, slug: true } },
      },
    });

    // Check if user has other active subscriptions
    const otherActiveSubscriptions = await this.prisma.subscription.count({
      where: {
        userId: subscription.userId,
        status: "active",
        id: { not: subscriptionId },
      },
    });

    // If no other active subscriptions, remove premium status
    if (otherActiveSubscriptions === 0) {
      await this.prisma.user.update({
        where: { id: subscription.userId },
        data: { isPremium: false },
      });
    }

    return updated;
  }

  /**
   * Refund a payment (admin action)
   */
  async refundPayment(paymentId: string, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: { user: true },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status === "refunded") {
      throw new Error("Payment is already refunded");
    }

    if (payment.status !== "completed") {
      throw new Error("Only completed payments can be refunded");
    }

    // Update payment status
    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "refunded",
        metadata: {
          ...((payment.metadata as object) || {}),
          refundReason: reason,
          refundedAt: new Date().toISOString(),
        },
      },
    });

    // Log the refund transaction
    await this.prisma.paymentTransaction.create({
      data: {
        orderId: payment.subscriptionId,
        orderType: "subscription",
        provider: payment.provider || "manual",
        amount: payment.amount,
        state: -1, // Refund state
        action: "refund",
        request: { reason },
        response: { success: true },
      },
    });

    return updated;
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // This month's revenue
    const thisMonthRevenue = await this.prisma.payment.aggregate({
      where: {
        status: "completed",
        createdAt: { gte: firstDayOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Last month's revenue
    const lastMonthRevenue = await this.prisma.payment.aggregate({
      where: {
        status: "completed",
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfMonth,
        },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Total revenue
    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
      _count: true,
    });

    // Revenue by provider
    const revenueByProvider = await this.prisma.payment.groupBy({
      by: ["provider"],
      where: { status: "completed" },
      _sum: { amount: true },
      _count: true,
    });

    // Refunded payments
    const refundedPayments = await this.prisma.payment.aggregate({
      where: { status: "refunded" },
      _sum: { amount: true },
      _count: true,
    });

    // Daily revenue for chart (last 30 days)
    const dailyPayments = await this.prisma.payment.findMany({
      where: {
        status: "completed",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by day
    const dailyRevenue: { [key: string]: number } = {};
    dailyPayments.forEach((p) => {
      const date = p.createdAt.toISOString().split("T")[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + p.amount;
    });

    // Convert to sorted array
    const dailyRevenueArray = Object.entries(dailyRevenue)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Purchase revenue (one-time purchases)
    const purchaseRevenue = await this.prisma.purchase.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
      _count: true,
    });

    return {
      thisMonth: {
        revenue: thisMonthRevenue._sum.amount || 0,
        count: thisMonthRevenue._count,
      },
      lastMonth: {
        revenue: lastMonthRevenue._sum.amount || 0,
        count: lastMonthRevenue._count,
      },
      total: {
        revenue: totalRevenue._sum.amount || 0,
        count: totalRevenue._count,
      },
      byProvider: revenueByProvider.map((p) => ({
        provider: p.provider || "unknown",
        revenue: p._sum.amount || 0,
        count: p._count,
      })),
      refunded: {
        amount: refundedPayments._sum.amount || 0,
        count: refundedPayments._count,
      },
      purchases: {
        revenue: purchaseRevenue._sum.amount || 0,
        count: purchaseRevenue._count,
      },
      dailyRevenue: dailyRevenueArray,
    };
  }

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return plans.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      nameRu: p.nameRu,
      type: p.type,
      priceMonthly: p.priceMonthly,
      currency: p.currency,
      isActive: p.isActive,
      course: p.course,
      subscriptionsCount: p._count.subscriptions,
      createdAt: p.createdAt,
    }));
  }
}
