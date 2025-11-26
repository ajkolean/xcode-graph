# Module Map - Quick Reference

**Last Updated:** Phase 2 - App.tsx Modularization & Design System Compliance

This guide helps you quickly find the right file to modify. See `/MODULAR_ARCHITECTURE.md` for design philosophy and `/REFACTORING_PHASE_2.md` for latest changes.

---

## 🎯 Need to modify the main app?

```
/App.tsx  ← Main orchestrator (535 → 218 lines!)
```

**It uses these modules:**
```
/hooks/                              ← NEW! Custom logic hooks
├── useGraphFilters.ts              ← Filter/search logic
├── useTransitiveDependencies.ts    ← Dependency chains  
└── useKeyboardShortcuts.ts         ← Keyboard events

/components/layout/                  ← NEW! Layout components
├── Sidebar.tsx                     ← Left navigation
├── Header.tsx                      ← Top search bar
├── Toolbar.tsx                     ← Zoom controls
├── GraphTab.tsx                    ← Graph view orchestrator
└── PlaceholderTab.tsx              ← Coming soon tabs
```

**Pro tip:** Don't modify App.tsx directly - find the right module!