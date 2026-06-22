// ------------------------------------------------------------------
// Build-time import of .design/ markdown files and parsed export
//
// When the .design/ directory is present (internal repo), all design
// context is loaded and parsed. When absent (public build), every
// export gracefully returns empty data.
// ------------------------------------------------------------------

import {
  ContextSources,
  DesignFeatureData,
  HistoryEntry,
  Journey,
  RouteFeatureMapping,
  SourceLink,
  TeamMember,
  extractLinksFromHistory,
  parseContextSources,
  parseDesignHistory,
  parseFeatureDetails,
  parseFeatureMapping,
  parseJourneys,
} from './designDataParser';

function mergeSources(primary: ContextSources, secondary: ContextSources): ContextSources {
  const merged = { ...primary };
  for (const [cat, links] of Object.entries(secondary)) {
    const key = `${cat} (from history)`;
    if (!merged[key]) merged[key] = [];
    for (const link of links) {
      const exists = merged[key].some((l: SourceLink) => l.url === link.url);
      if (!exists) merged[key].push(link);
    }
  }
  return merged;
}

// -- Initialise with empty defaults -----------------------------------

let featureData: Record<string, DesignFeatureData> = {};
let routeFeatureMappings: RouteFeatureMapping[] = [];
const personaAvatarMap: Record<string, string> = {};

// -- Conditionally load .design/ data at build time -------------------
// webpack's DefinePlugin replaces process.env.HAS_DESIGN_DATA with a
// string literal. When it evaluates to "false", the entire if-block is
// eliminated as dead code — including the require() calls — so webpack
// never attempts to resolve the missing files.

if (process.env.HAS_DESIGN_DATA === 'true') {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const personaMapping = require('../../../.design/personas/mapping.json');
  const featureMappingRaw: string = require('../../../.design/feature-mapping.md');
  const maasDetailsRaw: string = require('../../../.design/features/maas/feature-details.md');
  const maasHistoryRaw: string = require('../../../.design/features/maas/design-history.md');
  const maasContextSources34Raw: string = require('../../../.design/features/maas/3.4/3.4-context-sources.md');
  const maasJourneysRaw: string = require('../../../.design/features/maas/feature-journeys.md');
  const playgroundHistoryRaw: string = require('../../../.design/features/playground-prompt-registry/design-history.md');
  const commentingSystemHistoryRaw: string = require('../../../.design/features/commenting-system/design-history.md');
  const commentingSystemDetailsRaw: string = require('../../../.design/features/commenting-system/feature-details.md');
  const evaluationsHistoryRaw: string = require('../../../.design/features/evaluations/design-history.md');
  const playgroundVectorstoreHistoryRaw: string = require('../../../.design/features/playground-vectorstore/design-history.md');
  const playgroundVectorstoreDetailsRaw: string = require('../../../.design/features/playground-vectorstore/feature-details.md');
  const mcpServersHistoryRaw: string = require('../../../.design/features/mcp-servers/design-history.md');
  const playgroundMultimodalHistoryRaw: string = require('../../../.design/features/playground-multimodal/design-history.md');
  /* eslint-enable @typescript-eslint/no-require-imports */

  const maasHistory = parseDesignHistory(maasHistoryRaw);
  const maasContextSources = parseContextSources(maasContextSources34Raw);
  const maasHistoryLinks = extractLinksFromHistory(maasHistory);
  const maasJourneys = parseJourneys(maasJourneysRaw);
  const maasDetails = parseFeatureDetails(maasDetailsRaw);

  const playgroundHistory = parseDesignHistory(playgroundHistoryRaw);
  const commentingSystemHistory = parseDesignHistory(commentingSystemHistoryRaw);
  const commentingSystemDetails = parseFeatureDetails(commentingSystemDetailsRaw);
  const evaluationsHistory = parseDesignHistory(evaluationsHistoryRaw);

  const playgroundVectorstoreHistory = parseDesignHistory(playgroundVectorstoreHistoryRaw);
  const playgroundVectorstoreDetails = parseFeatureDetails(playgroundVectorstoreDetailsRaw);
  const mcpServersHistory = parseDesignHistory(mcpServersHistoryRaw);
  const playgroundMultimodalHistory = parseDesignHistory(playgroundMultimodalHistoryRaw);

  featureData = {
    maas: {
      id: 'maas',
      label: 'Models as a Service (MaaS)',
      overview: maasDetails,
      history: maasHistory,
      sources: mergeSources(maasContextSources, maasHistoryLinks),
      team: maasDetails.team,
      journeys: maasJourneys,
    },
    playground: {
      id: 'playground',
      label: 'Playground',
      overview: null,
      history: playgroundHistory,
      sources: extractLinksFromHistory(playgroundHistory),
      team: [],
      journeys: [],
    },
    'commenting-system': {
      id: 'commenting-system',
      label: 'Commenting system',
      overview: commentingSystemDetails,
      history: commentingSystemHistory,
      sources: extractLinksFromHistory(commentingSystemHistory),
      team: commentingSystemDetails.team,
      journeys: [],
    },
    'feature-store': {
      id: 'feature-store',
      label: 'Feature Store',
      overview: null,
      history: [],
      sources: {},
      team: [],
      journeys: [],
    },
    homepage: {
      id: 'homepage',
      label: 'Homepage',
      overview: null,
      history: [],
      sources: {},
      team: [],
      journeys: [],
    },
    observability: {
      id: 'observability',
      label: 'Observability',
      overview: null,
      history: [],
      sources: {},
      team: [],
      journeys: [],
    },
    navigation: {
      id: 'navigation',
      label: 'Navigation',
      overview: null,
      history: [],
      sources: {},
      team: [],
      journeys: [],
    },
    'prompt-registry': {
      id: 'prompt-registry',
      label: 'Prompt Registry',
      overview: null,
      history: [],
      sources: {},
      team: [],
      journeys: [],
    },
    autorag: {
      id: 'autorag',
      label: 'AutoRAG',
      overview: null,
      history: [],
      sources: {},
      team: [],
      journeys: [],
    },
    evaluations: {
      id: 'evaluations',
      label: 'Evaluations',
      overview: null,
      history: evaluationsHistory,
      sources: extractLinksFromHistory(evaluationsHistory),
      team: [],
      journeys: [],
    },
    'playground-vectorstore': {
      id: 'playground-vectorstore',
      label: 'Playground Vector Store',
      overview: playgroundVectorstoreDetails,
      history: playgroundVectorstoreHistory,
      sources: extractLinksFromHistory(playgroundVectorstoreHistory),
      team: playgroundVectorstoreDetails.team,
      journeys: [],
    },
    'mcp-servers': {
      id: 'mcp-servers',
      label: 'MCP Servers',
      overview: null,
      history: mcpServersHistory,
      sources: extractLinksFromHistory(mcpServersHistory),
      team: [],
      journeys: [],
    },
    'playground-multimodal': {
      id: 'playground-multimodal',
      label: 'Playground Multimodal',
      overview: null,
      history: playgroundMultimodalHistory,
      sources: extractLinksFromHistory(playgroundMultimodalHistory),
      team: [],
      journeys: [],
    },
  };

  routeFeatureMappings = parseFeatureMapping(featureMappingRaw);

  for (const entry of personaMapping.personas) {
    personaAvatarMap[entry.name.toLowerCase()] = entry.image;
  }
}

// -- Public API -------------------------------------------------------

export function getAllFeatures(): DesignFeatureData[] {
  return Object.values(featureData).filter((f) => f.overview !== null);
}

export function getFeatureById(id: string): DesignFeatureData | undefined {
  return featureData[id];
}

export function getFeatureIds(): string[] {
  return Object.keys(featureData);
}

export function getRouteFeatureMappings(): RouteFeatureMapping[] {
  return routeFeatureMappings;
}

export function findFeatureForRoute(pathname: string): RouteFeatureMapping | undefined {
  return routeFeatureMappings.find((m) => pathname.startsWith(m.pattern));
}

// -- Persona avatar lookup --------------------------------------------

export function getPersonaAvatarUrl(personaName: string): string | undefined {
  const key = personaName.toLowerCase();
  for (const [name, image] of Object.entries(personaAvatarMap)) {
    if (key.includes(name) || name.includes(key)) {
      const basePath = (process.env.PUBLIC_PATH || '').replace(/\/$/, '');
      return `${basePath}/images/personas/${image}`;
    }
  }
  return undefined;
}

export type { DesignFeatureData, HistoryEntry, ContextSources, TeamMember, Journey };
