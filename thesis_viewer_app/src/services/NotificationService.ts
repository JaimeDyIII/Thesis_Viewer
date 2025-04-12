// services/NotificationService.ts
import { supabase } from "../lib/supabase";

// Types
interface NotificationData {
  user_id: string;
  content: string;
  is_read: boolean;
}

export const NotificationService = {
  /**
   * Create a new notification for a user
   */
  async createNotification(notification: NotificationData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("Notification")
        .insert(notification);
      
      return !error;
    } catch (error) {
      console.error("Error creating notification:", error);
      return false;
    }
  },

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("Notification") // Fixed case
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("Notification") // Fixed case
        .update({ is_read: true })
        .eq("id", notificationId);
      
      return !error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("Notification") // Fixed case
        .update({ is_read: true })
        .eq("user_id", userId);
      
      return !error;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }
};