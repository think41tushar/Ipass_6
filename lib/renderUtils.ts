// lib/renderUtils.ts

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusConfig {
  color: string;
  icon: LucideIcon;
  iconColor: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  completed: {
    color: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
    icon: CheckCircle,
    iconColor: "text-emerald-400"
  },
  failed: {
    color: "bg-red-900/60 text-red-300 border-red-700",
    icon: XCircle,
    iconColor: "text-red-400"
  },
  default: {
    color: "bg-amber-900/60 text-amber-300 border-amber-700",
    icon: Clock,
    iconColor: "text-amber-400"
  }
};

export const getStatusColor = (status: string): string =>
  STATUS_CONFIGS[status]?.color || STATUS_CONFIGS.default.color;

export const getStatusIcon = (status: string): any => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.default;
  const IconComponent: React.ComponentType<{ size?: number; className?: string }> = config.icon;
  return (IconComponent);
};
