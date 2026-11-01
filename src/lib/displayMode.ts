import { triggerGlobalDisplayNotice } from '@/context/DisplayModeContext';

export class DisplayModeRestrictedError extends Error {
  constructor(actionName: string = 'Aksi ini') {
    super(`[Mode Display] ${actionName} dinonaktifkan pada dashboard display ini.`);
    this.name = 'DisplayModeRestrictedError';
  }
}

/**
 * Mencegah aksi mutasi data (Create, Update, Delete) pada mode display
 * dan memicu popup modal pemberitahuan display mode secara otomatis.
 */
export function enforceReadOnly(actionName: string): void {
  triggerGlobalDisplayNotice(actionName);
  throw new DisplayModeRestrictedError(actionName);
}
