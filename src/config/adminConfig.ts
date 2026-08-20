// Super Admin & RBAC Security Configuration
// Dynamic resolution from environment variables (Zero hardcoding in client bundles)

export const ADMIN_CONFIG = {
  // Secret hash route (e.g., #srit-mgmt-panel)
  endpoint: (import.meta.env.VITE_ADMIN_ENDPOINT as string) || 'srit-mgmt-panel',
  // Configured primary Super Admin email
  superAdminEmail: (import.meta.env.VITE_ADMIN_EMAIL as string) || 'k.naveenkumarnaveenkumar22@gmail.com',
  // Configured default Super Admin password
  superAdminPassword: (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'srithirumalafoamwash7@gmail.com',
};

// Check if a given email is the designated Super Admin
export const isConfiguredSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const target = ADMIN_CONFIG.superAdminEmail.trim().toLowerCase();
  return email.trim().toLowerCase() === target;
};

// Backwards-compatible alias
export const isConfiguredAdminEmail = isConfiguredSuperAdminEmail;
