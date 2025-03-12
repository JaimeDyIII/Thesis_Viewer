import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type PermissionsType = {
  [key: string]: boolean
}

interface Permissions extends PermissionsType {
    ThesisRepository_view: boolean;
    ThesisRepository_add: boolean;
    ThesisRepository_edit: boolean;
    ThesisRepository_delete: boolean;
    UserManagement_view: boolean;
    UserManagement_add: boolean;
    UserManagement_edit: boolean;
    UserManagement_delete: boolean;
}

interface PermissionsContextType {
  permissions: Permissions | null;
  permissionLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
    const [ permissions, setPermissions ] = useState<Permissions | null>(null);
    const [ permissionLoading, setPermissionLoading ] = useState(false);
    const { session } = useAuth();

    useEffect(() => {
        const fetchPermissions = async () => {
          setPermissionLoading(true);
          if(!session) return console.error("Session not found!");

          const user = session.user;
          console.log("Current user:", user?.id);

          if (!user?.id) {
              setPermissions({ 
                ThesisRepository_view: false, 
                ThesisRepository_add: false, 
                ThesisRepository_edit: false, 
                ThesisRepository_delete: false,
                UserManagement_view: false,
                UserManagement_add: false,
                UserManagement_edit: false,
                UserManagement_delete: false, 
              });

            return;
          }

          let { data, error } = await supabase
              .from('user_permissions')
              .select("subsystem, permission_type, permitted")
              .eq('userid', user.id);

          if (error) {
              console.error("Error fetching permissions:", error);
              return;
          }

          if (!data || data.length === 0) {
              console.log("No matching permissions found in database");
              setPermissions({ 
                ThesisRepository_view: false, 
                ThesisRepository_add: false, 
                ThesisRepository_edit: false, 
                ThesisRepository_delete: false,
                UserManagement_view: false,
                UserManagement_add: false,
                UserManagement_edit: false,
                UserManagement_delete: false, 
              });

              return;
          }

          const newPermissions: Permissions = { 
            ThesisRepository_view: false, 
            ThesisRepository_add: false, 
            ThesisRepository_edit: false, 
            ThesisRepository_delete: false,
            UserManagement_view: false,
            UserManagement_add: false,
            UserManagement_edit: false,
            UserManagement_delete: false, 
          }

          data.forEach(({ subsystem, permission_type, permitted }) => {
            const permissionKey = `${subsystem}_${permission_type}` as keyof Permissions;
    
            if (permissionKey in newPermissions) {
              newPermissions[permissionKey] = Boolean(permitted);
            }
          });
        
        setPermissions(newPermissions);
        setPermissionLoading(false);
      };

    fetchPermissions();
  }, [session]);

  

  return (
    <PermissionsContext.Provider value={{ permissions, permissionLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};