/**
 * DEAD CODE - MARKED FOR DELETION
 *
 * This component is not used anywhere in the codebase.
 * Analysis date: 2025-11-26
 *
 * Can be safely deleted after verification that:
 * 1. `pnpm dev` works correctly
 * 2. `pnpm build` passes
 * 3. No hidden dependencies exist
 *
 * If you need this component, remove this comment and update the analysis.
 */

import { X } from 'lucide-react';
import { LitButton } from '../components-lit/wrappers/Button';
import type { FilterState } from '../types/app';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
}

export function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const toggleNodeType = (type: string) => {
    const newTypes = new Set(filters.nodeTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    onFiltersChange({ ...filters, nodeTypes: newTypes });
  };

  const togglePlatform = (platform: string) => {
    const newPlatforms = new Set(filters.platforms);
    if (newPlatforms.has(platform)) {
      newPlatforms.delete(platform);
    } else {
      newPlatforms.add(platform);
    }
    onFiltersChange({ ...filters, platforms: newPlatforms });
  };

  const toggleOrigin = (origin: string) => {
    const newOrigins = new Set(filters.origins);
    if (newOrigins.has(origin)) {
      newOrigins.delete(origin);
    } else {
      newOrigins.add(origin);
    }
    onFiltersChange({ ...filters, origins: newOrigins });
  };

  const toggleProject = (project: string) => {
    const newProjects = new Set(filters.projects);
    if (newProjects.has(project)) {
      newProjects.delete(project);
    } else {
      newProjects.add(project);
    }
    onFiltersChange({ ...filters, projects: newProjects });
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 'var(--spacing-6)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 'var(--font-sizes-sm)',
    color: 'var(--colors-muted-foreground)',
    marginBottom: 'var(--spacing-3)',
  };

  const checkboxGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '320px',
        backgroundColor: 'var(--colors-sidebar)',
        borderRight: '1px solid var(--colors-border)',
        zIndex: 10,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--colors-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--colors-sidebar)',
          zIndex: 1,
        }}
      >
        <h3 style={{ color: 'var(--colors-foreground)', margin: 0 }}>Filters</h3>
        <LitButton variant="ghost" size="icon" onClick={onClose}>
          <X style={{ width: 16, height: 16 }} />
        </LitButton>
      </div>

      {/* Filter Sections */}
      <div style={{ padding: 'var(--spacing-4)' }}>
        {/* Node Types */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Target Type</div>
          <div style={checkboxGroupStyle}>
            {[
              { value: 'app', label: 'App Targets' },
              { value: 'framework', label: 'Frameworks' },
              { value: 'library', label: 'Static Libraries' },
              { value: 'test-unit', label: 'Unit Tests' },
              { value: 'test-ui', label: 'UI Tests' },
              { value: 'cli', label: 'CLI Tools' },
              { value: 'package', label: 'External Packages' },
            ].map(({ value, label }) => (
              <label key={value} style={labelStyle}>
                <input
                  type="checkbox"
                  checked={filters.nodeTypes.has(value)}
                  onChange={() => toggleNodeType(value)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--font-sizes-sm)', color: 'var(--colors-foreground)' }}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Platform</div>
          <div style={checkboxGroupStyle}>
            {['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS'].map((platform) => (
              <label key={platform} style={labelStyle}>
                <input
                  type="checkbox"
                  checked={filters.platforms.has(platform)}
                  onChange={() => togglePlatform(platform)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--font-sizes-sm)', color: 'var(--colors-foreground)' }}>
                  {platform}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Origin */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Origin</div>
          <div style={checkboxGroupStyle}>
            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={filters.origins.has('local')}
                onChange={() => toggleOrigin('local')}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 'var(--font-sizes-sm)', color: 'var(--colors-foreground)' }}>
                Local Projects
              </span>
            </label>
            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={filters.origins.has('external')}
                onChange={() => toggleOrigin('external')}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 'var(--font-sizes-sm)', color: 'var(--colors-foreground)' }}>
                External Packages
              </span>
            </label>
          </div>
        </div>

        {/* Projects */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Project</div>
          <div style={checkboxGroupStyle}>
            {['TuistCore', 'TuistKit'].map((project) => (
              <label key={project} style={labelStyle}>
                <input
                  type="checkbox"
                  checked={filters.projects.has(project)}
                  onChange={() => toggleProject(project)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--font-sizes-sm)', color: 'var(--colors-foreground)' }}>
                  {project}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <LitButton
          variant="outline"
          onClick={() => {
            onFiltersChange({
              nodeTypes: new Set([
                'app',
                'framework',
                'library',
                'test-unit',
                'test-ui',
                'cli',
                'package',
              ]),
              platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
              origins: new Set(['local', 'external']),
              projects: new Set(['TuistCore', 'TuistKit']),
            });
          }}
          style={{ width: '100%' }}
        >
          Reset All Filters
        </LitButton>
      </div>
    </div>
  );
}
