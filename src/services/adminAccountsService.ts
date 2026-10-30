import { supabase } from '@/lib/supabase';

export interface AdminAccount {
  id?: string;
  email: string;
  password?: string;
  name: string;
  role: string;
}

const STORAGE_ACCOUNTS_KEY = 'syafira_admin_accounts_v1';

// Default / Seeded accounts
export const SEEDED_ADMINS: AdminAccount[] = [
  {
    email: 'prabandarisyafira@gmail.com',
    password: '@syafira123',
    name: 'Syafira Prabandari',
    role: 'Super Admin',
  },
  {
    email: 'daryassatya@gmail.com',
    password: 'tititsayabesar123',
    name: 'Darya Satya',
    role: 'Super Admin',
  },
];

function getStoredAdmins(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with seeded to guarantee daryassatya and prabandari exist
        const emails = new Set(parsed.map((a: AdminAccount) => a.email.toLowerCase()));
        const merged = [...parsed];
        for (const s of SEEDED_ADMINS) {
          if (!emails.has(s.email.toLowerCase())) {
            merged.push(s);
          }
        }
        return merged;
      }
    }
  } catch {
    // ignore
  }
  return SEEDED_ADMINS;
}

function saveStoredAdmins(admins: AdminAccount[]) {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(admins));
  } catch {
    // ignore
  }
}

export const adminAccountsService = {
  /**
   * Verify credentials against Supabase admin_accounts or local persistent accounts.
   */
  async verifyLogin(emailInput: string, passwordInput: string): Promise<AdminAccount | null> {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // 1. Try querying Supabase admin_accounts table
    try {
      const { data, error } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role || 'Super Admin',
        };
      }
    } catch {
      // Supabase table not created yet or RLS restriction, fallback to local
    }

    // 2. Check local accounts (including SEEDED_ADMINS)
    const localAdmins = getStoredAdmins();
    const found = localAdmins.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.password === cleanPassword
    );

    if (found) {
      return {
        id: found.id || cleanEmail,
        email: found.email,
        name: found.name,
        role: found.role,
      };
    }

    return null;
  },

  /**
   * Update admin account credentials (email and/or password) with old password verification.
   */
  async updateCredentials(params: {
    currentEmail: string;
    currentPassword: string;
    newEmail?: string;
    newPassword?: string;
    newName?: string;
  }): Promise<{ success: boolean; updatedUser?: AdminAccount; error?: string }> {
    const { currentEmail, currentPassword, newEmail, newPassword, newName } = params;

    const cleanCurrentEmail = currentEmail.trim().toLowerCase();
    const cleanCurrentPass = currentPassword.trim();
    const targetEmail = (newEmail?.trim().toLowerCase()) || cleanCurrentEmail;
    const targetPass = newPassword?.trim() ? newPassword.trim() : cleanCurrentPass;

    // Verify current password first
    const localAdmins = getStoredAdmins();
    const foundIdx = localAdmins.findIndex(
      (a) => a.email.toLowerCase() === cleanCurrentEmail
    );

    let isPasswordValid = false;

    // Verify against Supabase if exists
    try {
      const { data } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('email', cleanCurrentEmail)
        .eq('password', cleanCurrentPass)
        .maybeSingle();

      if (data) isPasswordValid = true;
    } catch {
      // ignore
    }

    if (!isPasswordValid && foundIdx !== -1) {
      if (localAdmins[foundIdx].password === cleanCurrentPass) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Password lama (saat ini) yang Anda masukkan salah. Silakan periksa kembali.',
      };
    }

    const updatedAccount: AdminAccount = {
      email: targetEmail,
      password: targetPass,
      name: newName?.trim() || (foundIdx !== -1 ? localAdmins[foundIdx].name : 'Admin'),
      role: 'Super Admin',
    };

    // Update in Supabase
    try {
      await supabase
        .from('admin_accounts')
        .upsert(
          {
            email: targetEmail,
            password: targetPass,
            name: updatedAccount.name,
            role: updatedAccount.role,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
    } catch {
      // Continue to local update
    }

    // Update in Local Storage
    const updatedList = localAdmins.map((a) =>
      a.email.toLowerCase() === cleanCurrentEmail ? updatedAccount : a
    );
    if (!updatedList.some((a) => a.email.toLowerCase() === targetEmail)) {
      updatedList.push(updatedAccount);
    }
    saveStoredAdmins(updatedList);

    return {
      success: true,
      updatedUser: {
        email: updatedAccount.email,
        name: updatedAccount.name,
        role: updatedAccount.role,
      },
    };
  },
};
