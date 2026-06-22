// ------------------------------------------------------------------
// Parsers for .design/ markdown files
// ------------------------------------------------------------------

export interface DetailsSection {
  heading: string;
  bodyMarkdown: string;
  links: { label: string; url: string }[];
}

export interface FeatureDetails {
  title: string;
  description: string;
  rationale: string;
  personas: { name: string; need: string }[];
  sections: DetailsSection[];
  team: TeamMember[];
}

export interface HistoryEntry {
  date: string;
  type: string;
  title: string;
  body: string;
  links: { label: string; url: string }[];
}

export interface SourceLink {
  title: string;
  url: string;
  description?: string;
}

export interface ContextSources {
  [category: string]: SourceLink[];
}

export interface TeamMember {
  name: string;
  role: string;
  raci: string;
  section?: string;
}

export interface DesignFeatureData {
  id: string;
  label: string;
  overview: FeatureDetails | null;
  history: HistoryEntry[];
  sources: ContextSources;
  team: TeamMember[];
  journeys: Journey[];
}

export interface JourneyAction {
  type: 'navigate' | 'click' | 'highlight';
  target: string;
}

export interface JourneyStep {
  title: string;
  description: string;
  optional: boolean;
  actions: JourneyAction[];
}

export interface Journey {
  id: string;
  title: string;
  persona: string;
  goal: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  duration: string;
  introduction: string;
  steps: JourneyStep[];
}

export interface RouteFeatureMapping {
  pattern: string;
  featureId: string;
  featureLabel: string;
}

// ------------------------------------------------------------------
// feature-details.md
// ------------------------------------------------------------------

export function parseFeatureDetails(raw: string): FeatureDetails {
  const { frontMatter, body } = extractFrontMatter(raw);
  const mdSections = splitByH2(body);

  const title = frontMatter.title || '';
  let description = '';
  let rationale = '';
  const personas: { name: string; need: string }[] = [];
  const extraSections: DetailsSection[] = [];
  const team: TeamMember[] = [];

  for (const section of mdSections) {
    const heading = section.heading.toLowerCase();

    if (heading.includes('what is this')) {
      description = section.body.trim();
    } else if (heading.includes('why is it needed')) {
      rationale = section.body.trim();
    } else if (heading.includes('who does it help')) {
      const personaBlocks = section.body.split(/^- persona:/m);
      for (const block of personaBlocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;
        const name = trimmed.split('\n')[0].trim();
        const need = extractKeyValue(trimmed, 'need') || '';
        if (name) personas.push({ name, need });
      }
    } else if (heading.toLowerCase() === 'team') {
      const rolePattern = /^(\w[\w\s]*?):\s*(.+)/;
      for (const line of section.body.split('\n')) {
        const match = line.trim().match(rolePattern);
        if (match && !match[1].toLowerCase().startsWith('note')) {
          const role = match[1].trim();
          const names = match[2].split(',').map((n) => n.trim()).filter(Boolean);
          for (const nameStr of names) {
            const parenMatch = nameStr.match(/^(.+?)\s*\((.+)\)\s*$/);
            const name = parenMatch ? parenMatch[1].trim() : nameStr;
            const detail = parenMatch ? parenMatch[2].trim() : '';
            team.push({ name, role: detail ? `${role} (${detail})` : role, raci: '' });
          }
        }
      }
    } else {
      extraSections.push({
        heading: section.heading,
        bodyMarkdown: section.body.trim(),
        links: extractMarkdownLinks(section.body),
      });
    }
  }

  return { title, description, rationale, personas, sections: extraSections, team };
}

// ------------------------------------------------------------------
// design-history.md
// ------------------------------------------------------------------

export function parseDesignHistory(raw: string): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const datePattern = /^## (\d{4}-\d{2}-\d{2})/;
  const entryPattern = /^### \[(\w+)]\s*(.+)/;

  let currentDate = '';
  let currentType = '';
  let currentTitle = '';
  let bodyLines: string[] = [];

  const flushEntry = () => {
    if (currentTitle) {
      const body = bodyLines.join('\n').trim();
      const links = extractMarkdownLinks(body);
      entries.push({
        date: currentDate,
        type: currentType,
        title: currentTitle,
        body,
        links,
      });
    }
    bodyLines = [];
    currentType = '';
    currentTitle = '';
  };

  for (const line of raw.split('\n')) {
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      flushEntry();
      currentDate = dateMatch[1];
      continue;
    }

    const entryMatch = line.match(entryPattern);
    if (entryMatch) {
      flushEntry();
      currentType = entryMatch[1];
      currentTitle = entryMatch[2].trim();
      continue;
    }

    if (currentTitle) {
      bodyLines.push(line);
    }
  }
  flushEntry();

  return entries;
}

// ------------------------------------------------------------------
// context-sources.md
// ------------------------------------------------------------------

export function parseContextSources(raw: string): ContextSources {
  const result: ContextSources = {};
  const sections = splitByH2(raw);

  for (const section of sections) {
    if (!section.heading) continue;
    const category = section.heading;
    const links: SourceLink[] = [];

    let currentUrl = '';
    let currentTitle = '';
    let currentDescription = '';

    const flushSource = () => {
      if (currentUrl) {
        links.push({
          url: currentUrl,
          title: currentTitle || currentUrl,
          description: currentDescription || undefined,
        });
      }
      currentUrl = '';
      currentTitle = '';
      currentDescription = '';
    };

    for (const line of section.body.split('\n')) {
      const sourceMatch = line.match(/^source:\s*(.+)/);
      if (sourceMatch) {
        flushSource();
        currentUrl = sourceMatch[1].trim();
        continue;
      }

      const titleMatch = line.match(/^-\s*(?:title|name):\s*(.+)/);
      if (titleMatch) {
        currentTitle = titleMatch[1].trim();
        continue;
      }

      const descMatch = line.match(/^-\s*description:\s*(.+)/);
      if (descMatch) {
        currentDescription = descMatch[1].trim();
        continue;
      }
    }
    flushSource();

    if (links.length > 0) {
      result[category] = links;
    }
  }

  return result;
}

// ------------------------------------------------------------------
// feature-mapping.md
// ------------------------------------------------------------------

export function parseFeatureMapping(raw: string): RouteFeatureMapping[] {
  const mappings: RouteFeatureMapping[] = [];
  const tableRowPattern = /^\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|/;

  const codePathToRoute: Record<string, string> = {
    'src/app/components/CommentingSystem/': '/discussions',
    'src/app/Settings/Subscriptions/': '/settings/subscriptions',
    'src/app/Settings/ApiKeys/': '/settings/api-keys',
    'src/app/Settings/Tiers/': '/settings/tiers',
    'src/app/AIAssets/': '/ai-assets',
    'src/app/GenAIStudio/': '/gen-ai-studio',
    'src/app/ObserveMonitor/Dashboard/MaaSDashboard.tsx': '/observe-monitor/dashboard',
    'src/app/DevelopTrain/FeatureStore/': '/develop-train/feature-store',
    'src/app/Home/': '/',
    'src/app/Observability/': '/observability',
    'src/app/GenAIStudio/Playground/': '/gen-ai-studio/playground',
    'src/app/AppLayout/': '/',
    'src/app/FeatureFlags/': '/feature-flags',
    'src/app/routes.tsx': '/',
    'src/app/GenAIStudio/PromptLab/': '/gen-ai-studio/prompt-lab',
    'src/app/DevelopTrain/Evaluations/': '/develop-train/evaluations',
    'src/app/GenAIStudio/AssetEndpoints/': '/gen-ai-studio/asset-endpoints',
    'src/app/AIHub/MCPServers/': '/ai-hub/mcp',
    'src/app/GenAIStudio/Playground/Multimodal/': '/gen-ai-studio/playground',
  };

  for (const line of raw.split('\n')) {
    const match = line.match(tableRowPattern);
    if (!match) continue;
    const codePath = match[1].trim();
    const featureLabel = match[2].trim();

    if (codePath.includes('Code Path')) continue;

    const featureId = featureLabel.toLowerCase().replace(/\s+/g, '-');
    const route = codePathToRoute[codePath];
    if (route) {
      mappings.push({ pattern: route, featureId, featureLabel });
    }
  }

  return mappings;
}

// ------------------------------------------------------------------
// feature-journeys.md
// ------------------------------------------------------------------

export function parseJourneys(raw: string): Journey[] {
  const journeys: Journey[] = [];
  const sections = splitByH2(raw);

  for (const section of sections) {
    if (!section.heading) continue;

    const title = section.heading;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const lines = section.body.split('\n');

    let persona = '';
    let goal = '';
    let difficulty: Journey['difficulty'] = 'easy';
    let duration = '';
    let introduction = '';
    const steps: JourneyStep[] = [];

    let parsingMode: 'metadata' | 'introduction' | 'steps' = 'metadata';
    const introLines: string[] = [];
    let currentStepTitle = '';
    let currentStepLines: string[] = [];

    const flushStep = () => {
      if (!currentStepTitle) return;
      const optional = currentStepTitle.startsWith('(Optional)');
      const cleanTitle = currentStepTitle.replace(/^\(Optional\)\s*/, '');
      const { description, actions } = parseStepBody(currentStepLines);
      steps.push({ title: cleanTitle, description, optional, actions });
      currentStepTitle = '';
      currentStepLines = [];
    };

    for (const line of lines) {
      if (line.match(/^### Introduction/i)) {
        parsingMode = 'introduction';
        continue;
      }
      if (line.match(/^### Steps/i)) {
        introduction = introLines.join('\n').trim();
        parsingMode = 'steps';
        continue;
      }

      const h4Match = line.match(/^#### (.+)/);
      if (h4Match && parsingMode === 'steps') {
        flushStep();
        currentStepTitle = h4Match[1].trim();
        continue;
      }

      if (parsingMode === 'metadata') {
        const metaMatch = line.match(/^- (\w+):\s*(.+)/);
        if (metaMatch) {
          const key = metaMatch[1].toLowerCase();
          const value = metaMatch[2].trim();
          if (key === 'persona') persona = value;
          else if (key === 'goal') goal = value;
          else if (key === 'difficulty') difficulty = value as Journey['difficulty'];
          else if (key === 'duration') duration = value;
        }
      } else if (parsingMode === 'introduction') {
        introLines.push(line);
      } else if (parsingMode === 'steps' && currentStepTitle) {
        currentStepLines.push(line);
      }
    }
    flushStep();

    if (!introduction) {
      introduction = introLines.join('\n').trim();
    }

    journeys.push({ id, title, persona, goal, difficulty, duration, introduction, steps });
  }

  return journeys;
}

function parseStepBody(lines: string[]): { description: string; actions: JourneyAction[] } {
  const descriptionLines: string[] = [];
  const actions: JourneyAction[] = [];

  for (const line of lines) {
    const actionMatch = line.match(/^- (navigate|click|highlight):\s*(.+)/);
    if (actionMatch) {
      actions.push({
        type: actionMatch[1] as JourneyAction['type'],
        target: actionMatch[2].trim(),
      });
    } else {
      descriptionLines.push(line);
    }
  }

  return { description: descriptionLines.join('\n').trim(), actions };
}

// ------------------------------------------------------------------
// Extract links from history entries for Sources tab
// ------------------------------------------------------------------

export function extractLinksFromHistory(entries: HistoryEntry[]): ContextSources {
  const result: ContextSources = {};

  for (const entry of entries) {
    for (const link of entry.links) {
      const category = categorizeLink(link.url);
      if (!result[category]) result[category] = [];
      const exists = result[category].some((l) => l.url === link.url);
      if (!exists) {
        result[category].push({
          url: link.url,
          title: link.label,
          description: `From ${entry.date}: ${entry.title}`,
        });
      }
    }
  }

  return result;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function extractFrontMatter(raw: string): { frontMatter: Record<string, string>; body: string } {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('---')) {
    return { frontMatter: {}, body: raw };
  }

  const endIndex = trimmed.indexOf('---', 3);
  if (endIndex === -1) {
    return { frontMatter: {}, body: raw };
  }

  const fmBlock = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).trim();
  const frontMatter: Record<string, string> = {};

  for (const line of fmBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      frontMatter[key] = value;
    }
  }

  return { frontMatter, body };
}

interface MarkdownSection {
  heading: string;
  body: string;
}

function splitByH2(raw: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  const lines = raw.split('\n');
  let currentHeading = '';
  let bodyLines: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)/);
    if (h2Match) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: bodyLines.join('\n') });
      }
      currentHeading = h2Match[1].trim();
      bodyLines = [];
    } else {
      bodyLines.push(line);
    }
  }

  if (currentHeading) {
    sections.push({ heading: currentHeading, body: bodyLines.join('\n') });
  }

  return sections;
}

function extractKeyValue(text: string, key: string): string | null {
  const pattern = new RegExp(`^\\s*${key}:\\s*(.+)`, 'm');
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function extractMarkdownLinks(text: string): { label: string; url: string }[] {
  const links: { label: string; url: string }[] = [];
  const pattern = /\[([^\]]+)]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match[2] !== '#') {
      links.push({ label: match[1], url: match[2] });
    }
  }
  return links;
}

function categorizeLink(url: string): string {
  if (url.includes('issues.redhat.com')) return 'Jira';
  if (url.includes('docs.google.com/document')) return 'Docs';
  if (url.includes('docs.google.com/presentation')) return 'Slides';
  if (url.includes('drive.google.com')) return 'Recordings';
  if (url.includes('slack.com') || url.includes('slack.')) return 'Slack';
  if (url.includes('miro.com')) return 'Diagrams';
  if (url.includes('github.com') || url.includes('gitlab.')) return 'Repositories';
  if (url.includes('notebooklm.google.com')) return 'Notebooks';
  return 'Other';
}
