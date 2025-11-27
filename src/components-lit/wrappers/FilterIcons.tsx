/**
 * React Wrappers for FilterIcons Lit Components
 */

import React from 'react';
import { createComponent } from '@lit/react';
import {
  GraphProductTypesIcon,
  GraphPlatformsIcon,
  GraphProjectsIcon,
  GraphPackagesIcon,
} from '../ui/filter-icons';

// Product Types Icon
const LitProductTypesIconElement = createComponent({
  tagName: 'graph-product-types-icon',
  elementClass: GraphProductTypesIcon,
  react: React,
});

export function ProductTypesIcon(props: React.HTMLAttributes<HTMLElement> = {}) {
  return <LitProductTypesIconElement {...props} />;
}

// Platforms Icon
const LitPlatformsIconElement = createComponent({
  tagName: 'graph-platforms-icon',
  elementClass: GraphPlatformsIcon,
  react: React,
});

export function PlatformsIcon(props: React.HTMLAttributes<HTMLElement> = {}) {
  return <LitPlatformsIconElement {...props} />;
}

// Projects Icon
const LitProjectsIconElement = createComponent({
  tagName: 'graph-projects-icon',
  elementClass: GraphProjectsIcon,
  react: React,
});

export function ProjectsIcon(props: React.HTMLAttributes<HTMLElement> = {}) {
  return <LitProjectsIconElement {...props} />;
}

// Packages Icon
const LitPackagesIconElement = createComponent({
  tagName: 'graph-packages-icon',
  elementClass: GraphPackagesIcon,
  react: React,
});

export function PackagesIcon(props: React.HTMLAttributes<HTMLElement> = {}) {
  return <LitPackagesIconElement {...props} />;
}
