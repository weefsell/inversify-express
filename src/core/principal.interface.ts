export interface Principal {
    details: any;
    isAuthenticated(): Promise<boolean>;
    // Allows content-based auth
    isResourceOwner(resourceId: any): Promise<boolean>;
    // Allows role-based auth
    isInRole(role: string): Promise<boolean>;
}
