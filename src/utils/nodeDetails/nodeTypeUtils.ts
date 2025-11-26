/**
 * Utilities for node type colors and labels in detail panels
 */

export function getNodeTypeColor(type: string, project?: string): string {
  if (type === 'package') return 'text-amber-500';
  if (project === 'TuistKit') return 'text-blue-500';
  return 'text-purple-500';
}

export function getNodeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    app: 'App Target',
    framework: 'Framework',
    library: 'Static Library',
    'test-unit': 'Unit Test Bundle',
    'test-ui': 'UI Test Bundle',
    cli: 'CLI Tool',
    package: 'External Package',
  };
  return labels[type] || type;
}
