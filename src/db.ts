import Dexie, { type Table } from 'dexie';

export interface Child {
  id?: number;
  uuid: string;
  fullName: string;
  motherName: string;
  birthDate: string;
  birthPlace: string; // Governorate/District
  photoBase64?: string;
  voiceBase64?: string;
  childCryBase64?: string;
  phone?: string;
  createdAt: number;
  lastUpdatedAt: number;
  isSynced: boolean;
}

export interface VaccinationRecord {
  id?: number;
  childUuid: string;
  vaccineKey: string; // e.g., 'BCG', 'Polio1'
  doseNumber: number;
  dateGiven?: string;
  dateScheduled: string;
  customReminderDays?: number; // Days before to remind
  administeredBy?: string;
  location?: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  isSynced: boolean;
}

export interface NotificationMessage {
  id?: number;
  childUuid: string;
  recordId?: number;
  type: 'SMS' | 'VOICE';
  phone: string;
  message: string;
  scheduledFor: string;
  status: 'QUEUED' | 'SENT';
  createdAt: number;
}

export class LuqahiDB extends Dexie {
  children!: Table<Child>;
  vaccinations!: Table<VaccinationRecord>;
  notifications!: Table<NotificationMessage>;

  constructor() {
    super('LuqahiDB');
    this.version(2).stores({
      children: '++id, uuid, fullName, motherName, birthDate, isSynced',
      vaccinations: '++id, childUuid, vaccineKey, status, isSynced',
      notifications: '++id, childUuid, status, scheduledFor'
    }).upgrade(tx => {
      // Handle upgrade logic if needed, but since it's dev we might just clear or it will auto upgrade.
    });
  }
}

export const db = new LuqahiDB();
