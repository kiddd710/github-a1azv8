import { EmailClient } from "@azure/communication-email";
import { supabase } from './supabase';
import { config } from './config';

// Initialize email client only if connection string is properly configured
let emailClient: EmailClient | null = null;

try {
  if (config.azure?.communicationServiceConnectionString && 
      config.azure.communicationServiceConnectionString !== 'your_communication_service_connection_string') {
    emailClient = new EmailClient(config.azure.communicationServiceConnectionString);
  } else {
    console.warn('Azure Communication Service not configured - email notifications disabled');
  }
} catch (error) {
  console.error('Failed to initialize email client:', error);
}

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) => {
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      title,
      message,
      link
    }]);

  if (error) throw error;
};

export const sendEmail = async (
  to: string,
  subject: string,
  content: string
) => {
  if (!emailClient) {
    console.warn('Email client not initialized - skipping email send');
    return;
  }

  try {
    const senderAddress = config.email?.senderAddress || 'noreply@projectworkflow.com';
    
    await emailClient.send({
      senderAddress,
      content: {
        subject,
        plainText: content,
        html: `<html><body>${content}</body></html>`
      },
      recipients: {
        to: [{ address: to }]
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error to prevent breaking the app flow
    // Just log it since email sending is not critical
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

export const getUnreadNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};