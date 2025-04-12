
import { supabase } from "../lib/supabase";
import { NotificationService } from "./NotificationService";

export const ThesisNotificationService = {
  async notifyThesisUpload(thesisTitle: string, uploaderId: string): Promise<void> {
    try {
      // 1. Fetch all librarians and admins
      const { data: staffUsers, error: userError } = await supabase
        .from("users")
        .select("id, role")
        .in("role", ["Admin", "Librarian"]);
      
      if (userError) {
        console.error("Error fetching staff users:", userError);
        return;
      }
      
      if (!staffUsers || staffUsers.length === 0) {
        console.log("No librarians or admins found to notify");
        return;
      }
      
      // 2. Create the notification content
      const notificationContent = `"${thesisTitle}" has been uploaded and requires review.`;
      
      // 3. Create notifications for each staff member
      const notificationPromises = staffUsers.map(user => 
        NotificationService.createNotification({
          user_id: user.id,
          content: notificationContent,
          is_read: false
        })
      );
      
      // Execute all notification creations
      await Promise.all(notificationPromises);
      
      console.log(`Sent thesis upload notifications to ${staffUsers.length} staff members`);
    } catch (error) {
      console.error("Error in notifyThesisUpload:", error);
    }
  }
};