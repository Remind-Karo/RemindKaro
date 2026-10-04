import { NextResponse } from "next/server";
import { generateWeeklyDigestEmail } from "@/lib/emailTemplate";
import { calculateWeeklyStatsFromTasks } from "@/lib/digestService";

const userTasks = [
  { id: 1, status: "completed", updated_at: new Date().toISOString() },
  { id: 2, status: "completed", updated_at: new Date().toISOString() },
  { id: 3, status: "pending", deadline: "2026-01-01T00:00:00.000Z" }, // Overdue
];

export async function GET(request) {
  // 1. Authorization check for Cron trigger
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eligibleUsers = [
      {
        id: 1,
        email: "user@example.com",
        name: "Contributor",
        weekly_digest_opt_in: true,
      },
    ];

    let processedCount = 0;

    for (const user of eligibleUsers) {
      if (user.weekly_digest_opt_in === false) continue;

      const { completedCount, overdueCount } =
        calculateWeeklyStatsFromTasks(userTasks);

      const htmlContent = generateWeeklyDigestEmail({
        userName: user.name,
        completedCount,
        overdueCount,
        dashboardUrl: "https://remindkro.in/dashboard",
        settingsUrl: "https://remindkro.in/dashboard/profile",
      });

      //   const userTasks = [];
      //   const { completedCount, overdueCount } =
      //     calculateWeeklyStatsFromTasks(userTasks);

      //   const htmlContent = generateWeeklyDigestEmail({
      //     userName: user.name,
      //     completedCount,
      //     overdueCount,
      //     dashboardUrl: "https://remindkro.in/dashboard",
      //     settingsUrl: "https://remindkro.in/dashboard/profile",
      //   });

      console.log(
        `[Weekly Digest] Prepared digest email for ${user.email} (Completed: ${completedCount}, Overdue: ${overdueCount})`
      );
      processedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Weekly digest processed for ${processedCount} user(s).`,
    });
  } catch (error) {
    console.error("Weekly digest cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
