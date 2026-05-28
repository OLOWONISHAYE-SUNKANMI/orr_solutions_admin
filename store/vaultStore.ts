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
  project?: string;
  doc_count: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
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
}

interface VaultStore {
  documents: Document[];
  folders: Folder[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDocuments: (params?: any) => Promise<void>;
  fetchDocumentById: (id: string) => Promise<void>;
  fetchFolders: () => Promise<void>;
  fetchActivity: () => Promise<void>;
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
  isLoading: false,
  error: null,

  fetchDocuments: async (params) => {
    set({ isLoading: true });
    try {
      const data = await vaultApi.getDocuments(params);
      if (!Array.isArray(data)) {
        console.warn('[VaultStore] getDocuments returned non-array:', data);
        set({ documents: [], isLoading: false });
        return;
      }
      // Map backend fields to frontend interface if necessary
      const docs = data.map((d: any) => {
        let rawType = d.document_type || d.type;

        // If type is missing, try to detect from title or link
        if (!rawType) {
          const nameSource = d.title || d.link || d.webViewLink || '';
          const match = nameSource.match(/\.([a-z0-9]+)(\?.*)?$/i);
          if (match) rawType = match[1];
        }

        rawType = (rawType || 'pdf').toLowerCase().replace(/^\./, '');

        // Keep original document_source to distinguish between native and uploaded files
        const docSource = d.document_source;

        const normalizedType = docSource === 'google_doc' ? 'docx' :
          docSource === 'google_sheet' ? 'xlsx' :
            docSource === 'google_slide' ? 'pptx' :
              rawType;

        // Construct a reliable link - MUST come from backend
        const link = d.link || d.webViewLink || d.document_url || '';
        const finalLink = link ? (link.startsWith('http') ? link : `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}${link}`) : '';

        // Safely build accessRule with defaults
        const accessRule = d.access_rule || d.accessRule || { type: 'immediate', description: '' };

        return {
          ...d,
          title: d.title || d.name || 'Untitled Document',
          content: d.description || '',
          type: normalizedType,
          documentSource: docSource, // Store this explicitly
          scanStatus: d.scan_status || d.scanStatus || 'passed',
          accessRule,
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
      });
      set({ documents: docs, isLoading: false });
    } catch (error) {
      console.error('[VaultStore] fetchDocuments error:', error);
      set({ error: 'Failed to fetch documents', isLoading: false });
    }
  },

  fetchDocumentById: async (id) => {
    set({ isLoading: true });
    try {
      const d = await vaultApi.getDocument(id);
      let rawType = (d.document_type || d.type || 'pdf').toLowerCase().replace(/^\./, '');
      const docSource = d.document_source;

      const normalizedType = docSource === 'google_doc' ? 'docx' :
        docSource === 'google_sheet' ? 'xlsx' :
          docSource === 'google_slide' ? 'pptx' :
            rawType;

      // Construct a reliable link - MUST come from backend
      const link = d.link || d.webViewLink || d.document_url || '';
      const finalLink = link ? (link.startsWith('http') ? link : `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}${link}`) : '';

      const mappedDoc = {
        ...d,
        content: d.description || '',
        type: normalizedType,
        documentSource: docSource,
        scanStatus: d.scan_status || d.scanStatus || 'passed',
        accessRule: d.access_rule || d.accessRule || { type: 'immediate', description: '' },
        createdAt: d.created_at || d.createdAt,
        updatedAt: d.updated_at || d.updatedAt,
        accessCount: d.download_count || d.accessCount || 0,
        folderId: d.folder || d.folderId,
        link: finalLink,
        client: d.client_name || d.client || '',
        client_name: d.client_name || d.client || '',
        currentVersion: d.current_version || d.currentVersion || 1,
        visibility: d.visibility || 'client',
        category: d.category || '',
        project: d.project || '',
        versions: (d.versions || []).map((v: any) => ({
          id: v.id,
          version_number: v.version_number,
          file: v.file,
          file_name: v.file_name,
          file_size: v.file_size,
          uploaded_by_name: v.uploaded_by_name,
          hash: v.hash,
          created_at: v.created_at
        }))
      };
      set(state => ({
        documents: state.documents.some(doc => doc.id.toString() === id.toString())
          ? state.documents.map(doc => doc.id.toString() === id.toString() ? mappedDoc : doc)
          : [...state.documents, mappedDoc],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to fetch document', isLoading: false });
    }
  },

  fetchFolders: async () => {
    set({ isLoading: true });
    try {
      const data = await vaultApi.getFolders();
      if (!Array.isArray(data)) {
        console.warn('[VaultStore] getFolders returned non-array:', data);
        set({ folders: [], isLoading: false });
        return;
      }
      set({
        folders: data.map((f: any) => ({
          ...f,
          createdAt: f.created_at || f.createdAt,
        })),
        isLoading: false
      });
    } catch (error) {
      console.error('[VaultStore] fetchFolders error:', error);
      set({ error: 'Failed to fetch folders', isLoading: false });
    }
  },

  fetchActivity: async () => {
    set({ isLoading: true });
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
      set({ auditLogs: logs, isLoading: false });
    } catch (error) {
      console.error('[VaultStore] fetchActivity error:', error);
      set({ error: 'Failed to fetch activity', isLoading: false });
    }
  },

  uploadDocument: async (docData, file) => {
    set({ isLoading: true });
    try {
      await vaultApi.uploadDocument(docData, file);
      await get().fetchDocuments();
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to upload document', isLoading: false });
    }
  },

  createGoogleDoc: async (title, clientId, type, folderId = null) => {
    set({ isLoading: true });
    try {
      await vaultApi.createGoogleDoc({ title, client_id: clientId, type, folder_id: folderId });
      await get().fetchDocuments();
    } catch (error) {
      set({ error: 'Failed to create Google Doc', isLoading: false });
    }
  },

  updateDocumentMetadata: async (id, updates) => {
    try {
      await vaultApi.updateDocument(id, updates);
      await get().fetchDocuments();
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
      await get().fetchDocuments();
    } catch (error) {
      set({ error: 'Failed to toggle visibility' });
    }
  },

  batchUpdate: async (ids, updates) => {
    try {
      await vaultApi.batchUpdate(ids, updates);
      await get().fetchDocuments();
    } catch (error) {
      set({ error: 'Failed to batch update' });
    }
  },

  createFolder: async (name, parent, client, project) => {
    try {
      await vaultApi.createFolder({ name, parent: parent || undefined, client });
      await get().fetchFolders();
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
