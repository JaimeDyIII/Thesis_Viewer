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
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: Permissions = {
  ThesisRepository_view: false, 
  ThesisRepository_add: false, 
  ThesisRepository_edit: false, 
  ThesisRepository_delete: false,
  UserManagement_view: false,
  UserManagement_add: false,
  UserManagement_edit: false,
  UserManagement_delete: false, 
};

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
    const [ permissions, setPermissions ] = useState<Permissions | null>(null);
    const [ permissionLoading, setPermissionLoading ] = useState(false);
    const { session } = useAuth();

    const fetchPermissions = async () => {
      setPermissionLoading(true);
      if(!session) {
        setPermissions(DEFAULT_PERMISSIONS);
        setPermissionLoading(false);
        return;
      }
  
      const user = session.user;
  
      if (!user?.id) {
        setPermissions(DEFAULT_PERMISSIONS);
        setPermissionLoading(false);
        return;
      }
  
      try {
        const { data, error } = await supabase
          .from('user_permissions')
          .select("subsystem, permission_type, permitted")
          .eq('userid', user.id);
  
        if (error) {
          console.error("Error fetching permissions:", error);
          setPermissionLoading(false);
          return;
        }
  
        const newPermissions: Permissions = { ...DEFAULT_PERMISSIONS };
  
        if (data && data.length > 0) {
          data.forEach(({ subsystem, permission_type, permitted }) => {
            const permissionKey = `${subsystem}_${permission_type}` as keyof Permissions;
            
            if (permissionKey in newPermissions) {
              newPermissions[permissionKey] = Boolean(permitted);
            }
          });
        }
        
        setPermissions(newPermissions);
      } catch (err) {
        console.error("Unexpected error fetching permissions:", err);
      } finally {
        setPermissionLoading(false);
      }
    };

    const refreshPermissions = async () => {
      console.log("Refreshing permissions...");
      await fetchPermissions();
    };

    useEffect(() => {
      if (session) {
        fetchPermissions();
      }
  
      const permissionsSubscription = supabase
        .channel('user_permissions_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_permissions',
            filter: session?.user?.id ? `userid=eq.${session.user.id}` : undefined
          }, 
          async () => {
            await fetchPermissions();
          }
        )
        .subscribe();
  
      return () => {
        permissionsSubscription.unsubscribe();
      };
    }, [session?.user?.id]);

  return (
    <PermissionsContext.Provider value={{ permissions, permissionLoading, refreshPermissions }}>
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