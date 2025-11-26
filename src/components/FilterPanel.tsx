import { X } from 'lucide-react';
import { FilterState } from '../types/app';

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

  return (
    <div className="absolute left-0 top-0 bottom-0 w-80 bg-zinc-900 border-r border-zinc-800 z-10 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900">
        <h3 className="text-zinc-200">Filters</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Filter Sections */}
      <div className="p-4 space-y-6">
        {/* Node Types */}
        <div>
          <div className="text-sm text-zinc-400 mb-3">Target Type</div>
          <div className="space-y-2">
            {[
              { value: 'app', label: 'App Targets' },
              { value: 'framework', label: 'Frameworks' },
              { value: 'library', label: 'Static Libraries' },
              { value: 'test-unit', label: 'Unit Tests' },
              { value: 'test-ui', label: 'UI Tests' },
              { value: 'cli', label: 'CLI Tools' },
              { value: 'package', label: 'External Packages' }
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.nodeTypes.has(value)}
                  onChange={() => toggleNodeType(value)}
                  className="size-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-zinc-300 group-hover:text-zinc-200">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <div className="text-sm text-zinc-400 mb-3">Platform</div>
          <div className="space-y-2">
            {['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS'].map(platform => (
              <label
                key={platform}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.platforms.has(platform)}
                  onChange={() => togglePlatform(platform)}
                  className="size-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-zinc-300 group-hover:text-zinc-200">
                  {platform}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Origin */}
        <div>
          <div className="text-sm text-zinc-400 mb-3">Origin</div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.origins.has('local')}
                onChange={() => toggleOrigin('local')}
                className="size-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-zinc-300 group-hover:text-zinc-200">
                Local Projects
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.origins.has('external')}
                onChange={() => toggleOrigin('external')}
                className="size-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-zinc-300 group-hover:text-zinc-200">
                External Packages
              </span>
            </label>
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="text-sm text-zinc-400 mb-3">Project</div>
          <div className="space-y-2">
            {['TuistCore', 'TuistKit'].map(project => (
              <label
                key={project}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.projects.has(project)}
                  onChange={() => toggleProject(project)}
                  className="size-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-zinc-300 group-hover:text-zinc-200">
                  {project}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            onFiltersChange({
              nodeTypes: new Set(['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package']),
              platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
              origins: new Set(['local', 'external']),
              projects: new Set(['TuistCore', 'TuistKit'])
            });
          }}
          className="w-full px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-sm border border-zinc-700 transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}