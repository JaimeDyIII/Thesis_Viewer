import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Checkbox,
  Button,
  CircularProgress,
} from "@mui/material";
import { supabase } from "../lib/supabase";
import { addLogEntry, Subsystem, ActionType } from "../components/CheckLogs";

interface Permission {
  subsystem: string;
  permission_type: string;
  permitted: boolean;
}

// Track permission changes
interface PermissionChange {
  subsystem: string;
  permission_type: string;
  oldValue: boolean;
  newValue: boolean;
}

interface UserPermissionsProps {
  userId: string;
  userName: string;
  currentUserId: string | undefined;
  onPermissionUpdate: (message: string) => void;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({
  userId,
  currentUserId,
  onPermissionUpdate,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<PermissionChange[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_permissions")
        .select("subsystem, permission_type, permitted")
        .eq("userid", userId);
      
      if (error) {
        console.error("Error fetching permissions:", error);
      } else {
        setPermissions(data || []);
      }
    } catch (error) {
      console.error("Error in fetchPermissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    subsystem: string, 
    permission_type: string, 
    permitted: boolean
  ) => {
    // Update local state for UI
    setPermissions(prev => 
      prev.map(perm => 
        perm.subsystem === subsystem && perm.permission_type === permission_type
          ? { ...perm, permitted: !permitted }
          : perm
      )
    );
    
    // Track change in pendingChanges
    setPendingChanges(prev => {
      // Check if we already have a pending change for this permission
      const existingChangeIndex = prev.findIndex(
        change => 
          change.subsystem === subsystem && 
          change.permission_type === permission_type
      );
      
      // If this is a revert to original value, remove the pending change
      if (existingChangeIndex !== -1 && prev[existingChangeIndex].oldValue === !permitted) {
        return prev.filter((_, index) => index !== existingChangeIndex);
      }
      
      // If there's an existing change, update its newValue
      if (existingChangeIndex !== -1) {
        const updatedChanges = [...prev];
        updatedChanges[existingChangeIndex].newValue = !permitted;
        return updatedChanges;
      }
      
      // Otherwise add a new pending change
      return [...prev, {
        subsystem,
        permission_type,
        oldValue: permitted,
        newValue: !permitted
      }];
    });
  };

  const saveChanges = async () => {
    if (!currentUserId) {
      onPermissionUpdate("User is not authenticated, cannot save changes");
      return;
    }

    if (pendingChanges.length === 0) {
      onPermissionUpdate("No changes to save");
      return;
    }

    setSaveLoading(true);
    
    try {
      // Group changes by subsystem for better log organization
      const changesBySubsystem = pendingChanges.reduce((acc, change) => {
        if (!acc[change.subsystem]) {
          acc[change.subsystem] = [];
        }
        acc[change.subsystem].push(change);
        return acc;
      }, {} as Record<string, PermissionChange[]>);
      
      // Update permissions in database
      for (const change of pendingChanges) {
        const { error } = await supabase
          .from("user_permissions")
          .update({ permitted: change.newValue })
          .eq("userid", userId)
          .eq("subsystem", change.subsystem)
          .eq("permission_type", change.permission_type);
          
        if (error) {
          console.error("Error updating permission:", error);
          throw new Error("Failed to update permissions");
        }
      }
      
      // Format log entries by subsystem
      const logEntries: Record<string, string[]> = {};
      
      for (const subsystem in changesBySubsystem) {
        logEntries[subsystem] = changesBySubsystem[subsystem].map(change => 
          `${change.newValue ? "Granted" : "Revoked"} ${change.permission_type}`
        );
      }
      
      // Create the final log entry structure
      const changeDetails: Record<string, string> = {};
      
      for (const subsystem in logEntries) {
        changeDetails[subsystem] = logEntries[subsystem].join(", ");
      }
      
      // Log the changes as a single entry
      await addLogEntry(
        Subsystem.USER_MANAGEMENT,
        ActionType.ADD_USER,
        currentUserId,
        null,
        userId,
        null,
        changeDetails
      );
      
      // Clear pending changes
      setPendingChanges([]);
      onPermissionUpdate("Changes saved successfully ✅");
    } catch (error) {
      console.error("Error saving changes:", error);
      onPermissionUpdate("Failed to save changes. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const cancelChanges = () => {
    // Revert permissions state to original values
    setPermissions(prev => {
      const updatedPermissions = [...prev];
      
      pendingChanges.forEach(change => {
        const permIndex = updatedPermissions.findIndex(
          p => p.subsystem === change.subsystem && p.permission_type === change.permission_type
        );
        
        if (permIndex !== -1) {
          updatedPermissions[permIndex] = {
            ...updatedPermissions[permIndex],
            permitted: change.oldValue
          };
        }
      });
      
      return updatedPermissions;
    });
    
    // Clear pending changes
    setPendingChanges([]);
    onPermissionUpdate("Changes cancelled");
  };

  // Group permissions by subsystem
  const permissionsBySubsystem = permissions.reduce((acc, perm) => {
    acc[perm.subsystem] = acc[perm.subsystem] || [];
    acc[perm.subsystem].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Check if any permission has a pending change
  const isPending = (subsystem: string, permission_type: string) => {
    return pendingChanges.some(
      change => 
        change.subsystem === subsystem && 
        change.permission_type === permission_type
    );
  };

  return (
    <Box margin={2}>
      {permissions.length === 0 ? (
        <Typography>No permissions found for this user.</Typography>
      ) : (
        <>
          {Object.entries(permissionsBySubsystem).map(([subsystem, perms]) => (
            <Box key={subsystem} mb={2}>
              <Typography variant="h6">{subsystem}</Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                {perms.map((perm) => {
                  const pending = isPending(subsystem, perm.permission_type);
                  
                  return (
                    <Box 
                      key={perm.permission_type} 
                      display="flex" 
                      alignItems="center"
                      sx={pending ? { 
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      } : {}}
                    >
                      <Checkbox
                        checked={perm.permitted}
                        onChange={() => handlePermissionChange(
                          subsystem,
                          perm.permission_type,
                          perm.permitted
                        )}
                      />
                      {perm.permission_type.charAt(0).toUpperCase() + perm.permission_type.slice(1)}
                      {pending && (
                        <Typography 
                          variant="caption" 
                          sx={{ ml: 1, fontStyle: 'italic', color: 'text.secondary' }}
                        >
                          (unsaved changes)
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
          
          {/* Save/Cancel buttons in the bottom right */}
          {pendingChanges.length > 0 && (
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={cancelChanges}
                variant="outlined"
                color="error"
                disabled={saveLoading}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveChanges}
                variant="contained"
                color="success"
                disabled={saveLoading}
              >
                {saveLoading ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default UserPermissions;