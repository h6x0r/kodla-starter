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
      createdAt: user.createdAt,
      lastActivityAt: user.lastActivityAt,
      submissionsCount: user._count.submissions,
      coursesCount: user._count.courses,
    }));
  }
}
