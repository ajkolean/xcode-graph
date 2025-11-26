import { useState } from 'react';
import { ChevronDown, ChevronUp, Smartphone, Monitor, Glasses, Tv, Watch } from 'lucide-react';
import { getNodeIconPath } from '../utils/nodeIcons';
import AppGridIcon from '../imports/AppGrid1';
import FlaskIcon from '../imports/Flask1';

export function LegendPanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute top-4 right-4 bg-zinc-900/95 border border-zinc-700 rounded-lg overflow-hidden backdrop-blur-sm z-10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <span className="text-sm text-zinc-300">Graph Legend</span>
        {isExpanded ? (
          <ChevronUp className="size-4 text-zinc-500" />
        ) : (
          <ChevronDown className="size-4 text-zinc-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-zinc-800 space-y-4">
          {/* Node Shapes */}
          <div>
            <div className="text-xs text-zinc-500 mb-2">Node Shapes</div>
            <div className="space-y-2">
              {/* App with platform icons */}
              <div className="flex items-center gap-2">
                <div className="size-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="-10 -10 20 20" className="text-purple-500">
                    <path
                      d={getNodeIconPath('app', 'iOS')}
                      fill="rgba(15, 15, 20, 0.95)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">App (platform-specific)</span>
              </div>
              
              {/* Framework */}
              <div className="flex items-center gap-2">
                <div className="size-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="-14 -14 28 28" className="text-blue-500">
                    <path
                      d={getNodeIconPath('framework')}
                      fill="rgba(15, 15, 20, 0.95)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Framework</span>
              </div>
              
              {/* Library */}
              <div className="flex items-center gap-2">
                <div className="size-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="-14 -14 28 28" className="text-cyan-500">
                    <path
                      d={getNodeIconPath('library')}
                      fill="rgba(15, 15, 20, 0.95)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Library</span>
              </div>
              
              {/* Test Unit */}
              <div className="flex items-center gap-2">
                <div className="size-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="-14 -14 28 28" className="text-green-500">
                    <path
                      d={getNodeIconPath('test-unit')}
                      fill="rgba(15, 15, 20, 0.95)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Unit Test</span>
              </div>
              
              {/* Test UI */}
              <div className="flex items-center gap-2">
                <div className="size-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="-14 -14 28 28" className="text-emerald-500">
                    <path
                      d={getNodeIconPath('test-ui')}
                      fill="rgba(15, 15, 20, 0.95)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">UI Test</span>
              </div>
              
              {/* CLI */}
              <div className="flex items-center gap-2">
                <div className="size-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="-16 -14 32 28" className="text-orange-500">
                    <path
                      d={getNodeIconPath('cli')}
                      fill="rgba(15, 15, 20, 0.95)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">CLI Tool</span>
              </div>
              
              {/* Package */}
              <div className="flex items-center gap-2">
                <div className="size-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="-14 -14 28 28" className="text-amber-500">
                    <path
                      d={getNodeIconPath('package')}
                      fill="rgba(15, 15, 20, 0.95)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Swift Package</span>
              </div>
            </div>
          </div>

          {/* Platform Icons */}
          <div className="pt-3 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 mb-2">App Platforms</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Smartphone className="size-3.5" style={{ color: '#6F2CFF' }} />
                <span className="text-xs text-zinc-400">iOS</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="size-3.5" style={{ color: '#6F2CFF' }} />
                <span className="text-xs text-zinc-400">macOS</span>
              </div>
              <div className="flex items-center gap-2">
                <Glasses className="size-3.5" style={{ color: '#6F2CFF' }} />
                <span className="text-xs text-zinc-400">visionOS</span>
              </div>
              <div className="flex items-center gap-2">
                <Tv className="size-3.5" style={{ color: '#6F2CFF' }} />
                <span className="text-xs text-zinc-400">tvOS</span>
              </div>
              <div className="flex items-center gap-2">
                <Watch className="size-3.5" style={{ color: '#6F2CFF' }} />
                <span className="text-xs text-zinc-400">watchOS</span>
              </div>
            </div>
          </div>

          {/* Edges */}
          <div className="pt-3 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 mb-2">Edges</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-zinc-700"></div>
                <span className="text-xs text-zinc-400">Dependency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-purple-500"></div>
                <span className="text-xs text-zinc-400">Selected Path</span>
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div className="pt-3 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 mb-2">Interactions</div>
            <div className="space-y-1 text-xs text-zinc-400">
              <div>• Click node to inspect</div>
              <div>• Drag to pan</div>
              <div>• Scroll to zoom</div>
              <div>• Hover to highlight</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}