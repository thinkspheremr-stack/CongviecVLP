import { TaskItem, CategoryInfo, Project, ManagedDocument, ManagedDocTypeInfo, DocumentAttachment } from '../types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-1',
    code: 'WBS-1.0',
    name: 'Khảo sát & Lập kế hoạch',
    color: 'emerald',
    description: 'Khảo sát hiện trường, phê duyệt dự án, kế hoạch tổng thể & pháp lý.',
  },
  {
    id: 'cat-2',
    code: 'WBS-2.0',
    name: 'Thiết kế & Giải pháp kỹ thuật',
    color: 'blue',
    description: 'Hồ sơ thiết kế chi tiết, kiến trúc, kết cấu và đánh giá giải pháp.',
  },
  {
    id: 'cat-3',
    code: 'WBS-3.0',
    name: 'Triển khai & Thi công',
    color: 'indigo',
    description: 'Thi công xây lắp, lập trình module, tích hợp hạ tầng hệ thống.',
  },
  {
    id: 'cat-4',
    code: 'WBS-4.0',
    name: 'Kiểm thử & Nghiệm thu (UAT)',
    color: 'amber',
    description: 'Kiểm thử chức năng, lập biên bản nghiệm thu kỹ thuật và vận hành thử.',
  },
  {
    id: 'cat-5',
    code: 'WBS-5.0',
    name: 'Bàn giao & Hoàn công',
    color: 'rose',
    description: 'Ký biên bản bàn giao, thanh quyết toán, hướng dẫn đưa vào sử dụng.',
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    code: 'DA-01',
    name: 'Tòa nhà Phức hợp Sunrise Riverside',
    itemType: 'project',
    itemTypes: ['project'],
    projectKind: 'main',
    description: 'Dự án thi công khối tháp thương mại cao cấp 25 tầng.',
    manager: 'Nguyễn Minh (GĐ DA)',
    startMonth: '06',
    startYear: '2026',
    parentProject: 'Khu đô thị Nam Sài Gòn Riverside',
    relatedPackages: [
      { id: 'pkg-1', name: 'gói thầu : 1 Cung cấp & Lắp đặt Cơ điện MEP', link: 'https://drive.google.com' },
      { id: 'pkg-2', name: 'gói thầu 2 : Tư vấn Thẩm tra Thiết kế Kỹ thuật & PCCC', link: 'https://drive.google.com' }
    ],
    objectives: 'Hoàn thành bàn giao khối tháp 25 tầng đạt tiêu chuẩn nghiệm thu công trình cấp 1 và chứng nhận công trình xanh.',
    notes: 'Ưu tiên nghiệm thu ván khuôn và cốt thép trước mùa mưa. Hồ sơ lưu trữ đồng bộ Google Drive.',
    detailItems: [
      {
        id: 'det-1',
        stt: 1,
        content: 'Phê duyệt Kế hoạch Tổng tiến độ thi công',
        day: '05',
        month: '06',
        year: '2026',
        docNumber: '128',
        docText: '/QĐ-BQLDA',
        driveFileName: 'Quyet_dinh_128_Phe_duyet_Ke_hoach.pdf',
        driveFileLink: 'https://drive.google.com',
        isStartDateSelected: true
      },
      {
        id: 'det-2',
        stt: 2,
        content: 'Khởi công khoan cọc nhồi D1200 và tường vây',
        day: '15',
        month: '06',
        year: '2026',
        docNumber: '45',
        docText: '/TB-KC',
        driveFileName: 'Thong_bao_khoi_cong_mong_coc.pdf',
        driveFileLink: 'https://drive.google.com',
        isStartDateSelected: false
      },
      {
        id: 'det-3',
        stt: 3,
        content: 'Nghiệm thu phần ngầm giai đoạn 1 và hầm B1-B2',
        day: '20',
        month: '08',
        year: '2026',
        docNumber: '89',
        docText: '/BB-NT',
        isStartDateSelected: false
      }
    ],
    attachedDocuments: [
      {
        id: 'att-1',
        stt: 1,
        content: 'Hợp đồng Tổng thầu EPC thi công xây dựng số 12/2026/HĐ-XD',
        day: '01',
        month: '06',
        year: '2026',
        docNumber: '12',
        docText: '/2026/HĐ-XD',
        driveFileName: 'Hop_dong_Tong_thau_EPC_12_2026.pdf',
        driveFileLink: 'https://drive.google.com'
      },
      {
        id: 'att-2',
        stt: 2,
        content: 'Giấy phép xây dựng số 34/GPXD Sở Xây dựng cấp',
        day: '28',
        month: '05',
        year: '2026',
        docNumber: '34',
        docText: '/GPXD-SXD',
        driveFileName: 'Giay_phep_xay_dung_34_GPXD.pdf',
        driveFileLink: 'https://drive.google.com'
      }
    ],
    status: 'in_progress',
    startDate: '2026-06-01',
    targetDate: '2026-12-30',
    color: 'emerald',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'proj-02',
    code: 'DA-02',
    name: 'Triển khai Hệ thống ERP Doanh nghiệp',
    itemType: 'package',
    itemTypes: ['package'],
    projectKind: 'sub',
    parentProjectId: 'proj-01',
    description: 'Số hóa toàn diện quy trình cung ứng, kế toán và quản lý nhân sự.',
    manager: 'Trần Thị Thu Trang (PM)',
    startMonth: '07',
    startYear: '2026',
    parentProject: 'Chương trình Chuyển đổi số Doanh nghiệp 2026-2030',
    relatedPackages: [
      { id: 'pkg-21', name: 'gói thầu : 1 Cung cấp Bản quyền License Phần mềm ERP', link: 'https://drive.google.com' },
      { id: 'pkg-22', name: 'gói thầu 2 : Hạ tầng Máy chủ Cloud & Bảo mật', link: 'https://drive.google.com' }
    ],
    objectives: 'Go-live toàn bộ phân hệ Tài chính Kế toán & Mua sắm trước Q4/2026.',
    notes: 'Tuân thủ quy trình bảo mật dữ liệu khách hàng và đồng bộ sao lưu hàng tuần.',
    detailItems: [
      {
        id: 'det-21',
        stt: 1,
        content: 'Khảo sát Blueprint quy trình nghiệp vụ các phòng ban',
        day: '15',
        month: '07',
        year: '2026',
        docNumber: '08',
        docText: '/BB-KS',
        isStartDateSelected: true
      },
      {
        id: 'det-22',
        stt: 2,
        content: 'Kiểm thử chấp nhận người dùng đợt 1 (UAT 1)',
        day: '30',
        month: '09',
        year: '2026',
        docNumber: '19',
        docText: '/BB-UAT',
        isStartDateSelected: false
      }
    ],
    attachedDocuments: [
      {
        id: 'att-21',
        stt: 1,
        content: 'Tài liệu Kiến trúc Giải pháp Hệ thống (Solution Architecture Document)',
        day: '10',
        month: '07',
        year: '2026',
        docNumber: '02',
        docText: '/SAD-ERP',
        driveFileName: 'Kien_truc_giai_phap_ERP_v1.pdf',
        driveFileLink: 'https://drive.google.com'
      }
    ],
    status: 'in_progress',
    startDate: '2026-07-15',
    targetDate: '2026-11-20',
    color: 'blue',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 'proj-03',
    code: 'DA-03',
    name: 'Cải tạo & Nâng cấp Nhà máy Long Thành',
    itemType: 'item',
    itemTypes: ['item'],
    description: 'Mở rộng dây chuyền xưởng hóa chất đạt chuẩn ISO 14001.',
    manager: 'Lê Hoàng Hải (PM Kỹ thuật)',
    startMonth: '09',
    startYear: '2026',
    parentProject: 'Kế hoạch Mở rộng Công suất Công nghiệp Miền Nam',
    relatedPackages: [
      { id: 'pkg-31', name: 'gói thầu : 1 Dây chuyền robot đóng gói tự động', link: 'https://drive.google.com' }
    ],
    objectives: 'Nâng công suất dây chuyền thêm 45% và giảm tiêu hao năng lượng.',
    notes: 'Đảm bảo an toàn lao động trong suốt quá trình vừa thi công vừa duy trì sản xuất.',
    detailItems: [
      {
        id: 'det-31',
        stt: 1,
        content: 'Thẩm duyệt hiện trường và Giấy phép PCCC mở rộng',
        day: '01',
        month: '09',
        year: '2026',
        docNumber: '56',
        docText: '/TĐ-PCCC',
        isStartDateSelected: true
      }
    ],
    attachedDocuments: [],
    status: 'planning',
    startDate: '2026-09-01',
    targetDate: '2027-02-28',
    color: 'amber',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'proj-04',
    code: 'DA-04',
    name: 'Xây dựng Trung tâm Dữ liệu Data Center DC-02',
    itemType: 'project',
    itemTypes: ['project', 'package'],
    description: 'Hạ tầng phòng máy chủ Tier III vận hành N+1.',
    manager: 'Vũ Đức Toàn (Lead Architect)',
    startMonth: '05',
    startYear: '2026',
    parentProject: 'Hạ tầng Điện toán Đám mây Quốc gia',
    relatedPackages: [
      { id: 'pkg-41', name: 'gói thầu : 1 Máy phát điện Cummins & UPS công nghiệp', link: 'https://drive.google.com' },
      { id: 'pkg-42', name: 'gói thầu 2 : Hệ thống làm mát chính xác InRow Chiller', link: 'https://drive.google.com' }
    ],
    objectives: 'Đạt chứng nhận Tier III Uptime Institute.',
    notes: 'Kiểm tra tải giả 72 giờ trước khi lắp ráp thiết bị máy chủ chính thức.',
    detailItems: [
      {
        id: 'det-41',
        stt: 1,
        content: 'Thi công sàn nâng và hệ thống tiếp địa chống sét',
        day: '10',
        month: '05',
        year: '2026',
        docNumber: '77',
        docText: '/BB-SN',
        isStartDateSelected: true
      }
    ],
    attachedDocuments: [],
    status: 'review',
    startDate: '2026-05-10',
    targetDate: '2026-10-15',
    color: 'purple',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  }
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-101',
    projectId: 'proj-01',
    code: 'PM-01',
    title: 'Phê duyệt Dự án & Hợp đồng Nguyên tắc',
    description: 'Hoàn thiện hợp đồng tổng thầu, phê duyệt Charter dự án và danh mục các bên liên quan.',
    category: 'Khảo sát & Lập kế hoạch',
    status: 'completed',
    priority: 'high',
    progress: 100,
    assignee: 'Nguyễn Minh (PM Trưởng)',
    startDate: '2026-08-01',
    dueDate: '2026-08-15',
    budget: '450.000.000 VNĐ',
    notes: 'Đã thông qua Chủ tịch Hội đồng Quản trị.',
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    documents: [
      {
        id: 'doc-01',
        name: 'Hop_Dong_Nguyen_Tac_Sunrise.pdf',
        type: 'contract',
        projectId: 'proj-01',
        category: 'Khảo sát & Lập kế hoạch',
        driveFileId: 'sample-drive-id-1',
        driveViewLink: 'https://drive.google.com',
        fileSize: 2450000,
        mimeType: 'application/pdf',
        uploadDate: '2026-08-12',
        scannedViaCamera: false,
        description: 'Bản scan hợp đồng ký đóng dấu giáp lai đầy đủ'
      }
    ]
  },
  {
    id: 'task-102',
    projectId: 'proj-01',
    code: 'PM-02',
    title: 'Khảo sát địa chất & Hiện trường công trình',
    description: 'Đội khảo sát tiến hành khoan lấy mẫu đất và đo đạc trắc địa hiện trạng.',
    category: 'Khảo sát & Lập kế hoạch',
    status: 'completed',
    priority: 'urgent',
    progress: 100,
    assignee: 'Trịnh Trọng (Kỹ sư địa chất)',
    startDate: '2026-08-16',
    dueDate: '2026-08-30',
    budget: '180.000.000 VNĐ',
    notes: 'Báo cáo khảo sát đạt kết quả tốt, đủ điều kiện tải trọng móng.',
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    documents: [
      {
        id: 'doc-02',
        name: 'Bien_Ban_Khao_Sat_Hien_Truong.jpg',
        type: 'report',
        projectId: 'proj-01',
        category: 'Khảo sát & Lập kế hoạch',
        driveFileId: 'sample-drive-id-2',
        driveViewLink: 'https://drive.google.com',
        fileSize: 3120000,
        mimeType: 'image/jpeg',
        uploadDate: '2026-08-28',
        scannedViaCamera: true,
        description: 'Ảnh scan biên bản xác nhận mốc ranh giới hiện trường.'
      }
    ]
  },
  {
    id: 'task-103',
    projectId: 'proj-01',
    code: 'PM-03',
    title: 'Hoàn thiện Thiết kế kỹ thuật & Bản vẽ Thi công đợt 1',
    description: 'Phát hành bản vẽ kết cấu, kiến trúc, cơ điện (MEP) phiên bản Rev 2.0 có chữ ký phê duyệt.',
    category: 'Thiết kế & Giải pháp kỹ thuật',
    status: 'in_progress',
    priority: 'high',
    progress: 85,
    assignee: 'Lê Hoàng Hải (Trưởng phòng Thiết kế)',
    startDate: '2026-09-01',
    dueDate: '2026-09-25',
    budget: '320.000.000 VNĐ',
    notes: 'Đang chỉnh sửa bản vẽ mặt bằng tầng lửng.',
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    documents: [
      {
        id: 'doc-03',
        name: 'Ban_Ve_Ket_Cau_Rev2.pdf',
        type: 'drawing',
        projectId: 'proj-01',
        category: 'Thiết kế & Giải pháp kỹ thuật',
        driveFileId: 'sample-drive-id-3',
        driveViewLink: 'https://drive.google.com',
        fileSize: 14500000,
        mimeType: 'application/pdf',
        uploadDate: '2026-09-15',
        scannedViaCamera: false,
        description: 'Bản vẽ kỹ thuật chi tiết đã kiểm tra.'
      }
    ]
  },
  {
    id: 'task-104',
    projectId: 'proj-01',
    code: 'PM-04',
    title: 'Gia công lắp dựng kết cấu thép & Đổ bê tông sàn tầng 1',
    description: 'Tiến hành đổ bê tông dầm sàn, kiểm tra mác bê tông và lấy mẫu thí nghiệm.',
    category: 'Triển khai & Thi công',
    status: 'in_progress',
    priority: 'urgent',
    progress: 60,
    assignee: 'Phan Quốc Long (Chỉ huy trưởng công trường)',
    startDate: '2026-09-10',
    dueDate: '2026-10-05',
    budget: '1.250.000.000 VNĐ',
    notes: 'Cần theo dõi thời tiết để bảo đảm chất lượng ninh kết.',
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    documents: []
  },
  {
    id: 'task-105',
    projectId: 'proj-01',
    code: 'PM-05',
    title: 'Nghiệm thu vật liệu & Thiết bị đợt 1',
    description: 'Kiểm tra chứng chỉ xuất xứ (CO), chứng nhận chất lượng (CQ) của toàn bộ thiết bị nhập khẩu.',
    category: 'Kiểm thử & Nghiệm thu (UAT)',
    status: 'review',
    priority: 'medium',
    progress: 75,
    assignee: 'Vũ Đức Toàn (Tư vấn Giám sát)',
    startDate: '2026-09-18',
    dueDate: '2026-09-28',
    budget: '95.000.000 VNĐ',
    notes: 'Đang tổng hợp phiếu xuất xưởng từ nhà sản xuất.',
    updatedAt: new Date().toISOString(),
    documents: []
  },
  {
    id: 'task-106',
    projectId: 'proj-01',
    code: 'PM-06',
    title: 'Lập hồ sơ Hoàn công & Chuyển giao Vận hành',
    description: 'Chuẩn bị danh mục tài liệu hoàn công theo quy định và hướng dẫn quy trình vận hành hệ thống.',
    category: 'Bàn giao & Hoàn công',
    status: 'not_started',
    priority: 'medium',
    progress: 0,
    assignee: 'Nguyễn Minh (PM Trưởng)',
    startDate: '2026-10-15',
    dueDate: '2026-11-10',
    budget: '120.000.000 VNĐ',
    notes: 'Bắt đầu sau khi hoàn thành nghiệm thu liên động.',
    updatedAt: new Date().toISOString(),
    documents: []
  }
];

const PROJECTS_STORAGE_KEY = 'pm_projects_data_v2';
const ACTIVE_PROJECT_KEY = 'pm_active_project_id_v2';
const TASKS_STORAGE_KEY = 'pm_tasks_data_v2';
const CATEGORIES_STORAGE_KEY = 'pm_categories_data_v1';
const DRIVE_ROOT_FOLDER_KEY = 'pm_drive_root_folder_info_v1';

export function deduplicateProjects(projects: Project[]): Project[] {
  if (!Array.isArray(projects)) return [];
  const seen = new Set<string>();
  const result: Project[] = [];
  for (const p of projects) {
    if (p && p.id) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push(p);
      }
    }
  }
  return result;
}

export function loadSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const parsed: any[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const deduped = deduplicateProjects(parsed);
    if (deduped.length !== parsed.length) {
      saveProjects(deduped);
    }
    return deduped;
  } catch (error) {
    console.error('Lỗi load projects từ localStorage:', error);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    const deduped = deduplicateProjects(projects);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(deduped));
  } catch (error) {
    console.error('Lỗi lưu projects vào localStorage:', error);
  }
}

export function loadActiveProjectId(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
    return saved || DEFAULT_PROJECTS[0].id;
  } catch {
    return DEFAULT_PROJECTS[0].id;
  }
}

export function saveActiveProjectId(projectId: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  } catch (error) {
    console.error('Lỗi lưu active project id:', error);
  }
}

export function loadSavedTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const parsed: any[] = JSON.parse(raw);
    const validated = parsed.map(t => ({
      ...t,
      projectId: t.projectId || 'proj-01'
    }));
    return validated;
  } catch (error) {
    console.error('Lỗi load tasks từ localStorage:', error);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Lỗi lưu tasks vào localStorage:', error);
  }
}

export function loadSavedCategories(): CategoryInfo[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: CategoryInfo[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Lỗi lưu categories:', error);
  }
}

export function getSavedDriveFolder(): { id: string; name: string } | null {
  try {
    const raw = localStorage.getItem(DRIVE_ROOT_FOLDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDriveFolder(folder: { id: string; name: string }): void {
  try {
    localStorage.setItem(DRIVE_ROOT_FOLDER_KEY, JSON.stringify(folder));
  } catch (error) {
    console.error('Lỗi lưu drive folder info:', error);
  }
}

// Aliases for compatibility across components
export const INITIAL_PROJECTS = DEFAULT_PROJECTS;
export { INITIAL_TASKS };
export const WBS_CATEGORIES = DEFAULT_CATEGORIES;
export const getStoredProjects = loadSavedProjects;
export const setStoredProjects = saveProjects;
export const getStoredTasks = loadSavedTasks;
export const setStoredTasks = saveTasks;

export function getMasterDrivePath(): string {
  try {
    return localStorage.getItem('pm_master_drive_path') || '01. QUẢN LÝ DỰ ÁN & HỒ SƠ CÔNG TRÌNH';
  } catch {
    return '01. QUẢN LÝ DỰ ÁN & HỒ SƠ CÔNG TRÌNH';
  }
}

export function setMasterDrivePath(path: string): void {
  try {
    localStorage.setItem('pm_master_drive_path', path);
  } catch (error) {
    console.error('Lỗi lưu master drive path:', error);
  }
}

export const INITIAL_MANAGED_DOCUMENTS: ManagedDocument[] = [
  {
    id: 'doc-001',
    docNumber: '42/TTr-BQLDA',
    title: 'Tờ trình về việc Phê duyệt hồ sơ thiết kế bản vẽ thi công và dự toán Bến cảng số 3',
    docType: 'to_trinh',
    department: 'Ban Quản lý Dự án',
    projectName: 'Bến cảng số 3 - Cảng Vũng Áng',
    issueDay: '15',
    issueMonth: '01',
    issueYear: '2026',
    issueDate: '2026-01-15',
    signer: 'Trưởng ban QLDA',
    storageLocation: 'Hộp lưu số 03 - Tủ A (BQLDA)',
    note: 'Đã thông qua Hội đồng thẩm định kỹ thuật công ty',
    status: 'effective',
    driveFileName: '42_TTr_BQLDA_ThietKeBanVeThiCong_L2_DaSuaDoi.pdf',
    driveFileLink: 'https://drive.google.com',
    fileSize: 4520000,
    uploadedAt: '2026-01-15T09:30:00Z',
    attachments: [
      {
        id: 'att-001-1',
        fileName: '42_TTr_BQLDA_ThietKeBanVe_DuThao_L1.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 4120000,
        versionName: 'Lần 1 (Dự thảo)',
        uploadedAt: '2026-01-10T14:00:00Z',
        note: 'Bản dự thảo trình Hội đồng thẩm định lần đầu'
      },
      {
        id: 'att-001-2',
        fileName: '42_TTr_BQLDA_ThietKeBanVeThiCong_L2_DaSuaDoi.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 4520000,
        versionName: 'Lần 2 (Chỉnh sửa theo góp ý)',
        uploadedAt: '2026-01-14T16:30:00Z',
        note: 'Đã bổ sung dự toán chi tiết và thuyết minh móng cọc bến',
        isPrimary: true
      },
      {
        id: 'att-001-3',
        fileName: '42_TTr_BQLDA_BanChinhThuc_KyDuyet.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 4890000,
        versionName: 'Bản ký duyệt đóng dấu',
        uploadedAt: '2026-01-15T09:30:00Z',
        note: 'Bản chính thức có chữ ký Trưởng ban QLDA'
      }
    ],
    source: 'standalone'
  },
  {
    id: 'doc-002',
    docNumber: '88/QĐ-LV',
    title: 'Quyết định Phê duyệt kế hoạch lựa chọn nhà thầu gói thầu xây lắp công trình thủy công',
    docType: 'quyet_dinh',
    department: 'Ban Giám đốc',
    projectName: 'Bến cảng số 3 - Cảng Vũng Áng',
    issueDay: '22',
    issueMonth: '01',
    issueYear: '2026',
    issueDate: '2026-01-22',
    signer: 'Tổng Giám đốc',
    storageLocation: 'Hộp lưu số 01 - Tủ Ban Giám Đốc',
    note: 'Căn cứ Nghị quyết HĐQT số 05/NQ-HĐQT',
    status: 'effective',
    driveFileName: '88_QD_LV_KeHoachLCNT_ChinhThuc.pdf',
    driveFileLink: 'https://drive.google.com',
    fileSize: 2840000,
    uploadedAt: '2026-01-22T14:15:00Z',
    attachments: [
      {
        id: 'att-002-1',
        fileName: '88_QD_LV_DuThao_L1.docx',
        fileLink: 'https://drive.google.com',
        fileSize: 1250000,
        versionName: 'Lần 1 (Dự thảo)',
        uploadedAt: '2026-01-18T10:00:00Z',
        note: 'Dự thảo ban đầu kèm phụ lục tiến độ lựa chọn nhà thầu'
      },
      {
        id: 'att-002-2',
        fileName: '88_QD_LV_KeHoachLCNT_ChinhThuc.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 2840000,
        versionName: 'Quyết định chính thức',
        uploadedAt: '2026-01-22T14:15:00Z',
        note: 'Đã ban hành có dấu đỏ Ban Giám đốc',
        isPrimary: true
      }
    ],
    source: 'standalone'
  },
  {
    id: 'doc-003',
    docNumber: '18/TTr-KT',
    title: 'Tờ trình về Đề xuất phương án cải tạo và nâng cấp hệ thống cẩu giàn bến số 1 và số 2',
    docType: 'to_trinh',
    department: 'Phòng Kỹ thuật - Vận hành',
    projectName: 'Nâng cấp thiết bị bến cảng',
    issueDay: '05',
    issueMonth: '02',
    issueYear: '2026',
    issueDate: '2026-02-05',
    signer: 'Trưởng phòng Kỹ thuật',
    storageLocation: 'Hộp lưu số 06 - Kệ Kỹ thuật B2',
    note: 'Đề xuất thay mới cáp cẩu và hệ thống điều khiển PLC',
    status: 'effective',
    driveFileName: '18_TTr_KT_NangCapCauGian.pdf',
    driveFileLink: 'https://drive.google.com',
    fileSize: 3120000,
    uploadedAt: '2026-02-05T10:00:00Z',
    attachments: [
      {
        id: 'att-003-1',
        fileName: '18_TTr_KT_NangCapCauGian_DuThao_L1.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 2850000,
        versionName: 'Lần 1 (Dự thảo)',
        uploadedAt: '2026-02-01T09:00:00Z',
        note: 'Đề xuất ban đầu của Phòng Kỹ thuật'
      },
      {
        id: 'att-003-2',
        fileName: '18_TTr_KT_NangCapCauGian_HieuChinh_L2.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 3120000,
        versionName: 'Lần 2 (Sửa đổi & Dự toán)',
        uploadedAt: '2026-02-05T10:00:00Z',
        note: 'Bổ sung dự toán thay cáp cẩu và hệ thống PLC',
        isPrimary: true
      }
    ],
    source: 'standalone'
  },
  {
    id: 'doc-004',
    docNumber: '105/QĐ-LV',
    title: 'Quyết định Thành lập Tổ chuyên gia đấu thầu gói thầu mua sắm trang thiết bị giám sát cảng biển',
    docType: 'quyet_dinh',
    department: 'Ban Giám đốc',
    projectName: 'Hạ tầng số và Giám sát Cảng',
    issueDay: '12',
    issueMonth: '02',
    issueYear: '2026',
    issueDate: '2026-02-12',
    signer: 'Phó Tổng Giám đốc',
    storageLocation: 'Hộp lưu số 01 - Tủ Ban Giám Đốc',
    note: 'Tổ trưởng: Phó TGĐ, Thư ký: Chuyên viên P.KH-KD',
    status: 'effective',
    driveFileName: '105_QD_LV_ToChuyenGiaDauThau.pdf',
    driveFileLink: 'https://drive.google.com',
    fileSize: 1980000,
    uploadedAt: '2026-02-12T16:20:00Z',
    attachments: [
      {
        id: 'att-004-1',
        fileName: '105_QD_LV_DuThao_ToChuyenGia.docx',
        fileLink: 'https://drive.google.com',
        fileSize: 850000,
        versionName: 'Lần 1 (Dự thảo)',
        uploadedAt: '2026-02-08T11:00:00Z',
        note: 'Bản xin ý kiến các thành viên tổ'
      },
      {
        id: 'att-004-2',
        fileName: '105_QD_LV_ToChuyenGiaDauThau.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 1980000,
        versionName: 'Quyết định ban hành',
        uploadedAt: '2026-02-12T16:20:00Z',
        note: 'Đã ký và đóng dấu phát hành',
        isPrimary: true
      }
    ],
    source: 'standalone'
  },
  {
    id: 'doc-005',
    docNumber: '67/TTr-TCKT',
    title: 'Tờ trình về việc Tạm ứng kinh phí giải phóng mặt bằng và di dời hạ tầng kỹ thuật đợt 1',
    docType: 'to_trinh',
    department: 'Phòng Kế toán - Tài chính',
    projectName: 'Bến cảng số 3 - Cảng Vũng Áng',
    issueDay: '20',
    issueMonth: '02',
    issueYear: '2026',
    issueDate: '2026-02-20',
    signer: 'Kế toán trưởng',
    storageLocation: 'Hộp lưu số 08 - Tủ Tài chính Kế toán',
    note: 'Kèm theo phụ lục bảng kê đối tượng bồi thường',
    status: 'effective',
    driveFileName: '67_TTr_TCKT_TamUngKinhPhiGPMB.pdf',
    driveFileLink: 'https://drive.google.com',
    fileSize: 5210000,
    uploadedAt: '2026-02-20T11:45:00Z',
    attachments: [
      {
        id: 'att-005-1',
        fileName: '67_TTr_TCKT_TamUngKinhPhiGPMB.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 5210000,
        versionName: 'Lần 1 (Bản gốc)',
        uploadedAt: '2026-02-20T11:45:00Z',
        note: 'Tờ trình chính thức đợt 1',
        isPrimary: true
      }
    ],
    source: 'standalone'
  },
  {
    id: 'doc-006',
    docNumber: '230/CV-LV',
    title: 'Công văn gửi Cảng vụ Hàng hải Hà Tĩnh về việc Phối hợp kiểm tra hiện trường luồng hàng hải',
    docType: 'cong_van',
    department: 'Phòng Kế hoạch - Kinh doanh',
    projectName: 'Bến cảng số 3 - Cảng Vũng Áng',
    issueDay: '01',
    issueMonth: '03',
    issueYear: '2026',
    issueDate: '2026-03-01',
    signer: 'Phó Tổng Giám đốc',
    storageLocation: 'Hộp lưu số 04 - Tủ Hành chính',
    note: 'Cảng vụ đã tiếp nhận ngày 02/03/2026',
    status: 'effective',
    driveFileName: '230_CV_LV_KiemTraLuongHangHai.pdf',
    driveFileLink: 'https://drive.google.com',
    fileSize: 1650000,
    uploadedAt: '2026-03-01T08:30:00Z',
    attachments: [
      {
        id: 'att-006-1',
        fileName: '230_CV_LV_KiemTraLuongHangHai.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 1650000,
        versionName: 'Lần 1 (Chính thức)',
        uploadedAt: '2026-03-01T08:30:00Z',
        isPrimary: true
      }
    ],
    source: 'standalone'
  },
  {
    id: 'doc-007',
    docNumber: '12/BBNT-2026',
    title: 'Biên bản nghiệm thu hoàn thành công tác ép cọc thử và quan trắc độ lún bến số 3',
    docType: 'bien_ban',
    department: 'Đơn vị Tư vấn Giám sát',
    projectName: 'Bến cảng số 3 - Cảng Vũng Áng',
    issueDay: '18',
    issueMonth: '03',
    issueYear: '2026',
    issueDate: '2026-03-18',
    signer: 'Kỹ sư Tư vấn Trưởng',
    storageLocation: 'Hộp lưu số 05 - Kệ Hồ sơ Nghiệm thu',
    note: 'Đạt yêu cầu tải trọng thử nghiệm Pmax = 350 tấn',
    status: 'effective',
    driveFileName: '12_BBNT_2026_EpCocThu.pdf',
    driveFileLink: 'https://drive.google.com',
    fileSize: 6780000,
    uploadedAt: '2026-03-18T17:00:00Z',
    attachments: [
      {
        id: 'att-007-1',
        fileName: '12_BBNT_2026_EpCocThu_SoBo.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 5800000,
        versionName: 'Lần 1 (Số liệu sơ bộ)',
        uploadedAt: '2026-03-15T15:00:00Z',
        note: 'Biên bản đo đạc sơ bộ tại hiện trường'
      },
      {
        id: 'att-007-2',
        fileName: '12_BBNT_2026_EpCocThu_ChinhThuc.pdf',
        fileLink: 'https://drive.google.com',
        fileSize: 6780000,
        versionName: 'Lần 2 (Nghiệm thu chính thức)',
        uploadedAt: '2026-03-18T17:00:00Z',
        note: 'Ký xác nhận TVGS và BQLDA',
        isPrimary: true
      }
    ],
    source: 'standalone'
  }
];

export function loadSavedManagedDocuments(): ManagedDocument[] {
  try {
    const raw = localStorage.getItem('pm_managed_documents');
    if (!raw) return INITIAL_MANAGED_DOCUMENTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_MANAGED_DOCUMENTS;

    // Tự động chuẩn hóa và di chuyển dữ liệu cũ sang định dạng đa tệp đính kèm / nhiều lần sửa đổi
    return parsed.map((doc: ManagedDocument) => {
      // Nếu đã có attachments thì đảm bảo mỗi attachment đều có ngày sửa uploadedAt
      if (doc.attachments && Array.isArray(doc.attachments) && doc.attachments.length > 0) {
        return {
          ...doc,
          attachments: doc.attachments.map((att: DocumentAttachment) => ({
            ...att,
            uploadedAt: att.uploadedAt || doc.uploadedAt || doc.issueDate || new Date().toISOString()
          }))
        };
      }

      // Kiểm tra xem có dữ liệu mẫu tương ứng trong INITIAL_MANAGED_DOCUMENTS không
      const sample = INITIAL_MANAGED_DOCUMENTS.find(s => s.id === doc.id);
      if (sample && sample.attachments && sample.attachments.length > 0) {
        return {
          ...doc,
          attachments: sample.attachments
        };
      }

      // Nếu có tệp đơn cũ (driveFileName/driveFileLink), tự động chuyển thành Lần 1 (Bản gốc)
      if (doc.driveFileName || doc.driveFileLink) {
        return {
          ...doc,
          attachments: [
            {
              id: `${doc.id}-att-1`,
              fileName: doc.driveFileName || 'Tệp đính kèm',
              fileLink: doc.driveFileLink,
              fileSize: doc.fileSize,
              versionName: 'Lần 1 (Gốc)',
              uploadedAt: doc.uploadedAt || doc.issueDate || new Date().toISOString(),
              note: 'Bản ban đầu',
              isPrimary: true
            }
          ]
        };
      }

      return {
        ...doc,
        attachments: []
      };
    });
  } catch (e) {
    console.error('Lỗi đọc tài liệu quản lý từ localStorage:', e);
    return INITIAL_MANAGED_DOCUMENTS;
  }
}

export function saveManagedDocuments(docs: ManagedDocument[]): void {
  try {
    localStorage.setItem('pm_managed_documents', JSON.stringify(docs));
  } catch (e) {
    console.error('Lỗi lưu tài liệu quản lý vào localStorage:', e);
  }
}

export const getStoredManagedDocuments = loadSavedManagedDocuments;
export const setStoredManagedDocuments = saveManagedDocuments;

// Danh mục loại văn bản mặc định (Tờ trình, Quyết định, Công văn...)
export const DEFAULT_MANAGED_DOC_TYPES: ManagedDocTypeInfo[] = [
  {
    id: 'to_trinh',
    code: 'TTr',
    name: 'Tờ trình',
    color: 'amber',
    description: 'Tờ trình đề xuất, xin chủ trương, phê duyệt từ các phòng ban',
    isSystem: true
  },
  {
    id: 'quyet_dinh',
    code: 'QĐ',
    name: 'Quyết định',
    color: 'rose',
    description: 'Quyết định ban hành từ Ban Giám đốc hoặc cơ quan có thẩm quyền',
    isSystem: true
  },
  {
    id: 'cong_van',
    code: 'CV',
    name: 'Công văn',
    color: 'blue',
    description: 'Công văn đi, công văn đến, trao đổi liên ngành và đối tác',
    isSystem: true
  },
  {
    id: 'thong_bao',
    code: 'TB',
    name: 'Thông báo',
    color: 'cyan',
    description: 'Thông báo nội bộ, phân công nhiệm vụ, kết luận điều hành',
    isSystem: true
  },
  {
    id: 'bien_ban',
    code: 'BB',
    name: 'Biên bản / Nghiệm thu',
    color: 'emerald',
    description: 'Biên bản làm việc, nghiệm thu giai đoạn, hiện trường bàn giao',
    isSystem: true
  },
  {
    id: 'hop_dong',
    code: 'HĐ',
    name: 'Hợp đồng & Phụ lục',
    color: 'purple',
    description: 'Hợp đồng kinh tế, phụ lục hợp đồng xây lắp, mua sắm vật tư',
    isSystem: true
  },
  {
    id: 'giay_phep',
    code: 'GP',
    name: 'Giấy phép',
    color: 'teal',
    description: 'Giấy phép xây dựng, cấp phép thi công, quy hoạch kiến trúc',
    isSystem: true
  },
  {
    id: 'bao_cao',
    code: 'BC',
    name: 'Báo cáo',
    color: 'indigo',
    description: 'Báo cáo tiến độ tuần/tháng, báo cáo giám sát, tài chính kỹ thuật',
    isSystem: true
  },
  {
    id: 'chi_thi',
    code: 'CT',
    name: 'Chỉ thị / Kết luận',
    color: 'orange',
    description: 'Chỉ thị công tác, kết luận cuộc họp giao ban',
    isSystem: true
  },
  {
    id: 'ban_ve',
    code: 'BV',
    name: 'Bản vẽ / Thiết kế',
    color: 'cyan',
    description: 'Bản vẽ thi công, hồ sơ thiết kế kỹ thuật, bản vẽ hoàn công',
    isSystem: true
  },
  {
    id: 'hoa_don',
    code: 'HĐơn',
    name: 'Hóa đơn / Chứng từ',
    color: 'yellow',
    description: 'Hóa đơn GTGT, chứng từ tạm ứng, thanh toán giải ngân',
    isSystem: true
  },
  {
    id: 'khac',
    code: 'K',
    name: 'Khác',
    color: 'slate',
    description: 'Các loại văn bản, hồ sơ biểu mẫu khác chưa phân loại',
    isSystem: true
  }
];

/**
 * Tự động nhận diện loại văn bản từ ký hiệu văn bản hoặc nội dung trích yếu
 */
export function detectDocTypeFromText(docText?: string, content?: string): string {
  const d = (docText || '').toLowerCase().trim();
  const c = (content || '').toLowerCase().trim();
  
  if (d.includes('/qđ') || d.includes('/qd') || d.includes('qđ') || d.includes('qd') || c.startsWith('quyết định') || c.includes('quyết định')) {
    return 'quyet_dinh';
  }
  if (d.includes('/ttr') || d.includes('ttr') || c.startsWith('tờ trình') || c.includes('tờ trình')) {
    return 'to_trinh';
  }
  if (d.includes('/hđ') || d.includes('/hd') || d.includes('hđ-xd') || d.includes('hd-xd') || c.startsWith('hợp đồng') || c.includes('hợp đồng') || c.includes('phụ lục')) {
    return 'hop_dong';
  }
  if (d.includes('/gpxd') || d.includes('gpxd') || d.includes('/gp') || c.startsWith('giấy phép') || c.includes('giấy phép')) {
    return 'giay_phep';
  }
  if (d.includes('/cv') || d.includes('cv') || c.startsWith('công văn') || c.includes('công văn')) {
    return 'cong_van';
  }
  if (d.includes('/tb') || d.includes('tb') || c.startsWith('thông báo') || c.includes('thông báo')) {
    return 'thong_bao';
  }
  if (d.includes('/bb') || d.includes('bb') || d.includes('bbnt') || c.includes('nghiệm thu') || c.startsWith('biên bản') || c.includes('biên bản')) {
    return 'bien_ban';
  }
  if (d.includes('/bc') || d.includes('bc') || c.startsWith('báo cáo') || c.includes('báo cáo')) {
    return 'bao_cao';
  }
  if (d.includes('/ct') || d.includes('ct') || c.startsWith('chỉ thị') || c.includes('chỉ thị')) {
    return 'chi_thi';
  }
  if (d.includes('/bv') || d.includes('bv') || c.startsWith('bản vẽ') || c.includes('bản vẽ') || c.includes('thiết kế')) {
    return 'ban_ve';
  }
  if (d.includes('hđơn') || d.includes('hdon') || c.startsWith('hóa đơn') || c.includes('hóa đơn')) {
    return 'hoa_don';
  }
  return 'khac';
}

export function loadSavedManagedDocTypes(): ManagedDocTypeInfo[] {
  try {
    const raw = localStorage.getItem('pm_managed_doc_types');
    if (!raw) return DEFAULT_MANAGED_DOC_TYPES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MANAGED_DOC_TYPES;
  } catch (e) {
    console.error('Lỗi đọc loại văn bản từ localStorage:', e);
    return DEFAULT_MANAGED_DOC_TYPES;
  }
}

export function saveManagedDocTypes(types: ManagedDocTypeInfo[]): void {
  try {
    localStorage.setItem('pm_managed_doc_types', JSON.stringify(types));
  } catch (e) {
    console.error('Lỗi lưu loại văn bản vào localStorage:', e);
  }
}

export const getStoredManagedDocTypes = loadSavedManagedDocTypes;
export const setStoredManagedDocTypes = saveManagedDocTypes;
