import { faker } from '@faker-js/faker';

export interface TestActivity {
  id: string;
  projectId: string;
  hierarchyNodeId: string;
  activityType: string;
  scope: 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3';
  category: string;
  quantity: number;
  unit: string;
  activityDate: Date;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ActivityFactory {
  private static readonly ACTIVITY_TYPES = [
    'ELECTRICITY',
    'NATURAL_GAS',
    'FUEL_COMBUSTION',
    'BUSINESS_TRAVEL',
    'EMPLOYEE_COMMUTE',
    'WASTE',
    'WATER',
  ];

  private static readonly CATEGORIES = [
    'STATIONARY_COMBUSTION',
    'MOBILE_COMBUSTION',
    'PURCHASED_ELECTRICITY',
    'PURCHASED_HEAT',
    'UPSTREAM_TRANSPORTATION',
    'BUSINESS_TRAVEL',
    'WASTE_DISPOSAL',
  ];

  private static readonly UNITS = ['kWh', 'm3', 'kg', 'litres', 'miles', 'km', 'tonnes'];

  static create(overrides?: Partial<TestActivity>): TestActivity {
    return {
      id: faker.string.uuid(),
      projectId: faker.string.uuid(),
      hierarchyNodeId: faker.string.uuid(),
      activityType: faker.helpers.arrayElement(this.ACTIVITY_TYPES),
      scope: faker.helpers.arrayElement(['SCOPE_1', 'SCOPE_2', 'SCOPE_3'] as const),
      category: faker.helpers.arrayElement(this.CATEGORIES),
      quantity: faker.number.float({ min: 1, max: 10000, multipleOf: 0.01 }),
      unit: faker.helpers.arrayElement(this.UNITS),
      activityDate: faker.date.past({ years: 1 }),
      metadata: {
        source: faker.helpers.arrayElement(['MANUAL', 'UPLOAD', 'API']),
        confidence: faker.helpers.arrayElement(['HIGH', 'MEDIUM', 'LOW']),
      },
      createdBy: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<TestActivity>): TestActivity[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createScope1(overrides?: Partial<TestActivity>): TestActivity {
    return this.create({
      ...overrides,
      scope: 'SCOPE_1',
      activityType: faker.helpers.arrayElement(['NATURAL_GAS', 'FUEL_COMBUSTION']),
      category: 'STATIONARY_COMBUSTION',
    });
  }

  static createScope2(overrides?: Partial<TestActivity>): TestActivity {
    return this.create({
      ...overrides,
      scope: 'SCOPE_2',
      activityType: 'ELECTRICITY',
      category: 'PURCHASED_ELECTRICITY',
      unit: 'kWh',
    });
  }

  static createScope3(overrides?: Partial<TestActivity>): TestActivity {
    return this.create({
      ...overrides,
      scope: 'SCOPE_3',
      activityType: faker.helpers.arrayElement(['BUSINESS_TRAVEL', 'EMPLOYEE_COMMUTE']),
      category: 'BUSINESS_TRAVEL',
    });
  }
}
