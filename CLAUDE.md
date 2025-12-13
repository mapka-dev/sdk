# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a monorepo for the Mapka JS SDK, which provides additional features on top of MapLibre GL JS for working with Mapka mapping services. The repository uses Lerna for package management and publishes to npm.

## Commands

### Building

```bash
yarn build              # Build all packages using TypeScript
yarn build:watch        # Build in watch mode
```

### Linting

```bash
yarn lint               # Lint and auto-fix with Biome
yarn check              # Check code with Biome (includes linting + formatting)
```

### Development

```bash
yarn start              # Start development environment (build:watch + configurator)
```

### Testing & CI

- No test command is configured in the repository
- CI runs: `yarn build` and `yarn lint` on PRs

### Publishing

```bash
yarn lerna version --conventional-commits --yes    # Version packages
yarn lerna publish from-git --yes                  # Publish to npm
```

Publishing is automated via GitHub Actions when PRs are merged to master.

## Architecture

### Monorepo Structure

- **Root**: Yarn workspaces with Lerna for versioning and publishing
- **Packages**: Single package `@mapka/maplibre-gl-sdk` in `packages/maplibre-gl-sdk/`
- **Build System**: `@chyzwar/runner` for task orchestration (see `runner.config.ts`)
- **TypeScript**: Project references with composite builds (root `tsconfig.json` references package configs)

### Core Package: @mapka/maplibre-gl-sdk

Located in `packages/maplibre-gl-sdk/`, this package extends MapLibre GL JS with Mapka-specific features.

**Entry Point**: `src/index.ts` - Re-exports MapLibre GL and custom types/classes

**Main Class**: `MapkaMap` (exported as `Map`)

- Extends `maplibre-gl.Map`
- Handles API key authentication via `transformRequest` interceptor
- Automatically adds authorization headers for `mapka.dev` and `mapka.localhost` requests
- Integrates marker and icon loading systems via event listeners

**Key Features**:

1. **Markers** (`src/modules/markers.ts`):
   - Reads marker config from map style `metadata.mapka.markers` field
   - Each marker can have tooltips (hover or click triggered)
   - Manages marker lifecycle across style changes

2. **Tooltips** (`src/modules/tooltip.ts`):
   - Preact-based tooltip rendering with title, description, and image carousel
   - Supports both hover and click triggers
   - Positioned relative to markers

3. **Icons** (`src/modules/icons.ts`):
   - Lazy-loads missing layer icons via `styleimagemissing` event
   - Fetches SVG icons and adds them to map style

**Style System**:

- `setStyle()` override: Intercepts style changes to preserve markers
- Uses `transformStyle` to apply marker diffs during style swaps
- Metadata-driven configuration: Map styles can declare markers in `metadata.mapka.markers`

**TypeScript Configuration**:

- Uses Preact for lightweight UI components
- JSX configured with `jsxFactory: "h"` and `jsxFragmentFactory: "Fragment"`
- Extends `@chyzwar/tsconfig/react.json`

### Conventions

**Imports**: Use `.js` extensions in TypeScript imports (e.g., `from "./map.js"`) - required for ESM compatibility

**Linting**: Biome extends `@chyzwar/biome-config/react` with custom rules:

- Import organization is disabled
- `noShadowRestrictedNames` is off

**Commit Messages**: Follow Conventional Commits format - enforced by lint-staged and used for automated changelog generation

**Release Process**:

- Conventional commits drive versioning
- Lerna creates GitHub releases automatically
- Version bumps trigger on master branch merges

## Important Context

**API Authentication**: The SDK requires a Mapka API key. All requests to Mapka services (identified by domain) automatically include `Authorization: Bearer {apiKey}` headers.

**Marker Configuration**: Markers are defined in the map style's metadata, not via imperative API calls. This allows styles to bundle marker configurations.

**Environment Support**: `MapkaMap.env` static property (defaults to "prod") - currently unused but suggests future dev/local environment handling.

**Dependencies**:

- `maplibre-gl` - Base mapping library
- `preact` - Lightweight React alternative for tooltips
- `es-toolkit` - Utility library (uses `get()` for safe nested access)
