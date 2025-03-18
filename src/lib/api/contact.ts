import { supabase } from '@/lib/supabase';

export interface ContactMessage {
  id: string;
  user_id: string;
  user_email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export class ContactService {
  static async addMessage(data: Omit<ContactMessage, 'id' | 'user_id' | 'user_email' | 'status' | 'created_at' | 'updated_at'>) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data: message, error } = await supabase
      .from('contact_messages')
      .insert({
        ...data,
        user_id: user.data.user.id,
        user_email: user.data.user.email,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return message;
  }

  static async listMessages() {
    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return messages;
  }
} 