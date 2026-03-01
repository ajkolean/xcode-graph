/**
 * Canonical Node Type Color Palette
 *
 * This is the single source of truth for node type colors.
 * All other color references (tokens.css, canvas-theme fallbacks, etc.)
 * must derive from these values.
 *
 * Palette: Noora Design System
 *
 * @module shared/constants/node-palette
 */

import { NodeType } from '@/shared/schemas/graph.types.ts';

/**
 * Canonical node type color palette.
 * This is the single source of truth -- tokens.css and node-colors.ts derive from these.
 *
 * Colors are Noora palette hex values:
 * - App (orange-500): {@link https://noora.sh}
 * - Framework (azure-500)
 * - Library (green-500)
 * - TestUnit / TestUi (pink-500)
 * - Cli (blue-500)
 * - Package (yellow-500)
 */
export const NODE_PALETTE: Record<NodeType, string> = {
  [NodeType.App]: '#F59E0B',
  [NodeType.Framework]: '#0EA5E9',
  [NodeType.Library]: '#22C55E',
  [NodeType.TestUnit]: '#EC4899',
  [NodeType.TestUi]: '#EC4899',
  [NodeType.Cli]: '#3B82F6',
  [NodeType.Package]: '#EAB308',
};
