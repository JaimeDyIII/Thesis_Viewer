export type Permission = {
    subsystem: string;
    permission_type: string;
    permitted: boolean;
}
  
export type PermissionChange = {
    subsystem: string;
    permission_type: string;
    oldValue: boolean;
    newValue: boolean;
}
  
export type UserPermissionsProps = {
    userId: string;
    userName: string;
    currentUserId: string | undefined;
    onPermissionUpdate: (message: string) => void;
}
  