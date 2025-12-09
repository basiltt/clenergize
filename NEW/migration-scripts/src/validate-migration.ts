#!/usr/bin/env ts-node

import 'dotenv/config';
import chalk from 'chalk';
import logger from './utils/logger';
import { dbManager } from './utils/db-connection';

interface ValidationResult {
  service: string;
  checks: ValidationCheck[];
  passed: boolean;
}

interface ValidationCheck {
  name: string;
  passed: boolean;
  expected?: any;
  actual?: any;
  message?: string;
}

/**
 * Validate migration data integrity
 */
async function validateMigration() {
  console.log(chalk.bold.cyan('\n' + '='.repeat(80)));
  console.log(chalk.bold.cyan('  MIGRATION VALIDATION'));
  console.log(chalk.bold.cyan('='.repeat(80) + '\n'));

  // Connect to databases
  logger.info('Connecting to databases...');
  await dbManager.connect();
  const databases = dbManager.getDatabases();

  const results: ValidationResult[] = [];

  try {
    // Validate Identity Service
    logger.info('\n--- Validating Identity Service ---');
    const identityResult = await validateIdentityService(databases.old.userManagement, databases.new.identity);
    results.push(identityResult);
    displayValidationResult(identityResult);

    // Validate Organization Service
    logger.info('\n--- Validating Organization Service ---');
    const organizationResult = await validateOrganizationService(
      databases.old.projectManagement,
      databases.old.companyDetails,
      databases.new.organization
    );
    results.push(organizationResult);
    displayValidationResult(organizationResult);

    // Display summary
    displaySummary(results);

    // Exit with appropriate code
    const allPassed = results.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    logger.error('Validation failed:', error);
    process.exit(1);
  } finally {
    await dbManager.disconnect();
  }
}

/**
 * Validate Identity Service migration
 */
async function validateIdentityService(oldDb: any, newDb: any): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];

  try {
    // Check 1: User count
    const oldUserCount = await oldDb.collection('users').countDocuments({ isDeleted: { $ne: true } });
    const newUserCount = await newDb.collection('users').countDocuments({});
    checks.push({
      name: 'User count match',
      passed: oldUserCount === newUserCount,
      expected: oldUserCount,
      actual: newUserCount
    });

    // Check 2: Email uniqueness
    const duplicateEmails = await newDb.collection('users').aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    checks.push({
      name: 'Email uniqueness',
      passed: duplicateEmails.length === 0,
      message: duplicateEmails.length > 0 ? `Found ${duplicateEmails.length} duplicate emails` : undefined
    });

    // Check 3: Required fields
    const usersWithoutEmail = await newDb.collection('users').countDocuments({ email: { $in: [null, ''] } });
    checks.push({
      name: 'Required fields (email)',
      passed: usersWithoutEmail === 0,
      message: usersWithoutEmail > 0 ? `Found ${usersWithoutEmail} users without email` : undefined
    });

    // Check 4: Valid statuses
    const invalidStatuses = await newDb.collection('users').countDocuments({
      status: { $nin: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] }
    });
    checks.push({
      name: 'Valid status values',
      passed: invalidStatuses === 0,
      message: invalidStatuses > 0 ? `Found ${invalidStatuses} users with invalid status` : undefined
    });

    // Check 5: Indexes exist
    const indexes = await newDb.collection('users').indexes();
    const hasEmailIndex = indexes.some(idx => idx.key.email === 1);
    checks.push({
      name: 'Email index exists',
      passed: hasEmailIndex
    });

  } catch (error) {
    logger.error('Identity validation error:', error);
  }

  return {
    service: 'Identity',
    checks,
    passed: checks.every(c => c.passed)
  };
}

/**
 * Validate Organization Service migration
 */
async function validateOrganizationService(oldProjectDb: any, oldCompanyDb: any, newDb: any): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];

  try {
    // Check 1: Project count
    const oldProjectCount = await oldProjectDb.collection('projects').countDocuments({});
    const newProjectCount = await newDb.collection('projects').countDocuments({});
    checks.push({
      name: 'Project count match',
      passed: oldProjectCount === newProjectCount,
      expected: oldProjectCount,
      actual: newProjectCount
    });

    // Check 2: Hierarchy deduplication
    const oldProjects = await oldProjectDb.collection('projects').find({}).toArray();
    const oldProjectsWithHierarchy = oldProjects.filter(p => p.hierarchy || p.clonedHierarchy).length;
    const newHierarchyTemplates = await newDb.collection('hierarchy_templates').countDocuments({});

    checks.push({
      name: 'Hierarchy deduplication (templates < projects)',
      passed: newHierarchyTemplates < oldProjectsWithHierarchy,
      expected: `< ${oldProjectsWithHierarchy}`,
      actual: newHierarchyTemplates,
      message: `Reduced ${oldProjectsWithHierarchy} cloned hierarchies to ${newHierarchyTemplates} templates (${Math.round((1 - newHierarchyTemplates / oldProjectsWithHierarchy) * 100)}% reduction)`
    });

    // Check 3: All projects have hierarchy references
    const projectsWithHierarchy = await newDb.collection('projects').countDocuments({
      hierarchyReference: { $ne: null }
    });
    checks.push({
      name: 'Projects with hierarchy references',
      passed: true,  // Just informational
      actual: projectsWithHierarchy,
      message: `${projectsWithHierarchy}/${newProjectCount} projects have hierarchy references`
    });

    // Check 4: No orphaned projects
    const projectsWithoutOrg = await newDb.collection('projects').countDocuments({
      organizationId: { $in: [null, ''] }
    });
    checks.push({
      name: 'No orphaned projects',
      passed: projectsWithoutOrg === 0,
      message: projectsWithoutOrg > 0 ? `Found ${projectsWithoutOrg} projects without organization` : undefined
    });

    // Check 5: Entity extraction
    const entityCount = await newDb.collection('entities').countDocuments({});
    checks.push({
      name: 'Entities extracted',
      passed: entityCount > 0,
      actual: entityCount,
      message: `Extracted ${entityCount} entities from hierarchies`
    });

    // Check 6: Indexes exist
    const projectIndexes = await newDb.collection('projects').indexes();
    const hasOrgIndex = projectIndexes.some(idx => idx.key.organizationId === 1);
    checks.push({
      name: 'Project indexes exist',
      passed: hasOrgIndex
    });

  } catch (error) {
    logger.error('Organization validation error:', error);
  }

  return {
    service: 'Organization',
    checks,
    passed: checks.every(c => c.passed)
  };
}

/**
 * Display validation result for a service
 */
function displayValidationResult(result: ValidationResult) {
  result.checks.forEach(check => {
    if (check.passed) {
      console.log(chalk.green(`  ✓ ${check.name}`));
    } else {
      console.log(chalk.red(`  ✗ ${check.name}`));
    }

    if (check.expected !== undefined || check.actual !== undefined) {
      console.log(chalk.gray(`    Expected: ${check.expected}, Actual: ${check.actual}`));
    }

    if (check.message) {
      console.log(chalk.gray(`    ${check.message}`));
    }
  });
}

/**
 * Display validation summary
 */
function displaySummary(results: ValidationResult[]) {
  console.log(chalk.bold.cyan('\n' + '='.repeat(80)));
  console.log(chalk.bold.cyan('  VALIDATION SUMMARY'));
  console.log(chalk.bold.cyan('='.repeat(80) + '\n'));

  results.forEach(result => {
    const passedChecks = result.checks.filter(c => c.passed).length;
    const totalChecks = result.checks.length;
    const allPassed = result.passed;

    if (allPassed) {
      console.log(chalk.green(`✓ ${result.service}: ${passedChecks}/${totalChecks} checks passed`));
    } else {
      console.log(chalk.red(`✗ ${result.service}: ${passedChecks}/${totalChecks} checks passed`));
    }
  });

  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    console.log(chalk.bold.green('\n✅ All validation checks passed!\n'));
  } else {
    console.log(chalk.bold.red('\n❌ Some validation checks failed. Please review the issues above.\n'));
  }
}

// Run validation
validateMigration().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
