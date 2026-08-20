// Admin Portal Configuration
// Endpoint and default credentials configured via .env variables

export const ADMIN_CONFIG = {
  // Secret hash route (e.g., #srit-mgmt-panel)
  endpoint: (import.meta.env.VITE_ADMIN_ENDPOINT as string) || 'srit-mgmt-panel',
  // Configured admin email for verification
  adminEmail: (import.meta.env.VITE_ADMIN_EMAIL as string) || 'admin@srithirumalafoamwash.com',
  // Default/Initial strong password (optional helper)
  adminPassword: (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'Admin@Srithirumala#2024',
};

// Check if a given email is the designated admin
export const isConfiguredAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const adminEmail = ADMIN_CONFIG.adminEmail.trim().toLowerCase();
  return email.trim().toLowerCase() === adminEmail;
};
