import { ComponentMetadata } from '../types';

export function getFiberFromElement(element: Element | null): any {
  if (!element) return null;

  const key = Object.keys(element).find(
    (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'),
  );
  if (key) {
    return (element as any)[key];
  }

  let current: Node | null = element;
  while (current) {
    const keys = Object.keys(current);
    const fiberKey = keys.find(
      (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'),
    );
    if (fiberKey) {
      return (current as any)[fiberKey];
    }
    current = current.parentNode;
  }

  return null;
}

export function getComponentName(fiber: any): string | undefined {
  if (!fiber) return undefined;

  const type = fiber.type;
  if (!type) return undefined;

  if (typeof type === 'function') {
    return type.displayName || type.name || 'Anonymous';
  }

  if (type.$$typeof === Symbol.for('react.forward_ref')) {
    return type.render?.displayName || type.render?.name || 'ForwardRef';
  }

  if (type.$$typeof === Symbol.for('react.memo')) {
    const innerType = type.type;
    if (typeof innerType === 'function') {
      return innerType.displayName || innerType.name || 'Memo';
    }
    return 'Memo';
  }

  if (typeof type === 'string') {
    return type;
  }

  return undefined;
}

function getComponentType(fiber: any): ComponentMetadata['componentType'] {
  if (!fiber) return 'unknown';

  const type = fiber.type;
  if (!type) return 'unknown';

  if (typeof type === 'function') {
    if (type.prototype && type.prototype.isReactComponent) {
      return 'class';
    }
    return 'function';
  }

  if (type.$$typeof === Symbol.for('react.forward_ref')) return 'forwardRef';
  if (type.$$typeof === Symbol.for('react.memo')) return 'memo';
  if (type.$$typeof === Symbol.for('react.lazy')) return 'lazy';
  if (typeof type === 'string') return 'native';

  return 'unknown';
}

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const seen = new WeakSet();

  const sanitize = (value: unknown, depth = 0): unknown => {
    if (depth > 3) return '[Max Depth]';
    if (value === null || value === undefined) return value;
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'symbol') return '[Symbol]';
    if (typeof value === 'bigint') return `[BigInt: ${value}]`;

    if (typeof value === 'object') {
      if (seen.has(value)) return '[Circular]';
      if (value instanceof Date) return value.toISOString();
      if (value instanceof RegExp) return value.toString();
      if (Array.isArray(value)) {
        seen.add(value);
        return value.map((item) => sanitize(item, depth + 1));
      }
      if (value instanceof Set) return `[Set(${value.size})]`;
      if (value instanceof Map) return `[Map(${value.size})]`;

      if ((value as any).$$typeof) {
        const type = (value as any).type;
        if (typeof type === 'string') return `<${type} />`;
        if (typeof type === 'function') return `<${type.displayName || type.name || 'Component'} />`;
        return '[React Element]';
      }

      seen.add(value);
      const obj: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        if (key.startsWith('__') || key === 'ref' || key === 'key') continue;
        obj[key] = sanitize(val, depth + 1);
      }
      return obj;
    }

    return value;
  };

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('__') || key === 'ref' || key === 'key') continue;
    sanitized[key] = sanitize(value);
  }

  return sanitized;
}

export function getComponentMetadata(element: Element | null): ComponentMetadata | null {
  if (!element) return null;

  const fiber = getFiberFromElement(element);
  if (!fiber) return null;

  const componentName = getComponentName(fiber);
  const componentType = getComponentType(fiber);
  const props = fiber.memoizedProps || fiber.pendingProps || undefined;
  const key = fiber.key !== null && fiber.key !== undefined ? fiber.key : undefined;

  const type = fiber.type;
  const displayName =
    (typeof type === 'function' && (type.displayName || type.name)) ||
    (type?.$$typeof === Symbol.for('react.forward_ref') &&
      (type.render?.displayName || type.render?.name)) ||
    undefined;

  return {
    componentName,
    componentType,
    props: props ? sanitizeProps(props) : undefined,
    displayName,
    key,
  };
}

export function getComponentPath(element: Element | null): string[] {
  if (!element) return [];

  const path: string[] = [];
  let current: Element | null = element;

  while (current) {
    const fiber = getFiberFromElement(current);
    if (fiber) {
      const name = getComponentName(fiber);
      if (name && name !== 'Anonymous') {
        path.unshift(name);
      }
    }
    current = current.parentElement;
  }

  return path;
}

export function findNearestComponentElement(element: Element | null): Element | null {
  if (!element) return null;

  let current: Element | null = element;

  while (current) {
    const fiber = getFiberFromElement(current);
    if (fiber) {
      const type = fiber.type;
      if (type && typeof type !== 'string') {
        return current;
      }
    }
    current = current.parentElement;
  }

  return element;
}
