// Auth is now handled by the Express backend via JWT cookies.
// This file is kept to avoid breaking residual imports during migration.
// Remove after all usages of `auth`, `signIn`, `signOut` from next-auth are replaced.

export {}
