export interface DocTypeColorStyle {
  badgeBg: string;
  textCol: string;
  borderCol: string;
  pillBg: string;
  dotColor: string;
  colorName: string;
}

export interface ColorOption {
  id: string;
  label: string;
  previewBg: string;
  textCol: string;
  dotBg: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'amber', label: 'Vàng hổ phách', previewBg: 'bg-amber-500/20 border-amber-500/40', textCol: 'text-amber-400', dotBg: 'bg-amber-400' },
  { id: 'rose', label: 'Đỏ hồng', previewBg: 'bg-rose-500/20 border-rose-500/40', textCol: 'text-rose-400', dotBg: 'bg-rose-400' },
  { id: 'blue', label: 'Xanh dương', previewBg: 'bg-blue-500/20 border-blue-500/40', textCol: 'text-blue-400', dotBg: 'bg-blue-400' },
  { id: 'emerald', label: 'Xanh ngọc', previewBg: 'bg-emerald-500/20 border-emerald-500/40', textCol: 'text-emerald-400', dotBg: 'bg-emerald-400' },
  { id: 'purple', label: 'Tím thạch anh', previewBg: 'bg-purple-500/20 border-purple-500/40', textCol: 'text-purple-400', dotBg: 'bg-purple-400' },
  { id: 'indigo', label: 'Xanh chàm', previewBg: 'bg-indigo-500/20 border-indigo-500/40', textCol: 'text-indigo-400', dotBg: 'bg-indigo-400' },
  { id: 'orange', label: 'Cam tươi', previewBg: 'bg-orange-500/20 border-orange-500/40', textCol: 'text-orange-400', dotBg: 'bg-orange-400' },
  { id: 'teal', label: 'Xanh mòng két', previewBg: 'bg-teal-500/20 border-teal-500/40', textCol: 'text-teal-400', dotBg: 'bg-teal-400' },
  { id: 'cyan', label: 'Xanh lơ biển', previewBg: 'bg-cyan-500/20 border-cyan-500/40', textCol: 'text-cyan-400', dotBg: 'bg-cyan-400' },
  { id: 'yellow', label: 'Vàng tươi', previewBg: 'bg-yellow-500/20 border-yellow-500/40', textCol: 'text-yellow-400', dotBg: 'bg-yellow-400' },
  { id: 'pink', label: 'Hồng sen', previewBg: 'bg-pink-500/20 border-pink-500/40', textCol: 'text-pink-400', dotBg: 'bg-pink-400' },
  { id: 'slate', label: 'Xám ghi', previewBg: 'bg-slate-500/20 border-slate-500/40', textCol: 'text-slate-400', dotBg: 'bg-slate-400' }
];

const COLOR_MAP: Record<string, DocTypeColorStyle> = {
  amber: {
    badgeBg: 'bg-amber-500/15',
    textCol: 'text-amber-300',
    borderCol: 'border-amber-500/30',
    pillBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dotColor: 'bg-amber-400',
    colorName: 'Vàng hổ phách'
  },
  rose: {
    badgeBg: 'bg-rose-500/15',
    textCol: 'text-rose-300',
    borderCol: 'border-rose-500/30',
    pillBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    dotColor: 'bg-rose-400',
    colorName: 'Đỏ hồng'
  },
  blue: {
    badgeBg: 'bg-blue-500/15',
    textCol: 'text-blue-300',
    borderCol: 'border-blue-500/30',
    pillBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    dotColor: 'bg-blue-400',
    colorName: 'Xanh dương'
  },
  emerald: {
    badgeBg: 'bg-emerald-500/15',
    textCol: 'text-emerald-300',
    borderCol: 'border-emerald-500/30',
    pillBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    colorName: 'Xanh ngọc'
  },
  purple: {
    badgeBg: 'bg-purple-500/15',
    textCol: 'text-purple-300',
    borderCol: 'border-purple-500/30',
    pillBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    dotColor: 'bg-purple-400',
    colorName: 'Tím thạch anh'
  },
  indigo: {
    badgeBg: 'bg-indigo-500/15',
    textCol: 'text-indigo-300',
    borderCol: 'border-indigo-500/30',
    pillBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    dotColor: 'bg-indigo-400',
    colorName: 'Xanh chàm'
  },
  orange: {
    badgeBg: 'bg-orange-500/15',
    textCol: 'text-orange-300',
    borderCol: 'border-orange-500/30',
    pillBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    dotColor: 'bg-orange-400',
    colorName: 'Cam tươi'
  },
  teal: {
    badgeBg: 'bg-teal-500/15',
    textCol: 'text-teal-300',
    borderCol: 'border-teal-500/30',
    pillBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    dotColor: 'bg-teal-400',
    colorName: 'Xanh mòng két'
  },
  cyan: {
    badgeBg: 'bg-cyan-500/15',
    textCol: 'text-cyan-300',
    borderCol: 'border-cyan-500/30',
    pillBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    dotColor: 'bg-cyan-400',
    colorName: 'Xanh lơ biển'
  },
  yellow: {
    badgeBg: 'bg-yellow-500/15',
    textCol: 'text-yellow-300',
    borderCol: 'border-yellow-500/30',
    pillBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    dotColor: 'bg-yellow-400',
    colorName: 'Vàng tươi'
  },
  pink: {
    badgeBg: 'bg-pink-500/15',
    textCol: 'text-pink-300',
    borderCol: 'border-pink-500/30',
    pillBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    dotColor: 'bg-pink-400',
    colorName: 'Hồng sen'
  },
  slate: {
    badgeBg: 'bg-slate-500/15',
    textCol: 'text-slate-300',
    borderCol: 'border-slate-500/30',
    pillBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    dotColor: 'bg-slate-400',
    colorName: 'Xám ghi'
  }
};

export function getDocTypeColorStyle(color?: string): DocTypeColorStyle {
  if (!color || !COLOR_MAP[color]) {
    return COLOR_MAP.slate;
  }
  return COLOR_MAP[color];
}
