import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Download, 
  Printer, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Layers, 
  FolderCheck, 
  X, 
  Eye, 
  ArrowUpDown,
  Tag,
  Paperclip,
  Check,
  AlertCircle,
  Settings,
  History,
  FileCheck2,
  PlusCircle,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Project, TaskItem, ManagedDocument, ManagedDocType, ManagedDocTypeInfo, DocumentAttachment } from '../types';
import { DocTypeManagementModal } from './DocTypeManagementModal';
import { getDocTypeColorStyle } from '../utils/docTypeStyles';
import { getStoredManagedDocTypes, DEFAULT_MANAGED_DOC_TYPES } from '../services/taskStorage';

/**
 * Helper: Trả về danh sách tất cả file đính kèm / các lần sửa đổi của một văn bản
 * Đảm bảo tương thích ngược 100% với các trường cũ (driveFileName, driveFileLink)
 */
export const getDocAttachments = (doc: ManagedDocument): DocumentAttachment[] => {
  if (doc.attachments && Array.isArray(doc.attachments) && doc.attachments.length > 0) {
    return doc.attachments;
  }
  if (doc.driveFileName || doc.driveFileLink) {
    return [
      {
        id: `${doc.id}-att-1`,
        fileName: doc.driveFileName || 'Tệp đính kèm',
        fileLink: doc.driveFileLink,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        versionName: 'Lần 1 (Gốc)',
        uploadedAt: doc.uploadedAt || doc.issueDate,
        note: 'Bản ban đầu',
        isPrimary: true
      }
    ];
  }
  return [];
};

/**
 * Helper: Format ngày của bản sửa đổi (hiển thị dạng DD/MM/YYYY)
 */
export const formatRevisionDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  if (dateStr.length >= 10 && dateStr.includes('-')) {
    const parts = dateStr.substring(0, 10).split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return dateStr;
};

/**
 * Helper: Lấy ngày hôm nay định dạng YYYY-MM-DD cho input type="date"
 */
export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Helper: Kiểm tra chính xác loại văn bản
 * Xử lý chặt chẽ để khi người dùng ấn lọc nhanh "Quyết định" thì CHỈ các văn bản Quyết định được hiển thị,
 * không bị lẫn các văn bản khác (như Tờ trình, Công văn, Biên bản...)
 */
export const isDocTypeMatch = (doc: ManagedDocument, targetTypeId: string): boolean => {
  if (!targetTypeId || targetTypeId === 'all') return true;
  const dType = (doc.docType || '').toLowerCase().trim();
  if (!dType) return false;
  const target = targetTypeId.toLowerCase().trim();

  // 1. So khớp ID trực tiếp
  if (dType === target) return true;

  const normalize = (t: string) => {
    if (t === 'qd' || t === 'qđ' || t === 'quyết định') return 'quyet_dinh';
    if (t === 'ttr' || t === 'tờ trình') return 'to_trinh';
    if (t === 'cv' || t === 'công văn') return 'cong_van';
    if (t === 'tb' || t === 'thông báo') return 'thong_bao';
    if (t === 'bb' || t === 'biên bản' || t === 'bbnt') return 'bien_ban';
    if (t === 'hd' || t === 'hđ' || t === 'hợp đồng') return 'hop_dong';
    if (t === 'gp' || t === 'giấy phép') return 'giay_phep';
    if (t === 'bc' || t === 'báo cáo') return 'bao_cao';
    if (t === 'ct' || t === 'chỉ thị') return 'chi_thi';
    if (t === 'bv' || t === 'bản vẽ') return 'ban_ve';
    if (t === 'hdon' || t === 'hđơn' || t === 'hóa đơn') return 'hoa_don';
    return t;
  };

  const normDocType = normalize(dType);
  const normTarget = normalize(target);
  return normDocType === normTarget;
};

interface DocumentManagementBoardProps {
  projects: Project[];
  tasks: TaskItem[];
  standaloneDocs: ManagedDocument[];
  docTypes?: ManagedDocTypeInfo[];
  initialProjectId?: string;
  initialSearchTerm?: string;
  onAddDocument: (doc: Omit<ManagedDocument, 'id'>) => void;
  onUpdateDocument: (doc: ManagedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onAddDocType?: (newType: Omit<ManagedDocTypeInfo, 'id'>) => string;
  onUpdateDocType?: (updatedType: ManagedDocTypeInfo) => void;
  onDeleteDocType?: (typeId: string, reassignToId?: string) => void;
  onResetDocTypes?: () => void;
  onOpenScanModal?: () => void;
  isDriveConnected?: boolean;
}

export const COMMON_DEPARTMENTS = [
  'Ban Giám đốc',
  'Ban Quản lý Dự án',
  'Phòng Kỹ thuật - Vận hành',
  'Phòng Kế hoạch - Kinh doanh',
  'Phòng Kế toán - Tài chính',
  'Phòng Tổ chức - Hành chính',
  'Ban An toàn - Môi trường',
  'Đơn vị Tư vấn Giám sát',
  'Nhà thầu thi công',
  'Cảng vụ / Cơ quan nhà nước'
];

export const DocumentManagementBoard: React.FC<DocumentManagementBoardProps> = ({
  projects,
  tasks,
  standaloneDocs,
  docTypes,
  initialProjectId,
  initialSearchTerm,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onAddDocType,
  onUpdateDocType,
  onDeleteDocType,
  onResetDocTypes,
  onOpenScanModal,
  isDriveConnected
}) => {
  // Document Types State (sử dụng prop từ App hoặc fallback LocalStorage)
  const [localDocTypes, setLocalDocTypes] = useState<ManagedDocTypeInfo[]>(() => getStoredManagedDocTypes());
  const activeDocTypes = docTypes && docTypes.length > 0 ? docTypes : localDocTypes;

  const [isDocTypeModalOpen, setIsDocTypeModalOpen] = useState(false);

  // Helper tra cứu loại văn bản linh hoạt
  const getTypeInfo = (typeId: string): { name: string; code: string; color: string } => {
    const found = activeDocTypes.find(t => t.id === typeId);
    if (found) return found;
    return {
      name: typeId === 'khac' ? 'Khác' : (typeId || 'Chưa phân loại'),
      code: (typeId || 'K').slice(0, 4).toUpperCase(),
      color: 'slate'
    };
  };

  const handleInternalAddDocType = (newType: Omit<ManagedDocTypeInfo, 'id'>): string => {
    if (onAddDocType) {
      return onAddDocType(newType);
    }
    const newId = `dt-${Date.now()}`;
    const created: ManagedDocTypeInfo = { ...newType, id: newId };
    setLocalDocTypes(prev => {
      const updated = [...prev, created];
      localStorage.setItem('pm_managed_doc_types', JSON.stringify(updated));
      return updated;
    });
    return newId;
  };

  const handleInternalUpdateDocType = (updated: ManagedDocTypeInfo) => {
    if (onUpdateDocType) {
      onUpdateDocType(updated);
      return;
    }
    setLocalDocTypes(prev => {
      const nextList = prev.map(t => t.id === updated.id ? updated : t);
      localStorage.setItem('pm_managed_doc_types', JSON.stringify(nextList));
      return nextList;
    });
  };

  const handleInternalDeleteDocType = (typeId: string, reassignToId: string = 'khac') => {
    if (onDeleteDocType) {
      onDeleteDocType(typeId, reassignToId);
      return;
    }
    setLocalDocTypes(prev => {
      const nextList = prev.filter(t => t.id !== typeId);
      localStorage.setItem('pm_managed_doc_types', JSON.stringify(nextList));
      return nextList;
    });
  };

  const handleInternalResetDocTypes = () => {
    if (onResetDocTypes) {
      onResetDocTypes();
      return;
    }
    if (window.confirm('Khôi phục danh mục loại văn bản về mặc định ban đầu?')) {
      setLocalDocTypes(DEFAULT_MANAGED_DOC_TYPES);
      localStorage.setItem('pm_managed_doc_types', JSON.stringify(DEFAULT_MANAGED_DOC_TYPES));
    }
  };

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'standalone' | 'project_detail'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [hasFileFilter, setHasFileFilter] = useState<'all' | 'with_file' | 'no_file'>('all');

  // Đồng bộ khi prop initialProjectId hoặc initialSearchTerm từ ngoài truyền vào thay đổi (ví dụ khi click từ Dự án chi tiết sang)
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  useEffect(() => {
    if (initialSearchTerm !== undefined) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ManagedDocument | null>(null);

  // Form Fields
  const [docNumber, setDocNumber] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<ManagedDocType>('to_trinh');
  const [department, setDepartment] = useState('Ban Quản lý Dự án');
  const [customDepartment, setCustomDepartment] = useState('');
  const [projectId, setProjectId] = useState('');
  const [issueDay, setIssueDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [issueMonth, setIssueMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [issueYear, setIssueYear] = useState(new Date().getFullYear().toString());
  const [signer, setSigner] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [note, setNote] = useState('');
  
  // Danh sách các tệp đính kèm / các lần sửa đổi trong Modal chính
  const [modalAttachments, setModalAttachments] = useState<DocumentAttachment[]>([]);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Quick Attachment Modal (Thêm nhanh lần sửa đổi / đính kèm trực tiếp trên từng dòng)
  const [quickAttachDoc, setQuickAttachDoc] = useState<ManagedDocument | null>(null);
  const [quickDocNumber, setQuickDocNumber] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDocType, setQuickDocType] = useState<string>('quyet_dinh');
  const [quickVersionName, setQuickVersionName] = useState('');
  const [quickRevisionDate, setQuickRevisionDate] = useState(getTodayDateString());
  const [quickFileName, setQuickFileName] = useState('');
  const [quickFileLink, setQuickFileLink] = useState('');
  const [quickFileSize, setQuickFileSize] = useState<number | undefined>(undefined);
  const [quickNote, setQuickNote] = useState('');
  const [quickIsPrimary, setQuickIsPrimary] = useState(true);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // 1. TỔNG HỢP TOÀN BỘ TÀI LIỆU TRÊN TOÀN HỆ THỐNG
  const allDocuments = useMemo<ManagedDocument[]>(() => {
    const list: ManagedDocument[] = [...standaloneDocs];

    // Thu thập thêm tài liệu từ các mục "Chi tiết" của tất cả các dự án (Chỉ khi người dùng đã tự phân loại docType)
    projects.forEach(p => {
      if (p.detailItems && p.detailItems.length > 0) {
        p.detailItems.forEach(item => {
          if (item.docType && item.docType.trim() !== '') {
            const fullNumber = [item.docNumber, item.docText].filter(Boolean).join('');

            list.push({
              id: `proj-det-${item.id}`,
              docNumber: fullNumber || '',
              title: item.content || `Tài liệu dự án ${p.name}`,
              docType: item.docType as ManagedDocType,
              department: p.manager || 'Ban Quản lý Dự án',
              projectId: p.id,
              projectName: p.name,
              issueDay: item.day,
              issueMonth: item.month,
              issueYear: item.year || p.startYear,
              issueDate: item.year && item.month ? `${item.year}-${item.month.padStart(2, '0')}-${(item.day || '01').padStart(2, '0')}` : undefined,
              storageLocation: p.detailStorageLocation || p.storageLocation,
              note: p.detailNote,
              status: 'effective',
              driveFileId: item.driveFileId,
              driveFileName: item.driveFileName,
              driveFileLink: item.driveFileLink,
              driveFilePath: item.driveFilePath,
              source: 'project_detail',
              sourceId: item.id
            });
          }
        });
      }

      // Thu thập từ các phần "Tài liệu kèm theo" (Chỉ khi người dùng đã tự phân loại docType)
      if (p.attachedSections && p.attachedSections.length > 0) {
        p.attachedSections.forEach(sec => {
          (sec.items || []).forEach(item => {
            if (item.docType && item.docType.trim() !== '') {
              const fullNumber = [item.docNumber, item.docText].filter(Boolean).join('');

              list.push({
                id: `sec-doc-${item.id}`,
                docNumber: fullNumber || '',
                title: item.content || `Tài liệu kèm theo - ${sec.title}`,
                docType: item.docType as ManagedDocType,
                department: p.manager || 'Ban Quản lý Dự án',
                projectId: p.id,
                projectName: p.name,
                issueDay: item.day,
                issueMonth: item.month,
                issueYear: item.year || p.startYear,
                issueDate: item.year && item.month ? `${item.year}-${item.month.padStart(2, '0')}-${(item.day || '01').padStart(2, '0')}` : undefined,
                storageLocation: sec.storageLocation || p.storageLocation,
                note: sec.note,
                status: 'effective',
                driveFileId: item.driveFileId,
                driveFileName: item.driveFileName,
                driveFileLink: item.driveFileLink,
                driveFilePath: item.driveFilePath,
                source: 'attached_doc',
                sourceId: item.id
              });
            }
          });
        });
      }
    });

    // Thu thập từ scanned documents trong Tasks
    tasks.forEach(t => {
      if (t.documents && t.documents.length > 0) {
        t.documents.forEach(doc => {
          let detectedType: ManagedDocType = 'khac';
          if (doc.type === 'contract') detectedType = 'hop_dong';
          else if (doc.type === 'acceptance') detectedType = 'bien_ban';
          else if (doc.type === 'drawing') detectedType = 'ban_ve';
          else if (doc.type === 'invoice') detectedType = 'hoa_don';
          else if (doc.type === 'report') detectedType = 'bao_cao';

          const proj = projects.find(p => p.id === t.projectId);

          list.push({
            id: `task-scan-${doc.id}`,
            docNumber: doc.name.split('.')[0] || 'Văn bản scan',
            title: doc.description || doc.name,
            docType: detectedType,
            department: proj?.manager || 'Ban Quản lý Dự án',
            projectId: t.projectId,
            projectName: proj?.name || 'Dự án',
            issueDate: doc.uploadDate,
            signer: t.assignee,
            status: 'effective',
            driveFileId: doc.driveFileId,
            driveFileName: doc.name,
            driveFileLink: doc.driveViewLink,
            fileSize: doc.fileSize,
            uploadedAt: doc.uploadDate,
            source: 'task_scan',
            sourceId: doc.id
          });
        });
      }
    });

    return list;
  }, [standaloneDocs, projects, tasks]);

  // Bộ danh sách các năm xuất hiện
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add('2026');
    years.add('2025');
    allDocuments.forEach(d => {
      if (d.issueYear) years.add(d.issueYear);
      if (d.issueDate) {
        const y = d.issueDate.substring(0, 4);
        if (y.length === 4) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  }, [allDocuments]);

  // Bộ danh sách các phòng ban xuất hiện
  const availableDepartments = useMemo(() => {
    const deps = new Set<string>(COMMON_DEPARTMENTS);
    allDocuments.forEach(d => {
      if (d.department) deps.add(d.department);
    });
    return Array.from(deps);
  }, [allDocuments]);

  // LỌC DANH SÁCH TÀI LIỆU
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      // 1. Tìm kiếm từ khóa (bao gồm cả số hiệu, trích yếu, phòng ban, và TẤT CẢ các file đính kèm/lần sửa)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchNumber = (doc.docNumber || '').toLowerCase().includes(q);
        const matchTitle = (doc.title || '').toLowerCase().includes(q);
        const matchDept = (doc.department || '').toLowerCase().includes(q);
        const matchProj = (doc.projectName || '').toLowerCase().includes(q);
        const matchSigner = (doc.signer || '').toLowerCase().includes(q);
        const matchLoc = (doc.storageLocation || '').toLowerCase().includes(q);
        const matchNote = (doc.note || '').toLowerCase().includes(q);

        const docAtts = getDocAttachments(doc);
        const matchAttachments = docAtts.some(att => {
          const revDate = formatRevisionDate(att.uploadedAt);
          return att.fileName.toLowerCase().includes(q) ||
            (att.versionName || '').toLowerCase().includes(q) ||
            (att.note || '').toLowerCase().includes(q) ||
            (att.uploadedAt || '').toLowerCase().includes(q) ||
            revDate.toLowerCase().includes(q);
        });

        if (!matchNumber && !matchTitle && !matchDept && !matchProj && !matchSigner && !matchLoc && !matchNote && !matchAttachments) {
          return false;
        }
      }

      // 2. Lọc loại văn bản chặt chẽ
      if (selectedDocType !== 'all' && !isDocTypeMatch(doc, selectedDocType)) {
        return false;
      }

      // 3. Lọc phòng ban
      if (selectedDepartment !== 'all' && doc.department !== selectedDepartment) {
        return false;
      }

      // 4. Lọc dự án
      if (selectedProjectId !== 'all' && doc.projectId !== selectedProjectId) {
        return false;
      }

      // 5. Lọc năm
      if (selectedYear !== 'all') {
        const docYear = doc.issueYear || (doc.issueDate ? doc.issueDate.substring(0, 4) : '');
        if (docYear !== selectedYear) return false;
      }

      // 6. Lọc file đính kèm & các lần sửa đổi
      const docAtts = getDocAttachments(doc);
      if (hasFileFilter === 'with_file' && docAtts.length === 0) {
        return false;
      }
      if (hasFileFilter === 'no_file' && docAtts.length > 0) {
        return false;
      }

      return true;
    });
  }, [allDocuments, searchTerm, selectedDocType, selectedDepartment, selectedProjectId, selectedYear, hasFileFilter]);

  // THỐNG KÊ NHANH
  const stats = useMemo(() => {
    const total = allDocuments.length;
    const toTrinhCount = allDocuments.filter(d => isDocTypeMatch(d, 'to_trinh')).length;
    const quyetDinhCount = allDocuments.filter(d => isDocTypeMatch(d, 'quyet_dinh')).length;
    const withFileCount = allDocuments.filter(d => getDocAttachments(d).length > 0).length;
    const totalAttachmentsCount = allDocuments.reduce((sum, d) => sum + getDocAttachments(d).length, 0);
    return { total, toTrinhCount, quyetDinhCount, withFileCount, totalAttachmentsCount };
  }, [allDocuments]);

  // ================= XỬ LÝ QUICK ATTACH (THÊM LẦN SỬA ĐỔI TỪ DÒNG BẢNG) =================
  const handleOpenQuickAttach = (doc: ManagedDocument) => {
    setQuickAttachDoc(doc);
    setQuickDocNumber(doc.docNumber || '');
    setQuickTitle(doc.title || '');
    setQuickDocType(doc.docType || '');
    const existing = getDocAttachments(doc);
    const nextNum = existing.length + 1;
    setQuickVersionName(`Lần ${nextNum} (Chỉnh sửa)`);
    setQuickRevisionDate(getTodayDateString());
    setQuickFileName('');
    setQuickFileLink('');
    setQuickFileSize(undefined);
    setQuickNote('');
    setQuickIsPrimary(true);
  };

  const handleQuickFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuickFileName(file.name);
      setQuickFileSize(file.size);
      setQuickFileLink(`https://drive.google.com/search?q=${encodeURIComponent(file.name)}`);
    }
  };

  const handleSaveQuickAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAttachDoc) return;
    if (!quickTitle.trim()) {
      alert('Vui lòng nhập trích yếu hoặc tên văn bản / tài liệu!');
      return;
    }

    const existing = getDocAttachments(quickAttachDoc);
    const dateIso = quickRevisionDate ? `${quickRevisionDate}T00:00:00.000Z` : new Date().toISOString();

    let updatedAtts = [...existing];
    if (quickFileName.trim() || quickFileLink.trim()) {
      const newAtt: DocumentAttachment = {
        id: `att-${Date.now()}-${existing.length + 1}`,
        fileName: quickFileName.trim() || 'Tệp đính kèm mới',
        fileLink: quickFileLink.trim() || undefined,
        fileSize: quickFileSize,
        versionName: quickVersionName.trim() || `Lần ${existing.length + 1}`,
        uploadedAt: dateIso,
        note: quickNote.trim() || undefined,
        isPrimary: quickIsPrimary
      };

      updatedAtts = quickIsPrimary
        ? [...existing.map(a => ({ ...a, isPrimary: false })), newAtt]
        : [...existing, newAtt];
    }

    const latestAtt = updatedAtts[updatedAtts.length - 1];

    const updatedDoc: ManagedDocument = {
      ...quickAttachDoc,
      source: quickAttachDoc.source || 'standalone',
      sourceId: quickAttachDoc.sourceId,
      docNumber: quickDocNumber.trim(),
      title: quickTitle.trim() || quickAttachDoc.title,
      docType: (quickDocType || '') as ManagedDocType,
      attachments: updatedAtts,
      driveFileName: quickFileName.trim() || latestAtt?.fileName || quickAttachDoc.driveFileName,
      driveFileLink: quickFileLink.trim() || latestAtt?.fileLink || quickAttachDoc.driveFileLink,
      fileSize: quickFileSize || latestAtt?.fileSize || quickAttachDoc.fileSize,
      uploadedAt: dateIso
    };

    onUpdateDocument(updatedDoc);
    setQuickAttachDoc(null);
  };

  const handleDeleteQuickAttachment = (attachmentId: string) => {
    if (!quickAttachDoc) return;
    if (!confirm('Bạn có chắc muốn xóa tệp đính kèm / lần sửa đổi này?')) return;
    const currentAtts = getDocAttachments(quickAttachDoc);
    const updatedAtts = currentAtts.filter(a => a.id !== attachmentId);
    const latest = updatedAtts[updatedAtts.length - 1];

    const updatedDoc: ManagedDocument = {
      ...quickAttachDoc,
      source: quickAttachDoc.source || 'standalone',
      sourceId: quickAttachDoc.sourceId,
      attachments: updatedAtts,
      driveFileName: latest?.fileName || undefined,
      driveFileLink: latest?.fileLink || undefined,
      fileSize: latest?.fileSize,
      uploadedAt: latest?.uploadedAt || new Date().toISOString()
    };

    onUpdateDocument(updatedDoc);
    setQuickAttachDoc(updatedDoc);
  };

  // ================= XỬ LÝ MODAL THÊM / SỬA TOÀN BỘ VĂN BẢN =================
  const handleOpenAddModal = () => {
    setEditingDoc(null);
    setDocNumber('');
    setTitle('');
    setDocType('to_trinh');
    setDepartment('Ban Quản lý Dự án');
    setCustomDepartment('');
    setProjectId(projects[0]?.id || '');
    setIssueDay(new Date().getDate().toString().padStart(2, '0'));
    setIssueMonth((new Date().getMonth() + 1).toString().padStart(2, '0'));
    setIssueYear(new Date().getFullYear().toString());
    setSigner('');
    setStorageLocation('Hộp lưu số 01');
    setNote('');
    setModalAttachments([
      {
        id: `att-${Date.now()}-1`,
        versionName: 'Lần 1 (Gốc)',
        fileName: '',
        fileLink: '',
        uploadedAt: `${getTodayDateString()}T00:00:00.000Z`,
        note: '',
        isPrimary: true
      }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: ManagedDocument) => {
    setEditingDoc(doc);
    setDocNumber(doc.docNumber || '');
    setTitle(doc.title || '');
    setDocType((doc.docType || '') as ManagedDocType);
    if (COMMON_DEPARTMENTS.includes(doc.department)) {
      setDepartment(doc.department);
      setCustomDepartment('');
    } else {
      setDepartment('Khác');
      setCustomDepartment(doc.department);
    }
    setProjectId(doc.projectId || '');
    setIssueDay(doc.issueDay || (doc.issueDate ? doc.issueDate.split('-')[2] : '01'));
    setIssueMonth(doc.issueMonth || (doc.issueDate ? doc.issueDate.split('-')[1] : '01'));
    setIssueYear(doc.issueYear || (doc.issueDate ? doc.issueDate.split('-')[0] : '2026'));
    setSigner(doc.signer || '');
    setStorageLocation(doc.storageLocation || '');
    setNote(doc.note || '');
    
    // Tải danh sách các lần sửa đổi / đính kèm
    const existing = getDocAttachments(doc);
    setModalAttachments(existing.length > 0 ? existing : [
      {
        id: `att-${Date.now()}-1`,
        versionName: 'Lần 1 (Gốc)',
        fileName: '',
        fileLink: '',
        uploadedAt: `${getTodayDateString()}T00:00:00.000Z`,
        note: '',
        isPrimary: true
      }
    ]);
    setIsModalOpen(true);
  };

  // Thêm 1 dòng đính kèm / lần sửa mới vào Modal chính
  const handleAddModalAttachmentRow = () => {
    setModalAttachments(prev => [
      ...prev,
      {
        id: `att-${Date.now()}-${prev.length + 1}`,
        versionName: `Lần ${prev.length + 1} (Chỉnh sửa)`,
        fileName: '',
        fileLink: '',
        uploadedAt: `${getTodayDateString()}T00:00:00.000Z`,
        note: '',
        isPrimary: true
      }
    ]);
  };

  // Cập nhật thông tin 1 dòng đính kèm trong Modal chính
  const handleUpdateModalAttachment = (id: string, updates: Partial<DocumentAttachment>) => {
    setModalAttachments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      if (updates.isPrimary) {
        return { ...a, isPrimary: false };
      }
      return a;
    }));
  };

  // Xóa 1 dòng đính kèm khỏi Modal chính
  const handleRemoveModalAttachment = (id: string) => {
    setModalAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Xử lý tải file từ máy tính trong Modal chính
  const handleModalUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalAttachments(prev => [
        ...prev,
        {
          id: `att-${Date.now()}-${prev.length + 1}`,
          versionName: `Lần ${prev.length + 1} (Chỉnh sửa)`,
          fileName: file.name,
          fileLink: `https://drive.google.com/search?q=${encodeURIComponent(file.name)}`,
          fileSize: file.size,
          uploadedAt: `${getTodayDateString()}T00:00:00.000Z`,
          note: '',
          isPrimary: true
        }
      ]);
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  // Lưu văn bản từ Modal chính
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập trích yếu hoặc tên văn bản / tài liệu!');
      return;
    }

    const finalDept = department === 'Khác' ? (customDepartment.trim() || 'Khác') : department;
    const selectedProj = projects.find(p => p.id === projectId);

    // Lọc các attachment có tên file hoặc link
    const validAttachments = modalAttachments.filter(a => a.fileName.trim() || a.fileLink?.trim());
    const primaryAttachment = validAttachments.find(a => a.isPrimary) || validAttachments[validAttachments.length - 1];

    const docPayload = {
      docNumber: docNumber.trim(),
      title: title.trim(),
      docType,
      department: finalDept,
      projectId: projectId || undefined,
      projectName: selectedProj ? selectedProj.name : undefined,
      issueDay,
      issueMonth,
      issueYear,
      issueDate: issueYear && issueMonth ? `${issueYear}-${issueMonth.padStart(2, '0')}-${issueDay.padStart(2, '0')}` : undefined,
      signer: signer.trim() || undefined,
      storageLocation: storageLocation.trim() || undefined,
      note: note.trim() || undefined,
      status: 'effective' as const,
      attachments: validAttachments,
      driveFileName: primaryAttachment?.fileName || undefined,
      driveFileLink: primaryAttachment?.fileLink || undefined,
      fileSize: primaryAttachment?.fileSize,
      source: 'standalone' as const,
      uploadedAt: primaryAttachment?.uploadedAt || new Date().toISOString()
    };

    if (editingDoc) {
      onUpdateDocument({
        ...editingDoc,
        ...docPayload,
        source: editingDoc.source || 'standalone',
        sourceId: editingDoc.sourceId
      });
    } else {
      onAddDocument(docPayload);
    }

    setIsModalOpen(false);
  };

  // In danh mục tài liệu
  const handlePrint = () => {
    window.print();
  };

  // Xuất file CSV / Excel
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Số hiệu văn bản',
      'Loại văn bản',
      'Trích yếu nội dung',
      'Phòng ban ban hành',
      'Dự án liên quan',
      'Ngày ban hành',
      'Người ký',
      'Hộp lưu trữ',
      'Số lần sửa & Các tệp đính kèm',
      'Link tệp Drive'
    ];

    const rows = filteredDocuments.map((doc, idx) => {
      const docAtts = getDocAttachments(doc);
      const attNames = docAtts.map(a => {
        const dateStr = formatRevisionDate(a.uploadedAt);
        const datePart = dateStr ? ` [Ngày sửa: ${dateStr}]` : '';
        const notePart = a.note ? ` (Ghi chú: ${a.note})` : '';
        return `[${a.versionName || 'Lần sửa'}${datePart}] ${a.fileName}${notePart}`;
      }).join('; ');
      const attLinks = docAtts.map(a => a.fileLink).filter(Boolean).join('; ');

      return [
        idx + 1,
        `"${(doc.docNumber || '').replace(/"/g, '""')}"`,
        `"${getTypeInfo(doc.docType).name}"`,
        `"${(doc.title || '').replace(/"/g, '""')}"`,
        `"${(doc.department || '').replace(/"/g, '""')}"`,
        `"${(doc.projectName || 'Tài liệu chung').replace(/"/g, '""')}"`,
        `"${doc.issueDay ? `${doc.issueDay}/${doc.issueMonth}/${doc.issueYear}` : (doc.issueDate || '')}"`,
        `"${(doc.signer || '').replace(/"/g, '""')}"`,
        `"${(doc.storageLocation || '').replace(/"/g, '""')}"`,
        `"${attNames.replace(/"/g, '""')}"`,
        `"${attLinks.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `So_Quan_Ly_Tai_Lieu_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <FileText className="w-3.5 h-3.5" />
                Sổ Quản lý tài liệu tập trung
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {allDocuments.length} văn bản lưu trữ
              </span>
              <span className="text-xs text-teal-400 font-mono bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded-full">
                {stats.totalAttachmentsCount} tệp / lần sửa đổi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Sổ Quản Lý Tài Liệu, Tờ Trình &amp; Quyết Định
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Quản lý toàn bộ tờ trình, quyết định, công văn, hợp đồng từ các phòng ban. Mỗi văn bản có 1 STT, 1 nội dung và hỗ trợ đính kèm nhiều file tương ứng với nhiều lần sửa đổi.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleOpenAddModal}
              id="btn-add-managed-doc"
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm văn bản mới</span>
            </button>

            {/* Nút Quản lý Loại văn bản (Thêm, Sửa, Thay đổi loại văn bản) */}
            <button
              type="button"
              onClick={() => setIsDocTypeModalOpen(true)}
              id="btn-manage-doc-types"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/40 hover:border-amber-400 active:scale-95 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              title="Thêm mới, sửa tên, đổi mã viết tắt hoặc thay đổi danh mục loại văn bản"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Loại văn bản</span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded font-mono text-amber-300 border border-amber-700/60 font-bold">
                {activeDocTypes.length}
              </span>
            </button>

            {onOpenScanModal && (
              <button
                onClick={onOpenScanModal}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 active:scale-95 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
                title="Tải tệp PDF hoặc ảnh lên Google Drive"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Drive</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 active:scale-95 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
              title="Xuất bảng Excel / CSV"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 active:scale-95 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
              title="In danh mục tài liệu"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">In sổ</span>
            </button>
          </div>
        </div>

        {/* 2. KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Tổng số văn bản</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-white font-mono">{stats.total}</span>
              <span className="text-xs text-slate-500">tài liệu</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedDocType('to_trinh')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedDocType === 'to_trinh' ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/50' : 'bg-slate-950/60 border-slate-800/80 hover:border-amber-500/30'
            }`}
          >
            <span className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider block">Tờ trình các bộ phận</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">{stats.toTrinhCount}</span>
              <span className="text-xs text-slate-500">tờ trình</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedDocType('quyet_dinh')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedDocType === 'quyet_dinh' ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/50' : 'bg-slate-950/60 border-slate-800/80 hover:border-rose-500/30'
            }`}
          >
            <span className="text-[11px] font-medium text-rose-400/90 uppercase tracking-wider block">Quyết định ban hành</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-rose-400 font-mono">{stats.quyetDinhCount}</span>
              <span className="text-xs text-slate-500">quyết định</span>
            </div>
          </div>

          <div 
            onClick={() => setHasFileFilter(hasFileFilter === 'with_file' ? 'all' : 'with_file')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              hasFileFilter === 'with_file' ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/50' : 'bg-slate-950/60 border-slate-800/80 hover:border-emerald-500/30'
            }`}
          >
            <span className="text-[11px] font-medium text-emerald-400/90 uppercase tracking-wider block">File đính kèm &amp; Lần sửa</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{stats.withFileCount}</span>
              <span className="text-xs text-slate-400">VB</span>
              <span className="text-[11px] text-teal-300 font-mono">({stats.totalAttachmentsCount} tệp)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Quick Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="search-managed-docs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh theo số hiệu, trích yếu, tờ trình, quyết định, phòng ban, người ký, hộp lưu..."
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Select Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Lọc loại văn bản */}
            <div className="flex items-center gap-1">
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-200 rounded-xl px-2.5 py-2 focus:border-rose-500 cursor-pointer"
              >
                <option value="all">Tất cả loại văn bản ({activeDocTypes.length})</option>
                {activeDocTypes.map(t => (
                  <option key={t.id} value={t.id}>[{t.code}] {t.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsDocTypeModalOpen(true)}
                className="p-2 bg-slate-950 border border-slate-700/80 hover:border-amber-400 text-slate-400 hover:text-amber-400 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Quản lý danh mục loại văn bản (Thêm mới, Sửa tên, Đổi mã, Thay đổi)"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lọc phòng ban / bộ phận */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-200 rounded-xl px-2.5 py-2 focus:border-rose-500 cursor-pointer"
            >
              <option value="all">Tất cả phòng ban</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Lọc dự án */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-200 rounded-xl px-2.5 py-2 focus:border-rose-500 cursor-pointer"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
              ))}
            </select>

            {/* Lọc năm */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-200 rounded-xl px-2.5 py-2 focus:border-rose-500 cursor-pointer"
            >
              <option value="all">Tất cả các năm</option>
              {availableYears.map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Lọc nhanh:
          </span>

          <button
            onClick={() => {
              setSelectedDocType('all');
              setSelectedDepartment('all');
              setSelectedProjectId('all');
              setSelectedYear('all');
              setHasFileFilter('all');
              setSearchTerm('');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedDocType === 'all' && selectedDepartment === 'all' && selectedProjectId === 'all' && !searchTerm
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
            }`}
          >
            Tất cả ({allDocuments.length})
          </button>

          {/* Dynamic Document Type Quick Filter Pills */}
          {activeDocTypes.slice(0, 5).map(t => {
            const count = allDocuments.filter(d => isDocTypeMatch(d, t.id)).length;
            const style = getDocTypeColorStyle(t.color);
            return (
              <button
                key={t.id}
                onClick={() => setSelectedDocType(t.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedDocType === t.id
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : `bg-slate-800 ${style.textCol} hover:bg-slate-750`
                }`}
              >
                {t.name} ({count})
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsDocTypeModalOpen(true)}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            title="Thêm hoặc sửa danh mục Loại văn bản"
          >
            <Settings className="w-3 h-3 text-amber-400" />
            <span>+ Sửa loại</span>
          </button>

          <button
            onClick={() => setSelectedDepartment(selectedDepartment === 'Ban Quản lý Dự án' ? 'all' : 'Ban Quản lý Dự án')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedDepartment === 'Ban Quản lý Dự án'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800 text-blue-300 hover:bg-blue-950/40'
            }`}
          >
            Ban QLDA
          </button>

          <button
            onClick={() => setSelectedDepartment(selectedDepartment === 'Phòng Kỹ thuật - Vận hành' ? 'all' : 'Phòng Kỹ thuật - Vận hành')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedDepartment === 'Phòng Kỹ thuật - Vận hành'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-800 text-indigo-300 hover:bg-indigo-950/40'
            }`}
          >
            Phòng Kỹ thuật
          </button>

          <button
            onClick={() => setSelectedDepartment(selectedDepartment === 'Phòng Kế toán - Tài chính' ? 'all' : 'Phòng Kế toán - Tài chính')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedDepartment === 'Phòng Kế toán - Tài chính'
                ? 'bg-yellow-600 text-white font-semibold'
                : 'bg-slate-800 text-yellow-300 hover:bg-yellow-950/40'
            }`}
          >
            Phòng Kế toán
          </button>

          <button
            onClick={() => setSelectedDepartment(selectedDepartment === 'Ban Giám đốc' ? 'all' : 'Ban Giám đốc')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedDepartment === 'Ban Giám đốc'
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-slate-800 text-purple-300 hover:bg-purple-950/40'
            }`}
          >
            Ban Giám đốc
          </button>

          <button
            onClick={() => setHasFileFilter(hasFileFilter === 'with_file' ? 'all' : 'with_file')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              hasFileFilter === 'with_file'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-800 text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            Có file Drive ({allDocuments.filter(d => !!d.driveFileName || !!d.driveFileLink).length})
          </button>
        </div>
      </div>

      {/* 4. Table view of documents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-slate-200">Danh Mục Văn Bản &amp; Hồ Sơ Tài Liệu</span>
            <span className="text-xs bg-slate-800 text-rose-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
              {filteredDocuments.length} kết quả
            </span>

            {/* Active filter badges */}
            {selectedDocType !== 'all' && (
              <div className="flex items-center gap-1.5 bg-rose-950/60 text-rose-300 border border-rose-500/50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                <span>Loại: <strong>{getTypeInfo(selectedDocType).name}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedDocType('all')}
                  className="ml-1 text-rose-400 hover:text-white p-0.5 hover:bg-rose-700 rounded-full cursor-pointer transition-colors"
                  title="Bỏ lọc loại này để xem tất cả"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {selectedDepartment !== 'all' && (
              <div className="flex items-center gap-1.5 bg-blue-950/60 text-blue-300 border border-blue-500/50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                <span>Bộ phận: <strong>{selectedDepartment}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedDepartment('all')}
                  className="ml-1 text-blue-400 hover:text-white p-0.5 hover:bg-blue-700 rounded-full cursor-pointer transition-colors"
                  title="Bỏ lọc bộ phận"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {selectedProjectId !== 'all' && (
              <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                <span>Dự án: <strong>{projects.find(p => p.id === selectedProjectId)?.code || 'Dự án'}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedProjectId('all')}
                  className="ml-1 text-emerald-400 hover:text-white p-0.5 hover:bg-emerald-700 rounded-full cursor-pointer transition-colors"
                  title="Bỏ lọc dự án"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            {searchTerm && <span>Đang lọc: &quot;{searchTerm}&quot; • </span>}
            <span>Nhấn đúp hoặc icon để xem/sửa</span>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Không tìm thấy tài liệu phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có văn bản nào khớp với tiêu chí tìm kiếm hoặc bộ lọc. Vui lòng thử lại với từ khóa khác hoặc bấm nút thêm mới.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm văn bản vào danh mục</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3 w-36">Số hiệu</th>
                  <th className="py-3 px-3 w-28">Loại văn bản</th>
                  <th className="py-3 px-4 min-w-[260px]">Trích yếu nội dung</th>
                  <th className="py-3 px-3 w-40">Bộ phận / Đơn vị</th>
                  <th className="py-3 px-3 w-36">Dự án</th>
                  <th className="py-3 px-3 w-28 text-center">Ngày ban hành</th>
                  <th className="py-3 px-3 w-32">Hộp lưu</th>
                  <th className="py-3 px-4 min-w-[280px]">File đính kèm &amp; Các lần sửa đổi</th>
                  <th className="py-3 px-3 w-28 text-center print:hidden">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredDocuments.map((doc, idx) => {
                  const typeInfo = getTypeInfo(doc.docType);
                  const colorStyle = getDocTypeColorStyle(typeInfo.color);
                  const isStandalone = doc.source === 'standalone';
                  const docAtts = getDocAttachments(doc);

                  const dateFormatted = doc.issueDay 
                    ? `${doc.issueDay.padStart(2, '0')}/${(doc.issueMonth || '01').padStart(2, '0')}/${doc.issueYear || '2026'}`
                    : (doc.issueDate || '---');

                  return (
                    <tr 
                      key={doc.id}
                      onDoubleClick={() => handleOpenEditModal(doc)}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      title="Nhấn đúp chuột để chỉnh sửa toàn bộ thông tin văn bản"
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-xs">
                        {idx + 1}
                      </td>

                      {/* Số hiệu văn bản */}
                      <td className="py-3 px-3 font-semibold text-rose-300 font-mono text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {doc.docNumber ? (
                            <span>{doc.docNumber}</span>
                          ) : (
                            <span className="text-slate-500 font-normal italic text-[11px]">(Không có số)</span>
                          )}
                        </div>
                      </td>

                      {/* Loại văn bản */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colorStyle.badgeBg} ${colorStyle.textCol} ${colorStyle.borderCol}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${colorStyle.dotColor}`} />
                          {typeInfo.name}
                        </span>
                      </td>

                      {/* Trích yếu / Tên văn bản (1 STT - 1 Nội dung) */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-100 group-hover:text-rose-200 transition-colors">
                          {doc.title}
                        </div>
                        {doc.note && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                            * {doc.note}
                          </div>
                        )}
                      </td>

                      {/* Bộ phận / Đơn vị */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[150px]" title={doc.department}>{doc.department || '---'}</span>
                        </div>
                        {doc.signer && (
                          <div className="text-[10px] text-slate-500 pl-5">
                            Ký: {doc.signer}
                          </div>
                        )}
                      </td>

                      {/* Dự án liên quan */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs">
                        {doc.projectName ? (
                          <span className="text-slate-300 truncate max-w-[140px] block" title={doc.projectName}>
                            {doc.projectName}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Văn bản chung</span>
                        )}
                      </td>

                      {/* Ngày ban hành */}
                      <td className="py-3 px-3 text-center text-xs text-slate-400 font-mono whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* Hộp lưu trữ */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs">
                        {doc.storageLocation ? (
                          <span className="text-emerald-400/90 bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5 rounded text-[11px]">
                            {doc.storageLocation}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">Chưa xếp hộp</span>
                        )}
                      </td>

                      {/* CỘT FILE ĐÍNH KÈM & CÁC LẦN SỬA ĐỔI (FORMAT MỚI: 1 STT - Nhiều lần sửa & đính kèm) */}
                      <td className="py-3 px-4">
                        {docAtts.length === 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs italic">Chưa có tệp</span>
                            <button
                              type="button"
                              onClick={() => handleOpenQuickAttach(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-400 active:scale-95 transition-all cursor-pointer shadow-xs"
                              title="Thêm file đính kèm / lần sửa cho văn bản này"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Đính kèm</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 min-w-[240px]">
                            {/* Thanh tóm tắt: Số lượng lần sửa & Nút + Thêm lần sửa */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                                <Paperclip className="w-3 h-3 text-teal-400 shrink-0" />
                                <span>{docAtts.length} lần sửa ({docAtts.length} file)</span>
                              </span>

                              {/* Nút + Thêm lần sửa đổi ngay trên dòng */}
                              <button
                                type="button"
                                onClick={() => handleOpenQuickAttach(doc)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-500 active:scale-95 transition-all cursor-pointer shadow-xs"
                                title={`Thêm file lần sửa đổi thứ ${docAtts.length + 1} cho văn bản này`}
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Thêm sửa đổi</span>
                              </button>
                            </div>

                            {/* Danh sách các lần sửa đổi / tệp đính kèm */}
                            <div className="space-y-1.5">
                              {docAtts.map((att, attIdx) => {
                                const isLatest = att.isPrimary || attIdx === docAtts.length - 1;
                                const versionTag = att.versionName || `Lần ${attIdx + 1}`;
                                const revDate = formatRevisionDate(att.uploadedAt) || (doc.issueDate ? formatRevisionDate(doc.issueDate) : '');

                                return (
                                  <div 
                                    key={att.id || attIdx}
                                    className={`p-2 rounded-lg text-xs transition-colors space-y-1 ${
                                      isLatest 
                                        ? 'bg-slate-800/95 border border-teal-500/40 shadow-xs' 
                                        : 'bg-slate-900/95 border border-slate-800/90 hover:border-slate-700'
                                    }`}
                                  >
                                    {/* Hàng 1: Phiên bản + Ngày sửa đổi rõ ràng + Đánh dấu Mới nhất */}
                                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          isLatest
                                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                                        }`}>
                                          {versionTag}
                                        </span>

                                        {/* Ngày của bản sửa này */}
                                        {revDate && (
                                          <span 
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0"
                                            title={`Ngày sửa đổi / cập nhật bản này: ${revDate}`}
                                          >
                                            <Calendar className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                            <span>Ngày sửa: {revDate}</span>
                                          </span>
                                        )}
                                      </div>

                                      {isLatest && (
                                        <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider bg-teal-950/70 border border-teal-500/40 px-1 rounded">
                                          Mới nhất
                                        </span>
                                      )}
                                    </div>

                                    {/* Hàng 2: File link & Name & Ghi chú lý do sửa */}
                                    <div className="min-w-0 pl-0.5">
                                      {att.fileLink ? (
                                        <a
                                          href={att.fileLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-teal-300 hover:text-teal-200 hover:underline flex items-center gap-1 font-medium truncate group/link"
                                          title={`${att.fileName}\n${revDate ? `Ngày sửa: ${revDate}\n` : ''}${att.note ? `Lý do: ${att.note}` : ''}`}
                                        >
                                          <span className="truncate max-w-[210px] text-[11px] font-mono">{att.fileName}</span>
                                          <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/link:opacity-100" />
                                        </a>
                                      ) : (
                                        <span 
                                          className="text-slate-300 truncate max-w-[210px] block text-[11px] font-mono"
                                          title={`${att.fileName}${revDate ? ` (Ngày sửa: ${revDate})` : ''}`}
                                        >
                                          {att.fileName}
                                        </span>
                                      )}

                                      {/* Ghi chú lý do sửa đổi nếu có */}
                                      {att.note && (
                                        <p className="text-[10px] text-amber-300/90 truncate max-w-[230px] italic mt-0.5">
                                          * Lý do: {att.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3 text-center whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Nút chỉnh sửa toàn bộ thông tin văn bản (Số hiệu, Loại, Trích yếu...) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                            title="Chỉnh sửa toàn bộ thông tin văn bản (Loại văn bản, Trích yếu nội dung, Số hiệu, File...)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>

                          {/* Nút thêm nhanh lần sửa đổi / đính kèm */}
                          <button
                            type="button"
                            onClick={() => handleOpenQuickAttach(doc)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 hover:text-teal-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
                            title="Thêm file đính kèm / Lần sửa đổi mới"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Tệp ({getDocAttachments(doc).length})</span>
                          </button>

                          {isStandalone ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa văn bản "${doc.docNumber || doc.title}"?`)) {
                                  onDeleteDocument(doc.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Xóa văn bản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn gỡ văn bản "${doc.docNumber || doc.title}" khỏi Quản lý tài liệu? (Nội dung trong Chi tiết dự án vẫn được giữ nguyên, chỉ đưa Loại văn bản về chưa phân loại)`)) {
                                  onDeleteDocument(doc.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Gỡ khỏi Quản lý tài liệu (trả về trạng thái Chưa phân loại)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: THÊM / SỬA VĂN BẢN QUẢN LÝ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header - Fixed */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingDoc ? 'Chỉnh Sửa Toàn Bộ Văn Bản / Hồ Sơ' : 'Thêm Văn Bản / Tài Liệu Mới'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sửa đổi đầy đủ Số hiệu, Loại văn bản, Trích yếu nội dung &amp; File đính kèm
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form - Scrollable */}
            <form id="form-manage-doc" onSubmit={handleSaveDocument} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              
              {/* KHỐI 1: THÔNG TIN CỐT LÕI (SỐ HIỆU, LOẠI VĂN BẢN, TRÍCH YẾU) - VIỀN NỔI BẬT */}
              <div className="p-4 bg-slate-950/90 border-2 border-rose-500/50 rounded-xl space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-rose-400" />
                    1. Số hiệu, Loại văn bản &amp; Trích yếu nội dung
                  </span>
                  <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/90 border border-rose-800/80 px-2 py-0.5 rounded-full">
                    Thông tin văn bản
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Số hiệu văn bản */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Số hiệu văn bản</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      placeholder="VD: 42/TTr-BQLDA, 88/QĐ-LV (hoặc để trống)..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono font-bold"
                    />
                  </div>

                  {/* 2. Loại văn bản */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-200">
                        Loại văn bản <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsDocTypeModalOpen(true)}
                        className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                        title="Sửa tên, đổi mã, đổi màu sắc hoặc thêm mới loại văn bản"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Sửa loại văn bản</span>
                      </button>
                    </div>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as ManagedDocType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-rose-500 cursor-pointer font-medium"
                    >
                      <option value="">-- Để trống / Bỏ phân loại (Gỡ khỏi QLTL) --</option>
                      {activeDocTypes.map(t => (
                        <option key={t.id} value={t.id}>
                          [{t.code}] {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Trích yếu / Tên tài liệu */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Trích yếu nội dung / Tên văn bản <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Quyết định Phê duyệt kế hoạch lựa chọn nhà thầu gói thầu xây lắp công trình thủy công..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 4. Bộ phận / Phòng ban ban hành */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bộ phận / Phòng ban ban hành <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-rose-500 cursor-pointer mb-2"
                  >
                    {COMMON_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    <option value="Khác">Nhập phòng ban khác...</option>
                  </select>
                  {department === 'Khác' && (
                    <input
                      type="text"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      placeholder="Gõ tên phòng ban / đơn vị..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500"
                      required
                    />
                  )}
                </div>

                {/* 5. Thuộc dự án liên quan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Dự án liên quan
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-rose-500 cursor-pointer"
                  >
                    <option value="">-- Tài liệu chung (Toàn công ty) --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6. Ngày / Tháng / Năm ban hành */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ngày ban hành
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={issueDay}
                    onChange={(e) => setIssueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono text-center"
                    placeholder="Ngày"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tháng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={issueMonth}
                    onChange={(e) => setIssueMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono text-center"
                    placeholder="Tháng"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Năm
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    value={issueYear}
                    onChange={(e) => setIssueYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono text-center"
                    placeholder="Năm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 7. Người ký / Phụ trách */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Người ký / Phụ trách
                  </label>
                  <input
                    type="text"
                    value={signer}
                    onChange={(e) => setSigner(e.target.value)}
                    placeholder="VD: Tổng Giám đốc, Trưởng ban QLDA..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500"
                  />
                </div>

                {/* 8. Hộp lưu trữ / Vị trí tủ hồ sơ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hộp lưu trữ / Vị trí tủ
                  </label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="VD: Hộp lưu số 03 - Tủ A (BQLDA)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* 9. Tệp đính kèm & Các lần sửa đổi (Hỗ trợ 1 văn bản sửa nhiều lần) */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-teal-400" />
                      Tệp đính kèm &amp; Các lần sửa đổi ({modalAttachments.length})
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      1 văn bản có thể đính kèm nhiều file tương ứng với các lần dự thảo, bản chỉnh sửa, bản duyệt hoặc phụ lục.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      onChange={handleModalUploadFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-xs text-teal-300 hover:text-teal-200 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer"
                      title="Chọn tệp từ máy tính để tự động thêm vào danh sách"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>+ Chọn tệp từ máy</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddModalAttachmentRow}
                      className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer"
                      title="Thêm một dòng lần sửa đổi / đính kèm mới"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm dòng lần sửa</span>
                    </button>
                  </div>
                </div>

                {/* Danh sách các lần sửa */}
                {modalAttachments.length === 0 ? (
                  <div className="text-center py-5 border border-dashed border-slate-800 rounded-xl">
                    <Paperclip className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-400">Chưa có tệp đính kèm hoặc lần sửa đổi nào</p>
                    <button
                      type="button"
                      onClick={handleAddModalAttachmentRow}
                      className="mt-2 text-xs text-rose-400 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Bấm vào đây để thêm lần sửa đổi thứ 1</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {modalAttachments.map((att, attIdx) => (
                      <div 
                        key={att.id}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative group/item"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-teal-300 bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 rounded">
                              #{attIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={att.versionName || ''}
                              onChange={(e) => handleUpdateModalAttachment(att.id, { versionName: e.target.value })}
                              placeholder="Tên lần sửa (VD: Lần 1 (Gốc), Lần 2 (Sửa đổi), Bản duyệt...)"
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-semibold focus:border-teal-500 w-44 sm:w-56"
                            />
                            {/* Chọn ngày của bản sửa này */}
                            <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">Ngày sửa:</span>
                              <input
                                type="date"
                                value={att.uploadedAt ? att.uploadedAt.substring(0, 10) : ''}
                                onChange={(e) => handleUpdateModalAttachment(att.id, { 
                                  uploadedAt: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined 
                                })}
                                className="bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none p-0 cursor-pointer"
                                title="Chọn ngày chỉnh sửa / ban hành của bản này"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!att.isPrimary}
                                onChange={(e) => handleUpdateModalAttachment(att.id, { isPrimary: e.target.checked })}
                                className="rounded border-slate-700 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                              />
                              <span>Bản mới nhất</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveModalAttachment(att.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Xóa lần sửa này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              value={att.fileName}
                              onChange={(e) => handleUpdateModalAttachment(att.id, { fileName: e.target.value })}
                              placeholder="Tên file (VD: 42_TTr_DuThao.pdf)"
                              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={att.fileLink || ''}
                              onChange={(e) => handleUpdateModalAttachment(att.id, { fileLink: e.target.value })}
                              placeholder="Link tệp Drive / Web (https://drive.google.com/...)"
                              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500"
                            />
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={att.note || ''}
                            onChange={(e) => handleUpdateModalAttachment(att.id, { note: e.target.value })}
                            placeholder="Ghi chú lý do sửa đổi (VD: Điều chỉnh dự toán theo kết luận Hội đồng thẩm định)..."
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 placeholder-slate-600 italic"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 10. Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi chú thêm
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm về nội dung hoặc yêu cầu phê duyệt..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500"
                />
              </div>

              {/* Modal Buttons */}
            </form>

            {/* Modal Footer - Fixed at bottom */}
            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                {editingDoc ? 'Đang chỉnh sửa toàn bộ nội dung văn bản' : 'Tạo mới hồ sơ tài liệu'}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  form="form-manage-doc"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 active:scale-95 transition-all cursor-pointer"
                >
                  {editingDoc ? 'Lưu tất cả thay đổi' : 'Thêm vào danh mục'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: THÊM NHANH FILE ĐÍNH KÈM / LẦN SỬA ĐỔI (Trực tiếp từ dòng bảng) */}
      {quickAttachDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Thêm File Đính Kèm / Lần Sửa Đổi</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    <span className="font-mono text-rose-300 font-bold">{quickAttachDoc.docNumber}</span>: {quickAttachDoc.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAttachDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveQuickAttachment} className="p-5 space-y-4">
              
              {/* Thông tin văn bản cốt lõi: Số hiệu, Loại văn bản, Trích yếu nội dung */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>Thông tin văn bản (Chỉnh sửa trực tiếp):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const docToEdit = quickAttachDoc;
                      setQuickAttachDoc(null);
                      handleOpenEditModal(docToEdit);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    title="Mở form đầy đủ để chỉnh sửa toàn bộ các trường khác (phòng ban, ngày, người ký, tủ hồ sơ...)"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Mở sửa toàn bộ chi tiết</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Số hiệu văn bản</span>
                      <span className="text-[10px] text-slate-500">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      value={quickDocNumber}
                      onChange={(e) => setQuickDocNumber(e.target.value)}
                      placeholder="VD: 42/TTr-BQLDA (hoặc để trống)..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Loại văn bản
                    </label>
                    <select
                      value={quickDocType}
                      onChange={(e) => setQuickDocType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-medium focus:border-rose-500 cursor-pointer"
                    >
                      <option value="">-- Để trống / Bỏ phân loại (Gỡ khỏi QLTL) --</option>
                      {activeDocTypes.map(t => (
                        <option key={t.id} value={t.id}>
                          [{t.code}] {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Trích yếu nội dung / Tên văn bản <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Nhập trích yếu nội dung hoặc tên văn bản..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-rose-500 leading-relaxed"
                    required
                  />
                </div>
              </div>
              
              {/* Lịch sử các lần sửa đổi hiện có */}
              {(() => {
                const currentAtts = getDocAttachments(quickAttachDoc);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-teal-400" />
                        Các lần đính kèm hiện có ({currentAtts.length}):
                      </span>
                    </div>

                    {currentAtts.length === 0 ? (
                      <p className="text-xs text-slate-500 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        Văn bản này hiện chưa có file đính kèm nào. Vui lòng thêm lần sửa đổi / file đầu tiên bên dưới.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {currentAtts.map((att, idx) => (
                          <div 
                            key={att.id || idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                          >
                            <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[10px] bg-slate-800 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded shrink-0">
                                {att.versionName || `Lần ${idx + 1}`}
                              </span>
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
                                <Calendar className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                <span>Ngày sửa: {formatRevisionDate(att.uploadedAt) || (quickAttachDoc.issueDate ? formatRevisionDate(quickAttachDoc.issueDate) : 'Gốc')}</span>
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-[11px] text-slate-200 truncate">{att.fileName}</p>
                                {att.note && (
                                  <p className="text-[10px] text-amber-300/80 italic truncate">* {att.note}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {att.fileLink && (
                                <a
                                  href={att.fileLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-400 hover:text-teal-300 p-1 rounded hover:bg-slate-800"
                                  title="Mở file"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteQuickAttachment(att.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                                title="Xóa đính kèm này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Form thêm lần sửa đổi mới */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
                  Thông tin tệp sửa đổi mới (+):
                </span>

                {/* Tên phiên bản & Ngày sửa đổi của bản này */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tên phiên bản / Lần sửa <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={quickVersionName}
                      onChange={(e) => setQuickVersionName(e.target.value)}
                      placeholder="VD: Lần 2 (Chỉnh sửa theo góp ý P.KT), Bản ký duyệt chính thức..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ngày sửa đổi của bản này <span className="text-rose-400">*</span></span>
                    </label>
                    <input
                      type="date"
                      value={quickRevisionDate}
                      onChange={(e) => setQuickRevisionDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-rose-500 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Chọn file từ máy hoặc dán link */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Tệp đính kèm <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="file"
                      ref={quickFileInputRef}
                      onChange={handleQuickFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => quickFileInputRef.current?.click()}
                      className="text-xs text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2 cursor-pointer flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>+ Chọn file từ máy tính</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={quickFileName}
                    onChange={(e) => setQuickFileName(e.target.value)}
                    placeholder="Tên file (VD: 42_TTr_BQLDA_Lan2.pdf)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-rose-500"
                    required
                  />

                  <input
                    type="text"
                    value={quickFileLink}
                    onChange={(e) => setQuickFileLink(e.target.value)}
                    placeholder="Link Google Drive / Web (https://drive.google.com/...)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500"
                  />
                </div>

                {/* Ghi chú lý do chỉnh sửa */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ghi chú lý do chỉnh sửa / nội dung sửa đổi
                  </label>
                  <input
                    type="text"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="VD: Cập nhật lại giá trị dự toán theo biên bản thẩm định ngày 15/02..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500"
                  />
                </div>

                {/* Đặt làm bản mới nhất */}
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={quickIsPrimary}
                    onChange={(e) => setQuickIsPrimary(e.target.checked)}
                    className="rounded border-slate-700 text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span>Đặt làm bản hiệu lực chính / mới nhất</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickAttachDoc(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu lần sửa đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản lý / Sửa / Thêm / Thay đổi Loại văn bản */}
      <DocTypeManagementModal
        isOpen={isDocTypeModalOpen}
        onClose={() => setIsDocTypeModalOpen(false)}
        docTypes={activeDocTypes}
        allDocuments={allDocuments}
        onAddDocType={handleInternalAddDocType}
        onUpdateDocType={handleInternalUpdateDocType}
        onDeleteDocType={handleInternalDeleteDocType}
        onResetDocTypes={handleInternalResetDocTypes}
        onSelectDocType={(newTypeId) => {
          setDocType(newTypeId as ManagedDocType);
          setIsDocTypeModalOpen(false);
        }}
      />
    </div>
  );
};
