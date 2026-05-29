import { create } from 'zustand';
import { vaultApi } from '../lib/vault-api';

export type FileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip' | 'image' | 'video' | 'archive' | 'other';
export type Visibility = 'client' | 'internal';
export type ScanStatus = 'scanning' | 'passed' | 'failed' | 'skipped';

export interface AuditLog {
  id: string;
  action: string;
  item: string;
  performedBy: string;
  timestamp: string;
  details: string;
  time?: string;
}

export interface DocumentFeedback {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface DocumentVersion {
  id: string;
  version_number: number;
  file: string;
  file_name: string;
  file_size: number;
  uploaded_by_name: string;
  hash: string;
  created_at: string;
}

export interface DocumentAccessRule {
  type: 'immediate' | 'payment_linked' | 'invoice_linked' | 'date_linked';
  linkedId?: string;
  description: string;
}

export interface Folder {
  id: string;
  name: string;
  parent: string | null;
  client?: string;
  client_name?: string;
  project?: string;
  doc_count: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  content?: string;
  client: string;
  client_name: string;
  project: string;
  category: string;
  document_type: string;
  type: FileType;
  visibility: Visibility;
  scanStatus: ScanStatus;
  currentVersion: number;
  versions: DocumentVersion[];
  feedback?: DocumentFeedback[];
  accessRule: DocumentAccessRule;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  link?: string;
  documentSource?: string;
  google_drive_id?: string;
}

// Stale-data threshold: 30 seconds
const STALE_MS = 30_000;

function isStale(timestamp: number | null): boolean {
  if (!timestamp) return true;
  return Date.now() - timestamp > STALE_MS;
}

/** Lightweight mapper: backend doc → frontend Document */
function mapDocument(d: any): Document {
  const docSource = d.document_source || '';
  let rawType = d.document_type || d.type || '';
  if (!rawType) {
    const nameSource = d.title || d.link || '';
    const match = nameSource.match(/\.([a-z0-9]+)(\?.*)?$/i);
    if (match) rawType = match[1];
  }
  rawType = (rawType || 'pdf').toLowerCase().replace(/^\./, '');

  const normalizedType = docSource === 'google_doc' ? 'docx' :
    docSource === 'google_sheet' ? 'xlsx' :
      docSource === 'google_slide' ? 'pptx' :
        rawType;

  const link = d.link || d.webViewLink || d.document_url || '';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
  const finalLink = link ? (link.startsWith('http') ? link : `${apiBase}${link}`) : '';

  return {
    ...d,
    title: d.title || d.name || 'Untitled Document',
    description: d.description || '',
    content: d.description || d.content || '',
    type: normalizedType as FileType,
    documentSource: docSource,
    google_drive_id: d.google_drive_id || '',
    scanStatus: d.scan_status || d.scanStatus || 'passed',
    accessRule: d.access_rule || d.accessRule || { type: 'immediate', description: '' },
    createdAt: d.created_at || d.createdAt,
    updatedAt: d.updated_at || d.updatedAt,
    accessCount: d.download_count || d.accessCount || 0,
    folderId: d.folder || d.folderId,
    link: finalLink,
    client: d.client_name || d.client || '',
    client_name: d.client_name || d.client || '',
    versions: d.versions || [],
    currentVersion: d.current_version || d.currentVersion || 1,
    visibility: d.visibility || 'client',
    category: d.category || '',
    project: d.project || '',
  };
}

interface VaultStore {
  documents: Document[];
  folders: Folder[];
  auditLogs: AuditLog[];
  
  // Split loading states
  isLoadingDocuments: boolean;
  isLoadingFolders: boolean;
  isLoadingActivity: boolean;
  // Legacy compat — true if ANY is loading
  isLoading: boolean;
  error: string | null;

  // Stale-data timestamps
  _docsFetchedAt: number | null;
  _foldersFetchedAt: number | null;
  _activityFetchedAt: number | null;

  // Actions
  fetchDocuments: (params?: any, force?: boolean) => Promise<void>;
  fetchDocumentById: (id: string) => Promise<void>;
  fetchFolders: (force?: boolean) => Promise<void>;
  fetchActivity: (force?: boolean) => Promise<void>;
  uploadDocument: (doc: any, file: File) => Promise<void>;
  createGoogleDoc: (title: string, clientId: string, type: string, folderId?: string | null) => Promise<void>;
  updateDocumentMetadata: (id: string, updates: Partial<Document>) => Promise<void>;
  uploadNewVersion: (id: string, file: File, uploadedBy: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  batchUpdate: (ids: string[], updates: Partial<Document>) => Promise<void>;

  // Folder Actions
  createFolder: (name: string, parentId: string | null, client?: string, project?: string) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  documents: [],
  folders: [],
  auditLogs: [],
  isLoadingDocuments: false,
  isLoadingFolders: false,
  isLoadingActivity: false,
  isLoading: false,
  error: null,
  _docsFetchedAt: null,
  _foldersFetchedAt: null,
  _activityFetchedAt: null,

  fetchDocuments: async (params, force = false) => {
    // Skip if data is fresh (unless forced or params changed)
    if (!force && !isStale(get()._docsFetchedAt) && get().documents.length > 0 && !params) {
      return;
    }
    set({ isLoadingDocuments: true, isLoading: true });
    try {
      const data = await vaultApi.getDocuments(params);
      if (!Array.isArray(data)) {
        console.warn('[VaultStore] getDocuments returned non-array:', data);
        set({ documents: [], isLoadingDocuments: false, isLoading: get().isLoadingFolders || get().isLoadingActivity });
        return;
      }
      const docs = data.map(mapDocument);
      set({
        documents: docs,
        isLoadingDocuments: false,
        isLoading: get().isLoadingFolders || get().isLoadingActivity,
        _docsFetchedAt: Date.now(),
      });
    } catch (error) {
      console.error('[VaultStore] fetchDocuments error:', error);
      set({
        error: 'Failed to fetch documents',
        isLoadingDocuments: false,
        isLoading: get().isLoadingFolders || get().isLoadingActivity,
      });
    }
  },

  fetchDocumentById: async (id) => {
    set({ isLoadingDocuments: true, isLoading: true });
    try {
      const d = await vaultApi.getDocument(id);
      const mappedDoc = mapDocument(d);
      // Also map versions if present
      if (d.versions) {
        mappedDoc.versions = d.versions.map((v: any) => ({
          id: v.id,
          version_number: v.version_number,
          file: v.file,
          file_name: v.file_name,
          file_size: v.file_size,
          uploaded_by_name: v.uploaded_by_name,
          hash: v.hash,
          created_at: v.created_at
        }));
      }
      set(state => ({
        documents: state.documents.some(doc => doc.id.toString() === id.toString())
          ? state.documents.map(doc => doc.id.toString() === id.toString() ? mappedDoc : doc)
          : [...state.documents, mappedDoc],
        isLoadingDocuments: false,
        isLoading: state.isLoadingFolders || state.isLoadingActivity,
      }));
    } catch (error) {
      set(state => ({
        error: 'Failed to fetch document',
        isLoadingDocuments: false,
        isLoading: state.isLoadingFolders || state.isLoadingActivity,
      }));
    }
  },

  fetchFolders: async (force = false) => {
    if (!force && !isStale(get()._foldersFetchedAt) && get().folders.length > 0) {
      return;
    }
    set({ isLoadingFolders: true, isLoading: true });
    try {
      const data = await vaultApi.getFolders();
      if (!Array.isArray(data)) {
        console.warn('[VaultStore] getFolders returned non-array:', data);
        set({ folders: [], isLoadingFolders: false, isLoading: get().isLoadingDocuments || get().isLoadingActivity });
        return;
      }
      set({
        folders: data.map((f: any) => ({
          ...f,
          createdAt: f.created_at || f.createdAt,
        })),
        isLoadingFolders: false,
        isLoading: get().isLoadingDocuments || get().isLoadingActivity,
        _foldersFetchedAt: Date.now(),
      });
    } catch (error) {
      console.error('[VaultStore] fetchFolders error:', error);
      set({
        error: 'Failed to fetch folders',
        isLoadingFolders: false,
        isLoading: get().isLoadingDocuments || get().isLoadingActivity,
      });
    }
  },

  fetchActivity: async (force = false) => {
    if (!force && !isStale(get()._activityFetchedAt) && get().auditLogs.length > 0) {
      return;
    }
    set({ isLoadingActivity: true, isLoading: true });
    try {
      const data = await vaultApi.getActivity();
      const logs = Array.isArray(data) ? data.map((log: any) => ({
        id: log.id || log.pk || String(Math.random()),
        action: log.action || log.event_type || 'unknown',
        item: log.item || log.document_title || log.target || '',
        performedBy: log.performedBy || log.performed_by || log.user || log.user_name || log.admin_name || 'Unknown',
        timestamp: log.timestamp || log.created_at || new Date().toISOString(),
        details: log.details || log.description || '',
        time: log.time || '',
      })) : [];
      set({
        auditLogs: logs,
        isLoadingActivity: false,
        isLoading: get().isLoadingDocuments || get().isLoadingFolders,
        _activityFetchedAt: Date.now(),
      });
    } catch (error) {
      console.error('[VaultStore] fetchActivity error:', error);
      set({
        error: 'Failed to fetch activity',
        isLoadingActivity: false,
        isLoading: get().isLoadingDocuments || get().isLoadingFolders,
      });
    }
  },

  uploadDocument: async (docData, file) => {
    set({ isLoadingDocuments: true, isLoading: true });
    try {
      await vaultApi.uploadDocument(docData, file);
      // Force re-fetch after mutation
      await get().fetchDocuments(undefined, true);
    } catch (error) {
      set(state => ({
        error: 'Failed to upload document',
        isLoadingDocuments: false,
        isLoading: state.isLoadingFolders || state.isLoadingActivity,
      }));
    }
  },

  createGoogleDoc: async (title, clientId, type, folderId = null) => {
    set({ isLoadingDocuments: true, isLoading: true });
    try {
      await vaultApi.createGoogleDoc({ title, client_id: clientId, type, folder_id: folderId });
      await get().fetchDocuments(undefined, true);
    } catch (error) {
      set(state => ({
        error: 'Failed to create Google Doc',
        isLoadingDocuments: false,
        isLoading: state.isLoadingFolders || state.isLoadingActivity,
      }));
    }
  },

  updateDocumentMetadata: async (id, updates) => {
    try {
      await vaultApi.updateDocument(id, updates);
      // Optimistic: update in-place instead of full re-fetch
      // If description is updated, make sure to sync it to content as well!
      const contentUpdate = updates.description !== undefined ? { content: updates.description } : {};
      set(state => ({
        documents: state.documents.map(d =>
          d.id.toString() === id.toString() ? { ...d, ...updates, ...contentUpdate } : d
        ),
      }));
    } catch (error) {
      set({ error: 'Failed to update document' });
    }
  },

  uploadNewVersion: async (id, file, uploadedBy) => {
    // API call for version upload
  },

  deleteDocument: async (id) => {
    try {
      await vaultApi.deleteDocument(id);
      // Optimistic removal
      set(state => ({ documents: state.documents.filter(d => d.id !== id) }));
    } catch (error) {
      set({ error: 'Failed to delete document' });
    }
  },

  toggleVisibility: async (id) => {
    const doc = get().documents.find(d => d.id === id);
    const newVisibility = doc?.visibility === 'client' ? 'internal' : 'client';
    try {
      await vaultApi.updateDocument(id, { visibility: newVisibility });
      // Optimistic update
      set(state => ({
        documents: state.documents.map(d =>
          d.id === id ? { ...d, visibility: newVisibility as Visibility } : d
        ),
      }));
    } catch (error) {
      set({ error: 'Failed to toggle visibility' });
    }
  },

  batchUpdate: async (ids, updates) => {
    try {
      await vaultApi.batchUpdate(ids, updates);
      await get().fetchDocuments(undefined, true);
    } catch (error) {
      set({ error: 'Failed to batch update' });
    }
  },

  createFolder: async (name, parent, client, project) => {
    try {
      await vaultApi.createFolder({ name, parent: parent || undefined, client });
      await get().fetchFolders(true);
    } catch (error) {
      set({ error: 'Failed to create folder' });
    }
  },

  updateFolder: async (id, updates) => {
    // API call
  },

  deleteFolder: async (id) => {
    // API call
  }
}));
