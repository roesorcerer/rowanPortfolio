import type { EmailJSResponseStatus } from '@emailjs/browser';
import emailjs from '@emailjs/browser';

// Type definitions
type EmailTemplateParams = {
  [key: string]: string | number | boolean;
  from_name: string;
  from_email: string;
  to_email: string;
  message: string;
  to_name: string;
  reply_to: string;
  subject: string;
}

interface FormData {
  message: string;
  senderName: string;
  senderEmail: string;
}

// Get environment variables
const USER_ID = import.meta.env.VITE_EMAIL_USER_ID;
const SERVICE_ID = import.meta.env.VITE_EMAIL_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAIL_TEMPLATE_ID;
const CONFIRMATION_TEMPLATE_ID = import.meta.env.VITE_EMAIL_CONFIRMATION_TEMPLATE_ID;

// Verify environment variables
console.log('EmailJS Configuration:', {
  userIdExists: !!USER_ID,
  serviceIdExists: !!SERVICE_ID,
  templateIdExists: !!TEMPLATE_ID,
  confirmationTemplate: !!CONFIRMATION_TEMPLATE_ID
});

// Initialize EmailJS with your user ID
emailjs.init(USER_ID);

export async function sendEmail(formData: FormData): Promise<EmailJSResponseStatus[]> {
  try {
    console.log('Starting email send...');
    console.log('Using template ID:', TEMPLATE_ID);
    console.log('Using service ID:', SERVICE_ID);
    
    // Send notification to admin (you)
    const adminTemplateParams: EmailTemplateParams = {
      from_name: formData.senderName,
      from_email: formData.senderEmail,
      to_email: 'rowanstratton1@gmail.com',
      message: formData.message,
      to_name: 'Rowan',
      reply_to: formData.senderEmail,
      subject: `New Contact Request from Portfolio: ${formData.senderName} - ${new Date().toLocaleDateString()}`
    };

        // Send confirmation to user
        const userTemplateParams: EmailTemplateParams = {
          from_name: 'Rowan Stratton',
          from_email: 'rowanstratton1@gmail.com',
          to_email: formData.senderEmail,
          to_name: formData.senderName,
          message: 'Thank you for contacting me! I have received your message and will respond shortly.',
          reply_to: 'rowanstratton1@gmail.com',
          subject: 'Thank you for your message - Rowan Stratton'
        };

    // Send both emails
    const [adminResult, userResult] = await Promise.all([
      emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        adminTemplateParams,
        USER_ID
      ),
      emailjs.send(
        SERVICE_ID,
        CONFIRMATION_TEMPLATE_ID,
        userTemplateParams,
        USER_ID
      )
    ]);

    console.log('Email sent successfully:', { adminResult, userResult });
    /* The `return` statement in the `sendEmail` function is used to return the result of sending
    emails using EmailJS. In this case, the function is returning a Promise that resolves to an
    `EmailJSResponseStatus` object, which represents the status of the email sending process. */
    return [adminResult, userResult];
  } catch (error) {
    console.error('Error details:', {
      error,
      serviceId: SERVICE_ID,
      templateId: TEMPLATE_ID
    });
    throw error;
  }
}