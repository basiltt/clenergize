# Accessibility Testing Implementation Guide

## Executive Summary

This document provides production-ready accessibility testing implementations for the Clenergize V3 platform, ensuring WCAG 2.1 Level AA compliance through automated testing with axe-core, manual testing procedures, and continuous monitoring strategies.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Axe-Core Integration](#axe-core-integration)
3. [React Component Testing](#react-component-testing)
4. [End-to-End Accessibility Tests](#end-to-end-accessibility-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Manual Testing Procedures](#manual-testing-procedures)
7. [Accessibility Monitoring](#accessibility-monitoring)
8. [Remediation Workflows](#remediation-workflows)
9. [Reporting and Compliance](#reporting-and-compliance)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              ACCESSIBILITY TESTING ARCHITECTURE             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Development Phase:                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • ESLint Plugin (jsx-a11y)                           │ │
│  │ • React Testing Library (with axe)                   │ │
│  │ • Storybook Addon (a11y)                            │ │
│  │ • VS Code Extensions                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Testing Phase:                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Jest + jest-axe (Unit Tests)                       │ │
│  │ • Cypress + cypress-axe (E2E Tests)                  │ │
│  │ • Playwright + axe-playwright (Cross-browser)        │ │
│  │ • Pa11y (CLI Testing)                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  CI/CD Phase:                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • GitHub Actions Accessibility Checks                │ │
│  │ • Lighthouse CI                                      │ │
│  │ • WAVE API Integration                               │ │
│  │ • Accessibility Score Gates                          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Monitoring Phase:                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Real User Monitoring (RUM)                         │ │
│  │ • Automated Scans (Daily)                            │ │
│  │ • User Feedback Collection                           │ │
│  │ • Compliance Dashboards                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Axe-Core Integration

### 1. Base Configuration

```typescript
// NEW/frontend/src/testing/accessibility/axe-config.ts
import { configureAxe } from 'jest-axe';
import { Spec } from 'axe-core';

export const axeConfig: Spec = {
  rules: {
    // WCAG 2.1 Level AA rules
    'color-contrast': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'label': { enabled: true },
    'landmark-unique': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },

    // Custom rules for Clenergize
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'button-name': { enabled: true },
    'duplicate-id': { enabled: true },
    'heading-order': { enabled: true },
    'html-lang-valid': { enabled: true },
    'image-alt': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'tabindex': { enabled: true },

    // Disable rules that don't apply to our SPA
    'bypass': { enabled: false }, // We have a skip-to-content link
    'video-caption': { enabled: false } // No video content yet
  },

  // Check specific WCAG levels
  tags: ['wcag21aa', 'section508', 'best-practice'],

  // Custom checks for business requirements
  checks: [
    {
      id: 'emission-data-table',
      evaluate: function(node) {
        // Custom check for emission data tables
        return node.getAttribute('role') === 'table' &&
               node.hasAttribute('aria-label') &&
               node.querySelector('caption') !== null;
      },
      metadata: {
        impact: 'serious',
        messages: {
          pass: 'Emission data table is properly labeled',
          fail: 'Emission data table must have aria-label and caption'
        }
      }
    }
  ]
};

// Jest-axe configuration
export const jestAxeConfig = configureAxe({
  ...axeConfig,
  elementRef: true,
  iframes: true,
  selectors: true
});

// Reporter configuration
export interface AxeReportConfig {
  outputDir: string;
  reportTypes: ('json' | 'html' | 'csv')[];
  includeScreenshots: boolean;
  severityThreshold: 'minor' | 'moderate' | 'serious' | 'critical';
}

export const defaultReportConfig: AxeReportConfig = {
  outputDir: './accessibility-reports',
  reportTypes: ['html', 'json'],
  includeScreenshots: true,
  severityThreshold: 'moderate'
};
```

### 2. Axe-Core Service

```typescript
// NEW/frontend/src/services/accessibility/axe.service.ts
import axe, { AxeResults, Result, NodeResult, RunOptions } from 'axe-core';
import { axeConfig } from '@/testing/accessibility/axe-config';

export interface AccessibilityIssue {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: NodeResult[];
  tags: string[];
  category: string;
}

export interface AccessibilityReport {
  url: string;
  timestamp: Date;
  violations: AccessibilityIssue[];
  passes: number;
  incomplete: AccessibilityIssue[];
  inapplicable: number;
  score: number;
  wcagLevel: string;
}

export class AxeService {
  private options: RunOptions;

  constructor(customOptions?: Partial<RunOptions>) {
    this.options = {
      ...axeConfig,
      ...customOptions
    };
  }

  /**
   * Run accessibility tests on current page
   */
  async analyze(context?: string | Document | Element): Promise<AccessibilityReport> {
    const startTime = Date.now();

    try {
      const results = await axe.run(context || document, this.options);

      return this.formatReport(results, startTime);
    } catch (error) {
      console.error('Axe analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze specific component
   */
  async analyzeComponent(element: Element): Promise<AccessibilityReport> {
    return this.analyze(element);
  }

  /**
   * Check specific WCAG criteria
   */
  async checkWCAGCriteria(
    criteria: string[],
    context?: Element
  ): Promise<AccessibilityReport> {
    const options = {
      ...this.options,
      runOnly: {
        type: 'tag',
        values: criteria
      }
    };

    const results = await axe.run(context || document, options);
    return this.formatReport(results);
  }

  /**
   * Format axe results into report
   */
  private formatReport(
    results: AxeResults,
    startTime?: number
  ): AccessibilityReport {
    const violations = this.mapIssues(results.violations);
    const incomplete = this.mapIssues(results.incomplete);

    // Calculate accessibility score
    const score = this.calculateScore(results);

    return {
      url: results.url,
      timestamp: new Date(),
      violations,
      passes: results.passes.length,
      incomplete,
      inapplicable: results.inapplicable.length,
      score,
      wcagLevel: this.determineWCAGLevel(violations),
      testDuration: startTime ? Date.now() - startTime : undefined
    };
  }

  /**
   * Map axe violations to issues
   */
  private mapIssues(violations: Result[]): AccessibilityIssue[] {
    return violations.map(violation => ({
      id: violation.id,
      impact: violation.impact as any,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes,
      tags: violation.tags,
      category: this.categorizeIssue(violation.tags)
    }));
  }

  /**
   * Calculate accessibility score
   */
  private calculateScore(results: AxeResults): number {
    const weights = {
      critical: 10,
      serious: 5,
      moderate: 2,
      minor: 1
    };

    let totalWeight = 0;
    let issueWeight = 0;

    results.violations.forEach(violation => {
      const weight = weights[violation.impact as keyof typeof weights] || 1;
      issueWeight += weight * violation.nodes.length;
    });

    // Calculate maximum possible weight
    const totalChecks = results.passes.length +
                       results.violations.length +
                       results.incomplete.length;

    totalWeight = totalChecks * weights.critical;

    // Calculate score (0-100)
    return Math.max(0, Math.round(((totalWeight - issueWeight) / totalWeight) * 100));
  }

  /**
   * Determine WCAG compliance level
   */
  private determineWCAGLevel(violations: AccessibilityIssue[]): string {
    const hasAAViolation = violations.some(v =>
      v.tags.includes('wcag2aa') &&
      ['serious', 'critical'].includes(v.impact)
    );

    const hasAViolation = violations.some(v =>
      v.tags.includes('wcag2a') &&
      ['serious', 'critical'].includes(v.impact)
    );

    if (!hasAViolation && !hasAAViolation) return 'AA';
    if (!hasAViolation) return 'A';
    return 'Non-compliant';
  }

  /**
   * Categorize issue by type
   */
  private categorizeIssue(tags: string[]): string {
    if (tags.includes('color')) return 'Color Contrast';
    if (tags.includes('aria')) return 'ARIA';
    if (tags.includes('keyboard')) return 'Keyboard Navigation';
    if (tags.includes('forms')) return 'Forms';
    if (tags.includes('structure')) return 'Document Structure';
    if (tags.includes('tables')) return 'Tables';
    if (tags.includes('video-audio')) return 'Media';
    return 'General';
  }

  /**
   * Generate detailed report
   */
  async generateDetailedReport(
    report: AccessibilityReport
  ): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Accessibility Report - ${new Date().toISOString()}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .score { font-size: 48px; font-weight: bold; }
    .score.good { color: #4CAF50; }
    .score.fair { color: #FF9800; }
    .score.poor { color: #F44336; }
    .violation { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .violation.critical { border-left: 5px solid #F44336; }
    .violation.serious { border-left: 5px solid #FF5722; }
    .violation.moderate { border-left: 5px solid #FF9800; }
    .violation.minor { border-left: 5px solid #FFC107; }
    .node { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 3px; }
    pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
  </style>
</head>
<body>
  <h1>Accessibility Report</h1>
  <p>URL: ${report.url}</p>
  <p>Date: ${report.timestamp}</p>
  <p>WCAG Level: ${report.wcagLevel}</p>

  <div class="stats">
    <div class="stat">
      <div class="score ${report.score >= 90 ? 'good' : report.score >= 70 ? 'fair' : 'poor'}">
        ${report.score}%
      </div>
      <p>Accessibility Score</p>
    </div>
    <div class="stat">
      <h3>${report.violations.length}</h3>
      <p>Violations</p>
    </div>
    <div class="stat">
      <h3>${report.passes}</h3>
      <p>Passes</p>
    </div>
    <div class="stat">
      <h3>${report.incomplete.length}</h3>
      <p>Needs Review</p>
    </div>
  </div>

  <h2>Violations (${report.violations.length})</h2>
  ${report.violations.map(violation => `
    <div class="violation ${violation.impact}">
      <h3>${violation.help}</h3>
      <p><strong>Impact:</strong> ${violation.impact}</p>
      <p>${violation.description}</p>
      <p><a href="${violation.helpUrl}" target="_blank">Learn more</a></p>

      <h4>Affected Elements (${violation.nodes.length})</h4>
      ${violation.nodes.map(node => `
        <div class="node">
          <p><strong>Element:</strong> <code>${node.target}</code></p>
          <pre>${node.html}</pre>
          <p>${node.failureSummary}</p>
        </div>
      `).join('')}
    </div>
  `).join('')}

  <h2>Needs Review (${report.incomplete.length})</h2>
  ${report.incomplete.map(item => `
    <div class="violation moderate">
      <h3>${item.help}</h3>
      <p>${item.description}</p>
      <p>Manual review required</p>
    </div>
  `).join('')}
</body>
</html>
    `;

    return html;
  }
}

// Export singleton instance
export const axeService = new AxeService();
```

## React Component Testing

### 1. Jest-Axe Setup

```typescript
// NEW/frontend/src/testing/setup/jest-axe.setup.ts
import { toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}
```

### 2. Component Testing Utilities

```typescript
// NEW/frontend/src/testing/utils/accessibility-test.utils.tsx
import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { axe } from 'jest-axe';
import { jestAxeConfig } from '../accessibility/axe-config';

export interface A11yRenderOptions extends RenderOptions {
  axeOptions?: any;
  skipAccessibilityCheck?: boolean;
}

/**
 * Render component with automatic accessibility testing
 */
export async function renderWithA11y(
  ui: React.ReactElement,
  options?: A11yRenderOptions
): Promise<RenderResult & { axeResults?: any }> {
  const { axeOptions, skipAccessibilityCheck, ...renderOptions } = options || {};

  const result = render(ui, renderOptions);

  if (!skipAccessibilityCheck) {
    const axeResults = await axe(result.container, axeOptions || jestAxeConfig);
    expect(axeResults).toHaveNoViolations();

    return {
      ...result,
      axeResults
    };
  }

  return result;
}

/**
 * Test component for keyboard navigation
 */
export async function testKeyboardNavigation(
  component: React.ReactElement,
  expectedTabOrder: string[]
): Promise<void> {
  const { container } = render(component);

  const focusableElements = container.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );

  const actualTabOrder: string[] = [];

  // Simulate tab navigation
  focusableElements.forEach(element => {
    element.focus();
    actualTabOrder.push(element.tagName.toLowerCase());
  });

  expect(actualTabOrder).toEqual(expectedTabOrder);
}

/**
 * Test screen reader announcements
 */
export async function testScreenReaderAnnouncements(
  component: React.ReactElement,
  expectedAnnouncements: string[]
): Promise<void> {
  const { container } = render(component);

  // Check for aria-live regions
  const liveRegions = container.querySelectorAll('[aria-live]');
  expect(liveRegions.length).toBeGreaterThan(0);

  // Check for proper ARIA labels
  const ariaElements = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');

  const announcements = Array.from(ariaElements).map(el =>
    el.getAttribute('aria-label') ||
    el.textContent ||
    ''
  ).filter(Boolean);

  expectedAnnouncements.forEach(expected => {
    expect(announcements).toContain(expected);
  });
}
```

### 3. Component Test Examples

```typescript
// NEW/frontend/src/components/EmissionChart/EmissionChart.test.tsx
import React from 'react';
import { renderWithA11y, testKeyboardNavigation } from '@/testing/utils/accessibility-test.utils';
import { EmissionChart } from './EmissionChart';

describe('EmissionChart Accessibility', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'CO2 Emissions',
      data: [100, 150, 120]
    }]
  };

  it('should have no accessibility violations', async () => {
    await renderWithA11y(
      <EmissionChart data={mockData} />
    );
  });

  it('should provide text alternative for chart data', async () => {
    const { getByRole, getByLabelText } = await renderWithA11y(
      <EmissionChart data={mockData} />
    );

    // Check for accessible table alternative
    const table = getByRole('table', { name: /emission data/i });
    expect(table).toBeInTheDocument();

    // Check for proper caption
    const caption = getByLabelText(/co2 emissions by month/i);
    expect(caption).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    await testKeyboardNavigation(
      <EmissionChart data={mockData} interactive />,
      ['button', 'button', 'select', 'button'] // Export, Print, Period selector, Refresh
    );
  });

  it('should announce data changes to screen readers', async () => {
    const { rerender, getByRole } = await renderWithA11y(
      <EmissionChart data={mockData} />
    );

    const liveRegion = getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    // Update data
    const newData = { ...mockData, datasets: [{ ...mockData.datasets[0], data: [200, 250, 220] }] };
    rerender(<EmissionChart data={newData} />);

    expect(liveRegion).toHaveTextContent(/data updated/i);
  });

  it('should have proper color contrast', async () => {
    const { axeResults } = await renderWithA11y(
      <EmissionChart data={mockData} />,
      {
        axeOptions: {
          rules: {
            'color-contrast': { enabled: true }
          }
        }
      }
    );

    expect(axeResults).toHaveNoViolations();
  });
});
```

### 4. Form Component Testing

```typescript
// NEW/frontend/src/components/ActivityForm/ActivityForm.test.tsx
import React from 'react';
import { renderWithA11y, testScreenReaderAnnouncements } from '@/testing/utils/accessibility-test.utils';
import userEvent from '@testing-library/user-event';
import { ActivityForm } from './ActivityForm';

describe('ActivityForm Accessibility', () => {
  it('should have accessible form controls', async () => {
    const { getByLabelText } = await renderWithA11y(
      <ActivityForm onSubmit={jest.fn()} />
    );

    // All inputs should have labels
    expect(getByLabelText(/activity type/i)).toBeInTheDocument();
    expect(getByLabelText(/consumption value/i)).toBeInTheDocument();
    expect(getByLabelText(/unit/i)).toBeInTheDocument();
    expect(getByLabelText(/date/i)).toBeInTheDocument();
  });

  it('should provide error announcements', async () => {
    const { getByRole, getByText } = await renderWithA11y(
      <ActivityForm onSubmit={jest.fn()} />
    );

    const submitButton = getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Error messages should be announced
    const errorRegion = getByRole('alert');
    expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
    expect(getByText(/required field/i)).toBeInTheDocument();
  });

  it('should have proper field descriptions', async () => {
    const { getByLabelText } = await renderWithA11y(
      <ActivityForm onSubmit={jest.fn()} />
    );

    const consumptionInput = getByLabelText(/consumption value/i);
    expect(consumptionInput).toHaveAttribute('aria-describedby');

    const description = document.getElementById(
      consumptionInput.getAttribute('aria-describedby')!
    );
    expect(description).toHaveTextContent(/enter the consumption value/i);
  });

  it('should indicate required fields', async () => {
    const { getByLabelText } = await renderWithA11y(
      <ActivityForm onSubmit={jest.fn()} />
    );

    const requiredFields = ['activity type', 'consumption value', 'date'];

    requiredFields.forEach(fieldName => {
      const field = getByLabelText(new RegExp(fieldName, 'i'));
      expect(field).toHaveAttribute('aria-required', 'true');
    });
  });

  it('should manage focus properly', async () => {
    const { getByLabelText, getByRole } = await renderWithA11y(
      <ActivityForm onSubmit={jest.fn()} />
    );

    const firstInput = getByLabelText(/activity type/i);
    const submitButton = getByRole('button', { name: /submit/i });

    // Submit with errors
    await userEvent.click(submitButton);

    // Focus should move to first error field
    expect(document.activeElement).toBe(firstInput);
  });
});
```

## End-to-End Accessibility Tests

### 1. Cypress-Axe Configuration

```typescript
// NEW/frontend/cypress/support/accessibility.ts
import 'cypress-axe';

declare global {
  namespace Cypress {
    interface Chainable {
      checkA11y(
        context?: string | Node | axe.ContextObject | undefined,
        options?: Options | undefined,
        violationCallback?: ((violations: any[]) => void) | undefined
      ): void;

      configureAxe(configurationOptions?: any): void;

      checkTabNavigation(expectedOrder: string[]): void;

      checkScreenReaderText(expectedTexts: string[]): void;
    }
  }
}

// Configure axe
Cypress.Commands.add('configureAxe', (configurationOptions = {}) => {
  cy.window({ log: false }).then(win => {
    return win.axe.configure({
      branding: {
        application: 'Clenergize V3'
      },
      ...configurationOptions
    });
  });
});

// Custom command for tab navigation testing
Cypress.Commands.add('checkTabNavigation', (expectedOrder: string[]) => {
  cy.get('body').tab();

  expectedOrder.forEach((selector, index) => {
    cy.focused().should('match', selector);
    if (index < expectedOrder.length - 1) {
      cy.focused().tab();
    }
  });
});

// Check screen reader text
Cypress.Commands.add('checkScreenReaderText', (expectedTexts: string[]) => {
  expectedTexts.forEach(text => {
    cy.get('[aria-label], [aria-labelledby], [aria-describedby], .sr-only')
      .should('contain', text);
  });
});
```

### 2. E2E Accessibility Tests

```typescript
// NEW/frontend/cypress/e2e/accessibility/dashboard.cy.ts
describe('Dashboard Accessibility', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.injectAxe();
    cy.configureAxe({
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  it('should have no accessibility violations on load', () => {
    cy.checkA11y();
  });

  it('should have no violations after data load', () => {
    cy.intercept('GET', '/api/v1/emissions', { fixture: 'emissions.json' });
    cy.wait('@getEmissions');
    cy.checkA11y();
  });

  it('should support keyboard navigation', () => {
    cy.checkTabNavigation([
      '[data-testid="skip-to-content"]',
      '[data-testid="main-nav"] a:first',
      '[data-testid="period-selector"]',
      '[data-testid="emission-chart"]',
      '[data-testid="data-table"]',
      '[data-testid="export-button"]'
    ]);
  });

  it('should have proper heading hierarchy', () => {
    cy.get('h1').should('have.length', 1);
    cy.get('h1').should('contain', 'Dashboard');

    cy.get('h2').should('have.length.greaterThan', 0);
    cy.get('h2').each(($h2, index) => {
      if (index > 0) {
        cy.wrap($h2).should('not.have.attr', 'aria-level', '1');
      }
    });
  });

  it('should announce live updates', () => {
    cy.get('[aria-live="polite"]').should('exist');

    // Trigger data refresh
    cy.get('[data-testid="refresh-button"]').click();

    cy.get('[aria-live="polite"]')
      .should('contain', 'Data refreshed');
  });

  it('should provide focus indicators', () => {
    cy.get('button').first().focus();
    cy.focused().should('have.css', 'outline-width').and('not.equal', '0px');

    cy.get('a').first().focus();
    cy.focused().should('have.css', 'outline-width').and('not.equal', '0px');
  });

  it('should handle modal accessibility', () => {
    cy.get('[data-testid="open-filter-modal"]').click();

    // Check modal attributes
    cy.get('[role="dialog"]').should('exist');
    cy.get('[role="dialog"]').should('have.attr', 'aria-labelledby');
    cy.get('[role="dialog"]').should('have.attr', 'aria-describedby');

    // Check focus trap
    cy.focused().should('be.visible');
    cy.focused().should('have.attr', 'role', 'dialog');

    // Check escape key closes modal
    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]').should('not.exist');
  });
});
```

### 3. Playwright Accessibility Tests

```typescript
// NEW/frontend/tests/accessibility/cross-browser.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Cross-browser Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should have no violations in ${browserName}`, async ({ page, browserName }) => {
      const violations = await getViolations(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });

      expect(violations).toHaveLength(0);

      if (violations.length > 0) {
        // Save violations report
        await page.screenshot({
          path: `accessibility-violations-${browserName}.png`,
          fullPage: true
        });
      }
    });
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Test with screen reader mode
    await page.addInitScript(() => {
      // Simulate screen reader by adding role and aria attributes
      document.body.setAttribute('role', 'application');
    });

    // Check for landmarks
    const landmarks = await page.$$eval('[role]', elements =>
      elements.map(el => el.getAttribute('role'))
    );

    expect(landmarks).toContain('navigation');
    expect(landmarks).toContain('main');
    expect(landmarks).toContain('complementary');
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });

    await checkA11y(page);

    // Check specific high contrast requirements
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const backgroundColor = await button.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const color = await button.evaluate(el =>
        window.getComputedStyle(el).color
      );

      // Verify contrast ratio (simplified check)
      expect(backgroundColor).not.toBe(color);
    }
  });

  test('should support reduced motion', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check that animations are disabled
    const animatedElements = await page.$$('[data-animated="true"]');

    for (const element of animatedElements) {
      const animationDuration = await element.evaluate(el =>
        window.getComputedStyle(el).animationDuration
      );

      expect(animationDuration).toBe('0s');
    }
  });
});
```

## CI/CD Integration

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  accessibility-checks:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint accessibility checks
        run: npm run lint:a11y

      - name: Run Jest accessibility tests
        run: npm run test:a11y -- --coverage

      - name: Start application
        run: |
          npm run build
          npm run start:test &
          npx wait-on http://localhost:3000

      - name: Run Cypress accessibility tests
        uses: cypress-io/github-action@v5
        with:
          command: npm run cypress:a11y
          wait-on: 'http://localhost:3000'

      - name: Run Pa11y CI
        run: npm run pa11y:ci

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.js'
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('./accessibility-report.json'));

            const comment = `
            ## Accessibility Test Results

            **Score:** ${results.score}/100
            **Violations:** ${results.violations}
            **WCAG Level:** ${results.wcagLevel}

            ${results.violations > 0 ? '⚠️ Please fix accessibility issues before merging.' : '✅ All accessibility checks passed!'}

            [View detailed report](${results.reportUrl})
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

      - name: Upload reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: accessibility-reports
          path: |
            accessibility-reports/
            lighthouse-reports/
            coverage/
```

### 2. Pa11y Configuration

```javascript
// .pa11yci
module.exports = {
  defaults: {
    timeout: 10000,
    wait: 2000,
    standard: 'WCAG2AA',
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    },
    actions: [
      'wait for element #app to be visible'
    ]
  },
  urls: [
    {
      url: 'http://localhost:3000',
      screenCapture: 'reports/home.png'
    },
    {
      url: 'http://localhost:3000/dashboard',
      actions: [
        'wait for element [data-testid="dashboard-content"] to be visible',
        'click element [data-testid="period-selector"]',
        'wait for element [role="listbox"] to be visible'
      ],
      screenCapture: 'reports/dashboard.png'
    },
    {
      url: 'http://localhost:3000/activities',
      screenCapture: 'reports/activities.png'
    }
  ],
  reporters: [
    ['cli'],
    ['json', { fileName: './accessibility-report.json' }],
    ['html', { fileName: './accessibility-report.html' }]
  ]
};
```

## Manual Testing Procedures

### 1. Manual Testing Checklist

```typescript
// NEW/frontend/docs/accessibility/manual-testing-checklist.ts
export interface ManualTestCase {
  id: string;
  category: string;
  description: string;
  steps: string[];
  expectedResult: string;
  wcagCriteria: string[];
}

export const MANUAL_TEST_CHECKLIST: ManualTestCase[] = [
  {
    id: 'MT-001',
    category: 'Keyboard Navigation',
    description: 'Test complete keyboard navigation flow',
    steps: [
      'Start at the top of the page',
      'Press Tab key repeatedly',
      'Verify all interactive elements receive focus',
      'Verify focus order matches visual order',
      'Press Shift+Tab to navigate backwards',
      'Test Enter/Space activation of buttons',
      'Test arrow keys in dropdowns and menus'
    ],
    expectedResult: 'All interactive elements accessible via keyboard',
    wcagCriteria: ['2.1.1', '2.1.2', '2.4.3']
  },
  {
    id: 'MT-002',
    category: 'Screen Reader',
    description: 'Test with NVDA/JAWS/VoiceOver',
    steps: [
      'Enable screen reader',
      'Navigate page using screen reader commands',
      'Verify all content is announced',
      'Check form labels are read correctly',
      'Verify error messages are announced',
      'Test data table navigation',
      'Verify chart alternatives'
    ],
    expectedResult: 'All content accessible to screen readers',
    wcagCriteria: ['1.3.1', '2.4.6', '3.3.2']
  },
  {
    id: 'MT-003',
    category: 'Visual Testing',
    description: 'Test visual accessibility',
    steps: [
      'Zoom to 200% - verify no horizontal scroll',
      'Zoom to 400% - verify content reflows',
      'Test with Windows High Contrast mode',
      'Disable CSS - verify content structure',
      'Test color blind simulator',
      'Verify focus indicators visible'
    ],
    expectedResult: 'Content remains accessible at all zoom levels',
    wcagCriteria: ['1.4.4', '1.4.10', '1.4.11']
  },
  {
    id: 'MT-004',
    category: 'Forms',
    description: 'Test form accessibility',
    steps: [
      'Tab through all form fields',
      'Submit form with errors',
      'Verify error messages associated with fields',
      'Test with screen reader',
      'Verify required fields indicated',
      'Test autocomplete attributes',
      'Verify field instructions'
    ],
    expectedResult: 'Forms fully accessible with clear error handling',
    wcagCriteria: ['1.3.5', '3.3.1', '3.3.2', '3.3.3']
  }
];

// Manual test reporter
export class ManualTestReporter {
  generateChecklist(): string {
    let markdown = '# Accessibility Manual Testing Checklist\n\n';

    MANUAL_TEST_CHECKLIST.forEach(test => {
      markdown += `## ${test.id}: ${test.description}\n`;
      markdown += `**Category:** ${test.category}\n`;
      markdown += `**WCAG Criteria:** ${test.wcagCriteria.join(', ')}\n\n`;
      markdown += '### Steps:\n';
      test.steps.forEach((step, index) => {
        markdown += `${index + 1}. ${step}\n`;
      });
      markdown += `\n**Expected Result:** ${test.expectedResult}\n\n`;
      markdown += '**Pass:** ☐ **Fail:** ☐\n';
      markdown += '**Notes:** _____________________________\n\n---\n\n';
    });

    return markdown;
  }
}
```

## Accessibility Monitoring

### 1. Real User Monitoring

```typescript
// NEW/frontend/src/services/monitoring/accessibility-rum.ts
export class AccessibilityRUM {
  private violations: Map<string, number> = new Map();
  private userInteractions: any[] = [];

  init(): void {
    this.setupViolationTracking();
    this.setupInteractionTracking();
    this.setupPerformanceTracking();
  }

  private setupViolationTracking(): void {
    // Run axe on route changes
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(async () => {
        const results = await axe.run(document.body, {
          runOnly: ['wcag21aa'],
          resultTypes: ['violations']
        });

        results.violations.forEach(violation => {
          const count = this.violations.get(violation.id) || 0;
          this.violations.set(violation.id, count + 1);
        });

        // Send to analytics
        if (this.violations.size > 0) {
          this.sendToAnalytics();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  private setupInteractionTracking(): void {
    // Track keyboard usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.userInteractions.push({
          type: 'keyboard',
          timestamp: Date.now()
        });
      }
    });

    // Track screen reader usage (heuristic)
    const srDetection = () => {
      const focusTime = performance.now();

      requestAnimationFrame(() => {
        const blurTime = performance.now();

        if (blurTime - focusTime < 10) {
          this.userInteractions.push({
            type: 'screenreader',
            timestamp: Date.now()
          });
        }
      });
    };

    document.addEventListener('focus', srDetection, true);
  }

  private setupPerformanceTracking(): void {
    // Track focus delay
    let lastFocusTime = 0;

    document.addEventListener('focus', () => {
      const now = performance.now();
      const delay = now - lastFocusTime;

      if (delay > 100) {
        this.trackMetric('focus_delay', delay);
      }

      lastFocusTime = now;
    }, true);
  }

  private sendToAnalytics(): void {
    const data = {
      violations: Array.from(this.violations.entries()),
      interactions: this.userInteractions.slice(-100),
      timestamp: Date.now(),
      url: window.location.href
    };

    // Send to analytics endpoint
    fetch('/api/v1/analytics/accessibility', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private trackMetric(name: string, value: number): void {
    // Track custom metrics
    if (window.performance && window.performance.measure) {
      window.performance.measure(name, {
        detail: { value }
      });
    }
  }
}
```

## Remediation Workflows

### 1. Issue Tracking Integration

```typescript
// NEW/backend/src/services/accessibility/remediation.service.ts
import { Injectable } from '@nestjs/common';

export interface AccessibilityIssue {
  id: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  type: string;
  description: string;
  location: string;
  wcagCriteria: string[];
  status: 'open' | 'in-progress' | 'resolved' | 'wont-fix';
  assignee?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

@Injectable()
export class RemediationService {
  async createJiraTicket(issue: AccessibilityIssue): Promise<string> {
    const jiraPayload = {
      fields: {
        project: { key: 'CLNZ' },
        summary: `A11y: ${issue.description}`,
        description: this.formatJiraDescription(issue),
        issuetype: { name: 'Bug' },
        priority: this.mapSeverityToPriority(issue.severity),
        labels: ['accessibility', `wcag-${issue.wcagCriteria[0]}`],
        customfield_10001: issue.wcagCriteria.join(', '), // WCAG criteria field
      }
    };

    // Create ticket via JIRA API
    const response = await fetch(`${process.env.JIRA_URL}/rest/api/2/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.JIRA_AUTH}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jiraPayload)
    });

    const result = await response.json();
    return result.key;
  }

  private formatJiraDescription(issue: AccessibilityIssue): string {
    return `
h3. Accessibility Issue

*Severity:* ${issue.severity}
*Type:* ${issue.type}
*Location:* ${issue.location}
*WCAG Criteria:* ${issue.wcagCriteria.join(', ')}

h3. Description
${issue.description}

h3. Steps to Reproduce
1. Navigate to ${issue.location}
2. Use screen reader or keyboard navigation
3. Observe the issue

h3. Expected Behavior
Component should meet WCAG 2.1 Level AA criteria ${issue.wcagCriteria.join(', ')}

h3. Resources
- [WCAG Quick Reference|https://www.w3.org/WAI/WCAG21/quickref/]
- [Internal A11y Guide|https://wiki.company.com/accessibility]
    `;
  }

  private mapSeverityToPriority(severity: string): { name: string } {
    const mapping = {
      critical: 'Highest',
      serious: 'High',
      moderate: 'Medium',
      minor: 'Low'
    };

    return { name: mapping[severity] || 'Medium' };
  }
}
```

## Reporting and Compliance

### 1. Compliance Dashboard

```typescript
// NEW/frontend/src/components/AccessibilityDashboard/ComplianceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { axeService } from '@/services/accessibility/axe.service';

export const ComplianceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    overallScore: 0,
    wcagLevel: 'Unknown',
    totalViolations: 0,
    criticalViolations: 0,
    resolvedThisWeek: 0,
    trend: 'stable'
  });

  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    loadMetrics();
    loadRecentScans();
  }, []);

  const loadMetrics = async () => {
    const response = await fetch('/api/v1/accessibility/metrics');
    const data = await response.json();
    setMetrics(data);
  };

  const loadRecentScans = async () => {
    const response = await fetch('/api/v1/accessibility/scans?limit=10');
    const data = await response.json();
    setRecentScans(data);
  };

  const runScan = async () => {
    const report = await axeService.analyze();
    await fetch('/api/v1/accessibility/scans', {
      method: 'POST',
      body: JSON.stringify(report),
      headers: { 'Content-Type': 'application/json' }
    });

    loadMetrics();
    loadRecentScans();
  };

  return (
    <div className="accessibility-dashboard" role="main" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Accessibility Compliance Dashboard</h1>

      <div className="metrics-grid" role="region" aria-label="Compliance Metrics">
        <div className="metric-card">
          <h2>Overall Score</h2>
          <div
            className={`score ${metrics.overallScore >= 90 ? 'good' : metrics.overallScore >= 70 ? 'fair' : 'poor'}`}
            aria-label={`Overall accessibility score: ${metrics.overallScore} out of 100`}
          >
            {metrics.overallScore}/100
          </div>
        </div>

        <div className="metric-card">
          <h2>WCAG Compliance</h2>
          <div aria-label={`WCAG compliance level: ${metrics.wcagLevel}`}>
            {metrics.wcagLevel}
          </div>
        </div>

        <div className="metric-card">
          <h2>Active Violations</h2>
          <div aria-label={`${metrics.totalViolations} active violations, ${metrics.criticalViolations} critical`}>
            <span className="total">{metrics.totalViolations}</span>
            <span className="critical">({metrics.criticalViolations} critical)</span>
          </div>
        </div>

        <div className="metric-card">
          <h2>Weekly Progress</h2>
          <div aria-label={`${metrics.resolvedThisWeek} violations resolved this week`}>
            {metrics.resolvedThisWeek} resolved
            <span className={`trend ${metrics.trend}`} aria-label={`Trend: ${metrics.trend}`}>
              {metrics.trend === 'improving' ? '↑' : metrics.trend === 'declining' ? '↓' : '→'}
            </span>
          </div>
        </div>
      </div>

      <section aria-labelledby="recent-scans-title">
        <h2 id="recent-scans-title">Recent Scans</h2>

        <button onClick={runScan} aria-label="Run new accessibility scan">
          Run Scan
        </button>

        <table role="table" aria-label="Recent accessibility scan results">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Page</th>
              <th scope="col">Score</th>
              <th scope="col">Violations</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.map((scan, index) => (
              <tr key={scan.id}>
                <td>{new Date(scan.timestamp).toLocaleDateString()}</td>
                <td>{scan.url}</td>
                <td>
                  <span className={`score-badge ${scan.score >= 90 ? 'good' : scan.score >= 70 ? 'fair' : 'poor'}`}>
                    {scan.score}%
                  </span>
                </td>
                <td>{scan.violations}</td>
                <td>
                  <a href={`/accessibility/reports/${scan.id}`} aria-label={`View report for scan on ${scan.url}`}>
                    View Report
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
```

## Implementation Checklist

- [ ] Axe-core integrated in development environment
- [ ] Jest-axe configured for unit tests
- [ ] Cypress-axe setup for E2E tests
- [ ] ESLint jsx-a11y plugin configured
- [ ] Storybook a11y addon installed
- [ ] CI/CD pipeline includes accessibility tests
- [ ] Pa11y CI configured
- [ ] Lighthouse CI integrated
- [ ] Manual testing procedures documented
- [ ] Accessibility monitoring dashboard deployed
- [ ] JIRA integration for issue tracking
- [ ] Team trained on accessibility testing

## Best Practices

1. **Shift Left**: Test accessibility during development, not after
2. **Automate**: Catch ~30% of issues automatically
3. **Manual Testing**: Required for remaining ~70% of issues
4. **Real Users**: Include users with disabilities in testing
5. **Continuous Monitoring**: Track accessibility metrics over time
6. **Education**: Train developers on accessibility best practices

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-core Documentation](https://www.deque.com/axe/core-documentation/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

This implementation ensures comprehensive accessibility testing and WCAG 2.1 Level AA compliance throughout the development lifecycle.