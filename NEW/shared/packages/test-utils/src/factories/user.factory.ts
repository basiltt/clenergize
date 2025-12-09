import { faker } from '@faker-js/faker';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles: string[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

export class UserFactory {
  static create(overrides?: Partial<TestUser>): TestUser {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email().toLowerCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password({ length: 12 }),
      roles: ['USER'],
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<TestUser>): TestUser[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides?: Partial<TestUser>): TestUser {
    return this.create({
      ...overrides,
      roles: ['ADMIN'],
    });
  }

  static createSuperAdmin(overrides?: Partial<TestUser>): TestUser {
    return this.create({
      ...overrides,
      roles: ['SUPER_ADMIN'],
    });
  }

  static createSuspended(overrides?: Partial<TestUser>): TestUser {
    return this.create({
      ...overrides,
      status: 'SUSPENDED',
    });
  }
}
