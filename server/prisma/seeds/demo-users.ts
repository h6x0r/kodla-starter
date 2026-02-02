/**
 * Demo Users Seed
 * Creates demo users with various XP, levels, and streaks for leaderboard testing
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Level thresholds (must match gamification.service.ts):
 * Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 500, Level 5: 1000
 * Level 6: 1750, Level 7: 2750, Level 8: 4000, Level 9: 5500, Level 10: 7500
 *
 * Demo users data for leaderboard and analytics testing
 * XP values are set to match level thresholds correctly
 */
export const DEMO_USERS = [
	{ email: 'maria@example.com', name: 'Maria Chen', xp: 6200, level: 9, streak: 12, maxStreak: 15, isPremium: true },
	{ email: 'john@example.com', name: 'John Smith', xp: 4800, level: 8, streak: 5, maxStreak: 20, isPremium: false },
	{ email: 'anna@example.com', name: 'Anna Ko', xp: 3500, level: 7, streak: 8, maxStreak: 10, isPremium: true },
	{ email: 'mike@example.com', name: 'Mike Johnson', xp: 2200, level: 6, streak: 3, maxStreak: 7, isPremium: false },
	{ email: 'sarah@example.com', name: 'Sarah Lee', xp: 1900, level: 6, streak: 15, maxStreak: 15, isPremium: true },
	{ email: 'david@example.com', name: 'David Kim', xp: 1300, level: 5, streak: 2, maxStreak: 12, isPremium: false },
	{ email: 'emma@example.com', name: 'Emma Wilson', xp: 1050, level: 5, streak: 0, maxStreak: 8, isPremium: false },
	{ email: 'james@example.com', name: 'James Brown', xp: 700, level: 4, streak: 1, maxStreak: 5, isPremium: true },
	{ email: 'lisa@example.com', name: 'Lisa Wang', xp: 350, level: 3, streak: 4, maxStreak: 6, isPremium: false },
	{ email: 'tom@example.com', name: 'Tom Davis', xp: 150, level: 2, streak: 1, maxStreak: 3, isPremium: false },
];

/**
 * E2E Test Users for Playwright tests
 * These users are created with known credentials for automated testing
 */
export const E2E_TEST_USERS = [
	{
		email: 'e2e-test@practix.dev',
		name: 'E2E Test User',
		password: 'TestPassword123!',
		xp: 500,
		level: 4,
		streak: 0,
		maxStreak: 0,
		isPremium: false,
		isBot: true, // Mark as test user
		role: 'USER' as const,
	},
	{
		email: 'e2e-premium@practix.dev',
		name: 'E2E Premium User',
		password: 'PremiumPassword123!',
		xp: 2000,
		level: 6,
		streak: 5,
		maxStreak: 10,
		isPremium: true,
		isBot: true, // Mark as test user
		role: 'USER' as const,
	},
	{
		email: 'e2e-admin@practix.dev',
		name: 'E2E Admin User',
		password: 'AdminPassword123!',
		xp: 5000,
		level: 8,
		streak: 10,
		maxStreak: 30,
		isPremium: true,
		isBot: true, // Mark as test user
		role: 'ADMIN' as const,
	},
];

/**
 * Seed demo users for leaderboard and analytics
 */
export async function seedDemoUsers(prismaClient?: PrismaClient): Promise<void> {
	const db = prismaClient || prisma;
	console.log('👥 Seeding demo users...');

	const hashedPassword = await bcrypt.hash('demo123', 10);
	const now = new Date();

	for (const userData of DEMO_USERS) {
		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email: userData.email },
		});

		if (existingUser) {
			// Update existing user's stats
			await db.user.update({
				where: { email: userData.email },
				data: {
					xp: userData.xp,
					level: userData.level,
					currentStreak: userData.streak,
					maxStreak: userData.maxStreak,
					isPremium: userData.isPremium,
					isBot: true, // Mark as demo user for filtering in analytics
					lastActivityAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
				},
			});
		} else {
			// Create new user
			await db.user.create({
				data: {
					email: userData.email,
					password: hashedPassword,
					name: userData.name,
					xp: userData.xp,
					level: userData.level,
					currentStreak: userData.streak,
					maxStreak: userData.maxStreak,
					isPremium: userData.isPremium,
					isBot: true, // Mark as demo user for filtering in analytics
					role: 'USER',
					lastActivityAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
					preferences: {
						editorFontSize: 14,
						editorMinimap: false,
						editorTheme: 'vs-dark',
						editorLineNumbers: true,
						notifications: { emailDigest: true, newCourses: true },
					},
				},
			});
		}
	}

	console.log(`   ✅ ${DEMO_USERS.length} demo users seeded\n`);
}

/**
 * Seed demo progress data (course enrollments, submissions)
 */
export async function seedDemoProgress(prismaClient?: PrismaClient): Promise<void> {
	const db = prismaClient || prisma;
	console.log('📊 Seeding demo progress data...');

	// Get all demo users
	const demoUsers = await db.user.findMany({
		where: {
			email: { in: DEMO_USERS.map(u => u.email) },
		},
	});

	// Get ALL courses and MORE tasks for realistic progress
	const courses = await db.course.findMany({
		select: { id: true, slug: true },
	});

	const tasks = await db.task.findMany({
		take: 100, // More tasks for varied submissions
		select: { id: true, slug: true, difficulty: true },
	});

	if (courses.length === 0 || tasks.length === 0) {
		console.log('   ⚠️  No courses/tasks found, skipping progress seeding');
		return;
	}

	let enrollmentsCreated = 0;
	let submissionsCreated = 0;

	// Use 'passed' and 'failed' to match backend status system
	const statuses = ['passed', 'failed', 'error', 'passed', 'passed'];

	for (const user of demoUsers) {
		// Enroll user in random courses (3-6 courses per user for more realistic data)
		const numCourses = 3 + Math.floor(Math.random() * 4);
		const shuffledCourses = [...courses].sort(() => Math.random() - 0.5).slice(0, numCourses);

		for (const course of shuffledCourses) {
			// Check if enrollment exists
			const existing = await db.userCourse.findUnique({
				where: {
					userId_courseSlug: { userId: user.id, courseSlug: course.slug },
				},
			});

			if (!existing) {
				// 20% of courses should be completed for realistic analytics
				const isCompleted = Math.random() < 0.20;
				const progress = isCompleted ? 100 : 10 + Math.floor(Math.random() * 85); // 10-94%
				await db.userCourse.create({
					data: {
						userId: user.id,
						courseSlug: course.slug,
						progress,
						completedAt: isCompleted ? new Date() : null,
					},
				});
				enrollmentsCreated++;
			}
		}

		// Create MORE submissions for this user (15-30 per user for realistic statistics)
		const numSubmissions = 15 + Math.floor(Math.random() * 16);
		const shuffledTasks = [...tasks].sort(() => Math.random() - 0.5).slice(0, numSubmissions);

		for (const task of shuffledTasks) {
			const status = statuses[Math.floor(Math.random() * statuses.length)];
			const isPassed = status === 'passed';
			const isError = status === 'error';

			// Check if submission already exists for this user+task
			const existingSubmission = await db.submission.findFirst({
				where: { userId: user.id, taskId: task.id },
			});

			if (!existingSubmission) {
				// Spread submissions over 60 days for better analytics
				const daysAgo = Math.floor(Math.random() * 60);
				const submissionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

				await db.submission.create({
					data: {
						userId: user.id,
						taskId: task.id,
						code: '// Demo submission',
						status,
						score: isPassed ? 100 : isError ? 0 : Math.floor(Math.random() * 60),
						runtime: isError ? '0ms' : `${50 + Math.floor(Math.random() * 450)}ms`,
						memory: isError ? null : `${5 + Math.floor(Math.random() * 45)}MB`,
						message: isPassed ? 'All tests passed' : isError ? 'Compilation error' : 'Some tests failed',
						testsPassed: isPassed ? 10 : isError ? 0 : Math.floor(Math.random() * 7),
						testsTotal: 10,
						createdAt: submissionDate,
					},
				});
				submissionsCreated++;
			}
		}
	}

	console.log(`   ✅ ${enrollmentsCreated} enrollments, ${submissionsCreated} submissions created\n`);
}

/**
 * Seed progress data for alex@example.com (admin user)
 * This ensures the admin dashboard shows real data
 */
export async function seedAlexProgress(prismaClient?: PrismaClient): Promise<void> {
	const db = prismaClient || prisma;
	console.log('👑 Seeding alex@example.com progress data...');

	const alex = await db.user.findUnique({
		where: { email: 'alex@example.com' },
	});

	if (!alex) {
		console.log('   ⚠️  alex@example.com not found, skipping');
		return;
	}

	// Get ALL courses and MORE tasks for Alex (admin should have most activity)
	const courses = await db.course.findMany({
		select: { id: true, slug: true },
	});

	const tasks = await db.task.findMany({
		take: 80, // More tasks for Alex to show extensive activity
		select: { id: true, slug: true, difficulty: true },
	});

	if (courses.length === 0 || tasks.length === 0) {
		console.log('   ⚠️  No courses/tasks found, skipping');
		return;
	}

	let enrollmentsCreated = 0;
	let submissionsCreated = 0;

	// Enroll Alex in MORE courses (first 4 courses are completed, rest in progress)
	const maxCourses = Math.min(courses.length, 10);
	for (let i = 0; i < maxCourses; i++) {
		const course = courses[i];
		const existing = await db.userCourse.findUnique({
			where: {
				userId_courseSlug: { userId: alex.id, courseSlug: course.slug },
			},
		});

		if (!existing) {
			// First 4 courses are completed, rest are in progress
			const isCompleted = i < 4;
			const progress = isCompleted ? 100 : 40 + Math.floor(Math.random() * 55);
			await db.userCourse.create({
				data: {
					userId: alex.id,
					courseSlug: course.slug,
					progress,
					completedAt: isCompleted ? new Date() : null,
				},
			});
			enrollmentsCreated++;
		}
	}

	// Create MORE submissions for Alex (85% pass rate - admin should look skilled)
	const now = new Date();
	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		const existingSubmission = await db.submission.findFirst({
			where: { userId: alex.id, taskId: task.id },
		});

		if (!existingSubmission) {
			// 85% pass rate for Alex (admin should look competent)
			const random = Math.random();
			let status: string;
			if (random < 0.85) {
				status = 'passed';
			} else if (random < 0.95) {
				status = 'failed';
			} else {
				status = 'error';
			}
			const isPassed = status === 'passed';
			const isError = status === 'error';

			// Spread submissions over last 30 days for activity chart
			const daysAgo = Math.floor(Math.random() * 30);
			const submissionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

			await db.submission.create({
				data: {
					userId: alex.id,
					taskId: task.id,
					code: '// Alex submission',
					status,
					score: isPassed ? 100 : isError ? 0 : Math.floor(Math.random() * 50),
					runtime: isError ? '0ms' : `${50 + Math.floor(Math.random() * 200)}ms`,
					memory: isError ? null : `${10 + Math.floor(Math.random() * 30)}MB`,
					message: isPassed ? 'All tests passed' : isError ? 'Compilation error' : 'Some tests failed',
					testsPassed: isPassed ? 10 : isError ? 0 : Math.floor(Math.random() * 5),
					testsTotal: 10,
					createdAt: submissionDate,
				},
			});
			submissionsCreated++;
		}
	}

	console.log(`   ✅ Alex: ${enrollmentsCreated} enrollments, ${submissionsCreated} submissions created\n`);
}

/**
 * Seed demo subscriptions for premium users
 * Each demo user gets individual course subscriptions to all courses
 * This creates realistic analytics data showing per-course subscription distribution
 */
export async function seedDemoSubscriptions(prismaClient?: PrismaClient): Promise<void> {
	const db = prismaClient || prisma;
	console.log('💳 Seeding demo subscriptions...');

	// Get all course plans
	const coursePlans = await db.subscriptionPlan.findMany({
		where: { type: 'course' },
	});

	// Get global plan for some users
	const globalPlan = await db.subscriptionPlan.findFirst({
		where: { type: 'global' },
	});

	if (coursePlans.length === 0 && !globalPlan) {
		console.log('   ⚠️  No subscription plans found, skipping subscriptions');
		return;
	}

	// Get ALL demo users (not just premium)
	const demoUsers = await db.user.findMany({
		where: {
			email: { in: DEMO_USERS.map(u => u.email) },
		},
	});

	let subsCreated = 0;
	const now = new Date();
	const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

	for (let i = 0; i < demoUsers.length; i++) {
		const user = demoUsers[i];

		// Premium users get individual course subscriptions to all courses
		// This creates realistic analytics showing course subscription distribution
		if (DEMO_USERS.find(u => u.email === user.email)?.isPremium) {
			// Give each premium user subscriptions to all courses individually
			for (const plan of coursePlans) {
				const existingSub = await db.subscription.findUnique({
					where: {
						userId_planId: { userId: user.id, planId: plan.id },
					},
				});

				if (!existingSub) {
					// Random start dates in the past 6 months for realistic analytics
					const randomDaysAgo = Math.floor(Math.random() * 180);
					const startDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
					const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

					await db.subscription.create({
						data: {
							userId: user.id,
							planId: plan.id,
							status: 'active',
							startDate,
							endDate,
						},
					});
					subsCreated++;
				}
			}
		} else {
			// Non-premium users get 1-3 random course subscriptions (realistic partial access)
			const numSubs = 1 + Math.floor(Math.random() * 3);
			const shuffledPlans = [...coursePlans].sort(() => Math.random() - 0.5).slice(0, numSubs);

			for (const plan of shuffledPlans) {
				const existingSub = await db.subscription.findUnique({
					where: {
						userId_planId: { userId: user.id, planId: plan.id },
					},
				});

				if (!existingSub) {
					const randomDaysAgo = Math.floor(Math.random() * 90);
					const startDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
					const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

					await db.subscription.create({
						data: {
							userId: user.id,
							planId: plan.id,
							status: 'active',
							startDate,
							endDate,
						},
					});
					subsCreated++;
				}
			}
		}
	}

	console.log(`   ✅ ${subsCreated} course subscriptions created for ${demoUsers.length} demo users\n`);
}

/**
 * Seed E2E test users for Playwright automated testing
 * Creates users with known credentials that can be used in E2E tests
 */
export async function seedE2ETestUsers(prismaClient?: PrismaClient): Promise<void> {
	const db = prismaClient || prisma;
	console.log('🧪 Seeding E2E test users...');

	const now = new Date();

	for (const userData of E2E_TEST_USERS) {
		// Hash password for this specific user
		const hashedPassword = await bcrypt.hash(userData.password, 10);

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email: userData.email },
		});

		if (existingUser) {
			// Update existing user's password and stats
			await db.user.update({
				where: { email: userData.email },
				data: {
					password: hashedPassword,
					xp: userData.xp,
					level: userData.level,
					currentStreak: userData.streak,
					maxStreak: userData.maxStreak,
					isPremium: userData.isPremium,
					isBot: userData.isBot,
					role: userData.role || 'USER',
					lastActivityAt: now,
				},
			});
			console.log(`   📝 Updated: ${userData.email} (${userData.role || 'USER'})`);
		} else {
			// Create new user
			await db.user.create({
				data: {
					email: userData.email,
					password: hashedPassword,
					name: userData.name,
					xp: userData.xp,
					level: userData.level,
					currentStreak: userData.streak,
					maxStreak: userData.maxStreak,
					isPremium: userData.isPremium,
					isBot: userData.isBot,
					role: userData.role || 'USER',
					lastActivityAt: now,
					preferences: {
						editorFontSize: 14,
						editorMinimap: false,
						editorTheme: 'vs-dark',
						editorLineNumbers: true,
						notifications: { emailDigest: false, newCourses: false },
					},
				},
			});
			console.log(`   ✨ Created: ${userData.email} (${userData.role || 'USER'})`);
		}
	}

	// Create global premium subscription for premium test user
	const premiumUser = await db.user.findUnique({
		where: { email: 'e2e-premium@practix.dev' },
	});

	if (premiumUser) {
		const globalPlan = await db.subscriptionPlan.findFirst({
			where: { type: 'global' },
		});

		if (globalPlan) {
			const existingSub = await db.subscription.findUnique({
				where: {
					userId_planId: { userId: premiumUser.id, planId: globalPlan.id },
				},
			});

			if (!existingSub) {
				await db.subscription.create({
					data: {
						userId: premiumUser.id,
						planId: globalPlan.id,
						status: 'active',
						startDate: now,
						endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
					},
				});
				console.log('   💎 Created global premium subscription for e2e-premium@practix.dev');
			}
		}
	}

	console.log(`   ✅ ${E2E_TEST_USERS.length} E2E test users seeded\n`);
}

export default {
	seedDemoUsers,
	seedDemoProgress,
	seedAlexProgress,
	seedDemoSubscriptions,
	seedE2ETestUsers,
	DEMO_USERS,
	E2E_TEST_USERS,
};
