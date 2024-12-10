interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(data: EmailData): Promise<void> {
  // In a real application, this would connect to your email service
  // For now, we'll just log the email data
  console.log('Sending email:', data);
}

export function generateRecruitmentEmail(position: SavedPosition): EmailData {
  return {
    to: 'recruitment@magentiq.com',
    subject: `New Position Published: ${position.formData.jobTitle}`,
    body: `
A new position has been published:

Company: ${position.companyData.companyName}
Position: ${position.formData.jobTitle}
Location: ${position.formData.onshoreLocation}
Experience Level: ${position.formData.experienceLevel}

Please review the position in RecruitCRM and begin the sourcing process.

Best regards,
Magentiq Platform
    `.trim()
  };
}