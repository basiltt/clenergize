import { faker } from '@faker-js/faker';

export interface TestProject {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  ownerId: string;
  hierarchyTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectFactory {
  static create(overrides?: Partial<TestProject>): TestProject {
    const startDate = faker.date.past({ years: 1 });
    const endDate = faker.date.future({ years: 1, refDate: startDate });

    return {
      id: faker.string.uuid(),
      companyId: faker.string.uuid(),
      name: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      startDate,
      endDate,
      status: 'ACTIVE',
      ownerId: faker.string.uuid(),
      hierarchyTemplateId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<TestProject>): TestProject[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createDraft(overrides?: Partial<TestProject>): TestProject {
    return this.create({
      ...overrides,
      status: 'DRAFT',
    });
  }

  static createCompleted(overrides?: Partial<TestProject>): TestProject {
    return this.create({
      ...overrides,
      status: 'COMPLETED',
      endDate: faker.date.past({ years: 1 }),
    });
  }

  static createArchived(overrides?: Partial<TestProject>): TestProject {
    return this.create({
      ...overrides,
      status: 'ARCHIVED',
    });
  }
}
