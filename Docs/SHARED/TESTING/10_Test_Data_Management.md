# Test Data Management Implementation Guide

## Executive Summary

This document provides production-ready test data management implementations for the Clenergize V3 platform, including factory patterns, builders, fixtures, seeding strategies, and data anonymization for testing environments.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Factory Pattern Implementation](#factory-pattern-implementation)
3. [Builder Pattern for Complex Objects](#builder-pattern-for-complex-objects)
4. [Test Fixtures Management](#test-fixtures-management)
5. [Database Seeding Strategies](#database-seeding-strategies)
6. [Data Anonymization](#data-anonymization)
7. [Test Data API](#test-data-api)
8. [Performance Testing Data](#performance-testing-data)
9. [Data Cleanup Strategies](#data-cleanup-strategies)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   TEST DATA ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Factory Layer:                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Entity Factories (User, Organization, Project)      │ │
│  │ • Relationship Factories (Hierarchies, Permissions)   │ │
│  │ • Data Factories (Activities, Emissions)              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Builder Layer:                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Fluent Builders for Complex Objects                 │ │
│  │ • Scenario Builders (Complete Test Cases)             │ │
│  │ • State Builders (Workflow States)                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Fixture Layer:                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • JSON/YAML Fixtures                                  │ │
│  │ • Snapshot Management                                  │ │
│  │ • Reference Data Sets                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Seeding Layer:                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Environment-Specific Seeds                          │ │
│  │ • Bulk Data Generation                                 │ │
│  │ • Relationship Graph Construction                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Factory Pattern Implementation

### 1. Base Factory Class

```typescript
// NEW/shared/testing/factories/base.factory.ts
import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import { DeepPartial } from 'typeorm';

export abstract class BaseFactory<T> {
  protected sequence: number = 0;
  protected faker = faker;

  abstract define(): T;

  /**
   * Create a single instance
   */
  create(overrides?: DeepPartial<T>): T {
    this.sequence++;
    const instance = this.define();
    return this.merge(instance, overrides);
  }

  /**
   * Create multiple instances
   */
  createMany(count: number, overrides?: DeepPartial<T>): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create and persist to database
   */
  abstract async persist(overrides?: DeepPartial<T>): Promise<T>;

  /**
   * Create multiple and persist to database
   */
  async persistMany(count: number, overrides?: DeepPartial<T>): Promise<T[]> {
    const instances: T[] = [];
    for (let i = 0; i < count; i++) {
      instances.push(await this.persist(overrides));
    }
    return instances;
  }

  /**
   * Reset the factory sequence
   */
  reset(): void {
    this.sequence = 0;
    this.faker.seed(12345); // Consistent seed for reproducible tests
  }

  /**
   * Merge overrides with generated data
   */
  protected merge(instance: T, overrides?: DeepPartial<T>): T {
    if (!overrides) return instance;

    return Object.keys(overrides).reduce((merged, key) => {
      const value = overrides[key];
      if (value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          merged[key] = this.merge(merged[key] || {}, value);
        } else {
          merged[key] = value;
        }
      }
      return merged;
    }, { ...instance });
  }

  /**
   * Generate a unique ID
   */
  protected generateId(): string {
    return new ObjectId().toHexString();
  }

  /**
   * Generate a sequence-based value
   */
  protected sequenced(prefix: string): string {
    return `${prefix}_${this.sequence}`;
  }
}
```

### 2. User Factory

```typescript
// NEW/identity-service/test/factories/user.factory.ts
import { BaseFactory } from '@/shared/testing/factories/base.factory';
import { User, UserRole, UserStatus } from '@/domain/entities/user.entity';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';

export class UserFactory extends BaseFactory<User> {
  define(): User {
    return {
      id: this.generateId(),
      email: this.sequenced('user') + '@test.com',
      username: this.faker.internet.userName(),
      firstName: this.faker.person.firstName(),
      lastName: this.faker.person.lastName(),
      passwordHash: bcrypt.hashSync('Test123!', 10),
      role: this.faker.helpers.arrayElement(Object.values(UserRole)),
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneNumber: this.faker.phone.number(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      loginAttempts: 0,
      lockedUntil: null,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      },
      metadata: {}
    };
  }

  async persist(overrides?: DeepPartial<User>): Promise<User> {
    const user = this.create(overrides);
    const repository = getRepository(User);
    return repository.save(user);
  }

  // Specialized factory methods
  withRole(role: UserRole): this {
    this.define = () => ({
      ...super.define(),
      role
    });
    return this;
  }

  asAdmin(): User {
    return this.create({
      role: UserRole.ADMIN,
      email: this.sequenced('admin') + '@test.com'
    });
  }

  asAnalyst(): User {
    return this.create({
      role: UserRole.ANALYST,
      email: this.sequenced('analyst') + '@test.com'
    });
  }

  withOrganization(organizationId: string): User {
    return this.create({
      organizationId,
      metadata: { organizationJoinedAt: new Date() }
    });
  }

  suspended(): User {
    return this.create({
      status: UserStatus.SUSPENDED,
      metadata: { suspendedReason: 'Test suspension' }
    });
  }

  unverified(): User {
    return this.create({
      emailVerified: false,
      status: UserStatus.PENDING
    });
  }

  locked(): User {
    return this.create({
      loginAttempts: 5,
      lockedUntil: new Date(Date.now() + 3600000), // 1 hour from now
      status: UserStatus.LOCKED
    });
  }
}

// Export singleton instance
export const userFactory = new UserFactory();
```

### 3. Organization Factory

```typescript
// NEW/organization-service/test/factories/organization.factory.ts
import { BaseFactory } from '@/shared/testing/factories/base.factory';
import { Organization, OrganizationType } from '@/domain/entities/organization.entity';
import { getRepository } from 'typeorm';

export class OrganizationFactory extends BaseFactory<Organization> {
  define(): Organization {
    const companyName = this.faker.company.name();

    return {
      id: this.generateId(),
      name: companyName,
      code: companyName.substring(0, 3).toUpperCase() + this.sequence,
      type: this.faker.helpers.arrayElement(Object.values(OrganizationType)),
      industry: this.faker.helpers.arrayElement([
        'Manufacturing',
        'Technology',
        'Healthcare',
        'Finance',
        'Retail'
      ]),
      country: this.faker.location.countryCode(),
      address: {
        street: this.faker.location.streetAddress(),
        city: this.faker.location.city(),
        state: this.faker.location.state(),
        postalCode: this.faker.location.zipCode(),
        country: this.faker.location.country()
      },
      contact: {
        email: this.faker.internet.email({ provider: companyName.toLowerCase().replace(/\s/g, '') + '.com' }),
        phone: this.faker.phone.number(),
        website: this.faker.internet.url()
      },
      settings: {
        fiscalYearStart: 1,
        currency: 'USD',
        units: {
          energy: 'kWh',
          emissions: 'tCO2e',
          distance: 'km'
        },
        reportingBoundaries: ['Scope1', 'Scope2', 'Scope3']
      },
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {}
    };
  }

  async persist(overrides?: DeepPartial<Organization>): Promise<Organization> {
    const org = this.create(overrides);
    const repository = getRepository(Organization);
    return repository.save(org);
  }

  withProjects(count: number = 3): Organization {
    const org = this.create();
    org.projects = projectFactory.createMany(count, { organizationId: org.id });
    return org;
  }

  withUsers(users: User[]): Organization {
    const org = this.create();
    org.userIds = users.map(u => u.id);
    return org;
  }

  asEnterprise(): Organization {
    return this.create({
      type: OrganizationType.ENTERPRISE,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        features: ['unlimited-users', 'api-access', 'custom-reports', 'sso']
      }
    });
  }

  asSmallBusiness(): Organization {
    return this.create({
      type: OrganizationType.SMB,
      subscription: {
        plan: 'starter',
        status: 'active',
        features: ['basic-reports', 'email-support']
      }
    });
  }
}

export const organizationFactory = new OrganizationFactory();
```

### 4. Project Hierarchy Factory

```typescript
// NEW/organization-service/test/factories/project-hierarchy.factory.ts
import { BaseFactory } from '@/shared/testing/factories/base.factory';
import { ProjectHierarchy, HierarchyNode } from '@/domain/entities/project-hierarchy.entity';

export class ProjectHierarchyFactory extends BaseFactory<ProjectHierarchy> {
  define(): ProjectHierarchy {
    return {
      id: this.generateId(),
      projectId: this.generateId(),
      name: this.faker.commerce.department() + ' Hierarchy',
      description: this.faker.lorem.sentence(),
      rootNode: this.createNode('root', 0),
      totalNodes: 1,
      maxDepth: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
  }

  private createNode(name: string, level: number): HierarchyNode {
    return {
      id: this.generateId(),
      name: name || this.faker.commerce.department(),
      code: name.toUpperCase().substring(0, 3) + '_' + this.sequence,
      level,
      path: [],
      children: [],
      metadata: {
        responsible: this.faker.person.fullName(),
        costCenter: this.faker.finance.accountNumber()
      }
    };
  }

  withDepth(depth: number): ProjectHierarchy {
    const hierarchy = this.create();
    hierarchy.rootNode = this.buildTree(depth);
    hierarchy.maxDepth = depth;
    hierarchy.totalNodes = this.countNodes(hierarchy.rootNode);
    return hierarchy;
  }

  private buildTree(depth: number, currentLevel: number = 0): HierarchyNode {
    const node = this.createNode(`Level_${currentLevel}_Node`, currentLevel);

    if (currentLevel < depth) {
      const childCount = this.faker.number.int({ min: 2, max: 4 });
      node.children = Array.from({ length: childCount }, (_, i) => {
        const child = this.buildTree(depth, currentLevel + 1);
        child.path = [...node.path, node.id];
        child.name = `${node.name}_Child_${i + 1}`;
        return child;
      });
    }

    return node;
  }

  private countNodes(node: HierarchyNode): number {
    return 1 + node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
  }

  complexHierarchy(): ProjectHierarchy {
    return this.withDepth(4); // Creates a 4-level deep hierarchy
  }

  flatHierarchy(): ProjectHierarchy {
    const hierarchy = this.create();
    const childCount = 10;
    hierarchy.rootNode.children = Array.from({ length: childCount }, (_, i) =>
      this.createNode(`Department_${i + 1}`, 1)
    );
    hierarchy.totalNodes = childCount + 1;
    hierarchy.maxDepth = 1;
    return hierarchy;
  }

  async persist(overrides?: DeepPartial<ProjectHierarchy>): Promise<ProjectHierarchy> {
    const hierarchy = this.create(overrides);
    const repository = getRepository(ProjectHierarchy);
    return repository.save(hierarchy);
  }
}

export const hierarchyFactory = new ProjectHierarchyFactory();
```

### 5. Activity Data Factory

```typescript
// NEW/activity-service/test/factories/activity.factory.ts
import { BaseFactory } from '@/shared/testing/factories/base.factory';
import { Activity, ActivityType, DataQuality } from '@/domain/entities/activity.entity';

export class ActivityFactory extends BaseFactory<Activity> {
  define(): Activity {
    const activityType = this.faker.helpers.arrayElement(Object.values(ActivityType));

    return {
      id: this.generateId(),
      projectId: this.generateId(),
      hierarchyNodeId: this.generateId(),
      type: activityType,
      name: `${activityType} Activity ${this.sequence}`,
      description: this.faker.lorem.paragraph(),
      period: {
        year: 2024,
        month: this.faker.number.int({ min: 1, max: 12 }),
        quarter: Math.ceil(this.faker.number.int({ min: 1, max: 12 }) / 3)
      },
      data: this.generateActivityData(activityType),
      quality: {
        score: this.faker.number.float({ min: 0.5, max: 1.0, precision: 0.01 }),
        level: this.faker.helpers.arrayElement(Object.values(DataQuality)),
        issues: [],
        lastValidated: new Date()
      },
      source: {
        type: this.faker.helpers.arrayElement(['manual', 'api', 'iot', 'import']),
        reference: this.faker.string.uuid(),
        uploadedBy: this.generateId(),
        uploadedAt: new Date()
      },
      status: 'validated',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {}
    };
  }

  private generateActivityData(type: ActivityType): any {
    switch (type) {
      case ActivityType.ELECTRICITY:
        return {
          consumption: this.faker.number.float({ min: 1000, max: 50000, precision: 0.01 }),
          unit: 'kWh',
          supplier: this.faker.company.name(),
          renewable: this.faker.datatype.boolean(),
          renewablePercentage: this.faker.number.int({ min: 0, max: 100 })
        };

      case ActivityType.FUEL:
        return {
          type: this.faker.helpers.arrayElement(['diesel', 'gasoline', 'natural_gas', 'lpg']),
          consumption: this.faker.number.float({ min: 100, max: 5000, precision: 0.01 }),
          unit: 'liters',
          purpose: this.faker.helpers.arrayElement(['heating', 'transport', 'generation'])
        };

      case ActivityType.TRANSPORT:
        return {
          mode: this.faker.helpers.arrayElement(['road', 'rail', 'air', 'sea']),
          distance: this.faker.number.float({ min: 10, max: 10000, precision: 0.01 }),
          unit: 'km',
          vehicleType: this.faker.vehicle.type(),
          fuelType: this.faker.helpers.arrayElement(['diesel', 'gasoline', 'electric', 'hybrid']),
          passengers: this.faker.number.int({ min: 1, max: 50 })
        };

      case ActivityType.WASTE:
        return {
          type: this.faker.helpers.arrayElement(['landfill', 'recycling', 'composting', 'incineration']),
          weight: this.faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
          unit: 'kg',
          category: this.faker.helpers.arrayElement(['paper', 'plastic', 'organic', 'metal', 'glass'])
        };

      default:
        return {
          value: this.faker.number.float({ min: 1, max: 1000, precision: 0.01 }),
          unit: 'units'
        };
    }
  }

  withEmissions(emissionFactorId: string): Activity {
    return this.create({
      calculationResult: {
        emissionFactorId,
        emissions: this.faker.number.float({ min: 0.1, max: 100, precision: 0.001 }),
        unit: 'tCO2e',
        calculatedAt: new Date(),
        methodology: 'GHG Protocol'
      }
    });
  }

  bulkElectricityData(count: number, projectId: string): Activity[] {
    return this.createMany(count, {
      projectId,
      type: ActivityType.ELECTRICITY
    });
  }

  monthlyDataSet(year: number, projectId: string, hierarchyNodeId: string): Activity[] {
    return Array.from({ length: 12 }, (_, month) =>
      this.create({
        projectId,
        hierarchyNodeId,
        period: { year, month: month + 1, quarter: Math.ceil((month + 1) / 3) }
      })
    );
  }

  async persist(overrides?: DeepPartial<Activity>): Promise<Activity> {
    const activity = this.create(overrides);
    const repository = getRepository(Activity);
    return repository.save(activity);
  }
}

export const activityFactory = new ActivityFactory();
```

## Builder Pattern for Complex Objects

### 1. Test Scenario Builder

```typescript
// NEW/shared/testing/builders/scenario.builder.ts
import { userFactory } from '@/identity-service/test/factories/user.factory';
import { organizationFactory } from '@/organization-service/test/factories/organization.factory';
import { projectFactory } from '@/organization-service/test/factories/project.factory';
import { hierarchyFactory } from '@/organization-service/test/factories/project-hierarchy.factory';
import { activityFactory } from '@/activity-service/test/factories/activity.factory';
import { emissionFactorFactory } from '@/reference-service/test/factories/emission-factor.factory';

export class ScenarioBuilder {
  private scenario: any = {};

  static create(): ScenarioBuilder {
    return new ScenarioBuilder();
  }

  withOrganization(overrides?: any): this {
    this.scenario.organization = organizationFactory.create(overrides);
    return this;
  }

  withUsers(count: number = 3, roleDistribution?: Record<string, number>): this {
    if (roleDistribution) {
      this.scenario.users = [];
      for (const [role, num] of Object.entries(roleDistribution)) {
        this.scenario.users.push(
          ...userFactory.createMany(num, {
            role,
            organizationId: this.scenario.organization?.id
          })
        );
      }
    } else {
      this.scenario.users = userFactory.createMany(count, {
        organizationId: this.scenario.organization?.id
      });
    }
    return this;
  }

  withProjects(count: number = 2): this {
    this.scenario.projects = projectFactory.createMany(count, {
      organizationId: this.scenario.organization?.id
    });
    return this;
  }

  withComplexHierarchy(levels: number = 3): this {
    if (!this.scenario.projects?.length) {
      throw new Error('Projects must be created before hierarchies');
    }

    this.scenario.hierarchies = this.scenario.projects.map(project =>
      hierarchyFactory.withDepth(levels).create({ projectId: project.id })
    );
    return this;
  }

  withActivities(
    activitiesPerNode: number = 5,
    monthsBack: number = 12
  ): this {
    if (!this.scenario.hierarchies?.length) {
      throw new Error('Hierarchies must be created before activities');
    }

    this.scenario.activities = [];

    for (const hierarchy of this.scenario.hierarchies) {
      const nodes = this.flattenHierarchy(hierarchy.rootNode);

      for (const node of nodes) {
        const currentDate = new Date();
        for (let month = 0; month < monthsBack; month++) {
          const activityDate = new Date(currentDate);
          activityDate.setMonth(activityDate.getMonth() - month);

          this.scenario.activities.push(
            ...activityFactory.createMany(activitiesPerNode, {
              projectId: hierarchy.projectId,
              hierarchyNodeId: node.id,
              period: {
                year: activityDate.getFullYear(),
                month: activityDate.getMonth() + 1,
                quarter: Math.ceil((activityDate.getMonth() + 1) / 3)
              }
            })
          );
        }
      }
    }

    return this;
  }

  withEmissionFactors(count: number = 20): this {
    this.scenario.emissionFactors = emissionFactorFactory.createMany(count);
    return this;
  }

  withCalculations(): this {
    if (!this.scenario.activities || !this.scenario.emissionFactors) {
      throw new Error('Activities and emission factors required for calculations');
    }

    this.scenario.calculations = this.scenario.activities.map(activity => ({
      activityId: activity.id,
      emissionFactorId: this.scenario.emissionFactors[
        Math.floor(Math.random() * this.scenario.emissionFactors.length)
      ].id,
      emissions: Math.random() * 100,
      unit: 'tCO2e',
      calculatedAt: new Date()
    }));

    return this;
  }

  private flattenHierarchy(node: any, result: any[] = []): any[] {
    result.push(node);
    for (const child of node.children || []) {
      this.flattenHierarchy(child, result);
    }
    return result;
  }

  async build(): Promise<any> {
    return this.scenario;
  }

  async buildAndPersist(): Promise<any> {
    const persisted: any = {};

    if (this.scenario.organization) {
      persisted.organization = await organizationFactory.persist(this.scenario.organization);
    }

    if (this.scenario.users) {
      persisted.users = await Promise.all(
        this.scenario.users.map(u => userFactory.persist(u))
      );
    }

    if (this.scenario.projects) {
      persisted.projects = await Promise.all(
        this.scenario.projects.map(p => projectFactory.persist(p))
      );
    }

    // Continue persisting other entities...

    return persisted;
  }
}

// Usage example:
// const scenario = await ScenarioBuilder.create()
//   .withOrganization({ name: 'Test Corp' })
//   .withUsers(10, { ADMIN: 2, ANALYST: 5, VIEWER: 3 })
//   .withProjects(3)
//   .withComplexHierarchy(4)
//   .withActivities(5, 12)
//   .withEmissionFactors(30)
//   .withCalculations()
//   .buildAndPersist();
```

### 2. State Machine Builder

```typescript
// NEW/shared/testing/builders/state-machine.builder.ts
export class StateMachineBuilder<T> {
  private states: Map<string, T> = new Map();
  private transitions: Map<string, string[]> = new Map();
  private currentState: string;

  static create<T>(): StateMachineBuilder<T> {
    return new StateMachineBuilder<T>();
  }

  addState(name: string, data: T): this {
    this.states.set(name, data);
    if (!this.currentState) {
      this.currentState = name;
    }
    return this;
  }

  addTransition(from: string, to: string): this {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, []);
    }
    this.transitions.get(from)!.push(to);
    return this;
  }

  setState(state: string): this {
    if (!this.states.has(state)) {
      throw new Error(`State ${state} does not exist`);
    }
    this.currentState = state;
    return this;
  }

  transition(to: string): this {
    const allowedTransitions = this.transitions.get(this.currentState) || [];
    if (!allowedTransitions.includes(to)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${to}`);
    }
    this.currentState = to;
    return this;
  }

  getCurrentState(): T | undefined {
    return this.states.get(this.currentState);
  }

  build(): T | undefined {
    return this.getCurrentState();
  }
}

// Usage for testing workflows:
// const workflowBuilder = StateMachineBuilder.create<Project>()
//   .addState('draft', projectFactory.create({ status: 'draft' }))
//   .addState('active', projectFactory.create({ status: 'active' }))
//   .addState('completed', projectFactory.create({ status: 'completed' }))
//   .addTransition('draft', 'active')
//   .addTransition('active', 'completed')
//   .setState('draft')
//   .transition('active');
```

## Test Fixtures Management

### 1. Fixture Loader

```typescript
// NEW/shared/testing/fixtures/fixture-loader.ts
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FixtureLoader {
  private fixturesPath = path.join(__dirname, '../../../../fixtures');
  private cache: Map<string, any> = new Map();

  /**
   * Load a fixture file (JSON or YAML)
   */
  load<T>(name: string): T {
    if (this.cache.has(name)) {
      return this.cache.get(name) as T;
    }

    const jsonPath = path.join(this.fixturesPath, `${name}.json`);
    const yamlPath = path.join(this.fixturesPath, `${name}.yaml`);

    let data: T;

    if (fs.existsSync(jsonPath)) {
      data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } else if (fs.existsSync(yamlPath)) {
      data = yaml.load(fs.readFileSync(yamlPath, 'utf8')) as T;
    } else {
      throw new Error(`Fixture ${name} not found`);
    }

    this.cache.set(name, data);
    return data;
  }

  /**
   * Load multiple fixtures
   */
  loadMany<T>(names: string[]): T[] {
    return names.map(name => this.load<T>(name));
  }

  /**
   * Load all fixtures matching a pattern
   */
  loadPattern<T>(pattern: RegExp): T[] {
    const files = fs.readdirSync(this.fixturesPath);
    const matching = files.filter(file => pattern.test(file));

    return matching.map(file => {
      const name = file.replace(/\.(json|yaml)$/, '');
      return this.load<T>(name);
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Process fixture with interpolation
   */
  interpolate<T>(fixture: T, context: Record<string, any>): T {
    const json = JSON.stringify(fixture);
    const interpolated = json.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return context[key] || '';
    });
    return JSON.parse(interpolated);
  }
}
```

### 2. Sample Fixtures

```yaml
# fixtures/organizations/enterprise.yaml
name: "Acme Corporation"
type: "ENTERPRISE"
industry: "Manufacturing"
country: "US"
settings:
  fiscalYearStart: 1
  currency: "USD"
  units:
    energy: "kWh"
    emissions: "tCO2e"
  reportingBoundaries:
    - "Scope1"
    - "Scope2"
    - "Scope3"
subscription:
  plan: "enterprise"
  status: "active"
  features:
    - "unlimited-users"
    - "api-access"
    - "custom-reports"
    - "sso"
    - "dedicated-support"
```

```json
// fixtures/emission-factors/electricity-grid.json
{
  "category": "Electricity",
  "subcategory": "Grid Electricity",
  "factors": [
    {
      "region": "US-CA",
      "year": 2024,
      "value": 0.196,
      "unit": "kgCO2e/kWh",
      "source": "EPA eGRID 2024",
      "uncertainty": 0.05
    },
    {
      "region": "US-TX",
      "year": 2024,
      "value": 0.396,
      "unit": "kgCO2e/kWh",
      "source": "EPA eGRID 2024",
      "uncertainty": 0.05
    },
    {
      "region": "EU-DE",
      "year": 2024,
      "value": 0.338,
      "unit": "kgCO2e/kWh",
      "source": "European Environment Agency",
      "uncertainty": 0.08
    }
  ]
}
```

## Database Seeding Strategies

### 1. Seed Manager

```typescript
// NEW/shared/testing/seeds/seed-manager.ts
import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'typeorm';
import { MongoClient } from 'mongodb';

export interface SeedOptions {
  environment: 'local' | 'test' | 'staging' | 'demo';
  clean: boolean;
  services: string[];
  size: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface Seeder {
  name: string;
  service: string;
  dependencies?: string[];
  run(options: SeedOptions): Promise<void>;
  clean(): Promise<void>;
}

@Injectable()
export class SeedManager {
  private readonly logger = new Logger(SeedManager.name);
  private seeders: Map<string, Seeder> = new Map();
  private executed: Set<string> = new Set();

  constructor(
    private connection: Connection,
    private mongoClient: MongoClient
  ) {}

  /**
   * Register a seeder
   */
  register(seeder: Seeder): void {
    this.seeders.set(seeder.name, seeder);
  }

  /**
   * Run seeds based on options
   */
  async seed(options: SeedOptions): Promise<void> {
    this.logger.log(`Starting seed process for ${options.environment} environment`);

    // Clean if requested
    if (options.clean) {
      await this.clean(options.services);
    }

    // Get seeders to run
    const seedersToRun = this.getSeedersToRun(options);

    // Run seeders in dependency order
    for (const seeder of seedersToRun) {
      await this.runSeeder(seeder, options);
    }

    this.logger.log('Seeding completed successfully');
  }

  /**
   * Clean all data
   */
  async clean(services?: string[]): Promise<void> {
    this.logger.warn('Cleaning database...');

    const seedersToClean = services
      ? Array.from(this.seeders.values()).filter(s => services.includes(s.service))
      : Array.from(this.seeders.values());

    // Clean in reverse dependency order
    const reversed = seedersToClean.reverse();
    for (const seeder of reversed) {
      await seeder.clean();
      this.logger.log(`Cleaned ${seeder.name}`);
    }
  }

  /**
   * Get seeders to run based on dependencies
   */
  private getSeedersToRun(options: SeedOptions): Seeder[] {
    const allSeeders = Array.from(this.seeders.values());

    const filtered = options.services.length > 0
      ? allSeeders.filter(s => options.services.includes(s.service))
      : allSeeders;

    return this.topologicalSort(filtered);
  }

  /**
   * Run a single seeder
   */
  private async runSeeder(seeder: Seeder, options: SeedOptions): Promise<void> {
    if (this.executed.has(seeder.name)) {
      return;
    }

    // Run dependencies first
    if (seeder.dependencies) {
      for (const dep of seeder.dependencies) {
        const depSeeder = this.seeders.get(dep);
        if (depSeeder) {
          await this.runSeeder(depSeeder, options);
        }
      }
    }

    this.logger.log(`Running seeder: ${seeder.name}`);
    await seeder.run(options);
    this.executed.add(seeder.name);
  }

  /**
   * Topological sort for dependency resolution
   */
  private topologicalSort(seeders: Seeder[]): Seeder[] {
    const sorted: Seeder[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (seeder: Seeder) => {
      if (visited.has(seeder.name)) return;
      if (visiting.has(seeder.name)) {
        throw new Error(`Circular dependency detected: ${seeder.name}`);
      }

      visiting.add(seeder.name);

      if (seeder.dependencies) {
        for (const dep of seeder.dependencies) {
          const depSeeder = seeders.find(s => s.name === dep);
          if (depSeeder) {
            visit(depSeeder);
          }
        }
      }

      visiting.delete(seeder.name);
      visited.add(seeder.name);
      sorted.push(seeder);
    };

    for (const seeder of seeders) {
      visit(seeder);
    }

    return sorted;
  }
}
```

### 2. Service-Specific Seeders

```typescript
// NEW/identity-service/test/seeds/user.seeder.ts
import { Seeder, SeedOptions } from '@/shared/testing/seeds/seed-manager';
import { userFactory } from '../factories/user.factory';
import { getRepository } from 'typeorm';
import { User } from '@/domain/entities/user.entity';

export class UserSeeder implements Seeder {
  name = 'UserSeeder';
  service = 'identity';
  dependencies = [];

  async run(options: SeedOptions): Promise<void> {
    const counts = this.getCountsBySize(options.size);

    // Create admin users
    for (let i = 0; i < counts.admins; i++) {
      await userFactory.persist({
        email: `admin${i + 1}@clenergize.com`,
        role: 'ADMIN'
      });
    }

    // Create analysts
    for (let i = 0; i < counts.analysts; i++) {
      await userFactory.persist({
        email: `analyst${i + 1}@clenergize.com`,
        role: 'ANALYST'
      });
    }

    // Create viewers
    for (let i = 0; i < counts.viewers; i++) {
      await userFactory.persist({
        email: `viewer${i + 1}@clenergize.com`,
        role: 'VIEWER'
      });
    }

    // Create test users for different scenarios
    if (options.environment === 'test' || options.environment === 'local') {
      await this.createTestScenarioUsers();
    }
  }

  async clean(): Promise<void> {
    const repository = getRepository(User);
    await repository.clear();
  }

  private getCountsBySize(size: string) {
    const sizes = {
      small: { admins: 2, analysts: 5, viewers: 10 },
      medium: { admins: 5, analysts: 20, viewers: 50 },
      large: { admins: 10, analysts: 50, viewers: 200 },
      xlarge: { admins: 20, analysts: 100, viewers: 500 }
    };

    return sizes[size] || sizes.small;
  }

  private async createTestScenarioUsers(): Promise<void> {
    // User with expired password
    await userFactory.persist({
      email: 'expired@test.com',
      passwordChangedAt: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000)
    });

    // Locked user
    await userFactory.persist({
      email: 'locked@test.com',
      loginAttempts: 5,
      lockedUntil: new Date(Date.now() + 3600000)
    });

    // Unverified user
    await userFactory.persist({
      email: 'unverified@test.com',
      emailVerified: false,
      status: 'PENDING'
    });

    // User with MFA enabled
    await userFactory.persist({
      email: 'mfa@test.com',
      mfaEnabled: true,
      mfaSecret: 'test-secret'
    });
  }
}
```

### 3. Bulk Data Seeder

```typescript
// NEW/shared/testing/seeds/bulk-data.seeder.ts
import { Seeder, SeedOptions } from '@/shared/testing/seeds/seed-manager';
import { ScenarioBuilder } from '../builders/scenario.builder';
import { Logger } from '@nestjs/common';

export class BulkDataSeeder implements Seeder {
  name = 'BulkDataSeeder';
  service = 'all';
  dependencies = ['UserSeeder', 'OrganizationSeeder'];

  private readonly logger = new Logger(BulkDataSeeder.name);

  async run(options: SeedOptions): Promise<void> {
    const config = this.getConfigBySize(options.size);

    this.logger.log(`Creating ${config.organizations} organizations with data...`);

    for (let i = 0; i < config.organizations; i++) {
      const scenario = await ScenarioBuilder.create()
        .withOrganization({ name: `Organization ${i + 1}` })
        .withUsers(config.usersPerOrg, {
          ADMIN: Math.ceil(config.usersPerOrg * 0.1),
          ANALYST: Math.ceil(config.usersPerOrg * 0.3),
          VIEWER: Math.ceil(config.usersPerOrg * 0.6)
        })
        .withProjects(config.projectsPerOrg)
        .withComplexHierarchy(config.hierarchyDepth)
        .withActivities(config.activitiesPerNode, config.monthsOfData)
        .withEmissionFactors(config.emissionFactors)
        .withCalculations()
        .buildAndPersist();

      this.logger.log(`Created organization ${i + 1}/${config.organizations}`);
    }
  }

  async clean(): Promise<void> {
    // Handled by individual service seeders
  }

  private getConfigBySize(size: string) {
    const configs = {
      small: {
        organizations: 2,
        usersPerOrg: 10,
        projectsPerOrg: 2,
        hierarchyDepth: 2,
        activitiesPerNode: 5,
        monthsOfData: 3,
        emissionFactors: 20
      },
      medium: {
        organizations: 5,
        usersPerOrg: 20,
        projectsPerOrg: 5,
        hierarchyDepth: 3,
        activitiesPerNode: 10,
        monthsOfData: 6,
        emissionFactors: 50
      },
      large: {
        organizations: 10,
        usersPerOrg: 50,
        projectsPerOrg: 10,
        hierarchyDepth: 4,
        activitiesPerNode: 20,
        monthsOfData: 12,
        emissionFactors: 100
      },
      xlarge: {
        organizations: 20,
        usersPerOrg: 100,
        projectsPerOrg: 20,
        hierarchyDepth: 5,
        activitiesPerNode: 50,
        monthsOfData: 24,
        emissionFactors: 200
      }
    };

    return configs[size] || configs.small;
  }
}
```

## Data Anonymization

### 1. Anonymization Service

```typescript
// NEW/shared/testing/anonymization/anonymizer.service.ts
import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as crypto from 'crypto';

export interface AnonymizationConfig {
  preserveFormat?: boolean;
  preserveDomain?: boolean;
  deterministic?: boolean;
  salt?: string;
}

@Injectable()
export class AnonymizerService {
  private cache: Map<string, any> = new Map();

  /**
   * Anonymize PII data
   */
  anonymize(data: any, config: AnonymizationConfig = {}): any {
    if (Array.isArray(data)) {
      return data.map(item => this.anonymize(item, config));
    }

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const anonymized = { ...data };

    for (const [key, value] of Object.entries(anonymized)) {
      if (this.isPII(key)) {
        anonymized[key] = this.anonymizeField(key, value, config);
      } else if (typeof value === 'object') {
        anonymized[key] = this.anonymize(value, config);
      }
    }

    return anonymized;
  }

  /**
   * Check if field contains PII
   */
  private isPII(fieldName: string): boolean {
    const piiFields = [
      'email', 'name', 'firstName', 'lastName', 'phone', 'phoneNumber',
      'address', 'ssn', 'creditCard', 'bankAccount', 'passport',
      'driversLicense', 'taxId', 'employeeId', 'salary', 'dateOfBirth'
    ];

    return piiFields.some(pii =>
      fieldName.toLowerCase().includes(pii.toLowerCase())
    );
  }

  /**
   * Anonymize a specific field
   */
  private anonymizeField(
    fieldName: string,
    value: any,
    config: AnonymizationConfig
  ): any {
    if (config.deterministic) {
      return this.deterministicAnonymize(fieldName, value, config.salt);
    }

    const lowerField = fieldName.toLowerCase();

    if (lowerField.includes('email')) {
      return this.anonymizeEmail(value as string, config);
    }

    if (lowerField.includes('name')) {
      if (lowerField.includes('first')) {
        return faker.person.firstName();
      }
      if (lowerField.includes('last')) {
        return faker.person.lastName();
      }
      return faker.person.fullName();
    }

    if (lowerField.includes('phone')) {
      return this.anonymizePhone(value as string, config);
    }

    if (lowerField.includes('address')) {
      return this.anonymizeAddress(value, config);
    }

    if (lowerField.includes('ssn') || lowerField.includes('taxid')) {
      return this.anonymizeId(value as string, config);
    }

    // Default: replace with random string
    return faker.string.alphanumeric(String(value).length);
  }

  /**
   * Deterministic anonymization (same input = same output)
   */
  private deterministicAnonymize(
    fieldName: string,
    value: any,
    salt: string = 'default-salt'
  ): any {
    const key = `${fieldName}:${value}:${salt}`;

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const hash = crypto
      .createHash('sha256')
      .update(key)
      .digest('hex')
      .substring(0, 8);

    let anonymized: any;
    const lowerField = fieldName.toLowerCase();

    if (lowerField.includes('email')) {
      anonymized = `user_${hash}@example.com`;
    } else if (lowerField.includes('name')) {
      anonymized = `Person_${hash}`;
    } else if (lowerField.includes('phone')) {
      anonymized = `555-${hash.substring(0, 3)}-${hash.substring(3, 7)}`;
    } else {
      anonymized = hash;
    }

    this.cache.set(key, anonymized);
    return anonymized;
  }

  /**
   * Anonymize email addresses
   */
  private anonymizeEmail(email: string, config: AnonymizationConfig): string {
    if (config.preserveDomain) {
      const domain = email.split('@')[1];
      return `${faker.internet.userName()}@${domain}`;
    }

    if (config.preserveFormat) {
      const parts = email.split('@');
      const localLength = parts[0].length;
      const domainParts = parts[1].split('.');

      return `${faker.string.alphanumeric(localLength)}@${
        faker.string.alpha(domainParts[0].length)
      }.${domainParts[domainParts.length - 1]}`;
    }

    return faker.internet.email();
  }

  /**
   * Anonymize phone numbers
   */
  private anonymizePhone(phone: string, config: AnonymizationConfig): string {
    if (config.preserveFormat) {
      return phone.replace(/\d/g, () =>
        faker.number.int({ min: 0, max: 9 }).toString()
      );
    }

    return faker.phone.number();
  }

  /**
   * Anonymize addresses
   */
  private anonymizeAddress(address: any, config: AnonymizationConfig): any {
    if (typeof address === 'string') {
      return faker.location.streetAddress(true);
    }

    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: address.country || faker.location.country()
    };
  }

  /**
   * Anonymize IDs (SSN, Tax ID, etc.)
   */
  private anonymizeId(id: string, config: AnonymizationConfig): string {
    if (config.preserveFormat) {
      return id.replace(/[0-9]/g, () =>
        faker.number.int({ min: 0, max: 9 }).toString()
      ).replace(/[A-Z]/g, () =>
        faker.string.alpha({ length: 1, casing: 'upper' })
      );
    }

    return faker.string.alphanumeric(id.length);
  }

  /**
   * Export anonymized data for testing
   */
  async exportAnonymizedDataset(
    source: any[],
    config: AnonymizationConfig = {}
  ): Promise<any[]> {
    return source.map(item => this.anonymize(item, config));
  }
}
```

### 2. Production Data Cloner

```typescript
// NEW/shared/testing/anonymization/production-cloner.ts
import { Injectable, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { AnonymizerService } from './anonymizer.service';

@Injectable()
export class ProductionDataCloner {
  private readonly logger = new Logger(ProductionDataCloner.name);

  constructor(
    private anonymizer: AnonymizerService
  ) {}

  /**
   * Clone and anonymize production data for testing
   */
  async cloneForTesting(
    sourceUri: string,
    targetUri: string,
    options: {
      databases?: string[];
      collections?: string[];
      limit?: number;
      anonymize?: boolean;
    } = {}
  ): Promise<void> {
    const sourceClient = new MongoClient(sourceUri);
    const targetClient = new MongoClient(targetUri);

    try {
      await sourceClient.connect();
      await targetClient.connect();

      const databases = options.databases ||
        (await sourceClient.db().admin().listDatabases())
          .databases.map(db => db.name);

      for (const dbName of databases) {
        if (this.isSystemDatabase(dbName)) continue;

        this.logger.log(`Cloning database: ${dbName}`);

        const sourceDb = sourceClient.db(dbName);
        const targetDb = targetClient.db(dbName);

        const collections = options.collections ||
          (await sourceDb.listCollections().toArray())
            .map(col => col.name);

        for (const colName of collections) {
          await this.cloneCollection(
            sourceDb.collection(colName),
            targetDb.collection(colName),
            options
          );
        }
      }

      this.logger.log('Cloning completed successfully');

    } finally {
      await sourceClient.close();
      await targetClient.close();
    }
  }

  private async cloneCollection(
    source: any,
    target: any,
    options: any
  ): Promise<void> {
    const query = {};
    const cursor = options.limit
      ? source.find(query).limit(options.limit)
      : source.find(query);

    const documents = await cursor.toArray();

    if (documents.length === 0) return;

    const processed = options.anonymize
      ? documents.map(doc => this.anonymizer.anonymize(doc, {
          deterministic: true,
          preserveFormat: true
        }))
      : documents;

    await target.insertMany(processed);

    this.logger.log(
      `Cloned ${processed.length} documents to ${target.collectionName}`
    );
  }

  private isSystemDatabase(name: string): boolean {
    return ['admin', 'local', 'config'].includes(name);
  }
}
```

## Test Data API

### 1. Test Data Controller

```typescript
// NEW/shared/testing/api/test-data.controller.ts
import { Controller, Post, Body, Delete, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TestEnvironmentGuard } from '../guards/test-environment.guard';
import { SeedManager, SeedOptions } from '../seeds/seed-manager';
import { ScenarioBuilder } from '../builders/scenario.builder';
import { AnonymizerService } from '../anonymization/anonymizer.service';

@ApiTags('Test Data')
@Controller('api/test-data')
@UseGuards(TestEnvironmentGuard) // Only available in test/local environments
export class TestDataController {
  constructor(
    private seedManager: SeedManager,
    private anonymizer: AnonymizerService
  ) {}

  @Post('seed')
  @ApiOperation({ summary: 'Seed test data' })
  async seed(@Body() options: SeedOptions): Promise<any> {
    await this.seedManager.seed(options);
    return { success: true, message: 'Data seeded successfully' };
  }

  @Delete('clean')
  @ApiOperation({ summary: 'Clean test data' })
  async clean(@Query('services') services?: string): Promise<any> {
    const serviceList = services ? services.split(',') : [];
    await this.seedManager.clean(serviceList);
    return { success: true, message: 'Data cleaned successfully' };
  }

  @Post('scenario')
  @ApiOperation({ summary: 'Create a test scenario' })
  async createScenario(@Body() config: any): Promise<any> {
    const builder = ScenarioBuilder.create();

    if (config.organization) {
      builder.withOrganization(config.organization);
    }

    if (config.users) {
      builder.withUsers(config.users.count, config.users.roles);
    }

    if (config.projects) {
      builder.withProjects(config.projects);
    }

    if (config.hierarchy) {
      builder.withComplexHierarchy(config.hierarchy.depth);
    }

    if (config.activities) {
      builder.withActivities(
        config.activities.perNode,
        config.activities.months
      );
    }

    const scenario = await builder.buildAndPersist();

    return {
      success: true,
      scenario: this.anonymizer.anonymize(scenario, {
        deterministic: true,
        preserveFormat: true
      })
    };
  }

  @Get('factories')
  @ApiOperation({ summary: 'List available factories' })
  getFactories(): any {
    return {
      factories: [
        'UserFactory',
        'OrganizationFactory',
        'ProjectFactory',
        'HierarchyFactory',
        'ActivityFactory',
        'EmissionFactorFactory',
        'ReportFactory'
      ]
    };
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate test data using factory' })
  async generate(
    @Body() config: { factory: string; count: number; overrides?: any }
  ): Promise<any> {
    // Dynamic factory execution based on config
    // Implementation would map factory names to actual factory instances

    return {
      success: true,
      generated: config.count,
      factory: config.factory
    };
  }
}
```

## Performance Testing Data

### 1. Load Test Data Generator

```typescript
// NEW/shared/testing/performance/load-test-generator.ts
import { Injectable, Logger } from '@nestjs/common';
import { activityFactory } from '@/activity-service/test/factories/activity.factory';

export interface LoadTestConfig {
  users: number;
  organizations: number;
  projectsPerOrg: number;
  activitiesPerProject: number;
  emissionFactors: number;
  duration: number; // seconds
  rampUp: number; // seconds
}

@Injectable()
export class LoadTestDataGenerator {
  private readonly logger = new Logger(LoadTestDataGenerator.name);

  /**
   * Generate data for load testing
   */
  async generateLoadTestData(config: LoadTestConfig): Promise<any> {
    this.logger.log('Generating load test data...');

    const data = {
      users: [],
      organizations: [],
      projects: [],
      activities: [],
      emissionFactors: []
    };

    // Generate in batches to avoid memory issues
    const batchSize = 1000;

    // Users
    for (let i = 0; i < config.users; i += batchSize) {
      const batch = Math.min(batchSize, config.users - i);
      const users = userFactory.createMany(batch);
      data.users.push(...users);

      if (i % 10000 === 0) {
        this.logger.log(`Generated ${i} users...`);
      }
    }

    // Organizations with projects
    for (let i = 0; i < config.organizations; i++) {
      const org = organizationFactory.create();
      data.organizations.push(org);

      for (let j = 0; j < config.projectsPerOrg; j++) {
        const project = projectFactory.create({ organizationId: org.id });
        data.projects.push(project);

        // Activities for each project
        const activities = activityFactory.createMany(
          config.activitiesPerProject,
          { projectId: project.id }
        );
        data.activities.push(...activities);
      }

      if (i % 100 === 0) {
        this.logger.log(`Generated ${i} organizations...`);
      }
    }

    // Emission factors
    data.emissionFactors = emissionFactorFactory.createMany(config.emissionFactors);

    this.logger.log('Load test data generation completed');

    return {
      summary: {
        users: data.users.length,
        organizations: data.organizations.length,
        projects: data.projects.length,
        activities: data.activities.length,
        emissionFactors: data.emissionFactors.length
      },
      data: process.env.RETURN_DATA === 'true' ? data : undefined
    };
  }

  /**
   * Generate CSV data for load testing tools
   */
  async generateCSV(config: LoadTestConfig): Promise<string> {
    const users = userFactory.createMany(config.users);

    const csv = [
      'email,password,organizationId,role',
      ...users.map(u =>
        `${u.email},Test123!,${u.organizationId || ''},${u.role}`
      )
    ].join('\n');

    return csv;
  }

  /**
   * Generate JMeter test data
   */
  async generateJMeterData(config: LoadTestConfig): Promise<any> {
    return {
      threads: config.users,
      rampUp: config.rampUp,
      duration: config.duration,
      testData: await this.generateCSV(config),
      endpoints: [
        { path: '/api/v1/auth/login', method: 'POST', weight: 20 },
        { path: '/api/v1/activities', method: 'GET', weight: 30 },
        { path: '/api/v1/calculations/run', method: 'POST', weight: 10 },
        { path: '/api/v1/reports/generate', method: 'POST', weight: 5 },
        { path: '/api/v1/organizations', method: 'GET', weight: 35 }
      ]
    };
  }
}
```

## Data Cleanup Strategies

### 1. Test Data Cleaner

```typescript
// NEW/shared/testing/cleanup/test-data-cleaner.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MongoClient } from 'mongodb';

@Injectable()
export class TestDataCleaner {
  private readonly logger = new Logger(TestDataCleaner.name);

  constructor(
    private mongoClient: MongoClient
  ) {}

  /**
   * Clean up old test data (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanOldTestData(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return; // Never run in production
    }

    this.logger.log('Starting test data cleanup...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days old

    const databases = [
      'clenergize_identity_test',
      'clenergize_organization_test',
      'clenergize_activity_test',
      'clenergize_calculation_test'
    ];

    for (const dbName of databases) {
      const db = this.mongoClient.db(dbName);
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        const result = await db.collection(collection.name).deleteMany({
          createdAt: { $lt: cutoffDate },
          '_testData': true // Only delete marked test data
        });

        if (result.deletedCount > 0) {
          this.logger.log(
            `Deleted ${result.deletedCount} old test records from ${collection.name}`
          );
        }
      }
    }
  }

  /**
   * Mark data as test data
   */
  markAsTestData(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => ({ ...item, _testData: true }));
    }
    return { ...data, _testData: true };
  }

  /**
   * Clean specific test scenario
   */
  async cleanScenario(scenarioId: string): Promise<void> {
    const databases = await this.mongoClient.db().admin().listDatabases();

    for (const db of databases.databases) {
      if (db.name.includes('test')) {
        const database = this.mongoClient.db(db.name);
        const collections = await database.listCollections().toArray();

        for (const collection of collections) {
          await database.collection(collection.name).deleteMany({
            '_scenarioId': scenarioId
          });
        }
      }
    }

    this.logger.log(`Cleaned test scenario: ${scenarioId}`);
  }

  /**
   * Reset sequences and counters
   */
  async resetSequences(): Promise<void> {
    // Reset factory sequences
    userFactory.reset();
    organizationFactory.reset();
    projectFactory.reset();
    hierarchyFactory.reset();
    activityFactory.reset();
    emissionFactorFactory.reset();

    // Reset database sequences if any
    const db = this.mongoClient.db('clenergize_test');
    await db.collection('counters').deleteMany({});

    this.logger.log('Reset all sequences');
  }
}
```

## Implementation Checklist

- [ ] Base factory classes implemented
- [ ] Entity-specific factories created
- [ ] Builder patterns for complex objects
- [ ] Fixture files organized
- [ ] Seed manager configured
- [ ] Service-specific seeders implemented
- [ ] Anonymization service tested
- [ ] Test data API endpoints secured
- [ ] Performance test data generators ready
- [ ] Cleanup strategies automated

## Security Considerations

1. **Environment Guards**: Test data endpoints only available in non-production
2. **Data Anonymization**: All PII properly anonymized when cloning production
3. **Access Control**: Test data API requires authentication
4. **Data Isolation**: Test data clearly marked and segregated
5. **Cleanup Automation**: Old test data automatically removed

## Best Practices

1. **Deterministic Generation**: Use seeds for reproducible tests
2. **Realistic Data**: Generate data that mirrors production patterns
3. **Performance**: Use batch operations for large data sets
4. **Cleanup**: Always clean up after tests
5. **Documentation**: Document all factories and builders

This implementation provides a comprehensive test data management system that supports all testing needs from unit tests to performance testing while maintaining data security and quality.