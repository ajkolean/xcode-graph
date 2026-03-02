/**
 * Node Icons utility tests
 */

import { NodeType, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { getAppIconPath, getNodeIconPath, getNodeTypeLabel } from './node-icons';

describe('getAppIconPath', () => {
  it('returns smartphone icon for iOS', () => {
    const path = getAppIconPath(Platform.iOS);
    expect(path).toContain('M-8,-16');
  });

  it('returns monitor icon for macOS', () => {
    const path = getAppIconPath(Platform.macOS);
    expect(path).toContain('M-14,-10');
  });

  it('returns glasses icon for visionOS', () => {
    const path = getAppIconPath(Platform.visionOS);
    expect(path).toContain('M-6,-2');
  });

  it('returns TV icon for tvOS', () => {
    const path = getAppIconPath(Platform.tvOS);
    expect(path).toContain('M-14,-2');
  });

  it('returns watch icon for watchOS', () => {
    const path = getAppIconPath(Platform.watchOS);
    expect(path).toContain('M-6,-16');
  });

  it('returns default smartphone icon for unknown platform', () => {
    const path = getAppIconPath('UnknownPlatform');
    expect(path).toContain('M-8,-16');
  });
});

describe('getNodeIconPath', () => {
  it('returns app icon with platform when type is App and platform given', () => {
    const path = getNodeIconPath(NodeType.App, Platform.macOS);
    expect(path).toContain('M-14,-10');
  });

  it('returns default iOS app icon when type is App and no platform', () => {
    const path = getNodeIconPath(NodeType.App);
    expect(path).toContain('M-8,-16');
  });

  it('returns triangle for Framework', () => {
    const path = getNodeIconPath(NodeType.Framework);
    expect(path).toContain('M0,-14');
    expect(path).toContain('L12,12');
  });

  it('returns pentagon for Library', () => {
    const path = getNodeIconPath(NodeType.Library);
    expect(path).toContain('M0,-14');
    expect(path).toContain('L13,-4');
  });

  it('returns flask icon for TestUnit', () => {
    const path = getNodeIconPath(NodeType.TestUnit);
    expect(path).toContain('M-6,-14');
  });

  it('returns microscope icon for TestUi', () => {
    const path = getNodeIconPath(NodeType.TestUi);
    expect(path).toContain('M-12,14');
  });

  it('returns terminal icon for Cli', () => {
    const path = getNodeIconPath(NodeType.Cli);
    expect(path).toContain('M-14,-12');
  });

  it('returns package icon for Package', () => {
    const path = getNodeIconPath(NodeType.Package);
    expect(path).toContain('M-12,-6');
  });

  it('returns circle fallback for unknown type', () => {
    const path = getNodeIconPath('unknown-type');
    expect(path).toContain('A12,12');
  });
});

describe('getNodeTypeLabel', () => {
  it('returns "App Target" for App', () => {
    expect(getNodeTypeLabel(NodeType.App)).toBe('App Target');
  });

  it('returns "Framework" for Framework', () => {
    expect(getNodeTypeLabel(NodeType.Framework)).toBe('Framework');
  });

  it('returns "Library" for Library', () => {
    expect(getNodeTypeLabel(NodeType.Library)).toBe('Library');
  });

  it('returns "Unit Test" for TestUnit', () => {
    expect(getNodeTypeLabel(NodeType.TestUnit)).toBe('Unit Test');
  });

  it('returns "UI Test" for TestUi', () => {
    expect(getNodeTypeLabel(NodeType.TestUi)).toBe('UI Test');
  });

  it('returns "CLI Tool" for Cli', () => {
    expect(getNodeTypeLabel(NodeType.Cli)).toBe('CLI Tool');
  });

  it('returns "Swift Package" for Package', () => {
    expect(getNodeTypeLabel(NodeType.Package)).toBe('Swift Package');
  });

  it('returns the type string for unknown type', () => {
    expect(getNodeTypeLabel('custom-type')).toBe('custom-type');
  });
});
