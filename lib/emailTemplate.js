// responsive HTML for the weekly productivity digest mail

export function generateWeeklyDigestEmail({
  userName,
  completedCount,
  overdueCount,
  dashboardUrl,
  settingsUrl,
}) {
  return `
    
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Productivity Digest — RemindKaro</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f17; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 580px; margin: 0 auto; background: #131b2e; border-radius: 12px; padding: 32px; border: 1px solid #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .logo { color: #6366f1; font-size: 24px; font-weight: 800; text-decoration: none; display: inline-block; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
            .stats-grid { display: flex; gap: 16px; margin: 24px 0; }
            .stat-card { flex: 1; background: #0b0f17; padding: 20px; border-radius: 8px; border: 1px solid #1e293b; text-align: center; }
            .stat-number { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
            .stat-label { font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
            .completed-num { color: #10b981; }
            .overdue-num { color: #f43f5e; }
            .btn { display: inline-block; background: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; text-align: center; }
            .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; }
            .footer a { color: #94a3b8; text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="https://www.remindkro.in/" class="logo">RemindKaro</a>
            <div class="title">Your Weekly Productivity Summary 📊</div>
            <p>Hi ${userName || 'there'},  here is your task performance for the past week: </p>
            <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number completed-num">${completedCount}</div>
                <div class="stat-label">Completed Tasks (Last 7d)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number overdue-num">${overdueCount}</div>
                <div class="stat-label">Currently Overdue</div>
            </div>
            </div>
            <p>${
              completedCount >= overdueCount
                ? '🚀 Excellent progress staying on top of your deadlines this week!'
                : '⚡ You have a few overdue items. Clear them out to get back on track!'
            }</p>
            <a href="${dashboardUrl || 'https://remindkro.in/dashboard'}" class="btn">Open RemindKaro Dashboard →</a>
            <div class="footer">
            You are receiving this email because weekly digest notifications are enabled.<br>
            <a href="${settingsUrl || 'https://remindkro.in/dashboard/profile'}">Manage Notification Preferences</a>
            </div>
        </div> 
    </body>
    </html>
`;
}
