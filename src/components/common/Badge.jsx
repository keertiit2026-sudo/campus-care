import React from 'react';
import { 
  Wifi, Monitor, FlaskConical, Building2, Sparkles, 
  Wrench, Bus, Utensils, BookOpen, GraduationCap, AlertCircle,
  Clock, CheckCircle2, XCircle, ArrowRightCircle,
  Armchair, Zap, Droplets, Trees, ShieldAlert, HelpCircle, Layers
} from 'lucide-react';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../data/categories';

export const CategoryIcon = ({ iconName, size = 16, className = "" }) => {
  const iconProps = { size, className };
  switch (iconName) {
    case 'Armchair': return <Armchair {...iconProps} />;
    case 'FlaskConical': return <FlaskConical {...iconProps} />;
    case 'Wifi': return <Wifi {...iconProps} />;
    case 'Zap': return <Zap {...iconProps} />;
    case 'Droplets': return <Droplets {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Building2': return <Building2 {...iconProps} />;
    case 'Trees': return <Trees {...iconProps} />;
    case 'ShieldAlert': return <ShieldAlert {...iconProps} />;
    case 'HelpCircle': return <HelpCircle {...iconProps} />;
    case 'Monitor': return <Monitor {...iconProps} />;
    case 'Wrench': return <Wrench {...iconProps} />;
    case 'Bus': return <Bus {...iconProps} />;
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'GraduationCap': return <GraduationCap {...iconProps} />;
    default: return <Layers {...iconProps} />;
  }
};

export const CategoryBadge = ({ categoryId, showIcon = true, size = 'md' }) => {
  const cat = CATEGORIES.find(c => c.id === categoryId || c.aliases?.includes(categoryId)) || {
    name: categoryId || 'General',
    icon: 'HelpCircle',
    color: '#6366f1'
  };

  return (
    <span 
      className="badge badge-category"
      style={{
        borderColor: `${cat.color}40`,
        backgroundColor: `${cat.color}15`,
        color: cat.color,
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        padding: size === 'sm' ? '2px 8px' : '4px 10px'
      }}
    >
      {showIcon && <CategoryIcon iconName={cat.icon} size={size === 'sm' ? 12 : 14} />}
      <span>{cat.name}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'md' }) => {
  const p = (priority || 'low').toLowerCase();
  const meta = PRIORITIES.find(item => item.id === p) || { name: p, color: '#10b981' };

  return (
    <span 
      className={`badge badge-priority-${p}`}
      style={{
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        padding: size === 'sm' ? '2px 8px' : '4px 10px'
      }}
    >
      <span className="badge-dot" style={{ backgroundColor: meta.color }} />
      <span>{meta.name}</span>
    </span>
  );
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const statusSlug = (status || 'Submitted').toLowerCase().replace(/\s+/g, '-');
  
  const getStatusIcon = () => {
    const s = (status || '').toLowerCase();
    if (s.includes('resolved')) return <CheckCircle2 size={13} />;
    if (s.includes('progress')) return <Clock size={13} />;
    if (s.includes('closed')) return <XCircle size={13} />;
    return <ArrowRightCircle size={13} />;
  };

  return (
    <span 
      className={`badge badge-status-${statusSlug}`}
      style={{
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        padding: size === 'sm' ? '2px 8px' : '4px 10px'
      }}
    >
      {getStatusIcon()}
      <span>{status || 'Submitted'}</span>
    </span>
  );
};
