/**
 * Cluster details header component
 * Shows cluster icon, name, and back button
 * All styling uses design system CSS variables
 */

import { ChevronLeft, Package, Folder } from 'lucide-react';

interface ClusterHeaderProps {
  clusterName: string;
  clusterType: 'package' | 'project';
  clusterColor: string;
  isExternal: boolean;
  onBack: () => void;
}

export function ClusterHeader({
  clusterName,
  clusterType,
  clusterColor,
  isExternal,
  onBack
}: ClusterHeaderProps) {
  const isPackage = clusterType === 'package';
  const ClusterIcon = isPackage ? Package : Folder;

  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 border-b"
      style={{
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="size-6 rounded flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors"
        style={{
          color: 'var(--color-muted-foreground)'
        }}
      >
        <ChevronLeft className="size-5" />
      </button>
      
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon - with glow effect matching node details */}
        <div 
          className="size-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${clusterColor}15`,
            boxShadow: `0 0 20px ${clusterColor}30, 0 0 40px ${clusterColor}15`
          }}
        >
          <ClusterIcon 
            className="size-6"
            strokeWidth={2}
            style={{ color: clusterColor }}
          />
        </div>
        
        {/* Cluster Name and Origin - vertical stack */}
        <div className="flex-1 min-w-0">
          <h2
            className="truncate"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-foreground)'
            }}
          >
            {clusterName}
          </h2>
          
          {/* Origin subtitle */}
          <div
            className="truncate"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              lineHeight: '18px',
              color: 'var(--color-muted-foreground)'
            }}
          >
            {isExternal ? 'External' : 'Internal'}
          </div>
        </div>
      </div>
    </div>
  );
}
