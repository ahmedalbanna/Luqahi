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
  administeredBy?: string;
  location?: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  isSynced: boolean;
}

export class LuqahiDB extends Dexie {
  children!: Table<Child>;
  vaccinations!: Table<VaccinationRecord>;

  constructor() {
    super('LuqahiDB');
    this.version(1).stores({
      children: '++id, uuid, fullName, motherName, birthDate, isSynced',
      vaccinations: '++id, childUuid, vaccineKey, status, isSynced'
    });
  }
}

export const db = new LuqahiDB();
