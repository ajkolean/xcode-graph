I cracked open `graph.json` and it’s *rich*—you can turn your node/cluster panels into a “build‑system MRI” without overwhelming people… as long as you surface the right things by default and tuck the rest behind “More”.

A quick orientation first: this graph encodes projects as **(path, projectObject)** pairs inside the `projects` array (so it’s effectively an ordered dictionary).
Targets carry their own dependency lists (with optional platform conditions), and there’s also a **top-level** `dependencyConditions` list that annotates edges with platform filters.

Below are the highest-value additions I’d recommend for your **Target (node)** and **Project/Package (cluster)** detail screens, based on fields that actually show up in this real project graph.

---

## Target (node) details worth adding

### 1) A “What is this?” identity block (top of the panel)

Right now you show name + a couple pills. I’d add:

* **Fully-qualified identity**: `TargetName` + **project/package path** (or a shortened “owner/name@version” derived from the path).
  The graph’s own edge keys identify targets by `name + path` (e.g. `XcodeGraph` at a registry download path).
* **Local vs remote** target type (great for explaining “why is this in the graph?”): targets have `"type": { "remote": {} }` for package targets.
* **Product / kind** (framework vs unit tests vs app): targets have `product` and `productName`.
* **Bundle identifier** (super useful for apps + frameworks): `bundleId` is present.

These 4–5 items answer the user’s first question every time: “Am I looking at a SwiftPM target? A Tuist target? A test bundle? What module name gets imported?”

---

### 2) Platform support, but done “correctly”

You already show “Platforms” on clusters; do it on targets too, and make it accurate by using both:

* **`deploymentTargets`** (minimum OS versions per platform).
* **`destinations`** (more granular: macCatalyst, macWithiPadDesign, vision with iPad design, etc.).

This is where your viewer can beat Xcode: Xcode buries this in build settings soup.

Bonus: show “conditional platform edges” (next section) so users don’t assume a dependency exists on iOS when it’s macOS-only.

---

### 3) Dependency list, but with *semantics* (kinds + conditions)

Your UI already lists dependencies; the big upgrade is to label **what kind** of dependency it is and whether it’s **conditional**.

In this graph, a dependency entry can be:

* **Target dependency**: `"target": { "name": ..., "status": ... }`
* **Project dependency** (cross-project / cross-package): `"project": { "path": ..., "target": ... }`
* **SDK/system library**: `"sdk": { "name": "libz.tbd", ... }`
* **XCFramework** (binary): appears as `"xcframework": { "path": ..., ... }`

And dependencies can be **platform-conditional** in two places:

* Inline on the dependency itself (e.g. `condition.platformFilters`).
* Or via the top-level `dependencyConditions` edges list.

**UI suggestion:** in the dependencies list, add:

* a small icon/badge for kind: `target`, `project`, `sdk`, `xcframework`
* a platform badge if conditional (e.g. “macOS only”, “iOS only”)
* grouping toggles: “Internal vs External vs System vs Binary”

This is *huge* for understanding why graphs explode in size.

---

### 4) Architecture tags (these are gold)

Some targets have meaningful tags like `domain:*` and `layer:*`.

These are perfect for:

* showing at the top as badges (“domain:infrastructure”, “layer:feature”)
* enabling “Cluster by domain” / “Filter by layer” in the graph
* showing policy violations (e.g., “feature depends on feature”)

This is the kind of thing that turns your viewer from “pretty graph” into “architecture tool”.

---

### 5) Source + resource surface area (show counts first, then drill in)

Targets include explicit file lists:

* **`sources`** list of paths
* **`resources.resources`** list, including special files like privacy manifests
* Resources can have an **`inclusionCondition.platformFilters`** too (e.g. an iOS-only storyboard).

What to show in UI:

* counts: “Sources: 143”, “Resources: 7”
* “Notable resources” callouts:

  * `PrivacyInfo.xcprivacy` (privacy manifest)
  * storyboards / asset catalogs / entitlement files (when present)
* a collapsible list with search (paths get long fast)

---

### 6) Info.plist summary (especially for apps)

Info.plist is represented as “extend default + overrides”, and for apps it includes real keys (display name, URL schemes, Sparkle feed URL, etc.).

Great UI treatment:

* show “Info.plist: Extending Default”
* show a compact table of overridden keys (just the top ~10, with “Show all”)

---

### 7) Build settings “highlights”, not a raw dump

Settings are massive, but you can extract 8–12 “headline” values:

* **Swift version** exists in settings
* **Swift flags / upcoming features** show up (e.g. experimental / upcoming features)
* **Active compilation conditions** show up (`SWIFT_PACKAGE`, etc.).
* **Code signing / entitlements** for app targets show up in base settings.

UI suggestion:

* “Key build settings” section with curated keys
* “Debug vs Release diff” view for keys that differ (great for “why is this only broken in Release?”)

---

### 8) Bonus: Binary dependency introspection (XCFramework metadata)

Your graph includes rich XCFramework metadata (supported libs/architectures, linkage type, module maps, etc.).

If a node depends on an `.xcframework`, let users click through to:

* platforms/architectures available
* linking type (static/dynamic)
* whether it includes Swift module interfaces, etc.

This is a *chef’s kiss* feature when debugging binary integration.

---

## Cluster (project/package) details worth adding

### 1) Better “where did this come from?”

Clusters have:

* `path`, `sourceRootPath`, and `xcodeProjPath`
* `type: external { hash: ... }` for external projects
* `type: local {}` for local projects

What to show:

* **Source**: Local / Registry Download / Checkout (you can infer this from path prefixes like `/.build/registry/downloads/...`)
* **Package coordinate** (derive from path): `tuist/XcodeGraph@1.29.15` style
* “Copy path” + “Copy xcodeproj path” buttons (devs love tiny conveniences)

---

### 2) Platform support at cluster level (union, not “first target wins”)

In your screenshot, the XcodeGraph cluster shows “Platforms (1) iOS” — but targets in these external packages often support multiple platforms (iOS, macOS, tvOS, watchOS, visionOS).

Cluster platforms should be computed as:

* union of `deploymentTargets` keys across targets
* optionally union of `destinations` across targets

Also nice: show min versions per platform at the cluster level.

---

### 3) Target breakdown stats (great in the header)

You already show “Targets (3/3)”. Add:

* counts by product type (framework vs staticFramework vs unit_tests vs app)
* counts by local/remote target type

This makes clusters scannable.

---

### 4) External knobs that matter: project options + resource synthesizers

Projects contain generation options like:

* `disableSynthesizedResourceAccessors` and `automaticSchemesOptions`
* `resourceSynthesizers` describing how resources get synthesized

UI suggestion:

* small “Generation” section:

  * Resource accessors: on/off
  * Automatic schemes: enabled/disabled
  * Bundle accessors: on/off

Even if 90% of external projects share the same defaults, the 10% that don’t are usually where the weird bugs live.

---

### 5) Schemes (cluster-level superpower for local projects)

Local projects have real scheme definitions with build/test/run actions and diagnostics options.

Cluster details could include:

* scheme list + configs (Debug/Release)
* quick toggles shown (coverage on/off, diagnostics enabled)
* “Targets in this scheme” (derived)

This makes the viewer useful for *workflow*, not just structure.

---

### 6) Cluster “composition” rollups

These are derived, but extremely useful:

* total source files across targets
* total resources across targets (and count of privacy manifests)
* “largest targets” by source count
* “heaviest dependency fan-out targets” inside the cluster

Rollups help users decide “where is the weight in this package?”.

---

## Two “advanced but worth it” features

Not strictly “details fields”, but they use what’s already in your JSON and massively increase usefulness:

1. **Platform filter mode**
   Because dependencies/resources can be conditional (`platformFilters`), let users switch the whole viewer to “iOS view” / “macOS view” and hide edges/files that don’t apply.

2. **Settings diff lens**
   Pick a target, show “Debug vs Release diff” for key settings, especially around compiler flags and signing.

---

## If you only add 6 things, make them these

1. Fully-qualified target identity (name + package/project + version)
2. Product + bundleId
3. Platform support via deploymentTargets + destinations
4. Dependency kind badges + conditional edge badges
5. Architecture tags
6. Curated build settings highlights + Debug/Release diff

That set gives you: “what is it?”, “where is it from?”, “what platforms?”, “what does it pull in?”, “where does it sit architecturally?”, and “what does it *build like*?”—aka the six questions that keep engineers from screaming into the void.

And hey: if your UI ever feels too powerful, you can always add a “Make me forget what I learned” button.
