import { Db } from 'mongodb';
import ProgressBar from 'progress';
import logger, { logMigrationStart, logMigrationComplete, logMigrationError } from '../utils/logger';
import {
  transformIdToUUID,
  transformDate,
  transformStatus,
  sanitizeString,
  transformClonedHierarchyToReference,
  deduplicateByKey,
  chunkArray,
  retryWithBackoff
} from '../utils/transformers';

export interface OrganizationMigrationStats {
  organizationsProcessed: number;
  organizationsCreated: number;
  projectsProcessed: number;
  projectsCreated: number;
  entitiesProcessed: number;
  entitiesCreated: number;
  hierarchiesDedu plicated: number;
  hierarchyTemplatesCreated: number;
  duration: number;
}

/**
 * Migrate organizations, projects, and hierarchies from OLD to NEW
 *
 * CRITICAL: This migration converts cloned hierarchies to hierarchy templates + references
 */
export async function migrateOrganizationService(
  oldProjectDb: Db,
  oldCompanyDb: Db,
  newDb: Db,
  dryRun: boolean = false
): Promise<OrganizationMigrationStats> {
  const serviceName = 'Organization Service';
  logMigrationStart(serviceName);

  const startTime = Date.now();
  const stats: OrganizationMigrationStats = {
    organizationsProcessed: 0,
    organizationsCreated: 0,
    projectsProcessed: 0,
    projectsCreated: 0,
    entitiesProcessed: 0,
    entitiesCreated: 0,
    hierarchiesDeduplicated: 0,
    hierarchyTemplatesCreated: 0,
    duration: 0
  };

  try {
    // STEP 1: Migrate Organizations
    logger.info('\n--- Step 1: Migrating Organizations ---');
    const orgStats = await migrateOrganizations(oldCompanyDb, newDb, dryRun);
    stats.organizationsProcessed = orgStats.processed;
    stats.organizationsCreated = orgStats.created;

    // STEP 2: Extract and deduplicate hierarchies
    logger.info('\n--- Step 2: Extracting and Deduplicating Hierarchies ---');
    const hierarchyTemplates = await extractAndDeduplicateHierarchies(oldProjectDb);
    stats.hierarchiesDeduplicated = hierarchyTemplates.length;
    logger.info(`Deduplicated ${stats.hierarchiesDeduplicated} unique hierarchy templates`);

    // STEP 3: Migrate hierarchy templates
    if (!dryRun && hierarchyTemplates.length > 0) {
      logger.info('\n--- Step 3: Migrating Hierarchy Templates ---');
      await migrateHierarchyTemplates(newDb, hierarchyTemplates);
      stats.hierarchyTemplatesCreated = hierarchyTemplates.length;
    }

    // STEP 4: Migrate Projects (with hierarchy references)
    logger.info('\n--- Step 4: Migrating Projects ---');
    const projectStats = await migrateProjects(oldProjectDb, newDb, hierarchyTemplates, dryRun);
    stats.projectsProcessed = projectStats.processed;
    stats.projectsCreated = projectStats.created;

    // STEP 5: Migrate Entities (from denormalized project hierarchies)
    logger.info('\n--- Step 5: Migrating Entities ---');
    const entityStats = await migrateEntities(oldProjectDb, newDb, dryRun);
    stats.entitiesProcessed = entityStats.processed;
    stats.entitiesCreated = entityStats.created;

    // STEP 6: Create indexes
    if (!dryRun) {
      logger.info('\n--- Step 6: Creating Indexes ---');
      await createIndexes(newDb);
      logger.info('✓ Indexes created');
    }

    // STEP 7: Verify data integrity
    if (!dryRun) {
      logger.info('\n--- Step 7: Verifying Data Integrity ---');
      const verificationResult = await verifyMigration(oldProjectDb, newDb);
      if (!verificationResult.success) {
        logger.warn('Data integrity verification found issues:', verificationResult.errors);
      } else {
        logger.info('✓ Data integrity verified');
      }
    }

    stats.duration = Date.now() - startTime;
    logMigrationComplete(serviceName, stats);
    return stats;

  } catch (error) {
    logMigrationError(serviceName, error as Error);
    throw error;
  }
}

/**
 * Migrate organizations
 */
async function migrateOrganizations(
  oldCompanyDb: Db,
  newDb: Db,
  dryRun: boolean
): Promise<{ processed: number; created: number }> {
  const oldOrgs = await oldCompanyDb.collection('companies').find({}).toArray();
  logger.info(`Found ${oldOrgs.length} organizations to migrate`);

  const transformedOrgs = oldOrgs.map(transformOrganization).filter(org => org !== null);

  if (!dryRun && transformedOrgs.length > 0) {
    const batches = chunkArray(transformedOrgs, 100);
    let created = 0;

    for (const batch of batches) {
      try {
        await retryWithBackoff(async () => {
          await newDb.collection('organizations').insertMany(batch, { ordered: false });
        });
        created += batch.length;
      } catch (error: any) {
        if (error.code === 11000) {
          const duplicates = error.writeErrors?.length || 0;
          created += (batch.length - duplicates);
        }
      }
    }

    logger.info(`✓ Created ${created} organizations`);
    return { processed: oldOrgs.length, created };
  }

  return { processed: oldOrgs.length, created: transformedOrgs.length };
}

/**
 * Transform OLD organization to NEW organization
 */
function transformOrganization(oldOrg: any): any | null {
  try {
    return {
      _id: transformIdToUUID(oldOrg._id),
      name: sanitizeString(oldOrg.name || oldOrg.companyName),
      slug: (oldOrg.name || oldOrg.companyName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),

      settings: {
        industry: oldOrg.industry || 'Other',
        companySize: oldOrg.employeeCount ? getCompanySizeCategory(oldOrg.employeeCount) : 'SMALL',
        fiscalYearStart: oldOrg.fiscalYearStart || 1,  // January
        defaultCurrency: oldOrg.currency || 'USD',
        defaultLanguage: oldOrg.language || 'en',
        timezone: oldOrg.timezone || 'UTC'
      },

      contact: {
        email: oldOrg.contactEmail || oldOrg.email || '',
        phone: oldOrg.phone || oldOrg.contactPhone || null,
        website: oldOrg.website || null,
        address: {
          street: oldOrg.address?.street || '',
          city: oldOrg.address?.city || '',
          state: oldOrg.address?.state || '',
          country: oldOrg.address?.country || '',
          postalCode: oldOrg.address?.postalCode || oldOrg.address?.zipCode || ''
        }
      },

      subscription: {
        plan: oldOrg.subscriptionPlan || 'FREE',
        status: oldOrg.subscriptionStatus || 'ACTIVE',
        startDate: transformDate(oldOrg.subscriptionStartDate || oldOrg.createdAt),
        endDate: oldOrg.subscriptionEndDate ? transformDate(oldOrg.subscriptionEndDate) : null,
        trialEndsAt: oldOrg.trialEndsAt ? transformDate(oldOrg.trialEndsAt) : null
      },

      status: transformStatus(oldOrg.status || 'active'),
      createdAt: transformDate(oldOrg.createdAt),
      updatedAt: transformDate(oldOrg.updatedAt || oldOrg.createdAt),

      _migration: {
        sourceId: oldOrg._id.toString(),
        migratedAt: new Date().toISOString(),
        sourceSystem: 'company-details-v2'
      }
    };
  } catch (error) {
    logger.error(`Failed to transform organization ${oldOrg._id}:`, error);
    return null;
  }
}

/**
 * Extract all hierarchies from projects and deduplicate
 *
 * This is the CRITICAL deduplication step that eliminates cloned hierarchies
 */
async function extractAndDeduplicateHierarchies(oldProjectDb: Db): Promise<any[]> {
  const projects = await oldProjectDb.collection('projects').find({}).toArray();

  // Extract all hierarchies
  const allHierarchies = projects
    .filter(p => p.hierarchy || p.clonedHierarchy)
    .map(p => p.hierarchy || p.clonedHierarchy);

  logger.info(`Extracted ${allHierarchies.length} hierarchies from ${projects.length} projects`);

  // Deduplicate by structure hash
  const uniqueHierarchies = deduplicateByKey(allHierarchies, (hierarchy) => {
    return transformClonedHierarchyToReference(hierarchy, 'temp').hierarchyId;
  });

  logger.info(`Deduplicated to ${uniqueHierarchies.length} unique hierarchies (${allHierarchies.length - uniqueHierarchies.length} duplicates removed)`);

  // Transform to hierarchy templates
  return uniqueHierarchies.map((hierarchy, index) => ({
    _id: transformClonedHierarchyToReference(hierarchy, 'temp').hierarchyId,
    name: hierarchy.name || `Hierarchy Template ${index + 1}`,
    description: hierarchy.description || 'Migrated from OLD system',
    version: hierarchy.version || 1,
    structure: hierarchy.structure || hierarchy.nodes || [],
    metadata: {
      isSystem: false,
      isTemplate: true,
      usageCount: 0,  // Will be updated later
      createdFrom: 'migration'
    },
    createdAt: transformDate(hierarchy.createdAt),
    updatedAt: transformDate(hierarchy.updatedAt || hierarchy.createdAt)
  }));
}

/**
 * Migrate hierarchy templates
 */
async function migrateHierarchyTemplates(newDb: Db, templates: any[]): Promise<void> {
  if (templates.length === 0) return;

  const batches = chunkArray(templates, 100);
  let created = 0;

  const progressBar = new ProgressBar('  [:bar] :percent :current/:total templates', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: templates.length
  });

  for (const batch of batches) {
    try {
      await retryWithBackoff(async () => {
        await newDb.collection('hierarchy_templates').insertMany(batch, { ordered: false });
      });
      created += batch.length;
      progressBar.tick(batch.length);
    } catch (error: any) {
      if (error.code === 11000) {
        const duplicates = error.writeErrors?.length || 0;
        created += (batch.length - duplicates);
        progressBar.tick(batch.length);
      }
    }
  }

  logger.info(`\n✓ Created ${created} hierarchy templates`);
}

/**
 * Migrate projects with hierarchy references
 */
async function migrateProjects(
  oldProjectDb: Db,
  newDb: Db,
  hierarchyTemplates: any[],
  dryRun: boolean
): Promise<{ processed: number; created: number }> {
  const oldProjects = await oldProjectDb.collection('projects').find({}).toArray();
  logger.info(`Found ${oldProjects.length} projects to migrate`);

  // Create hierarchy lookup map
  const hierarchyMap = new Map(
    hierarchyTemplates.map(t => [t._id, t])
  );

  const transformedProjects = oldProjects.map(p => transformProject(p, hierarchyMap)).filter(p => p !== null);

  if (!dryRun && transformedProjects.length > 0) {
    const batches = chunkArray(transformedProjects, 100);
    let created = 0;

    const progressBar = new ProgressBar('  [:bar] :percent :current/:total projects', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: transformedProjects.length
    });

    for (const batch of batches) {
      try {
        await retryWithBackoff(async () => {
          await newDb.collection('projects').insertMany(batch, { ordered: false });
        });
        created += batch.length;
        progressBar.tick(batch.length);
      } catch (error: any) {
        if (error.code === 11000) {
          const duplicates = error.writeErrors?.length || 0;
          created += (batch.length - duplicates);
          progressBar.tick(batch.length);
        }
      }
    }

    logger.info(`\n✓ Created ${created} projects`);
    return { processed: oldProjects.length, created };
  }

  return { processed: oldProjects.length, created: transformedProjects.length };
}

/**
 * Transform OLD project to NEW project
 *
 * CRITICAL: Replace cloned hierarchy with hierarchy reference
 */
function transformProject(oldProject: any, hierarchyMap: Map<string, any>): any | null {
  try {
    const hierarchy = oldProject.hierarchy || oldProject.clonedHierarchy;
    const hierarchyRef = hierarchy ? transformClonedHierarchyToReference(hierarchy, oldProject._id.toString()) : null;

    return {
      _id: transformIdToUUID(oldProject._id),
      name: sanitizeString(oldProject.name || oldProject.projectName),
      organizationId: transformIdToUUID(oldProject.organizationId || oldProject.companyId),

      // CRITICAL: Hierarchy reference instead of cloned hierarchy
      hierarchyReference: hierarchyRef ? {
        templateId: hierarchyRef.hierarchyId,
        version: hierarchyRef.version,
        snapshotDate: hierarchyRef.snapshotDate,
        customizations: oldProject.hierarchyCustomizations || null
      } : null,

      reportingYears: oldProject.reportingYears || oldProject.years || [],

      settings: {
        dataCollectionDeadline: oldProject.deadline || null,
        emissionFactorVersion: oldProject.emissionFactorVersion || 'latest',
        calculationMethod: oldProject.calculationMethod || 'GHG_PROTOCOL',
        includeScope1: oldProject.includeScope1 !== false,
        includeScope2: oldProject.includeScope2 !== false,
        includeScope3: oldProject.includeScope3 === true
      },

      status: transformStatus(oldProject.status || 'active'),
      createdAt: transformDate(oldProject.createdAt),
      updatedAt: transformDate(oldProject.updatedAt || oldProject.createdAt),

      _migration: {
        sourceId: oldProject._id.toString(),
        hadClonedHierarchy: !!hierarchy,
        hierarchyDeduplicated: !!hierarchyRef,
        migratedAt: new Date().toISOString(),
        sourceSystem: 'project-management-v2'
      }
    };
  } catch (error) {
    logger.error(`Failed to transform project ${oldProject._id}:`, error);
    return null;
  }
}

/**
 * Migrate entities from denormalized project hierarchies
 */
async function migrateEntities(
  oldProjectDb: Db,
  newDb: Db,
  dryRun: boolean
): Promise<{ processed: number; created: number }> {
  const projects = await oldProjectDb.collection('projects').find({}).toArray();

  // Extract all entities from hierarchies
  const allEntities: any[] = [];
  projects.forEach(project => {
    const hierarchy = project.hierarchy || project.clonedHierarchy;
    if (hierarchy && hierarchy.structure) {
      extractEntitiesFromHierarchy(hierarchy.structure, project._id, allEntities);
    }
  });

  logger.info(`Extracted ${allEntities.length} entities from project hierarchies`);

  // Deduplicate entities by ID
  const uniqueEntities = deduplicateByKey(allEntities, entity => entity._id);
  logger.info(`Deduplicated to ${uniqueEntities.length} unique entities`);

  if (!dryRun && uniqueEntities.length > 0) {
    const batches = chunkArray(uniqueEntities, 100);
    let created = 0;

    for (const batch of batches) {
      try {
        await retryWithBackoff(async () => {
          await newDb.collection('entities').insertMany(batch, { ordered: false });
        });
        created += batch.length;
      } catch (error: any) {
        if (error.code === 11000) {
          const duplicates = error.writeErrors?.length || 0;
          created += (batch.length - duplicates);
        }
      }
    }

    logger.info(`✓ Created ${created} entities`);
    return { processed: allEntities.length, created };
  }

  return { processed: allEntities.length, created: uniqueEntities.length };
}

/**
 * Recursively extract entities from hierarchy structure
 */
function extractEntitiesFromHierarchy(nodes: any[], projectId: any, entities: any[]): void {
  if (!Array.isArray(nodes)) return;

  nodes.forEach(node => {
    if (node.type === 'entity' || node.entityType) {
      entities.push({
        _id: transformIdToUUID(node.id || node._id),
        name: sanitizeString(node.name),
        type: node.entityType || node.type || 'Entity',
        projectId: transformIdToUUID(projectId),
        parentId: node.parentId ? transformIdToUUID(node.parentId) : null,
        metadata: node.metadata || {},
        status: transformStatus(node.status || 'active'),
        createdAt: transformDate(node.createdAt || new Date()),
        updatedAt: transformDate(node.updatedAt || node.createdAt || new Date())
      });
    }

    // Recursively process children
    if (node.children && Array.isArray(node.children)) {
      extractEntitiesFromHierarchy(node.children, projectId, entities);
    }
  });
}

/**
 * Helper: Get company size category
 */
function getCompanySizeCategory(employeeCount: number): string {
  if (employeeCount < 50) return 'SMALL';
  if (employeeCount < 250) return 'MEDIUM';
  return 'LARGE';
}

/**
 * Create indexes
 */
async function createIndexes(newDb: Db): Promise<void> {
  await Promise.all([
    // Organizations
    newDb.collection('organizations').createIndex({ slug: 1 }, { unique: true }),
    newDb.collection('organizations').createIndex({ status: 1 }),
    newDb.collection('organizations').createIndex({ 'subscription.status': 1 }),

    // Projects
    newDb.collection('projects').createIndex({ organizationId: 1 }),
    newDb.collection('projects').createIndex({ 'hierarchyReference.templateId': 1 }),
    newDb.collection('projects').createIndex({ status: 1 }),
    newDb.collection('projects').createIndex({ organizationId: 1, status: 1 }),

    // Hierarchy Templates
    newDb.collection('hierarchy_templates').createIndex({ 'metadata.isTemplate': 1 }),
    newDb.collection('hierarchy_templates').createIndex({ version: 1 }),

    // Entities
    newDb.collection('entities').createIndex({ projectId: 1 }),
    newDb.collection('entities').createIndex({ parentId: 1 }),
    newDb.collection('entities').createIndex({ projectId: 1, type: 1 }),
    newDb.collection('entities').createIndex({ projectId: 1, parentId: 1 })
  ]);
}

/**
 * Verify migration
 */
async function verifyMigration(oldDb: Db, newDb: Db): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check project counts
  const oldProjectCount = await oldDb.collection('projects').countDocuments({});
  const newProjectCount = await newDb.collection('projects').countDocuments({});
  if (oldProjectCount !== newProjectCount) {
    errors.push(`Project count mismatch: OLD=${oldProjectCount}, NEW=${newProjectCount}`);
  }

  // Check for projects without hierarchy reference
  const projectsWithoutHierarchy = await newDb.collection('projects').countDocuments({
    hierarchyReference: null
  });
  if (projectsWithoutHierarchy > 0) {
    logger.warn(`${projectsWithoutHierarchy} projects have no hierarchy reference (may be intentional)`);
  }

  return { success: errors.length === 0, errors };
}

export default migrateOrganizationService;
