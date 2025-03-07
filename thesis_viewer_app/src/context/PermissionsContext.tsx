import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

interface ThesisRepositoryPermissions {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
}
  
interface UserManagementPermissions {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
}
  

interface PermissionsContextType {
  thesisRepositoryPermissions: ThesisRepositoryPermissions | null;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
    const [ thesisRepositoryPermissions, setThesisRepositoryPermissions ] = useState<ThesisRepositoryPermissions | null>(null);
    const [ userManagementPermissions, setUserManagementPermissions ] = useState<UserManagementPermissions | null>(null);
    const { session } = useAuth();

    useEffect(() => {
        const fetchThesisRepositoryPermissions = async () => {
        if(!session) return console.error("Session not found!");

        const user = session.user;
        console.log("Current user:", user?.id);

        if (!user?.id) {
            setThesisRepositoryPermissions({ view: false, add: false, edit: false, delete: false });
            return;
        }

        let { data, error } = await supabase
            .from('user_permissions')
            .select("permission_type, permitted")
            .eq('userid', user.id)
            .eq('subsystem', 'ThesisRepository');

        if (error) {
            console.error("Error fetching permissions:", error);
            return;
        }

        if (!data || data.length === 0) {
            console.log("No matching permissions found in database");
            setThesisRepositoryPermissions({ view: false, add: false, edit: false, delete: false });
            return;
        }

        const permissions: ThesisRepositoryPermissions = { view: false, add: false, edit: false, delete: false };

        if(!data) return "No Thesis Repository Permissions fetched!";

        data.forEach(({ permission_type, permitted }) => {
            if (permissions.hasOwnProperty(permission_type)) {
                permissions[permission_type as keyof ThesisRepositoryPermissions] = Boolean(permitted);
            }
        });
    
    setThesisRepositoryPermissions(permissions);
    };

    fetchThesisRepositoryPermissions();
  }, [session]);

  return (
    <PermissionsContext.Provider value={{ thesisRepositoryPermissions }}>
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