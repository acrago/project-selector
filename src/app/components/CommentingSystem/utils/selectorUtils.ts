import { findNearestComponentElement, getComponentMetadata, getComponentPath } from './componentUtils';
import { ComponentMetadata } from '../types';

export function generateSelectorForElement(element: Element): string {
  const testId = element.getAttribute('data-testid') || element.getAttribute('data-id');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }

  const id = element.getAttribute('id');
  if (id) {
    return `#${CSS.escape(id)}`;
  }

  const tagName = element.tagName.toLowerCase();
  const classList = Array.from(element.classList);
  const ariaLabel = element.getAttribute('aria-label');
  const role = element.getAttribute('role');
  const type = element.getAttribute('type');

  let selector = tagName;

  if (classList.length > 0) {
    selector += `.${CSS.escape(classList[0])}`;
  }

  if (ariaLabel) {
    selector += `[aria-label="${CSS.escape(ariaLabel)}"]`;
  } else if (role) {
    selector += `[role="${CSS.escape(role)}"]`;
  } else if (type) {
    selector += `[type="${CSS.escape(type)}"]`;
  }

  const matches = document.querySelectorAll(selector);
  if (matches.length === 1 && matches[0] === element) {
    return selector;
  }

  return getNthChildPath(element);
}

function getNthChildPath(element: Element): string {
  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body && current.parentElement) {
    const parent = current.parentElement;
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(current) + 1;

    const tagName = current.tagName.toLowerCase();
    const classList = Array.from(current.classList);

    if (classList.length > 0) {
      path.unshift(`${tagName}.${CSS.escape(classList[0])}:nth-child(${index})`);
    } else {
      path.unshift(`${tagName}:nth-child(${index})`);
    }

    current = parent;
  }

  return path.join(' > ');
}

export function getElementDescription(element: Element): string {
  const componentMeta = getComponentMetadata(element);
  if (componentMeta?.componentName && componentMeta.componentType !== 'native') {
    return componentMeta.componentName;
  }

  const tagName = element.tagName.toLowerCase();
  const classList = Array.from(element.classList);

  if (classList.length > 0) {
    return `${tagName}.${classList[0]}`;
  }

  return tagName;
}

export function getElementComponentMetadata(element: Element): ComponentMetadata | null {
  const componentElement = findNearestComponentElement(element);
  if (!componentElement) return null;

  const metadata = getComponentMetadata(componentElement);
  if (!metadata) return null;

  const path = getComponentPath(componentElement);
  return {
    ...metadata,
    componentPath: path.length > 0 ? path : undefined,
  };
}

export function findElementBySelector(selector: string | undefined): Element | null {
  if (!selector) {
    return null;
  }

  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}
