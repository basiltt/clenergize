# Neo4j Graph Database Model for ESG Relationships

## Overview

This document defines the Neo4j graph database schema for modeling complex relationships in the Clenergize V3 ESG platform. Neo4j is used to represent organizational hierarchies, supply chain networks, stakeholder relationships, and ESG impact dependencies that are difficult to model in traditional relational or document databases.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              NEO4J ESG GRAPH ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Core Graph Domains:                                        │
│  • Organizational Structure (companies, divisions, sites)   │
│  • Supply Chain Network (suppliers, materials, products)    │
│  • Stakeholder Ecosystem (investors, communities, NGOs)     │
│  • ESG Dependencies (impacts, risks, opportunities)         │
│  • Regulatory Relationships (standards, compliance)         │
│                                                             │
│  Node Types:                                                │
│  • Entities (Organization, Facility, Project, User)         │
│  • ESG Elements (Emission, Target, Initiative, Risk)        │
│  • Supply Chain (Supplier, Material, Product, Location)     │
│  • Governance (Policy, Control, Audit, Stakeholder)         │
│                                                             │
│  Relationship Types:                                        │
│  • Structural (OWNS, PART_OF, MANAGES, LOCATED_IN)         │
│  • Operational (SUPPLIES, PRODUCES, CONSUMES, EMITS)       │
│  • Compliance (COMPLIES_WITH, CERTIFIED_BY, AUDITED_BY)    │
│  • Impact (IMPACTS, INFLUENCES, DEPENDS_ON, MITIGATES)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Core Node Types

### 1. Organizational Nodes

#### Organization Node
```cypher
// Organization (Company/Entity)
(:Organization {
  id: 'org-uuid-v4',
  name: 'Clenergize Corporation',
  type: 'corporation|subsidiary|joint_venture|partnership',
  industry: 'manufacturing|energy|technology|retail',
  sector: 'private|public|nonprofit',
  ticker: 'CLNG',
  lei_code: 'Legal Entity Identifier',
  headquarters_country: 'US',
  founded_year: 2010,
  employee_count: 5000,
  revenue: 1000000000,
  esg_rating: 'AA',
  created_at: datetime(),
  updated_at: datetime(),
  active: true
})
```

#### Division/Business Unit Node
```cypher
(:Division {
  id: 'div-uuid-v4',
  name: 'Manufacturing Division',
  code: 'MFG-001',
  type: 'business_unit|division|department',
  cost_center: 'CC-1001',
  headcount: 500,
  budget: 50000000,
  created_at: datetime()
})
```

#### Facility Node
```cypher
(:Facility {
  id: 'fac-uuid-v4',
  name: 'Shanghai Manufacturing Plant',
  type: 'manufacturing|office|warehouse|retail|datacenter',
  address: '123 Industrial Ave',
  city: 'Shanghai',
  country: 'CN',
  latitude: 31.2304,
  longitude: 121.4737,
  size_sqft: 250000,
  year_built: 2015,
  energy_star_score: 85,
  leed_certification: 'Gold',
  operational_status: 'active|idle|decommissioned',
  created_at: datetime()
})
```

#### Project Node
```cypher
(:Project {
  id: 'proj-uuid-v4',
  name: 'Carbon Neutrality 2030',
  type: 'sustainability|compliance|improvement',
  status: 'planning|active|completed|cancelled',
  start_date: date('2024-01-01'),
  end_date: date('2030-12-31'),
  budget: 10000000,
  roi_expected: 2.5,
  carbon_reduction_target: 50000, // tCO2e
  created_at: datetime()
})
```

### 2. ESG Element Nodes

#### Emission Source Node
```cypher
(:EmissionSource {
  id: 'source-uuid-v4',
  name: 'Natural Gas Boiler #1',
  type: 'stationary_combustion|mobile|process|fugitive',
  category: 'scope1|scope2|scope3',
  fuel_type: 'natural_gas|diesel|electricity',
  capacity: 10.5,
  capacity_unit: 'MW',
  emission_factor: 53.06, // kgCO2e/MMBtu
  installation_date: date('2020-01-15'),
  retirement_date: null,
  active: true
})
```

#### ESG Target Node
```cypher
(:Target {
  id: 'target-uuid-v4',
  name: '50% Emission Reduction by 2030',
  type: 'absolute|intensity|science_based',
  metric: 'ghg_emissions|water|waste|energy',
  baseline_year: 2020,
  baseline_value: 100000, // tCO2e
  target_year: 2030,
  target_value: 50000,
  target_unit: 'tCO2e',
  sbti_approved: true,
  progress_percentage: 35.5,
  status: 'on_track|at_risk|behind|achieved',
  created_at: datetime()
})
```

#### ESG Initiative Node
```cypher
(:Initiative {
  id: 'init-uuid-v4',
  name: 'Solar Panel Installation',
  type: 'energy_efficiency|renewable|circular|social',
  description: 'Install 5MW solar capacity',
  investment: 5000000,
  payback_period_years: 7,
  annual_savings: 750000,
  carbon_reduction_annual: 3500, // tCO2e
  implementation_date: date('2024-06-01'),
  status: 'proposed|approved|in_progress|completed',
  created_at: datetime()
})
```

#### Risk Node
```cypher
(:Risk {
  id: 'risk-uuid-v4',
  name: 'Climate Transition Risk - Carbon Tax',
  type: 'physical|transition|liability|reputational',
  category: 'climate|water|biodiversity|social|governance',
  probability: 'low|medium|high|very_high',
  impact: 'negligible|minor|moderate|major|severe',
  time_horizon: 'short|medium|long', // <2y, 2-5y, >5y
  financial_impact: 10000000,
  mitigation_status: 'identified|in_progress|mitigated',
  created_at: datetime()
})
```

### 3. Supply Chain Nodes

#### Supplier Node
```cypher
(:Supplier {
  id: 'sup-uuid-v4',
  name: 'Green Materials Inc',
  type: 'tier1|tier2|tier3',
  category: 'raw_materials|components|services|logistics',
  country: 'US',
  sustainability_score: 85,
  certifications: ['ISO14001', 'SA8000', 'FSC'],
  risk_level: 'low|medium|high',
  spend_annual: 5000000,
  contract_start: date('2023-01-01'),
  contract_end: date('2025-12-31'),
  active: true
})
```

#### Material Node
```cypher
(:Material {
  id: 'mat-uuid-v4',
  name: 'Recycled Aluminum',
  type: 'raw|processed|component|packaging',
  category: 'metal|plastic|chemical|textile',
  recycled_content: 75.5, // percentage
  carbon_footprint: 2.3, // kgCO2e/kg
  water_footprint: 15.2, // liters/kg
  hazardous: false,
  conflict_mineral: false,
  certification: 'RMI_certified',
  created_at: datetime()
})
```

#### Product Node
```cypher
(:Product {
  id: 'prod-uuid-v4',
  name: 'EcoWidget 3000',
  sku: 'EW3000',
  category: 'electronics|appliance|vehicle|consumable',
  lifecycle_emissions: 125.5, // kgCO2e
  recyclability: 85, // percentage
  energy_star_certified: true,
  epeat_rating: 'Gold',
  manufacturing_location: 'CN',
  created_at: datetime()
})
```

### 4. Governance Nodes

#### Stakeholder Node
```cypher
(:Stakeholder {
  id: 'stake-uuid-v4',
  name: 'BlackRock Investment',
  type: 'investor|customer|employee|community|regulator|ngo',
  influence: 'low|medium|high|critical',
  interest: 'low|medium|high|critical',
  engagement_frequency: 'daily|weekly|monthly|quarterly|annual',
  sentiment: 'positive|neutral|negative',
  aum: 9000000000000, // Assets under management for investors
  ownership_percentage: 5.2,
  created_at: datetime()
})
```

#### Policy Node
```cypher
(:Policy {
  id: 'pol-uuid-v4',
  name: 'Environmental Management Policy',
  type: 'environmental|social|governance|ethics',
  version: '2.0',
  effective_date: date('2024-01-01'),
  review_date: date('2025-01-01'),
  owner: 'Chief Sustainability Officer',
  approval_level: 'board|executive|management',
  mandatory: true,
  scope: 'global|regional|local',
  created_at: datetime()
})
```

#### Regulation Node
```cypher
(:Regulation {
  id: 'reg-uuid-v4',
  name: 'EU Carbon Border Adjustment Mechanism',
  acronym: 'CBAM',
  type: 'environmental|social|governance|reporting',
  jurisdiction: 'EU|US|CN|global',
  effective_date: date('2023-10-01'),
  compliance_deadline: date('2024-12-31'),
  penalty_max: 1000000,
  reporting_frequency: 'quarterly',
  created_at: datetime()
})
```

## Core Relationship Types

### 1. Organizational Relationships

```cypher
// Ownership hierarchy
(parent:Organization)-[:OWNS {percentage: 100, since: date('2020-01-01')}]->(subsidiary:Organization)

// Organizational structure
(org:Organization)-[:HAS_DIVISION]->(div:Division)
(div:Division)-[:OPERATES]->(fac:Facility)
(fac:Facility)-[:LOCATED_IN]->(country:Location)

// Management
(user:User)-[:MANAGES {role: 'facility_manager', since: date('2023-01-01')}]->(fac:Facility)
(project:Project)-[:MANAGED_BY]->(user:User)

// Project relationships
(org:Organization)-[:EXECUTES]->(project:Project)
(project:Project)-[:TARGETS]->(target:Target)
(project:Project)-[:IMPLEMENTS]->(initiative:Initiative)
```

### 2. Supply Chain Relationships

```cypher
// Supply relationships
(supplier:Supplier)-[:SUPPLIES {
  volume: 10000,
  unit: 'tons',
  frequency: 'monthly',
  contract_value: 500000
}]->(org:Organization)

// Material flow
(supplier:Supplier)-[:PROVIDES]->(material:Material)
(material:Material)-[:USED_IN]->(product:Product)
(facility:Facility)-[:PRODUCES {
  quantity: 1000,
  unit: 'units/day'
}]->(product:Product)

// Logistics
(facilityA:Facility)-[:SHIPS_TO {
  mode: 'truck|rail|ship|air',
  distance_km: 500,
  frequency: 'weekly',
  carbon_intensity: 0.15 // kgCO2e/ton-km
}]->(facilityB:Facility)
```

### 3. ESG Impact Relationships

```cypher
// Emission relationships
(source:EmissionSource)-[:LOCATED_AT]->(facility:Facility)
(source:EmissionSource)-[:EMITS {
  amount: 1250.5,
  unit: 'tCO2e',
  period: 'monthly',
  measured_at: datetime()
}]->(emission:Emission)

// Target tracking
(org:Organization)-[:COMMITS_TO]->(target:Target)
(initiative:Initiative)-[:CONTRIBUTES_TO {
  contribution: 500, // tCO2e reduction
  percentage: 10
}]->(target:Target)

// Risk relationships
(risk:Risk)-[:THREATENS]->(facility:Facility)
(risk:Risk)-[:MITIGATED_BY]->(initiative:Initiative)
(climate_scenario:Scenario)-[:CREATES]->(risk:Risk)
```

### 4. Compliance Relationships

```cypher
// Regulatory compliance
(org:Organization)-[:MUST_COMPLY_WITH {
  deadline: date('2024-12-31'),
  status: 'compliant|non_compliant|in_progress'
}]->(regulation:Regulation)

// Certifications
(facility:Facility)-[:CERTIFIED_BY {
  certification: 'ISO14001',
  issued_date: date('2023-06-01'),
  expiry_date: date('2026-05-31'),
  auditor: 'SGS'
}]->(standard:Standard)

// Policy implementation
(org:Organization)-[:IMPLEMENTS]->(policy:Policy)
(policy:Policy)-[:APPLIES_TO]->(facility:Facility)

// Stakeholder relationships
(stakeholder:Stakeholder)-[:INVESTS_IN {
  amount: 100000000,
  date: date('2023-01-15')
}]->(org:Organization)
(stakeholder:Stakeholder)-[:INFLUENCES {
  influence_type: 'regulatory|market|reputational',
  strength: 'high'
}]->(org:Organization)
```

## Complex Query Patterns

### 1. Organizational Carbon Footprint Rollup

```cypher
// Calculate total emissions for organization including all subsidiaries
MATCH (org:Organization {id: $orgId})
OPTIONAL MATCH (org)-[:OWNS*]->(subsidiary:Organization)
WITH org, COLLECT(DISTINCT subsidiary) AS subsidiaries
WITH org + subsidiaries AS allOrgs
UNWIND allOrgs AS company
MATCH (company)-[:HAS_DIVISION]->(:Division)-[:OPERATES]->(fac:Facility)
MATCH (fac)<-[:LOCATED_AT]-(source:EmissionSource)-[:EMITS]->(emission:Emission)
WHERE emission.period >= date($startDate) AND emission.period <= date($endDate)
RETURN
  org.name AS organization,
  COUNT(DISTINCT fac) AS facility_count,
  COUNT(DISTINCT source) AS emission_sources,
  SUM(emission.amount) AS total_emissions,
  COLLECT(DISTINCT emission.scope) AS scopes
```

### 2. Supply Chain Emission Tracking

```cypher
// Trace emissions through supply chain (upstream)
MATCH (org:Organization {id: $orgId})
MATCH path = (org)<-[:SUPPLIES*1..3]-(supplier:Supplier)
WITH org, supplier, length(path) AS tier
MATCH (supplier)-[:OPERATES]->(facility:Facility)
MATCH (facility)<-[:LOCATED_AT]-(source:EmissionSource)-[:EMITS]->(emission:Emission)
WHERE emission.scope = 'scope3'
RETURN
  tier,
  supplier.name,
  supplier.country,
  SUM(emission.amount) AS supplier_emissions,
  supplier.sustainability_score
ORDER BY tier, supplier_emissions DESC
```

### 3. ESG Initiative Impact Analysis

```cypher
// Analyze initiatives contributing to targets
MATCH (org:Organization {id: $orgId})-[:COMMITS_TO]->(target:Target)
MATCH (initiative:Initiative)-[contrib:CONTRIBUTES_TO]->(target)
MATCH (initiative)<-[:IMPLEMENTS]-(project:Project)
OPTIONAL MATCH (initiative)-[:MITIGATES]->(risk:Risk)
RETURN
  target.name,
  target.target_value,
  target.progress_percentage,
  COLLECT({
    initiative: initiative.name,
    type: initiative.type,
    contribution: contrib.contribution,
    investment: initiative.investment,
    roi: initiative.annual_savings / initiative.investment,
    risks_mitigated: COUNT(risk)
  }) AS initiatives,
  SUM(contrib.contribution) AS total_contribution
```

### 4. Stakeholder Influence Network

```cypher
// Map stakeholder influence network
MATCH (org:Organization {id: $orgId})
MATCH (stakeholder:Stakeholder)-[rel:INFLUENCES|INVESTS_IN|REGULATES|PARTNERS_WITH]->(org)
WITH stakeholder, type(rel) AS relationship_type, rel
MATCH (stakeholder)-[:INTERESTED_IN]->(topic:ESGTopic)
RETURN
  stakeholder.name,
  stakeholder.type,
  relationship_type,
  stakeholder.influence,
  stakeholder.interest,
  COLLECT(topic.name) AS esg_interests,
  CASE
    WHEN stakeholder.influence = 'critical' AND stakeholder.interest = 'high' THEN 'Key Player'
    WHEN stakeholder.influence = 'critical' AND stakeholder.interest = 'low' THEN 'Keep Satisfied'
    WHEN stakeholder.influence = 'low' AND stakeholder.interest = 'high' THEN 'Keep Informed'
    ELSE 'Monitor'
  END AS engagement_strategy
ORDER BY stakeholder.influence DESC
```

### 5. Climate Risk Dependency Analysis

```cypher
// Analyze climate risk dependencies
MATCH (facility:Facility {id: $facilityId})
MATCH (risk:Risk)-[:THREATENS]->(facility)
WHERE risk.category = 'climate'
OPTIONAL MATCH (risk)-[:DEPENDS_ON]->(factor:RiskFactor)
OPTIONAL MATCH (initiative:Initiative)-[:MITIGATES]->(risk)
RETURN
  facility.name,
  risk.name,
  risk.type,
  risk.probability,
  risk.impact,
  risk.financial_impact,
  COLLECT(DISTINCT factor.name) AS risk_factors,
  COLLECT(DISTINCT {
    name: initiative.name,
    effectiveness: initiative.risk_reduction_percentage
  }) AS mitigation_measures,
  risk.mitigation_status
ORDER BY risk.financial_impact DESC
```

### 6. Circular Economy Network

```cypher
// Map circular material flows
MATCH (product:Product {id: $productId})
MATCH (product)<-[:USED_IN]-(material:Material)
WHERE material.recycled_content > 0
MATCH (material)<-[:PROVIDES]-(supplier:Supplier)
OPTIONAL MATCH (product)-[:END_OF_LIFE]->(disposal:DisposalMethod)
OPTIONAL MATCH (disposal)-[:RECOVERS]->(recovered:Material)
OPTIONAL MATCH (recovered)-[:USED_IN]->(newProduct:Product)
RETURN
  product.name,
  product.recyclability,
  COLLECT(DISTINCT {
    material: material.name,
    recycled_content: material.recycled_content,
    supplier: supplier.name
  }) AS recycled_inputs,
  disposal.method,
  disposal.recovery_rate,
  COLLECT(DISTINCT newProduct.name) AS products_from_recovery
```

## Graph Algorithms

### 1. PageRank for Influence Analysis

```cypher
// Identify most influential entities in ESG network
CALL gds.pageRank.stream('esg-network', {
  nodeLabels: ['Organization', 'Stakeholder', 'Facility'],
  relationshipTypes: ['OWNS', 'INFLUENCES', 'SUPPLIES', 'INVESTS_IN'],
  maxIterations: 20,
  dampingFactor: 0.85
})
YIELD nodeId, score
MATCH (n) WHERE id(n) = nodeId
RETURN n.name AS entity, labels(n)[0] AS type, score
ORDER BY score DESC
LIMIT 20
```

### 2. Community Detection for Supply Clusters

```cypher
// Detect supply chain communities
CALL gds.louvain.stream('supply-network', {
  nodeLabels: ['Organization', 'Supplier', 'Facility'],
  relationshipTypes: ['SUPPLIES', 'SHIPS_TO', 'PROVIDES'],
  relationshipWeightProperty: 'volume'
})
YIELD nodeId, communityId
MATCH (n) WHERE id(n) = nodeId
RETURN communityId, COLLECT(n.name) AS members, COUNT(*) AS size
ORDER BY size DESC
```

### 3. Shortest Path for Supply Chain Traceability

```cypher
// Trace shortest path from raw material to product
MATCH (material:Material {name: $materialName})
MATCH (product:Product {name: $productName})
CALL gds.shortestPath.dijkstra.stream('supply-network', {
  sourceNode: material,
  targetNode: product,
  relationshipWeightProperty: 'distance_km'
})
YIELD path, totalCost
RETURN [node IN nodes(path) | node.name] AS supply_path, totalCost AS total_distance
```

### 4. Centrality for Critical Infrastructure

```cypher
// Identify critical facilities using betweenness centrality
CALL gds.betweenness.stream('facility-network', {
  nodeLabels: ['Facility'],
  relationshipTypes: ['SHIPS_TO', 'DEPENDS_ON']
})
YIELD nodeId, score
MATCH (f:Facility) WHERE id(f) = nodeId
RETURN f.name, f.type, score AS criticality_score
ORDER BY score DESC
LIMIT 10
```

## Data Import Patterns

### 1. CSV Import for Organizations

```cypher
// Import organizations from CSV
LOAD CSV WITH HEADERS FROM 'file:///organizations.csv' AS row
CREATE (org:Organization {
  id: row.id,
  name: row.name,
  type: row.type,
  industry: row.industry,
  country: row.country,
  employee_count: toInteger(row.employees),
  revenue: toFloat(row.revenue),
  created_at: datetime()
})
```

### 2. JSON Import for Hierarchies

```cypher
// Import organizational hierarchy from JSON
CALL apoc.load.json('file:///org_hierarchy.json') YIELD value
UNWIND value.organizations AS org
MERGE (o:Organization {id: org.id})
SET o.name = org.name
WITH org, o
UNWIND org.subsidiaries AS sub
MERGE (s:Organization {id: sub.id})
SET s.name = sub.name
MERGE (o)-[:OWNS {percentage: sub.ownership}]->(s)
```

### 3. Real-time Integration

```typescript
// Neo4j integration in Node.js service
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function createSupplyRelationship(supplierId: string, orgId: string, data: SupplyData) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (supplier:Supplier {id: $supplierId})
      MATCH (org:Organization {id: $orgId})
      MERGE (supplier)-[rel:SUPPLIES]->(org)
      SET rel.volume = $volume,
          rel.unit = $unit,
          rel.contract_value = $contractValue,
          rel.updated_at = datetime()
      RETURN rel
      `,
      {
        supplierId,
        orgId,
        volume: data.volume,
        unit: data.unit,
        contractValue: data.contractValue
      }
    );

    return result.records[0].get('rel');
  } finally {
    await session.close();
  }
}
```

## Performance Optimization

### 1. Index Strategy

```cypher
// Create indexes for common queries
CREATE INDEX org_id_index FOR (n:Organization) ON (n.id);
CREATE INDEX facility_country_index FOR (n:Facility) ON (n.country);
CREATE INDEX emission_period_index FOR (n:Emission) ON (n.period);
CREATE INDEX supplier_tier_index FOR (n:Supplier) ON (n.type);

// Composite indexes
CREATE INDEX facility_location FOR (n:Facility) ON (n.country, n.city);
CREATE INDEX emission_scope_period FOR (n:Emission) ON (n.scope, n.period);

// Full-text search indexes
CREATE FULLTEXT INDEX organization_search FOR (n:Organization) ON EACH [n.name, n.description];
CREATE FULLTEXT INDEX product_search FOR (n:Product) ON EACH [n.name, n.sku, n.category];
```

### 2. Query Optimization

```cypher
// Use PROFILE to analyze query performance
PROFILE
MATCH (org:Organization {id: $orgId})-[:OWNS*]->(sub:Organization)
RETURN COUNT(sub);

// Optimize with query hints
MATCH (org:Organization {id: $orgId})
USING INDEX org:Organization(id)
MATCH (org)-[:OWNS*]->(sub:Organization)
RETURN COUNT(sub);

// Use APOC for better performance on large traversals
CALL apoc.path.subgraphAll(org, {
  relationshipFilter: 'OWNS>',
  maxLevel: 5
})
YIELD nodes, relationships
RETURN SIZE(nodes) - 1 AS subsidiary_count;
```

### 3. Memory Configuration

```yaml
# neo4j.conf optimization for ESG workload
dbms.memory.heap.initial_size=4G
dbms.memory.heap.max_size=8G
dbms.memory.pagecache.size=4G

# Query cache
dbms.query_cache_size=100

# Transaction settings
dbms.transaction.timeout=30s
dbms.transaction.concurrent.maximum=100
```

## Security Configuration

### 1. Authentication & Authorization

```cypher
// Create roles for ESG platform
CREATE ROLE esg_admin;
CREATE ROLE esg_analyst;
CREATE ROLE esg_viewer;

// Grant permissions
GRANT MATCH {*} ON GRAPH * TO esg_viewer;
GRANT CREATE ON GRAPH * TO esg_analyst;
GRANT ALL ON GRAPH * TO esg_admin;

// Create users
CREATE USER 'admin@clenergize.com' SET PASSWORD 'SecurePassword123!' SET PASSWORD CHANGE NOT REQUIRED;
GRANT ROLE esg_admin TO 'admin@clenergize.com';
```

### 2. Encryption

```yaml
# Enable encryption in neo4j.conf
dbms.ssl.policy.bolt.enabled=true
dbms.ssl.policy.bolt.base_directory=certificates/bolt
dbms.ssl.policy.bolt.private_key=private.key
dbms.ssl.policy.bolt.public_certificate=public.crt

dbms.ssl.policy.https.enabled=true
dbms.ssl.policy.https.base_directory=certificates/https
```

## Monitoring & Maintenance

### 1. Query Monitoring

```cypher
// Monitor slow queries
CALL dbms.listQueries() YIELD query, elapsedTimeMillis, username
WHERE elapsedTimeMillis > 1000
RETURN query, elapsedTimeMillis, username;

// Kill long-running queries
CALL dbms.listQueries() YIELD queryId, elapsedTimeMillis
WHERE elapsedTimeMillis > 30000
CALL dbms.killQuery(queryId) YIELD queryId AS killed
RETURN killed;
```

### 2. Database Statistics

```cypher
// Check database size and statistics
CALL apoc.meta.stats() YIELD nodeCount, relCount, labelCount, relTypeCount
RETURN nodeCount, relCount, labelCount, relTypeCount;

// Check index usage
CALL db.indexes() YIELD name, state, populationPercent, uniqueness
RETURN name, state, populationPercent, uniqueness;
```

### 3. Backup Strategy

```bash
#!/bin/bash
# Neo4j backup script

BACKUP_DIR="/backups/neo4j/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Online backup
neo4j-admin backup \
  --database=clenergize \
  --backup-dir=$BACKUP_DIR \
  --verbose

# Compress and upload to S3
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
aws s3 cp $BACKUP_DIR.tar.gz s3://clenergize-backups/neo4j/
```

## Integration with Clenergize Services

### Organization Service Integration

```typescript
// organization-service/src/infrastructure/graph/neo4j.client.ts
import neo4j, { Driver, Session } from 'neo4j-driver';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Neo4jClient {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
      {
        maxConnectionPoolSize: 50,
        connectionTimeout: 30000,
        maxTransactionRetryTime: 30000,
      }
    );
  }

  async createOrganizationHierarchy(org: Organization): Promise<void> {
    const session = this.driver.session();

    try {
      await session.writeTransaction(async (tx) => {
        // Create organization node
        await tx.run(
          `
          MERGE (org:Organization {id: $id})
          SET org.name = $name,
              org.type = $type,
              org.industry = $industry,
              org.updated_at = datetime()
          `,
          org
        );

        // Create facilities
        for (const facility of org.facilities) {
          await tx.run(
            `
            MATCH (org:Organization {id: $orgId})
            MERGE (fac:Facility {id: $facId})
            SET fac.name = $name,
                fac.type = $type,
                fac.country = $country
            MERGE (org)-[:OPERATES]->(fac)
            `,
            {
              orgId: org.id,
              facId: facility.id,
              name: facility.name,
              type: facility.type,
              country: facility.country,
            }
          );
        }
      });
    } finally {
      await session.close();
    }
  }

  async getOrganizationNetwork(orgId: string): Promise<any> {
    const session = this.driver.session();

    try {
      const result = await session.readTransaction(async (tx) => {
        return tx.run(
          `
          MATCH (org:Organization {id: $orgId})
          OPTIONAL MATCH (org)-[r:OWNS|OPERATES|MANAGES*..3]-(connected)
          RETURN org, COLLECT(DISTINCT connected) AS network, COLLECT(DISTINCT r) AS relationships
          `,
          { orgId }
        );
      });

      return result.records[0]?.toObject();
    } finally {
      await session.close();
    }
  }
}
```

## Migration from Legacy Systems

### Hierarchy Cloning to Graph References

```cypher
// Migrate cloned hierarchies to graph relationships
// Legacy: Each project had a full copy of hierarchy
// New: Single hierarchy with project references

// Step 1: Create master hierarchy
LOAD CSV WITH HEADERS FROM 'file:///legacy_hierarchy.csv' AS row
MERGE (parent:HierarchyNode {id: row.parent_id})
SET parent.name = row.parent_name, parent.type = row.parent_type
MERGE (child:HierarchyNode {id: row.child_id})
SET child.name = row.child_name, child.type = row.child_type
MERGE (parent)-[:HAS_CHILD {level: toInteger(row.level)}]->(child);

// Step 2: Link projects to hierarchy nodes
LOAD CSV WITH HEADERS FROM 'file:///project_hierarchy_mapping.csv' AS row
MATCH (project:Project {id: row.project_id})
MATCH (node:HierarchyNode {id: row.hierarchy_node_id})
MERGE (project)-[:USES_HIERARCHY]->(node);

// Step 3: Create hierarchy snapshots for versioning
MATCH (node:HierarchyNode)
CREATE (snapshot:HierarchySnapshot {
  id: node.id + '_v1',
  node_id: node.id,
  version: 1,
  valid_from: date('2024-01-01'),
  valid_to: date('9999-12-31'),
  name: node.name,
  type: node.type
})
MERGE (node)-[:HAS_VERSION]->(snapshot);
```

## Capacity Planning

### Storage Estimation

```yaml
# ESG Platform Graph Size Estimation
Nodes:
  Organizations: 10,000
  Facilities: 100,000
  Suppliers: 500,000
  Products: 1,000,000
  Emissions: 10,000,000 (historical)
  Users: 50,000
  Total: ~12M nodes

Relationships:
  Organizational: 200,000
  Supply Chain: 5,000,000
  ESG Tracking: 20,000,000
  Compliance: 500,000
  Total: ~26M relationships

Storage:
  Nodes: 12M × 1KB = 12GB
  Relationships: 26M × 500B = 13GB
  Indexes: 5GB
  Total: ~30GB (without properties)
  With properties: ~100GB
  With 3x growth: ~300GB
```

## References

- [Neo4j Documentation](https://neo4j.com/docs/)
- [Graph Data Modeling](https://neo4j.com/developer/data-modeling/)
- [Neo4j Performance Tuning](https://neo4j.com/developer/performance/)
- [APOC Procedures](https://neo4j.com/developer/apoc/)
- [Graph Data Science](https://neo4j.com/docs/graph-data-science/current/)