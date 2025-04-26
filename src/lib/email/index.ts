import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'noreply@habityall.com';

// Initialize Resend client
const resend = new Resend(resendApiKey);

// Send a notification email
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
}

// Template for volley notification
export function generateVolleyNotificationEmail({
  recipientName,
  habitName,
  partnerName,
  deadlineTime,
}: {
  recipientName: string;
  habitName: string;
  partnerName: string;
  deadlineTime: string;
}) {
  const subject = `🏓 Your Turn for ${habitName}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0284c7; margin-bottom: 24px;">Your Turn, ${recipientName}!</h1>
      
      <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        <strong>${partnerName}</strong> has completed their <strong>${habitName}</strong> habit.
        Now it's your turn to keep the streak going!
      </p>
      
      <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
        You have until <strong>${deadlineTime}</strong> to complete your habit and maintain your streak.
      </p>
      
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
           style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Check In Now
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; text-align: center;">
        Keep up the great work! Your accountability partner is counting on you.
      </p>
    </div>
  `;
  
  return { subject, html };
}

// Template for streak broken notification
export function generateStreakBrokenEmail({
  recipientName,
  habitName,
  streakCount,
  creditsReceived,
}: {
  recipientName: string;
  habitName: string;
  streakCount: number;
  creditsReceived: number;
}) {
  const subject = `Streak Broken for ${habitName}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0284c7; margin-bottom: 24px;">Streak Broken</h1>
      
      <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hi ${recipientName},
      </p>
      
      <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Unfortunately, the streak for <strong>${habitName}</strong> has been broken.
        You maintained a streak of <strong>${streakCount} consecutive completions</strong>.
      </p>
      
      <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
        The good news is that you've received <strong>${creditsReceived} credits</strong> as a result.
      </p>
      
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
           style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Dashboard
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; text-align: center;">
        Remember, building habits takes time. Don't give up!
      </p>
    </div>
  `;
  
  return { subject, html };
} 