import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  RotateCcw, 
  Tag, 
  AlertCircle, 
  FolderCheck,
  Palette,
  Sparkles
} from 'lucide-react';
import { ManagedDocTypeInfo, ManagedDocument } from '../types';
import { COLOR_OPTIONS, getDocTypeColorStyle } from '../utils/docTypeStyles';

interface DocTypeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTypes: ManagedDocTypeInfo[];
  allDocuments: ManagedDocument[];
  onAddDocType: (newType: Omit<ManagedDocTypeInfo, 'id'>) => string; // returns created ID
  onUpdateDocType: (updatedType: ManagedDocTypeInfo) => void;
  onDeleteDocType: (typeId: string, reassignToId?: string) => void;
  onResetDocTypes: () => void;
  onSelectDocType?: (typeId: string) => void;
}

export const DocTypeManagementModal: React.FC<DocTypeManagementModalProps> = ({
  isOpen,
  onClose,
  docTypes,
  allDocuments,
  onAddDocType,
  onUpdateDocType,
  onDeleteDocType,
  onResetDocTypes,
  onSelectDocType
}) => {
  // Mode: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  // Form fields
  const [typeName, setTypeName] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [typeColor, setTypeColor] = useState('amber');
  const [typeDescription, setTypeDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deletingType, setDeletingType] = useState<ManagedDocTypeInfo | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('khac');

  if (!isOpen) return null;

  // Tính số lượng văn bản đang áp dụng từng loại
  const getDocCountForType = (typeId: string) => {
    return allDocuments.filter(d => d.docType === typeId).length;
  };

  const handleOpenAddForm = () => {
    setMode('add');
    setEditingTypeId(null);
    setTypeName('');
    setTypeCode('');
    setTypeColor('blue');
    setTypeDescription('');
    setFormError('');
  };

  const handleOpenEditForm = (typeInfo: ManagedDocTypeInfo) => {
    setMode('edit');
    setEditingTypeId(typeInfo.id);
    setTypeName(typeInfo.name);
    setTypeCode(typeInfo.code);
    setTypeColor(typeInfo.color || 'slate');
    setTypeDescription(typeInfo.description || '');
    setFormError('');
  };

  const handleCancelForm = () => {
    setMode('list');
    setEditingTypeId(null);
    setFormError('');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      setFormError('Vui lòng nhập tên loại văn bản!');
      return;
    }
    if (!typeCode.trim()) {
      setFormError('Vui lòng nhập mã / ký hiệu viết tắt!');
      return;
    }

    if (mode === 'add') {
      const createdId = onAddDocType({
        name: typeName.trim(),
        code: typeCode.trim().toUpperCase(),
        color: typeColor,
        description: typeDescription.trim(),
        isSystem: false
      });
      if (onSelectDocType) {
        onSelectDocType(createdId);
      }
      setMode('list');
    } else if (mode === 'edit' && editingTypeId) {
      const existing = docTypes.find(t => t.id === editingTypeId);
      onUpdateDocType({
        id: editingTypeId,
        name: typeName.trim(),
        code: typeCode.trim().toUpperCase(),
        color: typeColor,
        description: typeDescription.trim(),
        isSystem: existing?.isSystem ?? false
      });
      setMode('list');
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingType) return;
    onDeleteDocType(deletingType.id, reassignTargetId);
    setDeletingType(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Quản Lý Danh Mục Loại Văn Bản</span>
                <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800/60 font-mono">
                  {docTypes.length} loại
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Thêm, sửa, đổi tên, ký hiệu và màu sắc các loại văn bản (Tờ trình, Quyết định...)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* View: ADD or EDIT Form */}
          {(mode === 'add' || mode === 'edit') && (
            <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-4 sm:p-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-400" />
                  <span>{mode === 'add' ? 'Thêm loại văn bản mới' : 'Chỉnh sửa / Thay đổi loại văn bản'}</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Quay lại danh sách
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-2.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Tên loại văn bản */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tên loại văn bản <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                      placeholder="VD: Hồ sơ mời thầu, Giấy phép thi công..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      autoFocus
                    />
                  </div>

                  {/* Ký hiệu / Mã viết tắt */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ký hiệu viết tắt <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={typeCode}
                      onChange={(e) => setTypeCode(e.target.value)}
                      placeholder="VD: HSMT, GPXD..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 uppercase font-mono placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Chọn màu sắc badge */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Màu sắc nhãn (Badge Color):</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Xem trước: 
                      <span className={`ml-1.5 px-2 py-0.5 rounded-md font-medium text-xs border ${getDocTypeColorStyle(typeColor).pillBg}`}>
                        [{typeCode || 'MÃ'}] {typeName || 'Tên loại văn bản'}
                      </span>
                    </span>
                  </label>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTypeColor(c.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          typeColor === c.id
                            ? 'ring-2 ring-white border-white bg-slate-800 text-white font-bold'
                            : 'border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dotBg} shrink-0`} />
                        <span className="truncate">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mô tả ghi chú */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mô tả phạm vi văn bản <span className="text-slate-500 text-[11px] font-normal">(tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    value={typeDescription}
                    onChange={(e) => setTypeDescription(e.target.value)}
                    placeholder="VD: Dùng cho các hồ sơ lựa chọn nhà thầu, gói thầu xây lắp..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-rose-500"
                  />
                </div>

                {/* Nút hành động Form */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{mode === 'add' ? 'Lưu loại mới' : 'Cập nhật thay đổi'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* View: LIST ALL TYPES */}
          {mode === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  Danh sách loại văn bản đang áp dụng:
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onResetDocTypes}
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-400 text-xs px-2.5 py-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                    title="Khôi phục danh sách loại văn bản mặc định ban đầu"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Khôi phục mặc định</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm loại văn bản</span>
                  </button>
                </div>
              </div>

              {/* Table / List */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/70">
                {docTypes.map((type, idx) => {
                  const style = getDocTypeColorStyle(type.color);
                  const count = getDocCountForType(type.id);

                  return (
                    <div 
                      key={type.id}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Left: STT + Badge + Name + Description */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-500 w-5 text-center">
                          {idx + 1}
                        </span>

                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border font-mono shrink-0 ${style.pillBg}`}>
                          {type.code}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate">
                              {type.name}
                            </span>
                            {type.isSystem && (
                              <span className="text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.2 rounded font-sans">
                                Hệ thống
                              </span>
                            )}
                          </div>
                          {type.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-sm">
                              {type.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Count + Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Count */}
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700/80"
                          title={`${count} văn bản đang dùng loại này`}
                        >
                          {count} vb
                        </span>

                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(type)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Sửa loại văn bản (Tên, mã, màu sắc)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Nút Xóa (cho phép xóa nếu không phải loại 'khac' cốt lõi) */}
                        {type.id !== 'khac' && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingType(type);
                              setReassignTargetId('khac');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Xóa loại văn bản này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delete confirmation modal overlay */}
          {deletingType && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-rose-200">
                    Xác nhận xóa loại văn bản: &quot;{deletingType.name}&quot;?
                  </h4>
                  <p className="text-xs text-rose-300/90">
                    Hiện có <span className="font-bold underline">{getDocCountForType(deletingType.id)}</span> văn bản đang thuộc loại này.
                  </p>
                </div>
              </div>

              {getDocCountForType(deletingType.id) > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chuyển các văn bản trên sang loại thay thế:
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-rose-500 cursor-pointer"
                  >
                    {docTypes.filter(t => t.id !== deletingType.id).map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.code}] {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeletingType(null)}
                  className="px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/70 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Mọi thay đổi về loại văn bản được tự động lưu trữ và đồng bộ với biểu mẫu</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
