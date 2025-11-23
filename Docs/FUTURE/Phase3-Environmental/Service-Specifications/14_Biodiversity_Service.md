# Service Specification: Biodiversity Service

## Service Overview

**Service Name**: Biodiversity Service
**Port**: 3014
**Purpose**: Manages biodiversity impact assessment, ecosystem services valuation, nature-based solutions, TNFD LEAP analysis, and SBTN target setting
**Domain**: Environmental Domain - Biodiversity & Nature
**Team Ownership**: Environmental Domain Team
**Phase**: 3 (Environmental Domain - Months 5-8)
**Story Points**: 55
**Agent**: Biodiversity Agent

## 1. Functional Requirements

### 1.1 Core Features

#### Land Use & Biodiversity Assessment
- **Site-Level Baseline Assessment**: Biodiversity baseline for facilities and operations
  - Initial biodiversity inventory (species, habitats)
  - Ecosystem condition assessment
  - Baseline biodiversity metrics (species richness, abundance)
  - Temporal trend analysis (multi-year data)
- **Habitat Mapping**: Identify and classify habitat types
  - Forests (tropical, temperate, boreal)
  - Wetlands (marshes, swamps, peatlands)
  - Grasslands (savannas, prairies, steppes)
  - Marine/coastal (coral reefs, mangroves, seagrass)
  - Urban green spaces
  - Agricultural landscapes
  - GIS-based habitat boundary mapping
  - Habitat quality scoring (pristine to degraded)
- **Protected Area Proximity**: Distance and impact on protected zones
  - IUCN category mapping (Ia, Ib, II, III, IV, V, VI)
  - Ramsar wetland sites
  - UNESCO World Heritage sites
  - National parks and reserves
  - Key Biodiversity Areas (KBAs)
  - Indigenous and Community Conserved Areas (ICCAs)
  - Buffer zone analysis (proximity impact scoring)
  - No-go zone identification
- **Species Presence Tracking**: Monitor species in operational areas
  - Endangered species (IUCN Red List)
  - Threatened species (regional lists)
  - Endemic species (unique to region)
  - Invasive species (monitoring and control)
  - Flagship species (cultural/conservation significance)
  - Species sighting registry (camera traps, surveys)
  - Population trend monitoring
  - Migration pattern tracking
- **IBAT Integration**: Automated biodiversity screening
  - IBAT API integration for site screening
  - Protected area overlap detection
  - Species occurrence data import
  - Red List species alerts
  - Key Biodiversity Area identification
  - Automated risk scoring
- **Ecological Sensitivity Screening**: Risk assessment for new projects
  - Pre-project biodiversity risk assessment
  - Habitat fragmentation analysis
  - Ecosystem connectivity mapping
  - Critical habitat identification
  - Cumulative impact assessment
  - Mitigation hierarchy application (avoid, minimize, restore, offset)

#### TNFD LEAP Analysis
- **Locate (L)**: Map assets and activities in nature
  - **Asset Location Mapping**: GIS mapping of all facilities, supply chain sites
  - **Biome Classification**: Identify biomes (tropical forest, savanna, etc.)
  - **Ecoregion Mapping**: WWF terrestrial/freshwater/marine ecoregions
  - **Biodiversity Hotspot Overlay**: Conservation International 36 hotspots
  - **Water Basin Mapping**: Major river basins and watersheds
  - **Land Use Classification**: Forest, agriculture, urban, wetland
  - **Proximity to Sensitive Areas**: Distance to protected areas, KBAs
  - **Supply Chain Traceability**: Locate upstream sourcing sites (commodities)

- **Evaluate (E)**: Assess dependencies on nature
  - **Ecosystem Service Dependencies**: Identify critical nature services
    - Water provision (quantity, quality)
    - Climate regulation (carbon sequestration)
    - Pollination (crop production)
    - Flood/erosion control
    - Natural pest control
    - Genetic resources
  - **Dependency Criticality**: Score reliance on each service (low/medium/high/very high)
  - **Substitutability Analysis**: Can services be replaced? Cost?
  - **Dependency Mapping by Business Process**: Link services to operations
  - **Supply Chain Dependencies**: Nature reliance in value chain
  - **Scenario Analysis**: Impact of ecosystem service loss
  - **Financial Exposure**: Revenue/cost at risk from nature loss

- **Assess (A)**: Measure impacts on nature
  - **Impact Driver Identification**: Pressures on biodiversity
    - Land/sea use change (conversion, degradation)
    - Direct exploitation (overfishing, overharvesting)
    - Climate change (temperature, precipitation shifts)
    - Pollution (air, water, soil, plastic)
    - Invasive species introduction
  - **Impact Pathway Analysis**: Driver → Pressure → State → Response
  - **Impact Magnitude Scoring**: Severity, scope, irremediability
  - **Positive Impact Identification**: Conservation, restoration activities
  - **Net Impact Calculation**: Negative impacts - Positive contributions
  - **Impact Attribution**: Direct, indirect, cumulative impacts
  - **Spatial Impact Mapping**: Where impacts occur (on-site, upstream, downstream)

- **Prepare (P)**: Develop response strategy
  - **Risk Prioritization**: Rank nature-related risks (physical, transition, systemic)
  - **Opportunity Identification**: Nature-positive business opportunities
  - **Mitigation Hierarchy Application**: Avoid, minimize, restore, offset
  - **Action Plan Development**: Targets, initiatives, timelines
  - **Disclosure Preparation**: TNFD-aligned reporting
  - **Stakeholder Engagement**: Local communities, conservation groups
  - **Governance Integration**: Board oversight, risk management

#### Ecosystem Services Valuation
- **Natural Capital Accounting**: Measure natural asset stocks and flows
  - **Asset Stock Measurement**: Quantity of natural capital (hectares of forest, cubic meters of water)
  - **Flow Measurement**: Annual ecosystem service provision (tons CO2 sequestered, cubic meters water purified)
  - **Depreciation Accounting**: Natural capital depletion over time
  - **Restoration Investment**: Capital expenditure on nature restoration
  - **Natural Capital Balance Sheet**: Assets, liabilities, net worth
  - **Integrated Profit & Loss**: Include natural capital costs/benefits
- **Ecosystem Service Identification**: Catalog all services provided by nature
  - **Provisioning Services**: Water, timber, food, fiber, genetic resources
  - **Regulating Services**: Climate regulation, water purification, pollination, pest control, flood control
  - **Cultural Services**: Recreation, aesthetic values, spiritual significance
  - **Supporting Services**: Soil formation, nutrient cycling, primary production
  - **Service Condition Assessment**: Quality and sustainability of each service
  - **Service Flow Mapping**: Where services originate and who benefits
- **Economic Valuation**: Assign monetary value to ecosystem services
  - **Market Price Method**: Direct market values (timber, water)
  - **Replacement Cost Method**: Cost to replace service (e.g., water treatment plant)
  - **Avoided Cost Method**: Costs avoided by nature (e.g., flood protection)
  - **Hedonic Pricing**: Property value premiums near nature
  - **Travel Cost Method**: Recreation value based on visitor spending
  - **Contingent Valuation**: Willingness-to-pay surveys
  - **Benefit Transfer**: Apply values from similar ecosystems
  - **Discounting**: Present value of future service flows
- **Dependency Mapping**: Link business processes to ecosystem services
  - **Value Chain Mapping**: Which activities depend on which services
  - **Criticality Assessment**: How essential is each service
  - **Risk Scenarios**: Impact of service loss on operations
  - **Substitution Options**: Alternatives to natural services (cost, feasibility)
  - **Supplier Dependencies**: Nature reliance in supply chain
- **Impact Pathways**: How business affects ecosystem services
  - **Pressure Identification**: Activities causing impacts (emissions, land use)
  - **Service Degradation**: How pressures reduce service provision
  - **Feedback Loops**: Impacts that worsen dependencies (e.g., water pollution affecting water availability)
  - **Cumulative Impacts**: Combined effects of multiple pressures
  - **Spatial Analysis**: Where impacts occur relative to dependencies

#### Biodiversity Impact Metrics
- **Mean Species Abundance (MSA)**: GLOBIO methodology
  - **MSA Calculation**: Remaining biodiversity vs pristine baseline (0-100%)
  - **Pressure-Specific MSA**: Separate MSA for land use, climate, pollution, etc.
  - **Aggregated MSA**: Combined impact across all pressures
  - **Temporal MSA**: Historical trends and future projections
  - **Spatial MSA**: Site-level and regional MSA scores
  - **Sector-Specific MSA**: Industry benchmarks
- **Potentially Disappeared Fraction (PDF)**: ReCiPe/IMPACT methodology
  - **PDF of Species**: Expected species loss per km² per year
  - **PDF by Taxonomic Group**: Mammals, birds, plants, etc.
  - **Characterization Factors**: Impact per unit pressure (e.g., PDF/ton pesticide)
  - **Aggregation**: Total PDF across all impact categories
  - **Normalization**: PDF relative to global baseline
- **Biodiversity Footprint**: Lifecycle impact assessment
  - **Land Use Footprint**: Area transformed or occupied (MSA·km²·year)
  - **Pollution Footprint**: Toxic impacts on species (CTUe - Comparative Toxic Units)
  - **Climate Change Footprint**: Species loss due to warming (PDF)
  - **Water Consumption Footprint**: Freshwater biodiversity impacts
  - **Resource Extraction Footprint**: Mining, forestry, fishing impacts
  - **Supply Chain Footprint**: Upstream biodiversity impacts
  - **Product Lifecycle Footprint**: Cradle-to-grave assessment
- **Net Positive Impact Tracking**: Progress toward no net loss/net gain
  - **Baseline Biodiversity**: Initial state (MSA, species count)
  - **Negative Impacts**: Losses from operations (MSA loss, habitat hectares)
  - **Positive Contributions**: Gains from restoration, conservation (MSA gain, hectares restored)
  - **Net Impact**: Positive - Negative
  - **Offset Ratio**: Positive required to achieve no net loss (e.g., 2:1, 10:1)
  - **Trajectory Modeling**: Projected path to net positive by target year
- **STAR Metric**: Species Threat Abatement and Restoration
  - **Threat Abatement**: Reduction in species extinction risk from threat reduction
  - **Restoration Potential**: Species extinction risk reduction from habitat restoration
  - **STAR Score Calculation**: Per hectare, per project, per portfolio
  - **STAR Target Setting**: Required STAR to align with global biodiversity goals
  - **STAR Monitoring**: Annual STAR contributions
  - **STAR Disclosure**: Integration with SBTN and TNFD reporting

#### Nature-Based Solutions (NbS)
- **Restoration Project Tracking**: Monitor ecological restoration initiatives
  - **Reforestation/Afforestation**: Tree planting projects
  - **Wetland Restoration**: Re-watering, invasive species removal
  - **Grassland Rehabilitation**: Native species reintroduction
  - **Coral Reef Restoration**: Coral transplantation, artificial reefs
  - **River Restoration**: Channelization removal, riparian buffers
  - **Peatland Rewetting**: Hydrological restoration
  - **Project Registry**: Location, hectares, species, timeline
  - **Progress Tracking**: Survival rates, species return, ecosystem function recovery
  - **Monitoring Protocols**: Photo points, species surveys, hydrological data
  - **Adaptive Management**: Mid-course corrections based on monitoring
- **Conservation Program Management**: Protect existing ecosystems
  - **Protected Area Management**: National parks, reserves, conservancies
  - **Easement Management**: Conservation easements, restrictive covenants
  - **Stewardship Agreements**: Partnerships with landowners
  - **Anti-Poaching Programs**: Ranger patrols, enforcement
  - **Fire Management**: Prescribed burns, fire prevention
  - **Invasive Species Control**: Eradication, containment programs
  - **Monitoring and Enforcement**: Satellite monitoring, field patrols
- **Biodiversity Offset Management**: Compensate for residual impacts
  - **Offset Registry**: Location, type, hectares, biodiversity units
  - **Equivalency Calculations**: Habitat matching, species matching
  - **Offset Ratio Application**: Multipliers for risk, time lag
  - **Third-Party Certification**: Verified Carbon Standard (VCS) Biodiversity, Plan Vivo
  - **Credit Issuance**: Biodiversity credits generated
  - **Credit Retirement**: Credits used to offset impacts
  - **Additionality Verification**: Offset would not have occurred otherwise
  - **Permanence Monitoring**: Long-term offset security
  - **Co-Benefits**: Carbon, community, water benefits
- **Green Infrastructure Initiatives**: Integrate nature in built environment
  - **Green Roofs and Walls**: Vegetation on buildings
  - **Urban Forest Canopy**: Street trees, parks
  - **Bioswales and Rain Gardens**: Stormwater management
  - **Wildlife Corridors**: Connectivity in fragmented landscapes
  - **Pollinator Gardens**: Native flowering plants
  - **Living Shorelines**: Natural coastal protection
  - **Performance Metrics**: Biodiversity (species count), ecosystem services (stormwater filtered)
- **Nature-Positive Investment Tracking**: Finance for nature
  - **Investment Portfolio**: NbS projects, green bonds, blended finance
  - **Investment Amount**: Capital deployed for nature
  - **Expected Returns**: Financial and biodiversity ROI
  - **Impact Metrics**: Hectares restored, species recovered, carbon sequestered
  - **IRIS+ Alignment**: Standardized impact measurement
  - **Blended Finance**: Public, private, philanthropic capital mix

#### Supply Chain Biodiversity
- **Commodity Risk Assessment**: High-risk materials sourcing
  - **Palm Oil**: Deforestation, peatland conversion, orangutan habitat
  - **Soy**: Amazon/Cerrado conversion, habitat loss
  - **Timber**: Illegal logging, forest degradation
  - **Beef**: Grassland conversion, Amazon deforestation
  - **Cocoa**: Forest encroachment, biodiversity loss
  - **Rubber**: Natural forest conversion
  - **Coffee**: Shade forest loss, habitat fragmentation
  - **Cotton**: Pesticide impacts, water consumption
  - **Risk Scoring**: Commodity, origin, supplier, certification
  - **Deforestation Risk**: Forest loss per ton of commodity
  - **Biodiversity Threat**: Threatened species in sourcing region
- **Supplier Location Mapping**: Geospatial supplier analysis
  - **Tier 1 Supplier Locations**: Direct suppliers (facilities, farms)
  - **Tier 2+ Locations**: Upstream suppliers (where data available)
  - **Biodiversity Hotspot Overlay**: Sourcing in 36 global hotspots
  - **Protected Area Proximity**: Suppliers near reserves, KBAs
  - **High Conservation Value (HCV) Areas**: Sourcing in critical ecosystems
  - **Indigenous Territories**: Sourcing in indigenous lands (FPIC verification)
  - **Deforestation Frontiers**: Sourcing in active deforestation zones (e.g., Amazon, Borneo)
  - **Risk Heat Maps**: Visual representation of supply chain biodiversity risk
- **Deforestation-Free Sourcing Verification**: Ensure zero-deforestation commitments
  - **Satellite Monitoring**: High-resolution imagery (Sentinel, Landsat, Planet)
  - **Deforestation Alerts**: Near-real-time forest loss detection (GLAD, RADD)
  - **Traceability to Source**: GPS coordinates of farms/concessions
  - **Cut-Off Date Verification**: No deforestation after commitment date (e.g., 2020)
  - **Forest Cover Baselines**: Pre-commitment forest extent
  - **Change Detection**: Forest loss analysis within supply sheds
  - **Supplier Scorecards**: Deforestation compliance by supplier
  - **Action Plans**: Remediation for non-compliant suppliers
- **Sustainable Certification Tracking**: Monitor certified sourcing
  - **FSC (Forest Stewardship Council)**: Responsible forest management
  - **RSPO (Roundtable on Sustainable Palm Oil)**: Sustainable palm oil
  - **MSC (Marine Stewardship Council)**: Sustainable seafood
  - **Rainforest Alliance**: Sustainable agriculture
  - **Fair Trade**: Social and environmental standards
  - **Organic Certifications**: Biodiversity-friendly farming
  - **Certification Registry**: Supplier certificates, expiry dates, scope
  - **Chain of Custody Verification**: Segregated, mass balance, book and claim
  - **Percentage Certified**: Certified volume / total volume by commodity
  - **Certification Trends**: Growth in certified sourcing over time
- **Traceability to Source Landscapes**: Origin visibility
  - **Farm-Level Traceability**: Individual farm identification
  - **Cooperative/Mill Traceability**: Processing facility sourcing areas
  - **Landscape-Level Data**: Biodiversity conditions in sourcing landscapes
  - **Polygons/Geopoints**: Precise sourcing area boundaries
  - **Traceability Technologies**: Blockchain, QR codes, RFID, DNA barcoding
  - **Third-Party Verification**: Independent traceability audits
  - **Transparency Platforms**: Public disclosure of sourcing areas (e.g., Global Forest Watch Pro, Trase)

#### SBTN Target Setting
- **Science-Based Targets for Nature**: Align with global biodiversity goals
  - **SBTN Framework**: Land, freshwater, ocean, biodiversity integrity, climate (nexus)
  - **Assess Step**: Understand dependencies and impacts (TNFD LEAP)
  - **Interpret & Prioritize**: Identify material nature issues
  - **Measure, Set & Disclose**: Quantify impacts, set targets, report progress
  - **Act**: Implement target action plans
- **No Net Loss / Net Positive Goals**: Biodiversity impact targets
  - **No Net Loss**: Zero net biodiversity loss from operations
  - **Net Positive Impact**: Measurable biodiversity gain vs baseline
  - **Net Positive by Year**: Target year for net positive (e.g., 2030)
  - **Offset Strategy**: Residual impacts fully compensated
  - **Monitoring Plan**: Annual biodiversity impact accounting
- **Pressure Reduction Targets**: Reduce drivers of biodiversity loss
  - **Land Use Change**: Zero deforestation, zero conversion, habitat restoration hectares
  - **Pollution**: Reduce pesticide/fertilizer use, zero plastic waste to nature
  - **Climate Change**: GHG reduction (aligned with SBTi), climate adaptation actions
  - **Invasive Species**: Eradication targets, prevention protocols
  - **Exploitation**: Sustainable harvest limits, no overfishing/overharvesting
  - **Water Consumption**: Reduce water use in water-stressed basins
  - **Nitrogen/Phosphorus**: Reduce nutrient runoff to watersheds
- **State Improvement Targets**: Improve ecosystem health
  - **Ecosystem Integrity**: Increase MSA, ecological condition indices
  - **Species Populations**: Recover threatened species, increase abundance
  - **Habitat Extent**: Expand protected areas, restore degraded habitats
  - **Connectivity**: Improve landscape connectivity, reduce fragmentation
  - **Ecosystem Services**: Enhance service provision (e.g., increase carbon sequestration)
- **Action Plan Development**: Detailed implementation roadmap
  - **Target Hierarchy**: Corporate, business unit, site, product-level targets
  - **Baseline Year**: Reference year for target setting (e.g., 2020)
  - **Target Year**: Achievement year (near-term: 2025-2030, long-term: 2040-2050)
  - **Interim Milestones**: 5-year checkpoints
  - **Initiatives**: Specific actions to achieve targets (restoration, sourcing changes)
  - **Responsibility Assignment**: Owners for each initiative
  - **Budget Allocation**: CAPEX and OPEX for nature targets
  - **KPI Dashboard**: Real-time progress tracking
  - **Reporting Schedule**: Annual SBTN disclosures

### 1.2 API Endpoints

#### Biodiversity Site Assessment Endpoints
```yaml
POST /v1/biodiversity/sites
  Request:
    - name: string (required)
    - siteType: string ("facility" | "farm" | "mine" | "plantation" | "conservation")
    - location: {
        latitude: number (required),
        longitude: number (required),
        address: string,
        country: string (required)
      }
    - area: {
        hectares: number,
        boundaries: GeoJSON (polygon)
      }
    - organizationId: string (required)
    - facilityId: string (optional, link to Organization Service facility)
  Response:
    - siteId: string
    - ibatScreening: {
        protectedAreas: ProtectedArea[],
        keyBiodiversityAreas: KBA[],
        redListSpecies: Species[],
        riskScore: number (0-100)
      }
    - createdAt: timestamp

GET /v1/biodiversity/sites
  Query:
    - organizationId: string (required)
    - siteType: string (optional)
    - country: string (optional)
    - riskLevel: string ("low" | "medium" | "high" | "critical")
    - page: number
    - limit: number
  Response:
    - sites: BiodiversitySite[]
    - total: number
    - aggregates: {
        totalHectares: number,
        highRiskSites: number,
        sitesInProtectedAreas: number,
        sitesInHotspots: number
      }

GET /v1/biodiversity/sites/:siteId
  Response:
    - site: BiodiversitySite
    - habitatTypes: HabitatAssessment[]
    - speciesInventory: SpeciesSighting[]
    - protectedAreaProximity: ProtectedAreaProximity[]
    - assessmentHistory: BiodiversityAssessment[]

PUT /v1/biodiversity/sites/:siteId
  Request:
    - name: string
    - area: object
    - habitatDescription: string
    - managementPractices: string
  Response:
    - site: BiodiversitySite

DELETE /v1/biodiversity/sites/:siteId
  Response:
    - success: boolean

POST /v1/biodiversity/sites/:siteId/assessments
  Request:
    - assessmentType: string ("baseline" | "routine_monitoring" | "impact_assessment" | "pre_project")
    - assessmentDate: date (required)
    - assessors: string[] (required)
    - methodology: string (required, e.g., "Rapid Biodiversity Assessment", "Comprehensive Biodiversity Inventory")
    - findings: {
        speciesRichness: number,
        abundanceIndex: number,
        ecosystemCondition: string ("pristine" | "good" | "moderate" | "degraded" | "severely_degraded"),
        threats: string[],
        recommendations: string
      }
    - evidence: {
        photos: string[] (S3 URLs),
        reports: string[] (S3 URLs),
        dataSheets: string[] (S3 URLs)
      }
  Response:
    - assessment: BiodiversityAssessment
    - assessmentId: string

GET /v1/biodiversity/sites/:siteId/assessments
  Query:
    - assessmentType: string
    - startDate: date
    - endDate: date
  Response:
    - assessments: BiodiversityAssessment[]
    - trends: {
        speciesRichnessTrend: string ("increasing" | "stable" | "decreasing"),
        ecosystemConditionTrend: string
      }
```

#### Habitat Management Endpoints
```yaml
POST /v1/biodiversity/sites/:siteId/habitats
  Request:
    - habitatType: string ("forest" | "wetland" | "grassland" | "marine" | "urban_green" | "agricultural")
    - habitatSubtype: string (e.g., "tropical_rainforest", "mangrove", "coral_reef")
    - area: {
        hectares: number (required),
        boundaries: GeoJSON (polygon)
      }
    - condition: string ("pristine" | "good" | "moderate" | "degraded" | "severely_degraded")
    - dominantSpecies: string[]
    - threatFactors: string[]
  Response:
    - habitat: HabitatAssessment
    - habitatId: string

GET /v1/biodiversity/sites/:siteId/habitats
  Response:
    - habitats: HabitatAssessment[]
    - totalHectares: number
    - habitatDiversity: number (Shannon diversity index)
    - fragmentationIndex: number

PUT /v1/biodiversity/sites/:siteId/habitats/:habitatId
  Request:
    - condition: string
    - area: object
    - managementActions: string[]
  Response:
    - habitat: HabitatAssessment

GET /v1/biodiversity/protected-areas
  Query:
    - latitude: number (required)
    - longitude: number (required)
    - radiusKm: number (default: 10)
  Response:
    - protectedAreas: ProtectedArea[]
    - keyBiodiversityAreas: KBA[]
    - indigenousTerritories: IndigenousTerritory[]
    - minimumDistance: number (km to nearest protected area)
```

#### Species Tracking Endpoints
```yaml
POST /v1/biodiversity/species/sightings
  Request:
    - siteId: string (required)
    - species: {
        scientificName: string (required),
        commonName: string,
        taxonomicGroup: string ("mammal" | "bird" | "reptile" | "amphibian" | "fish" | "invertebrate" | "plant")
      }
    - sightingDate: date (required)
    - location: {
        latitude: number,
        longitude: number,
        habitatId: string
      }
    - abundance: number (individual count)
    - observationType: string ("visual" | "camera_trap" | "acoustic" | "track_sign" | "environmental_dna")
    - evidence: {
        photos: string[],
        recordings: string[],
        notes: string
      }
    - observers: string[] (required)
  Response:
    - sighting: SpeciesSighting
    - sightingId: string
    - conservationStatus: {
        iucnCategory: string ("LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX"),
        nationalStatus: string,
        isEndemic: boolean,
        isMigratory: boolean
      }

GET /v1/biodiversity/species/sightings
  Query:
    - siteId: string (required)
    - startDate: date
    - endDate: date
    - taxonomicGroup: string
    - conservationStatus: string ("threatened" | "endangered" | "endemic" | "invasive")
  Response:
    - sightings: SpeciesSighting[]
    - uniqueSpeciesCount: number
    - threatenedSpeciesCount: number
    - endemicSpeciesCount: number

GET /v1/biodiversity/species/inventory/:siteId
  Response:
    - speciesList: Species[]
    - taxonomicSummary: {
        mammals: number,
        birds: number,
        reptiles: number,
        amphibians: number,
        fish: number,
        invertebrates: number,
        plants: number
      }
    - conservationSummary: {
        criticallyEndangered: number,
        endangered: number,
        vulnerable: number,
        endemic: number,
        invasive: number
      }
    - sightingFrequency: {
        [speciesId: string]: number
      }

POST /v1/biodiversity/species/alerts
  Request:
    - siteId: string (required)
    - speciesId: string (required)
    - alertType: string ("threatened_species_sighting" | "invasive_species_detection" | "population_decline")
    - priority: string ("low" | "medium" | "high" | "critical")
    - description: string
    - recommendedActions: string[]
  Response:
    - alert: BiodiversityAlert
    - alertId: string
    - notificationsSent: number
```

#### TNFD LEAP Assessment Endpoints
```yaml
POST /v1/biodiversity/tnfd/assessments
  Request:
    - name: string (required)
    - scope: string ("corporate" | "business_unit" | "site" | "product" | "supply_chain")
    - scopeDetails: {
        organizationId: string,
        siteIds: string[],
        productIds: string[],
        supplierIds: string[]
      }
    - assessmentYear: number (required)
    - framework: string (default: "TNFD_v1.0")
  Response:
    - assessmentId: string
    - status: "draft"
    - leapStages: {
        locate: { status: "pending", progress: 0 },
        evaluate: { status: "pending", progress: 0 },
        assess: { status: "pending", progress: 0 },
        prepare: { status: "pending", progress: 0 }
      }

GET /v1/biodiversity/tnfd/assessments
  Query:
    - organizationId: string (required)
    - year: number
    - status: string
  Response:
    - assessments: TNFDAssessment[]
    - total: number

GET /v1/biodiversity/tnfd/assessments/:assessmentId
  Response:
    - assessment: TNFDAssessment
    - locateData: LocateAnalysis
    - evaluateData: EvaluateAnalysis
    - assessData: AssessAnalysis
    - prepareData: PrepareAnalysis
    - disclosureReadiness: number (0-100%)

# LOCATE Stage
POST /v1/biodiversity/tnfd/assessments/:assessmentId/locate
  Request:
    - assets: [{
        assetId: string,
        assetType: string ("facility" | "farm" | "mine" | "supply_site"),
        location: { latitude: number, longitude: number },
        area: { hectares: number }
      }]
    - analyzeSupplyChain: boolean (default: true)
  Response:
    - locateAnalysis: {
        assetCount: number,
        biomes: Biome[],
        ecoregions: Ecoregion[],
        biodiversityHotspots: Hotspot[],
        waterBasins: WaterBasin[],
        protectedAreaProximity: ProtectedAreaProximity[],
        highRiskAssets: Asset[] (in hotspots/protected areas),
        riskHeatMap: GeoJSON
      }
    - leapStages.locate: { status: "completed", progress: 100 }

# EVALUATE Stage
POST /v1/biodiversity/tnfd/assessments/:assessmentId/evaluate
  Request:
    - ecosystemServices: [{
        serviceType: string ("water_provision" | "climate_regulation" | "pollination" | "flood_control" | "pest_control" | "genetic_resources"),
        businessProcess: string (required),
        criticalityScore: number (1-5),
        substitutability: string ("none" | "low" | "medium" | "high"),
        substitutionCost: number (optional),
        annualValue: number (optional),
        riskScenarios: [{
          scenario: string,
          likelihoodOfLoss: number (0-100%),
          impactOnOperations: string,
          financialImpact: number
        }]
      }]
  Response:
    - evaluateAnalysis: {
        totalDependencies: number,
        criticalDependencies: number (score 4-5),
        dependenciesByService: object,
        dependencyRiskScore: number (0-100),
        financialExposure: number,
        supplyChainDependencies: object
      }
    - leapStages.evaluate: { status: "completed", progress: 100 }

# ASSESS Stage
POST /v1/biodiversity/tnfd/assessments/:assessmentId/assess
  Request:
    - impactDrivers: [{
        driver: string ("land_use_change" | "exploitation" | "climate_change" | "pollution" | "invasive_species"),
        activities: string[],
        impactPathway: string,
        magnitude: {
          severity: number (1-5),
          scope: number (1-5),
          irremediability: number (1-5)
        },
        spatial: {
          extent: string ("on_site" | "local" | "regional" | "global"),
          location: GeoJSON
        },
        temporal: string ("short_term" | "medium_term" | "long_term"),
        affectedSpecies: string[],
        affectedHabitats: string[]
      }]
    - positiveImpacts: [{
        activity: string,
        impactType: string ("restoration" | "conservation" | "sustainable_use"),
        magnitude: number,
        hectares: number,
        benefitedSpecies: string[]
      }]
  Response:
    - assessAnalysis: {
        totalNegativeImpacts: number,
        totalPositiveImpacts: number,
        netImpact: number,
        impactsByDriver: object,
        priorityImpacts: ImpactDriver[] (top 5 by magnitude),
        biodiversityFootprint: {
          landUse: number (MSA·km²·year),
          pollution: number (CTUe),
          climate: number (PDF),
          water: number (PDF)
        },
        msaLoss: number,
        pdfSpecies: number
      }
    - leapStages.assess: { status: "completed", progress: 100 }

# PREPARE Stage
POST /v1/biodiversity/tnfd/assessments/:assessmentId/prepare
  Request:
    - risks: [{
        riskType: string ("physical" | "transition" | "systemic"),
        description: string (required),
        likelihood: number (1-5),
        impact: number (1-5),
        financialImpact: number,
        timeHorizon: string ("short" | "medium" | "long"),
        mitigationActions: string[],
        responsibleParty: string
      }]
    - opportunities: [{
        opportunityType: string ("resource_efficiency" | "market" | "products_services" | "resilience"),
        description: string (required),
        potentialValue: number,
        investmentRequired: number,
        timeHorizon: string,
        actionPlan: string
      }]
    - actionPlan: {
        mitigationHierarchy: [{
          step: string ("avoid" | "minimize" | "restore" | "offset"),
          actions: string[],
          timeline: string,
          budget: number
        }],
        sbtnCommitment: boolean,
        disclosureStrategy: string,
        governanceIntegration: string
      }
  Response:
    - prepareAnalysis: {
        totalRisks: number,
        highRisks: number (score 16-25),
        totalOpportunities: number,
        netFinancialImpact: number,
        actionPlanStatus: string,
        disclosureReadiness: number (0-100%)
      }
    - leapStages.prepare: { status: "completed", progress: 100 }

PUT /v1/biodiversity/tnfd/assessments/:assessmentId/publish
  Response:
    - assessment: TNFDAssessment
    - tnfdDisclosure: {
        executiveSummary: string,
        governanceSection: string,
        strategySection: string,
        riskManagementSection: string,
        metricsTargetsSection: string,
        dataQualityStatement: string
      }
    - publishedAt: timestamp
```

#### Ecosystem Services Endpoints
```yaml
POST /v1/biodiversity/ecosystem-services
  Request:
    - siteId: string (required)
    - serviceCategory: string ("provisioning" | "regulating" | "cultural" | "supporting")
    - serviceType: string (required)
    - description: string
    - quantification: {
        metric: string (e.g., "cubic_meters_water_per_year", "tons_co2_sequestered_per_year"),
        annualFlow: number,
        unit: string
      }
    - valuation: {
        valuationMethod: string ("market_price" | "replacement_cost" | "avoided_cost" | "hedonic_pricing" | "contingent_valuation" | "benefit_transfer"),
        annualValue: number (USD),
        currency: string,
        valuationYear: number,
        assumptions: string,
        references: string[]
      }
    - businessDependency: {
        dependentProcesses: string[],
        criticalityScore: number (1-5),
        substitutability: string,
        riskOfLoss: number (0-100%)
      }
  Response:
    - ecosystemService: EcosystemService
    - serviceId: string

GET /v1/biodiversity/ecosystem-services
  Query:
    - siteId: string (required)
    - serviceCategory: string
    - criticalityScore: number (minimum)
  Response:
    - ecosystemServices: EcosystemService[]
    - totalAnnualValue: number
    - criticalServices: number (score 4-5)
    - valueByCategory: {
        provisioning: number,
        regulating: number,
        cultural: number,
        supporting: number
      }

PUT /v1/biodiversity/ecosystem-services/:serviceId
  Request:
    - quantification: object
    - valuation: object
    - businessDependency: object
  Response:
    - ecosystemService: EcosystemService

POST /v1/biodiversity/natural-capital/balance-sheet
  Request:
    - organizationId: string (required)
    - reportingYear: number (required)
    - assets: [{
        assetType: string ("forest" | "water_resources" | "soil" | "biodiversity"),
        quantity: number,
        unit: string,
        valuation: number,
        depreciationRate: number (annual % decline)
      }]
    - flows: {
        ecosystemServiceValue: number,
        degradationCosts: number,
        restorationInvestments: number
      }
  Response:
    - balanceSheet: {
        openingBalance: number,
        additions: number,
        depletions: number,
        closingBalance: number,
        netChange: number,
        naturalCapitalROI: number (%)
      }
```

#### Biodiversity Impact Metrics Endpoints
```yaml
POST /v1/biodiversity/metrics/msa
  Request:
    - siteId: string (required)
    - calculationYear: number (required)
    - pressures: [{
        pressureType: string ("land_use" | "climate_change" | "nitrogen" | "fragmentation" | "infrastructure"),
        pressureValue: number,
        unit: string
      }]
    - area: number (km²)
    - biome: string
    - region: string
  Response:
    - msaMetric: {
        aggregatedMSA: number (0-100%),
        msaByPressure: {
          landUse: number,
          climateChange: number,
          nitrogen: number,
          fragmentation: number,
          infrastructure: number
        },
        msaLoss: number (% from pristine),
        msaArea: number (MSA·km²),
        temporalTrend: number (% change per year)
      }

POST /v1/biodiversity/metrics/pdf
  Request:
    - organizationId: string (required)
    - calculationYear: number (required)
    - impactCategories: [{
        category: string ("land_use" | "ecotoxicity" | "climate_change" | "water_consumption"),
        impactValue: number,
        unit: string,
        characterizationFactor: number (PDF/unit)
      }]
  Response:
    - pdfMetric: {
        totalPDF: number (species·year),
        pdfByCategory: object,
        pdfByTaxon: {
          mammals: number,
          birds: number,
          plants: number,
          fish: number
        },
        normalizedPDF: number (relative to global baseline)
      }

POST /v1/biodiversity/metrics/footprint
  Request:
    - organizationId: string (required)
    - calculationYear: number (required)
    - scope: string ("direct_operations" | "supply_chain" | "product_lifecycle")
    - methodology: string ("ReCiPe" | "IMPACT_World+" | "LC_IMPACT")
    - inputData: {
        landUse: [{ landType: string, area: number, duration: number }],
        emissions: object,
        resourceConsumption: object,
        wasteGeneration: object
      }
  Response:
    - biodiversityFootprint: {
        totalFootprint: number (PDF or MSA·km²·year),
        landUseFootprint: number,
        pollutionFootprint: number,
        climateFootprint: number,
        waterFootprint: number,
        resourceExtractionFootprint: number,
        supplyChainFootprint: number (if scope includes supply chain),
        footprintIntensity: number (per revenue, per product unit)
      }

POST /v1/biodiversity/metrics/net-impact
  Request:
    - organizationId: string (required)
    - reportingYear: number (required)
    - baseline: {
        baselineYear: number,
        baselineMSA: number,
        baselineSpeciesCount: number,
        baselineHectares: number
      }
    - negativeImpacts: {
        msaLoss: number,
        habitatLost: number (hectares),
        speciesExtirpated: number
      }
    - positiveContributions: {
        msaGain: number,
        habitatRestored: number (hectares),
        speciesReintroduced: number,
        conservationHectares: number
      }
  Response:
    - netImpact: {
        netMSA: number (positive - negative),
        netHabitat: number (hectares),
        netSpecies: number,
        status: string ("net_loss" | "no_net_loss" | "net_positive"),
        offsetRatio: number (positive / negative),
        trajectoryToNetPositive: {
          targetYear: number,
          currentProgress: number (%),
          annualRateRequired: number
        }
      }

POST /v1/biodiversity/metrics/star
  Request:
    - projectType: string ("threat_abatement" | "restoration")
    - location: {
        latitude: number,
        longitude: number,
        ecoregion: string
      }
    - area: number (hectares)
    - threats: string[] (for abatement)
    - restorationActions: string[] (for restoration)
  Response:
    - starScore: {
        starValue: number (STAR per hectare),
        totalSTAR: number (STAR across all hectares),
        speciesBenefited: Species[],
        extinctionRiskReduction: number,
        starByThreat: object (for abatement),
        starByAction: object (for restoration)
      }
    - comparisonBenchmark: number (average STAR for similar projects)
```

#### Nature-Based Solutions Endpoints
```yaml
POST /v1/biodiversity/nbs/projects
  Request:
    - name: string (required)
    - projectType: string ("reforestation" | "wetland_restoration" | "grassland_rehabilitation" | "coral_restoration" | "river_restoration" | "peatland_rewetting")
    - location: {
        siteId: string,
        latitude: number,
        longitude: number,
        boundaries: GeoJSON
      }
    - area: number (hectares, required)
    - timeline: {
        startDate: date (required),
        endDate: date,
        duration: number (years)
      }
    - targetOutcomes: {
        habitatRestored: number (hectares),
        speciesReintroduced: string[],
        carbonSequestered: number (tons CO2),
        waterFiltered: number (cubic meters),
        biodiversityGain: number (MSA increase)
      }
    - budget: number
    - partners: string[]
  Response:
    - project: NbSProject
    - projectId: string
    - estimatedSTAR: number

GET /v1/biodiversity/nbs/projects
  Query:
    - organizationId: string (required)
    - projectType: string
    - status: string ("planned" | "active" | "completed" | "suspended")
    - startDate: date
    - endDate: date
  Response:
    - projects: NbSProject[]
    - totalArea: number (hectares)
    - totalInvestment: number
    - totalCarbonSequestered: number
    - totalBiodiversityGain: number (MSA)

POST /v1/biodiversity/nbs/projects/:projectId/monitoring
  Request:
    - monitoringDate: date (required)
    - survivalRate: number (%, for restoration projects)
    - speciesReturned: string[]
    - ecosystemFunctionRecovery: {
        soilHealth: number (0-100),
        waterQuality: number (0-100),
        vegetationCover: number (%),
        speciesDiversity: number (Shannon index)
      }
    - photos: string[] (S3 URLs)
    - observations: string
  Response:
    - monitoringRecord: MonitoringRecord
    - progressToTarget: number (%)
    - adaptiveManagementRecommendations: string[]

POST /v1/biodiversity/offsets
  Request:
    - impactSiteId: string (required, site being offset)
    - offsetProjectId: string (required, NbS project providing offset)
    - impactDescription: string
    - impactArea: number (hectares)
    - impactBiodiversityLoss: number (MSA or biodiversity units)
    - offsetRatio: number (e.g., 2:1, 10:1)
    - offsetCredits: number (biodiversity units)
    - certification: string ("VCS_Biodiversity" | "Plan_Vivo" | "Gold_Standard" | "ISO_14008")
    - permanence: number (years)
    - additionalityEvidence: string
  Response:
    - offset: BiodiversityOffset
    - offsetId: string
    - residualImpact: number (impact - offset credits)

GET /v1/biodiversity/offsets
  Query:
    - organizationId: string (required)
    - status: string ("planned" | "active" | "retired")
  Response:
    - offsets: BiodiversityOffset[]
    - totalCreditsIssued: number
    - totalCreditsRetired: number
    - netOffsetPosition: number (credits issued - retired)
```

#### Supply Chain Biodiversity Endpoints
```yaml
POST /v1/biodiversity/supply-chain/commodities
  Request:
    - commodity: string ("palm_oil" | "soy" | "timber" | "beef" | "cocoa" | "rubber" | "coffee" | "cotton")
    - annualVolume: number (required)
    - unit: string (required)
    - supplierId: string (required)
    - origins: [{
        country: string (required),
        region: string,
        latitude: number,
        longitude: number,
        volume: number,
        traceabilityLevel: string ("farm" | "cooperative" | "mill" | "district" | "country")
      }]
    - certifications: [{
        scheme: string ("FSC" | "RSPO" | "Rainforest_Alliance" | "Organic"),
        certificateNumber: string,
        expiryDate: date,
        volume: number (certified volume)
      }]
  Response:
    - commodityRiskProfile: {
        overallRisk: string ("low" | "medium" | "high" | "critical"),
        deforestationRisk: number (0-100),
        biodiversityThreat: number (0-100),
        hotspotExposure: boolean,
        protectedAreaProximity: boolean,
        threatenedSpeciesImpact: string[],
        certifiedPercentage: number (%)
      }
    - commodityId: string

GET /v1/biodiversity/supply-chain/commodities
  Query:
    - organizationId: string (required)
    - commodity: string
    - riskLevel: string
    - certificationScheme: string
  Response:
    - commodities: Commodity[]
    - totalVolume: number
    - certifiedVolume: number
    - certifiedPercentage: number
    - highRiskVolume: number
    - hotspotSourcingPercentage: number

POST /v1/biodiversity/supply-chain/deforestation-monitoring
  Request:
    - commodityId: string (required)
    - origins: [{
        originId: string,
        polygon: GeoJSON (farm/mill sourcing area)
      }]
    - cutoffDate: date (required, e.g., "2020-01-01")
    - monitoringPeriod: {
        startDate: date,
        endDate: date
      }
  Response:
    - deforestationAnalysis: {
        forestCoverBaseline: number (hectares),
        forestLoss: number (hectares),
        forestLossPercentage: number,
        compliantOrigins: string[],
        nonCompliantOrigins: string[],
        alertsGenerated: number,
        complianceStatus: string ("compliant" | "potential_violation" | "confirmed_violation")
      }
    - alerts: DeforestationAlert[]

GET /v1/biodiversity/supply-chain/supplier-locations
  Query:
    - organizationId: string (required)
    - tier: number (1, 2, 3+)
  Response:
    - suppliers: Supplier[]
    - locations: {
        type: "FeatureCollection",
        features: GeoJSON[] (supplier facility locations)
      }
    - riskHeatMap: {
        hotspotSuppliers: number,
        protectedAreaProximity: number,
        highConservationValueAreas: number,
        indigenousTerritories: number
      }

POST /v1/biodiversity/supply-chain/certifications
  Request:
    - supplierId: string (required)
    - commodity: string (required)
    - certificationScheme: string (required)
    - certificateNumber: string (required)
    - issuanceDate: date
    - expiryDate: date
    - certifiedVolume: number
    - chainOfCustody: string ("segregated" | "mass_balance" | "book_and_claim")
    - certificateDocument: string (S3 URL)
  Response:
    - certification: Certification
    - certificationId: string
    - verificationStatus: string ("pending" | "verified" | "expired")
```

#### SBTN Target Endpoints
```yaml
POST /v1/biodiversity/sbtn/targets
  Request:
    - targetType: string ("no_net_loss" | "net_positive" | "pressure_reduction" | "state_improvement")
    - pressureCategory: string ("land_use" | "pollution" | "climate" | "water" | "invasive_species" | "exploitation")
    - description: string (required)
    - baseline: {
        baselineYear: number (required),
        baselineValue: number (required),
        baselineMetric: string (required, e.g., "MSA", "hectares", "tons_pesticide")
      }
    - target: {
        targetYear: number (required),
        targetValue: number (required),
        targetMetric: string (required)
      }
    - interimMilestones: [{
        year: number,
        value: number
      }]
    - scope: string ("corporate" | "business_unit" | "site" | "product" | "supply_chain")
    - scienceBasedAlignment: string ("SBTN_AR3-L" | "SBTN_AR3-F" | "SBTN_AR3-O" | "CBD_Kunming-Montreal")
    - organizationId: string (required)
  Response:
    - target: SBTNTarget
    - targetId: string
    - status: "draft"

GET /v1/biodiversity/sbtn/targets
  Query:
    - organizationId: string (required)
    - targetType: string
    - status: string ("draft" | "submitted" | "validated" | "active" | "achieved")
  Response:
    - targets: SBTNTarget[]
    - total: number
    - targetsByType: object
    - overallProgress: number (%)

PUT /v1/biodiversity/sbtn/targets/:targetId
  Request:
    - status: string ("submitted" | "validated" | "active")
    - actionPlan: [{
        initiative: string (required),
        description: string,
        owner: string,
        budget: number,
        timeline: { start: date, end: date },
        expectedContribution: number (toward target)
      }]
  Response:
    - target: SBTNTarget
    - actionPlanStatus: string

POST /v1/biodiversity/sbtn/targets/:targetId/progress
  Request:
    - reportingYear: number (required)
    - currentValue: number (required)
    - progress: number (% to target)
    - achievements: string[]
    - challenges: string[]
    - evidenceLinks: string[]
  Response:
    - progressRecord: TargetProgress
    - onTrack: boolean
    - gapToTarget: number
    - requiredAnnualRate: number

POST /v1/biodiversity/sbtn/action-plans
  Request:
    - targetId: string (required)
    - initiatives: [{
        name: string (required),
        type: string ("restoration" | "conservation" | "sustainable_sourcing" | "pollution_reduction" | "climate_action"),
        description: string,
        responsibleParty: string,
        budget: {
          capex: number,
          opex: number
        },
        timeline: {
          startDate: date,
          completionDate: date,
          milestones: [{ date: date, description: string }]
        },
        kpis: [{
          metric: string,
          targetValue: number,
          reportingFrequency: string
        }],
        expectedImpact: {
          targetContribution: number (% or absolute),
          coBenefits: string[] (e.g., "carbon_sequestration", "community_employment")
        }
      }]
  Response:
    - actionPlan: ActionPlan
    - totalBudget: number
    - totalExpectedImpact: number
    - initiativeCount: number

GET /v1/biodiversity/sbtn/action-plans/:planId/dashboard
  Response:
    - actionPlan: ActionPlan
    - initiatives: Initiative[]
    - overallProgress: number (%)
    - budgetUtilization: number (%)
    - kpiPerformance: {
        [kpiName: string]: {
          current: number,
          target: number,
          onTrack: boolean
        }
      }
    - upcomingMilestones: Milestone[]
    - riskIssues: Issue[]
```

### 1.3 Business Rules

#### Site Assessment Rules
1. All sites >1 hectare require biodiversity baseline assessment within 12 months of operation
2. Sites within 10km of IUCN Category I-IV protected areas require annual monitoring
3. Sites in biodiversity hotspots require comprehensive species inventories (not rapid assessments)
4. Endangered/critically endangered species sightings trigger immediate alert to management
5. Invasive species detections require eradication plan within 30 days

#### TNFD LEAP Rules
1. All LEAP assessments must be completed in order (Locate → Evaluate → Assess → Prepare)
2. Cannot move to next LEAP stage until previous stage is >80% complete
3. High-risk sites (in hotspots/protected areas) require full LEAP analysis annually
4. Medium-risk sites require LEAP reassessment every 2 years
5. Low-risk sites require LEAP reassessment every 3 years or upon material change

#### Ecosystem Services Valuation Rules
1. Valuation methodologies must align with Natural Capital Protocol
2. Discount rate for future ecosystem service flows: 3-7% (align with organizational WACC)
3. Critical dependencies (score 4-5) require business continuity planning
4. Annual ecosystem service value must be recalculated to account for degradation/restoration
5. Dependencies with >25% loss risk require mitigation strategies within 6 months

#### Biodiversity Impact Metrics Rules
1. MSA calculations must use GLOBIO 4 or equivalent methodology
2. PDF calculations must use ReCiPe 2016 or IMPACT World+ characterization factors
3. Biodiversity footprint must include Scope 3 (supply chain) for material commodities
4. Net impact calculations: Offset ratio must be ≥2:1 for no net loss claims
5. STAR calculations must use IUCN STAR tool methodology

#### Nature-Based Solutions Rules
1. All NbS projects must align with IUCN NbS Global Standard
2. Restoration projects require monitoring for ≥5 years post-implementation
3. Survival rate for reforestation must be >70% at year 3 for project success
4. Biodiversity offsets must demonstrate additionality (would not occur without offset)
5. Offset permanence must match or exceed impact duration (minimum 20 years)
6. Offset location must be within same ecoregion as impact (like-for-like)

#### Supply Chain Biodiversity Rules
1. High-risk commodities (palm oil, soy, timber, beef) require 100% traceability to district level by 2025
2. All sourcing from biodiversity hotspots requires third-party certification
3. Deforestation detected after cut-off date triggers supplier suspension pending investigation
4. Suppliers with confirmed deforestation violations: 90-day remediation period or contract termination
5. Suppliers in protected area buffer zones (0-5km) require annual independent audits

#### SBTN Target Rules
1. Science-based nature targets must align with SBTN AR3 guidance
2. Baseline year must be ≤5 years old (or target requires re-baselining)
3. Target year: Near-term (2025-2030) and long-term (2040-2050) required
4. Interim milestones required every 5 years
5. No net loss targets require quantified offset strategy
6. Net positive targets require >10% gain beyond no net loss
7. State improvement targets must reference specific ecosystems or species populations

### 1.4 Error Handling

```yaml
Error Responses:
  400 Bad Request:
    - INVALID_COORDINATES
    - INVALID_HABITAT_TYPE
    - INVALID_CONSERVATION_STATUS
    - INVALID_SBTN_TARGET_STRUCTURE
    - MISSING_BASELINE_DATA
    - LEAP_STAGE_NOT_COMPLETED

  404 Not Found:
    - SITE_NOT_FOUND
    - SPECIES_NOT_FOUND
    - TNFD_ASSESSMENT_NOT_FOUND
    - NBS_PROJECT_NOT_FOUND
    - COMMODITY_NOT_FOUND
    - SBTN_TARGET_NOT_FOUND

  409 Conflict:
    - DUPLICATE_SITE_NAME
    - DUPLICATE_SPECIES_SIGHTING
    - LEAP_STAGE_ALREADY_COMPLETED
    - TARGET_ALREADY_EXISTS

  422 Unprocessable Entity:
    - IBAT_API_ERROR
    - GEOSPATIAL_ANALYSIS_FAILED
    - MSA_CALCULATION_ERROR
    - DEFORESTATION_MONITORING_FAILED
    - INSUFFICIENT_DATA_FOR_VALUATION

  500 Internal Server Error:
    - GEOSPATIAL_SERVICE_UNAVAILABLE
    - EXTERNAL_API_TIMEOUT
    - DATABASE_ERROR
```

## 2. Data Model

### 2.1 MongoDB Collections

#### biodiversity_sites Collection
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  siteType: String ("facility" | "farm" | "mine" | "plantation" | "conservation"),

  location: {
    latitude: Number (indexed, geospatial),
    longitude: Number (indexed, geospatial),
    address: String,
    country: String (indexed),
    region: String,
    coordinates: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  },

  area: {
    hectares: Number,
    boundaries: Object (GeoJSON Polygon),
    boundarySource: String ("GPS_survey" | "satellite_imagery" | "cadastral_map")
  },

  organizationId: String (indexed),
  facilityId: String (optional, link to Organization Service),

  ibatScreening: {
    screeningDate: Date,
    protectedAreas: [{
      name: String,
      iucnCategory: String,
      distance: Number (km),
      overlap: Boolean
    }],
    keyBiodiversityAreas: [{
      name: String,
      kbaId: String,
      distance: Number
    }],
    redListSpecies: [{
      scientificName: String,
      iucnCategory: String,
      occurrenceLikelihood: String
    }],
    riskScore: Number (0-100)
  },

  biome: String,
  ecoregion: String,
  biodiversityHotspot: String (optional),
  waterBasin: String,

  metadata: {
    createdAt: Date (indexed),
    createdBy: String,
    updatedAt: Date,
    updatedBy: String
  }
}

// Indexes
- location.coordinates: 2dsphere (geospatial queries)
- organizationId: 1
- country: 1
- siteType: 1
- ibatScreening.riskScore: -1
```

#### habitat_assessments Collection
```javascript
{
  _id: ObjectId,
  siteId: ObjectId (indexed),

  habitatType: String ("forest" | "wetland" | "grassland" | "marine" | "urban_green" | "agricultural"),
  habitatSubtype: String,

  area: {
    hectares: Number,
    boundaries: Object (GeoJSON Polygon),
    percentOfSite: Number
  },

  condition: String ("pristine" | "good" | "moderate" | "degraded" | "severely_degradated"),
  conditionScore: Number (0-100),

  dominantSpecies: [String],
  structuralComplexity: String ("high" | "medium" | "low"),

  threats: [{
    threat: String,
    severity: String ("low" | "medium" | "high" | "critical"),
    description: String
  }],

  managementActions: [String],

  assessmentDate: Date (indexed),
  assessor: String,

  metadata: {
    createdAt: Date,
    updatedAt: Date
  }
}

// Indexes
- siteId: 1
- habitatType: 1
- condition: 1
- assessmentDate: -1
```

#### species_inventories Collection
```javascript
{
  _id: ObjectId,
  siteId: ObjectId (indexed),
  habitatId: ObjectId (optional),

  species: {
    scientificName: String (indexed),
    commonName: String,
    taxonomicGroup: String ("mammal" | "bird" | "reptile" | "amphibian" | "fish" | "invertebrate" | "plant")
  },

  conservationStatus: {
    iucnCategory: String ("LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX"),
    nationalStatus: String,
    cites: String ("I" | "II" | "III"),
    isEndemic: Boolean,
    isMigratory: Boolean,
    isInvasive: Boolean
  },

  sighting: {
    sightingDate: Date (indexed),
    location: {
      latitude: Number,
      longitude: Number,
      coordinates: { type: "Point", coordinates: [Number, Number] }
    },
    abundance: Number,
    observationType: String ("visual" | "camera_trap" | "acoustic" | "track_sign" | "environmental_dna"),
    evidence: {
      photos: [String],
      recordings: [String],
      notes: String
    },
    observers: [String]
  },

  populationTrend: String ("increasing" | "stable" | "decreasing" | "unknown"),

  metadata: {
    createdAt: Date,
    updatedAt: Date
  }
}

// Indexes
- siteId: 1
- species.scientificName: 1
- conservationStatus.iucnCategory: 1
- conservationStatus.isEndemic: 1
- conservationStatus.isInvasive: 1
- sighting.sightingDate: -1
```

#### protected_areas Collection (Reference Data)
```javascript
{
  _id: ObjectId,
  wdpaId: String (unique, indexed),
  name: String (indexed),

  type: String ("protected_area" | "key_biodiversity_area" | "indigenous_territory" | "ramsar_site" | "world_heritage"),
  iucnCategory: String,

  location: {
    country: String (indexed),
    region: String,
    boundaries: Object (GeoJSON MultiPolygon),
    centroid: { type: "Point", coordinates: [Number, Number] }
  },

  area: {
    hectares: Number,
    marineArea: Number
  },

  designation: {
    designationYear: Number,
    governanceType: String,
    managementAuthority: String
  },

  biodiversitySignificance: {
    criticalHabitat: Boolean,
    endemicSpecies: [String],
    threatenedSpecies: [String]
  },

  dataSource: String ("WDPA" | "IBAT" | "national_registry"),
  lastUpdated: Date
}

// Indexes
- wdpaId: unique
- location.country: 1
- type: 1
- iucnCategory: 1
- location.centroid: 2dsphere
```

#### tnfd_assessments Collection
```javascript
{
  _id: ObjectId,
  name: String,
  organizationId: String (indexed),

  scope: String ("corporate" | "business_unit" | "site" | "product" | "supply_chain"),
  scopeDetails: {
    organizationId: String,
    siteIds: [String],
    productIds: [String],
    supplierIds: [String]
  },

  assessmentYear: Number (indexed),
  framework: String (default: "TNFD_v1.0"),
  status: String ("draft" | "in_progress" | "completed" | "published"),

  leapStages: {
    locate: {
      status: String ("pending" | "in_progress" | "completed"),
      progress: Number (0-100),
      completedDate: Date,
      data: {
        assetCount: Number,
        biomes: [String],
        ecoregions: [String],
        biodiversityHotspots: [String],
        waterBasins: [String],
        protectedAreaProximity: [{
          siteId: String,
          siteName: String,
          protectedAreaName: String,
          distance: Number,
          iucnCategory: String
        }],
        highRiskAssets: [String],
        riskHeatMap: Object (GeoJSON)
      }
    },
    evaluate: {
      status: String,
      progress: Number,
      completedDate: Date,
      data: {
        totalDependencies: Number,
        criticalDependencies: Number,
        dependencies: [{
          serviceType: String,
          businessProcess: String,
          criticalityScore: Number (1-5),
          substitutability: String,
          substitutionCost: Number,
          annualValue: Number,
          riskScenarios: [{
            scenario: String,
            likelihoodOfLoss: Number,
            impactOnOperations: String,
            financialImpact: Number
          }]
        }],
        dependencyRiskScore: Number (0-100),
        financialExposure: Number
      }
    },
    assess: {
      status: String,
      progress: Number,
      completedDate: Date,
      data: {
        totalNegativeImpacts: Number,
        totalPositiveImpacts: Number,
        netImpact: Number,
        impactDrivers: [{
          driver: String,
          activities: [String],
          impactPathway: String,
          magnitude: {
            severity: Number (1-5),
            scope: Number (1-5),
            irremediability: Number (1-5)
          },
          spatial: {
            extent: String,
            location: Object (GeoJSON)
          },
          temporal: String,
          affectedSpecies: [String],
          affectedHabitats: [String]
        }],
        positiveImpacts: [{
          activity: String,
          impactType: String,
          magnitude: Number,
          hectares: Number,
          benefitedSpecies: [String]
        }],
        biodiversityFootprint: {
          landUse: Number,
          pollution: Number,
          climate: Number,
          water: Number
        },
        msaLoss: Number,
        pdfSpecies: Number
      }
    },
    prepare: {
      status: String,
      progress: Number,
      completedDate: Date,
      data: {
        totalRisks: Number,
        highRisks: Number,
        risks: [{
          riskType: String,
          description: String,
          likelihood: Number (1-5),
          impact: Number (1-5),
          riskScore: Number (likelihood * impact),
          financialImpact: Number,
          timeHorizon: String,
          mitigationActions: [String],
          responsibleParty: String
        }],
        opportunities: [{
          opportunityType: String,
          description: String,
          potentialValue: Number,
          investmentRequired: Number,
          timeHorizon: String,
          actionPlan: String
        }],
        actionPlan: {
          mitigationHierarchy: [{
            step: String,
            actions: [String],
            timeline: String,
            budget: Number
          }],
          sbtnCommitment: Boolean,
          disclosureStrategy: String,
          governanceIntegration: String
        },
        netFinancialImpact: Number,
        disclosureReadiness: Number (0-100)
      }
    }
  },

  tnfdDisclosure: {
    executiveSummary: String,
    governanceSection: String,
    strategySection: String,
    riskManagementSection: String,
    metricsTargetsSection: String,
    dataQualityStatement: String
  },

  publishedAt: Date,

  metadata: {
    createdAt: Date (indexed),
    createdBy: String,
    updatedAt: Date,
    updatedBy: String
  }
}

// Indexes
- organizationId: 1
- assessmentYear: -1
- status: 1
- "leapStages.locate.status": 1
- "leapStages.evaluate.status": 1
- "leapStages.assess.status": 1
- "leapStages.prepare.status": 1
```

#### ecosystem_services Collection
```javascript
{
  _id: ObjectId,
  siteId: ObjectId (indexed),

  serviceCategory: String ("provisioning" | "regulating" | "cultural" | "supporting"),
  serviceType: String (indexed),
  description: String,

  quantification: {
    metric: String,
    annualFlow: Number,
    unit: String,
    dataSource: String,
    measurementMethod: String
  },

  valuation: {
    valuationMethod: String,
    annualValue: Number,
    currency: String,
    valuationYear: Number,
    assumptions: String,
    references: [String],
    uncertainty: Number (%)
  },

  businessDependency: {
    dependentProcesses: [String],
    criticalityScore: Number (1-5),
    substitutability: String ("none" | "low" | "medium" | "high"),
    riskOfLoss: Number (0-100)
  },

  trends: {
    historicalData: [{
      year: Number,
      flow: Number,
      value: Number
    }],
    trend: String ("improving" | "stable" | "declining")
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String
  }
}

// Indexes
- siteId: 1
- serviceCategory: 1
- serviceType: 1
- "businessDependency.criticalityScore": -1
```

#### biodiversity_impacts Collection
```javascript
{
  _id: ObjectId,
  organizationId: String (indexed),
  siteId: String (optional, indexed),

  impactType: String ("msa" | "pdf" | "footprint" | "net_impact" | "star"),
  calculationYear: Number (indexed),
  methodology: String,

  // For MSA
  msa: {
    aggregatedMSA: Number (0-100),
    msaByPressure: {
      landUse: Number,
      climateChange: Number,
      nitrogen: Number,
      fragmentation: Number,
      infrastructure: Number
    },
    msaLoss: Number,
    msaArea: Number (MSA·km²),
    temporalTrend: Number
  },

  // For PDF
  pdf: {
    totalPDF: Number,
    pdfByCategory: {
      landUse: Number,
      ecotoxicity: Number,
      climateChange: Number,
      waterConsumption: Number
    },
    pdfByTaxon: {
      mammals: Number,
      birds: Number,
      plants: Number,
      fish: Number
    },
    normalizedPDF: Number
  },

  // For Biodiversity Footprint
  footprint: {
    totalFootprint: Number,
    landUseFootprint: Number,
    pollutionFootprint: Number,
    climateFootprint: Number,
    waterFootprint: Number,
    resourceExtractionFootprint: Number,
    supplyChainFootprint: Number,
    footprintIntensity: Number
  },

  // For Net Impact
  netImpact: {
    baseline: {
      baselineYear: Number,
      baselineMSA: Number,
      baselineSpeciesCount: Number,
      baselineHectares: Number
    },
    negativeImpacts: {
      msaLoss: Number,
      habitatLost: Number,
      speciesExtirpated: Number
    },
    positiveContributions: {
      msaGain: Number,
      habitatRestored: Number,
      speciesReintroduced: Number,
      conservationHectares: Number
    },
    netMSA: Number,
    netHabitat: Number,
    netSpecies: Number,
    status: String ("net_loss" | "no_net_loss" | "net_positive"),
    offsetRatio: Number
  },

  // For STAR
  star: {
    starValue: Number,
    totalSTAR: Number,
    speciesBenefited: [String],
    extinctionRiskReduction: Number,
    starByThreat: Object,
    starByAction: Object
  },

  inputData: Object,
  calculationDetails: Object,

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date
  }
}

// Indexes
- organizationId: 1
- siteId: 1
- impactType: 1
- calculationYear: -1
```

#### nbs_projects Collection
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  organizationId: String (indexed),

  projectType: String ("reforestation" | "wetland_restoration" | "grassland_rehabilitation" | "coral_restoration" | "river_restoration" | "peatland_rewetting"),

  location: {
    siteId: String,
    latitude: Number,
    longitude: Number,
    boundaries: Object (GeoJSON Polygon),
    coordinates: { type: "Point", coordinates: [Number, Number] }
  },

  area: Number (hectares),

  timeline: {
    startDate: Date (indexed),
    endDate: Date,
    duration: Number (years),
    currentPhase: String ("planning" | "implementation" | "monitoring" | "completed")
  },

  targetOutcomes: {
    habitatRestored: Number,
    speciesReintroduced: [String],
    carbonSequestered: Number,
    waterFiltered: Number,
    biodiversityGain: Number (MSA increase)
  },

  actualOutcomes: {
    habitatRestored: Number,
    speciesReturned: [String],
    carbonSequestered: Number,
    waterFiltered: Number,
    biodiversityGain: Number
  },

  budget: Number,
  expenditure: Number,
  partners: [String],

  iucnNbSAlignment: {
    criterion1_societal: Boolean,
    criterion2_biodiversity: Boolean,
    criterion3_net_gain: Boolean,
    criterion4_economic_feasibility: Boolean,
    criterion5_governance: Boolean,
    criterion6_tradeoffs: Boolean,
    criterion7_adaptive: Boolean,
    criterion8_sustainable: Boolean
  },

  monitoringRecords: [{
    monitoringDate: Date,
    survivalRate: Number,
    speciesReturned: [String],
    ecosystemFunctionRecovery: {
      soilHealth: Number (0-100),
      waterQuality: Number (0-100),
      vegetationCover: Number,
      speciesDiversity: Number
    },
    photos: [String],
    observations: String
  }],

  status: String ("planned" | "active" | "completed" | "suspended"),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String
  }
}

// Indexes
- organizationId: 1
- projectType: 1
- status: 1
- "timeline.startDate": -1
- location.coordinates: 2dsphere
```

#### biodiversity_offsets Collection
```javascript
{
  _id: ObjectId,
  organizationId: String (indexed),

  impactSiteId: String (indexed),
  offsetProjectId: String (indexed, ref to nbs_projects),

  impactDescription: String,
  impactArea: Number (hectares),
  impactBiodiversityLoss: Number (MSA or biodiversity units),

  offsetRatio: Number,
  offsetCredits: Number,
  creditsRetired: Number,

  certification: String ("VCS_Biodiversity" | "Plan_Vivo" | "Gold_Standard" | "ISO_14008"),
  certificateNumber: String,

  permanence: Number (years),
  additionalityEvidence: String,

  likeForLikeMatch: {
    habitatType: String,
    ecoregion: String,
    speciesMatch: Boolean
  },

  coBenefits: {
    carbonSequestration: Number (tons CO2),
    waterQuality: Boolean,
    communityEmployment: Number (jobs)
  },

  status: String ("planned" | "active" | "retired"),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    retiredAt: Date
  }
}

// Indexes
- organizationId: 1
- impactSiteId: 1
- offsetProjectId: 1
- status: 1
```

#### supply_chain_biodiversity Collection
```javascript
{
  _id: ObjectId,
  organizationId: String (indexed),
  supplierId: String (indexed),

  commodity: String ("palm_oil" | "soy" | "timber" | "beef" | "cocoa" | "rubber" | "coffee" | "cotton"),
  annualVolume: Number,
  unit: String,

  origins: [{
    originId: String,
    country: String (indexed),
    region: String,
    latitude: Number,
    longitude: Number,
    coordinates: { type: "Point", coordinates: [Number, Number] },
    polygon: Object (GeoJSON, sourcing area),
    volume: Number,
    traceabilityLevel: String ("farm" | "cooperative" | "mill" | "district" | "country")
  }],

  riskProfile: {
    overallRisk: String ("low" | "medium" | "high" | "critical"),
    deforestationRisk: Number (0-100),
    biodiversityThreat: Number (0-100),
    hotspotExposure: Boolean,
    protectedAreaProximity: Boolean,
    threatenedSpeciesImpact: [String]
  },

  certifications: [{
    certificationId: String,
    scheme: String ("FSC" | "RSPO" | "MSC" | "Rainforest_Alliance" | "Organic"),
    certificateNumber: String,
    issuanceDate: Date,
    expiryDate: Date (indexed),
    certifiedVolume: Number,
    chainOfCustody: String ("segregated" | "mass_balance" | "book_and_claim"),
    certificateDocument: String (S3 URL),
    verificationStatus: String ("pending" | "verified" | "expired")
  }],

  deforestationMonitoring: {
    cutoffDate: Date,
    lastMonitoringDate: Date,
    forestCoverBaseline: Number (hectares),
    forestLoss: Number (hectares),
    forestLossPercentage: Number,
    complianceStatus: String ("compliant" | "potential_violation" | "confirmed_violation"),
    alerts: [{
      alertDate: Date,
      originId: String,
      forestLossHectares: Number,
      alertSource: String ("GLAD" | "RADD" | "Planet"),
      investigationStatus: String,
      resolution: String
    }]
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String
  }
}

// Indexes
- organizationId: 1
- supplierId: 1
- commodity: 1
- "riskProfile.overallRisk": 1
- "origins.country": 1
- "certifications.expiryDate": 1
- "deforestationMonitoring.complianceStatus": 1
```

#### sbtn_targets Collection
```javascript
{
  _id: ObjectId,
  organizationId: String (indexed),

  targetType: String ("no_net_loss" | "net_positive" | "pressure_reduction" | "state_improvement"),
  pressureCategory: String ("land_use" | "pollution" | "climate" | "water" | "invasive_species" | "exploitation"),

  description: String,

  baseline: {
    baselineYear: Number (indexed),
    baselineValue: Number,
    baselineMetric: String,
    dataSource: String
  },

  target: {
    targetYear: Number (indexed),
    targetValue: Number,
    targetMetric: String,
    ambitionLevel: String ("minimum" | "moderate" | "high" | "transformative")
  },

  interimMilestones: [{
    year: Number,
    value: Number,
    achieved: Boolean,
    achievedDate: Date
  }],

  scope: String ("corporate" | "business_unit" | "site" | "product" | "supply_chain"),
  scienceBasedAlignment: String ("SBTN_AR3-L" | "SBTN_AR3-F" | "SBTN_AR3-O" | "CBD_Kunming-Montreal"),

  actionPlan: {
    initiatives: [{
      initiativeId: String,
      name: String,
      type: String,
      description: String,
      owner: String,
      budget: { capex: Number, opex: Number },
      timeline: { start: Date, end: Date },
      expectedContribution: Number,
      kpis: [{
        metric: String,
        targetValue: Number,
        currentValue: Number,
        reportingFrequency: String
      }]
    }],
    totalBudget: Number,
    totalExpectedImpact: Number
  },

  progressRecords: [{
    reportingYear: Number,
    currentValue: Number,
    progress: Number (%),
    onTrack: Boolean,
    achievements: [String],
    challenges: [String],
    evidenceLinks: [String],
    reportedDate: Date
  }],

  status: String ("draft" | "submitted" | "validated" | "active" | "achieved"),
  validationDate: Date,
  achievementDate: Date,

  metadata: {
    createdAt: Date (indexed),
    createdBy: String,
    updatedAt: Date,
    updatedBy: String
  }
}

// Indexes
- organizationId: 1
- targetType: 1
- status: 1
- "baseline.baselineYear": 1
- "target.targetYear": 1
```

#### biodiversity_incidents Collection
```javascript
{
  _id: ObjectId,
  siteId: ObjectId (indexed),
  organizationId: String (indexed),

  incidentType: String ("species_harm" | "habitat_destruction" | "pollution_event" | "invasive_introduction" | "illegal_harvest"),
  severity: String ("low" | "medium" | "high" | "critical"),

  incidentDate: Date (indexed),
  discoveryDate: Date,

  location: {
    latitude: Number,
    longitude: Number,
    habitatId: String,
    coordinates: { type: "Point", coordinates: [Number, Number] }
  },

  description: String,

  impact: {
    affectedSpecies: [String],
    affectedArea: Number (hectares),
    estimatedBiodiversityLoss: Number,
    threatenedSpeciesAffected: Boolean
  },

  response: {
    reportedToAuthorities: Boolean,
    reportingDate: Date,
    immediateActions: [String],
    remediationPlan: String,
    remediationCost: Number,
    remediationStatus: String ("planned" | "in_progress" | "completed")
  },

  rootCause: String,
  preventiveMeasures: [String],

  status: String ("open" | "investigating" | "remediation" | "closed"),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    closedAt: Date
  }
}

// Indexes
- siteId: 1
- organizationId: 1
- incidentDate: -1
- severity: 1
- status: 1
```

#### biodiversity_reports Collection
```javascript
{
  _id: ObjectId,
  organizationId: String (indexed),

  reportType: String ("TNFD" | "CDP_Forests" | "GRI_304" | "SBTN" | "CSRD_ESRS_E4"),
  reportingYear: Number (indexed),
  reportingPeriod: {
    startDate: Date,
    endDate: Date
  },

  framework: String,
  frameworkVersion: String,

  sections: {
    governance: {
      boardOversight: String,
      managementRole: String,
      policies: [String]
    },
    strategy: {
      dependencies: Object,
      impacts: Object,
      risksOpportunities: Object
    },
    riskManagement: {
      riskIdentification: String,
      riskAssessment: String,
      riskMitigation: String
    },
    metricsTargets: {
      metrics: [{
        metricName: String,
        value: Number,
        unit: String,
        trend: String
      }],
      targets: [{
        targetName: String,
        baselineYear: Number,
        baselineValue: Number,
        targetYear: Number,
        targetValue: Number,
        currentValue: Number,
        progress: Number
      }]
    }
  },

  disclosures: [{
    disclosureId: String,
    question: String,
    response: String,
    dataPoints: [Object],
    evidence: [String]
  }],

  dataQuality: {
    estimatedDataPercentage: Number,
    measuredDataPercentage: Number,
    uncertaintyLevel: String ("low" | "medium" | "high"),
    assumptions: [String]
  },

  assurance: {
    assured: Boolean,
    assuranceLevel: String ("limited" | "reasonable"),
    assuranceProvider: String,
    assuranceDate: Date,
    assuranceReport: String (S3 URL)
  },

  status: String ("draft" | "review" | "approved" | "submitted" | "published"),
  publishedAt: Date,
  publicURL: String,

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    approvedBy: String,
    approvedAt: Date
  }
}

// Indexes
- organizationId: 1
- reportType: 1
- reportingYear: -1
- status: 1
```

### 2.2 PostgreSQL + PostGIS Tables

#### spatial_biodiversity_features Table
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE spatial_biodiversity_features (
  id UUID PRIMARY KEY,
  feature_type VARCHAR(50) NOT NULL, -- 'site', 'habitat', 'protected_area', 'supply_origin'
  feature_id VARCHAR(100) NOT NULL,
  name VARCHAR(255),
  geometry GEOMETRY(GEOMETRY, 4326) NOT NULL,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_spatial_features_geom ON spatial_biodiversity_features USING GIST (geometry);
CREATE INDEX idx_spatial_features_type ON spatial_biodiversity_features (feature_type);
CREATE INDEX idx_spatial_features_id ON spatial_biodiversity_features (feature_id);
```

### 2.3 Neo4j Graph Schema

#### Biodiversity Impact Network
```cypher
// Nodes
(:Organization {id, name})
(:Site {id, name, location, riskScore})
(:Habitat {id, type, condition, hectares})
(:Species {id, scientificName, iucnCategory, isEndemic})
(:EcosystemService {id, type, annualValue, criticalityScore})
(:Commodity {id, name, riskLevel})
(:Supplier {id, name, tier})
(:NBSProject {id, name, type, area})
(:SBTNTarget {id, description, targetYear, status})

// Relationships
(:Organization)-[:OPERATES]->(:Site)
(:Site)-[:CONTAINS]->(:Habitat)
(:Habitat)-[:SUPPORTS]->(:Species)
(:Site)-[:PROVIDES]->(:EcosystemService)
(:Organization)-[:DEPENDS_ON]->(:EcosystemService)
(:Organization)-[:IMPACTS]->(:Species)
(:Organization)-[:SOURCES]->(:Commodity)
(:Commodity)-[:SUPPLIED_BY]->(:Supplier)
(:Supplier)-[:LOCATED_IN]->(:Site)
(:Organization)-[:IMPLEMENTS]->(:NBSProject)
(:NBSProject)-[:RESTORES]->(:Habitat)
(:NBSProject)-[:BENEFITS]->(:Species)
(:Organization)-[:COMMITTED_TO]->(:SBTNTarget)
(:SBTNTarget)-[:ADDRESSES]->(:Species)
```

## 3. Technical Architecture

### 3.1 Technology Stack

**Core Framework**
- **Runtime**: Node.js 20+
- **Framework**: NestJS 10+
- **Language**: TypeScript 5+

**Databases**
- **Document Store**: MongoDB 7+ (biodiversity data, assessments, TNFD)
- **Geospatial**: PostgreSQL 15+ with PostGIS 3.3+ (spatial analysis, habitat mapping)
- **Graph Database**: Neo4j 5+ (supply chain traceability, ecosystem dependencies)
- **Cache**: Redis 7+ (session management, spatial query cache)

**Geospatial & Mapping**
- **GIS Server**: GeoServer 2.23+ (WMS/WFS services)
- **Tile Server**: MapServer or Mapbox Vector Tiles
- **Geocoding**: Mapbox Geocoding API
- **Satellite Imagery**: Planet Labs API, Google Earth Engine
- **Deforestation Alerts**: Global Forest Watch GLAD API, RADD alerts

**External APIs**
- **IBAT**: Integrated Biodiversity Assessment Tool API
- **IUCN Red List**: Species conservation status API
- **Protected Planet**: WDPA (World Database on Protected Areas) API
- **Global Forest Watch**: Forest change monitoring
- **TNFD Navigator**: TNFD guidance and tools
- **Certification Bodies**: FSC, RSPO, MSC APIs

**Real-time**
- **WebSocket**: Socket.io (real-time species monitoring, alert notifications)
- **Streaming**: Kafka (biodiversity events, monitoring data streams)

**ML/AI (Future)**
- **Species Recognition**: TensorFlow (camera trap image analysis)
- **Acoustic Monitoring**: Audio classification for bird/animal calls
- **Habitat Classification**: Satellite image classification

**Testing**
- **Unit**: Jest
- **Integration**: Supertest
- **E2E**: Cypress
- **Geospatial**: PostGIS test fixtures

### 3.2 Service Dependencies

**Upstream Dependencies** (Services this service depends on):
- **Organization Service (3002)**: Facility data, organizational hierarchies
- **Reference Service (3003)**: Species reference data, protected areas, emission factors
- **Integration Service (3010)**: External API orchestration (IBAT, IUCN, GFW)
- **Climate Risk Service (3018)**: Climate impact on ecosystems
- **Supply Chain Services (3020, 3026)**: Commodity sourcing, supplier data

**Downstream Consumers** (Services that depend on this service):
- **Reporting Service (3044)**: TNFD, CDP Forests, GRI 304, CSRD ESRS E4 reports
- **Strategy Service (3042)**: SBTN target integration
- **Risk Service (3033)**: Nature-related risk data
- **ML Service (3046)**: Biodiversity prediction models
- **Analytics Service (3045)**: Biodiversity dashboards and insights

**External Integrations**:
- **IBAT**: Automated biodiversity screening
- **IUCN Red List**: Species conservation status
- **Protected Planet (WDPA)**: Protected area boundaries
- **Global Forest Watch**: Deforestation alerts
- **Certification Bodies**: FSC, RSPO, MSC verification
- **GeoServer**: WMS/WFS geospatial services

### 3.3 Event-Driven Architecture

**Events Published**:
```typescript
// Biodiversity Assessment Events
'biodiversity.assessment.completed.v1'
'biodiversity.site.created.v1'
'biodiversity.site.risk-level-changed.v1'

// Species Events
'biodiversity.species.sighting.recorded.v1'
'biodiversity.species.threatened.detected.v1'
'biodiversity.species.invasive.detected.v1'

// TNFD Events
'biodiversity.tnfd.leap-stage-completed.v1'
'biodiversity.tnfd.assessment.published.v1'

// Impact & Metrics Events
'biodiversity.impact.calculated.v1'
'biodiversity.msa.updated.v1'
'biodiversity.net-impact.updated.v1'

// NbS Events
'biodiversity.nbs-project.initiated.v1'
'biodiversity.nbs-project.completed.v1'
'biodiversity.offset.registered.v1'
'biodiversity.offset.retired.v1'

// Supply Chain Events
'biodiversity.deforestation.alert.v1'
'biodiversity.commodity.risk-changed.v1'
'biodiversity.certification.expired.v1'

// Target Events
'biodiversity.sbtn-target.set.v1'
'biodiversity.sbtn-target.achieved.v1'
'biodiversity.target.progress.updated.v1'

// Alert Events
'biodiversity.protected-area.proximity-alert.v1'
'biodiversity.incident.reported.v1'
'biodiversity.high-risk-site.identified.v1'
```

**Events Consumed**:
```typescript
// From Organization Service
'organization.facility.created.v1'
'organization.facility.location-updated.v1'
'organization.facility.decommissioned.v1'

// From Supply Chain Services
'supply-chain.supplier.onboarded.v1'
'supply-chain.commodity.purchased.v1'
'supply-chain.supplier.location-updated.v1'

// From Climate Risk Service
'climate.scenario.analyzed.v1'
'climate.physical-risk.assessed.v1'

// From Strategy Service
'strategy.target.approved.v1'
'strategy.initiative.launched.v1'

// From Reference Service
'reference.species-data.updated.v1'
'reference.protected-area.updated.v1'
```

### 3.4 API Design Patterns

**RESTful Endpoints**: Standard CRUD operations (sites, species, assessments)
**GraphQL**: Complex queries across biodiversity data, supply chain, and impacts
**GeoJSON API**: Geospatial data retrieval (habitat boundaries, supply chain origins)
**WebSocket**: Real-time species sightings, deforestation alerts
**Webhook**: External system notifications (IBAT screening results, GFW alerts)

### 3.5 Security Requirements

- **Authentication**: JWT tokens (from Identity Service)
- **Authorization**: RBAC (sustainability managers, analysts, auditors)
- **Data Privacy**: Encrypt sensitive location data (endangered species, indigenous territories)
- **API Rate Limiting**: External API calls (IBAT: 100/day, IUCN: 1000/day)
- **Geospatial Data Masking**: Blur exact locations for critically endangered species
- **Audit Trail**: All biodiversity assessment changes, TNFD disclosure approvals

### 3.6 Performance Requirements

**Response Time**:
- Simple queries (site list): <200ms p95
- Geospatial queries (habitat mapping): <500ms p95
- IBAT screening: <3 seconds (external API dependency)
- MSA/PDF calculations: <2 seconds
- TNFD LEAP analysis: <10 seconds (full assessment)

**Throughput**:
- 100 requests/second (peak)
- 10,000+ sites supported
- 1M+ geospatial features (habitats, protected areas)
- 100K+ species sightings/year

**Data Volume**:
- 50GB biodiversity data (sites, species, assessments)
- 500GB geospatial data (PostGIS: habitat polygons, protected areas)
- 10GB Neo4j (supply chain biodiversity network)

**Caching Strategy**:
- Redis: Protected area proximity queries (1-hour TTL)
- Redis: IBAT screening results (24-hour TTL)
- Redis: MSA/PDF calculations (7-day TTL, invalidate on data change)
- CDN: Public habitat maps, TNFD disclosures

## 4. Integration Specifications

### 4.1 IBAT (Integrated Biodiversity Assessment Tool)

**Purpose**: Automated biodiversity screening for sites

**Authentication**: API key

**Endpoints**:
```yaml
POST /ibat/screening
  Request:
    - latitude: number
    - longitude: number
    - radius: number (km)
  Response:
    - protectedAreas: ProtectedArea[]
    - keyBiodiversityAreas: KBA[]
    - redListSpecies: Species[]
    - riskScore: number
```

**Rate Limit**: 100 screenings/day (paid tier)

**Error Handling**: Fallback to cached WDPA data if IBAT unavailable

### 4.2 IUCN Red List API

**Purpose**: Species conservation status lookup

**Authentication**: API token

**Endpoints**:
```yaml
GET /species/{scientific_name}
  Response:
    - category: string ("LC" | "NT" | "VU" | "EN" | "CR")
    - populationTrend: string
    - threats: Threat[]
    - conservationActions: Action[]
```

**Rate Limit**: 1000 requests/day

**Caching**: Cache species data for 30 days (Red List updates quarterly)

### 4.3 Protected Planet (WDPA) API

**Purpose**: Protected area boundaries and metadata

**Authentication**: Public API (no key required)

**Endpoints**:
```yaml
GET /protected_areas
  Query:
    - latitude: number
    - longitude: number
    - radius: number (km)
  Response:
    - protectedAreas: ProtectedArea[]
    - boundaries: GeoJSON
```

**Data Source**: Monthly WDPA database download for bulk import

### 4.4 Global Forest Watch (GFW) API

**Purpose**: Deforestation monitoring and alerts

**Authentication**: API key

**Endpoints**:
```yaml
POST /glad-alerts
  Request:
    - geostore: string (polygon ID)
    - startDate: date
    - endDate: date
  Response:
    - alerts: [{
        latitude: number,
        longitude: number,
        confidence: string,
        date: date
      }]
    - totalAlerts: number
```

**Webhook Integration**: Subscribe to GLAD/RADD alerts for monitored polygons

**Rate Limit**: 10,000 requests/month

### 4.5 Certification Body APIs

**FSC (Forest Stewardship Council)**:
- Certificate verification
- Chain of custody tracking

**RSPO (Roundtable on Sustainable Palm Oil)**:
- RSPO member lookup
- Certified mill locations

**MSC (Marine Stewardship Council)**:
- Certified fishery lookup
- Product traceability

**Authentication**: API keys (per certification scheme)

**Verification Frequency**: Daily certificate expiry checks

## 5. Deployment & Operations

### 5.1 Infrastructure Requirements

**AWS Services**:
- **ECS/EKS**: Container orchestration
- **RDS for PostgreSQL + PostGIS**: Geospatial database
- **DocumentDB (MongoDB)**: Biodiversity data
- **Neptune**: Graph database (alternative to self-hosted Neo4j)
- **S3**: Photos, reports, GIS files
- **CloudFront**: CDN for maps
- **Lambda**: Deforestation alert processing
- **EventBridge**: Event routing

**GIS Infrastructure**:
- **GeoServer**: EC2 instance or ECS container
- **Tile Cache**: S3 + CloudFront or Mapbox hosting
- **Basemap**: Mapbox, OpenStreetMap, or Esri

**Compute**:
- **Production**: 4 vCPU, 8GB RAM (auto-scaling 2-10 instances)
- **Development**: 2 vCPU, 4GB RAM (1 instance)

**Storage**:
- **MongoDB**: 100GB (provisioned IOPS)
- **PostgreSQL + PostGIS**: 1TB (geospatial data, high IOPS)
- **Neo4j**: 50GB SSD
- **S3**: 500GB (photos, reports, GIS files)

### 5.2 Monitoring & Alerting

**Metrics**:
- API response times (p50, p95, p99)
- Geospatial query performance
- External API availability (IBAT, GFW, IUCN)
- Database query performance (PostGIS spatial queries)
- Cache hit rates (Redis)

**Alerts**:
- Deforestation alert processing lag >1 hour
- IBAT API failure rate >5%
- PostGIS query response time >1 second
- Threatened species sighting detected
- High-risk site identified (in hotspot/protected area)

**Dashboards**:
- Biodiversity risk heatmap (global sites)
- TNFD LEAP completion status
- Deforestation monitoring status (% compliant suppliers)
- NbS project progress (hectares restored)
- SBTN target performance (% to goal)

### 5.3 Disaster Recovery

**Backup Strategy**:
- **MongoDB**: Daily full backup, 6-hour point-in-time recovery
- **PostgreSQL + PostGIS**: Daily full backup, hourly incremental, 30-day retention
- **Neo4j**: Daily full backup, 7-day retention
- **S3**: Cross-region replication

**RTO**: 4 hours (restore from backup)
**RPO**: 1 hour (maximum data loss)

**Failover**:
- Multi-AZ deployment for databases
- Active-passive failover for application tier
- Global Forest Watch webhook queue (SQS) for alert resilience

## 6. Compliance & Standards

### 6.1 Regulatory Frameworks

**TNFD (Taskforce on Nature-related Financial Disclosures)**:
- LEAP analysis framework
- Risk and opportunity disclosure
- Metrics and targets

**SBTN (Science Based Targets for Nature)**:
- AR3 (Assessment, Reduction, Regeneration) framework
- Land, freshwater, ocean, biodiversity integrity targets
- Target validation requirements

**CSRD ESRS E4 (Biodiversity and Ecosystems)**:
- Double materiality assessment
- Impact, risk, opportunity analysis
- Biodiversity metrics and targets

**GRI 304 (Biodiversity)**:
- Operational sites in/near protected areas
- Significant impacts on biodiversity
- Habitats protected or restored

**CDP Forests**:
- Deforestation-free commodity sourcing
- Forest risk commodity management
- Forest-related risks and opportunities

**Convention on Biological Diversity (CBD)**:
- Kunming-Montreal Global Biodiversity Framework
- 30x30 conservation targets
- Biodiversity mainstreaming

**EU Taxonomy**:
- DNSH (Do No Significant Harm) biodiversity criteria
- Substantial contribution to biodiversity and ecosystems

**IFC Performance Standard 6 (Biodiversity)**:
- Mitigation hierarchy
- Critical habitat protection
- Biodiversity offsets

### 6.2 Reporting Standards

**TNFD Recommended Disclosures**:
- Governance (A, B, C)
- Strategy (A, B, C, D)
- Risk & Impact Management (A, B, C, D, E)
- Metrics & Targets (A, B, C)

**SBTN Initial Target-Setting Guidance**:
- Step 1: Assess
- Step 2: Interpret & Prioritize
- Step 3: Measure, Set & Disclose
- Step 4: Act

**GRI 304 Disclosure Items**:
- 304-1: Operational sites in/near protected areas
- 304-2: Significant impacts on biodiversity
- 304-3: Habitats protected or restored
- 304-4: IUCN Red List species in areas of operation

**CDP Forests Questionnaire**:
- F1: Forest Risk Commodities
- F2: Procedures
- F3: Risks and Opportunities
- F4: Governance
- F6: Implementation
- F7: Verification
- F8: Barriers and Challenges

### 6.3 Certification & Assurance

**Third-Party Certifications**:
- FSC (Forest Stewardship Council)
- RSPO (Roundtable on Sustainable Palm Oil)
- MSC (Marine Stewardship Council)
- Rainforest Alliance
- Plan Vivo (biodiversity offsets)
- VCS Biodiversity (Verified Carbon Standard)

**Assurance Requirements**:
- TNFD disclosures: Limited assurance recommended
- SBTN targets: Third-party validation required
- Biodiversity offsets: Independent verification mandatory

**Data Quality Standards**:
- Primary data: Measured/monitored (preferred)
- Secondary data: Published studies, databases (acceptable)
- Estimated data: Documented assumptions, uncertainty quantified
- Expert judgment: Justification, peer review

## 7. Testing Strategy

### 7.1 Unit Tests (Target: 90% coverage)

**Focus Areas**:
- MSA/PDF calculation algorithms
- TNFD LEAP scoring logic
- Geospatial distance calculations
- Offset ratio calculations
- Risk scoring algorithms

**Frameworks**: Jest, ts-jest

### 7.2 Integration Tests (Target: 80% coverage)

**Test Scenarios**:
- Site creation → IBAT screening → Risk scoring
- Species sighting → Conservation status lookup (IUCN) → Alert generation
- Commodity sourcing → Deforestation monitoring (GFW) → Alert notification
- TNFD LEAP workflow (Locate → Evaluate → Assess → Prepare)
- SBTN target setting → Action plan → Progress tracking
- NbS project → Monitoring → Offset credit issuance

**Frameworks**: Supertest, TestContainers (MongoDB, PostgreSQL + PostGIS)

### 7.3 Geospatial Tests

**Test Cases**:
- Protected area proximity queries (<10km, 10-50km, >50km)
- Habitat polygon intersection (site overlaps with protected area)
- Deforestation polygon change detection
- Supply chain origin mapping (farm to facility)
- Biodiversity hotspot overlay

**Test Data**: Real-world protected area boundaries (WDPA sample), synthetic habitat polygons

### 7.4 E2E Tests

**User Journeys**:
1. **Site Assessment**: Create site → Run IBAT screening → Review risk score → Conduct baseline assessment
2. **TNFD LEAP**: Initiate assessment → Complete Locate → Complete Evaluate → Complete Assess → Complete Prepare → Publish disclosure
3. **Deforestation Monitoring**: Import commodity origins → Set up GFW monitoring → Receive alert → Investigate → Take action
4. **SBTN Target**: Set no net loss target → Create action plan → Log progress → Achieve target
5. **NbS Project**: Initiate restoration → Monitor progress → Verify outcomes → Issue offset credits

**Frameworks**: Cypress, Playwright

### 7.5 Performance Tests

**Load Scenarios**:
- 100 concurrent users viewing biodiversity dashboards
- Bulk IBAT screening (1000 sites)
- Real-time deforestation alert processing (100 alerts/minute)
- Geospatial query load (PostGIS: 50 queries/second)

**Performance Targets**:
- API response: <500ms p95 (geospatial queries)
- IBAT screening: <3 seconds
- MSA calculation: <2 seconds
- Deforestation alert processing: <10 seconds

**Frameworks**: K6, Artillery

## 8. Migration & Data Seeding

### 8.1 Reference Data Seeding

**Protected Areas (WDPA)**:
- Download monthly WDPA database (GeoPackage format)
- Import to PostgreSQL + PostGIS (`spatial_biodiversity_features` table)
- Load ~265,000 protected areas globally
- Create spatial index for fast proximity queries

**IUCN Red List Species**:
- Download IUCN Red List data (CSV format)
- Import to MongoDB (`reference.species` collection in Reference Service)
- Load ~150,000 species with conservation status
- Sync monthly

**Biodiversity Hotspots**:
- Conservation International 36 hotspots (GeoJSON)
- Import to PostgreSQL + PostGIS
- Load ~1,000 hotspot polygons

**Ecoregions**:
- WWF Terrestrial Ecoregions of the World (Shapefile)
- Import to PostgreSQL + PostGIS
- Load ~867 ecoregions globally

### 8.2 Development Test Data

**Sample Sites** (10 sites across risk levels):
- 3 high-risk sites (in biodiversity hotspots)
- 4 medium-risk sites (near protected areas)
- 3 low-risk sites (urban/agricultural)

**Sample Species Inventories**:
- 50 species sightings per site
- Mix of threatened (20%), endemic (10%), invasive (5%)

**Sample TNFD Assessments** (3 completed):
- 1 corporate-level
- 1 business-unit
- 1 site-level

**Sample NbS Projects** (5 projects):
- 2 reforestation
- 1 wetland restoration
- 1 coral restoration
- 1 peatland rewetting

**Sample SBTN Targets** (5 targets):
- 1 no net loss
- 1 net positive
- 2 pressure reduction
- 1 state improvement

### 8.3 Production Data Migration (Future)

**Legacy Biodiversity Data** (if migrating from existing system):
- Extract site data → Map to biodiversity_sites schema
- Extract species data → Map to species_inventories schema
- Extract impact assessments → Map to tnfd_assessments schema
- Extract restoration projects → Map to nbs_projects schema

**Validation Rules**:
- All sites have valid lat/long coordinates
- All species have valid scientific names (verify against IUCN)
- All TNFD assessments have completed LEAP stages
- All SBTN targets have baseline year ≤ current year

## 9. API Documentation

### 9.1 OpenAPI/Swagger

**Swagger UI**: Available at `/api/biodiversity/docs`

**API Versioning**: `/v1/biodiversity/*` (current), `/v2/biodiversity/*` (future)

**Request/Response Examples**: Included in all endpoint definitions

**Error Codes**: Comprehensive error code registry

### 9.2 Postman Collection

**Collection Structure**:
- **Sites & Assessments**: CRUD operations, IBAT screening
- **Habitats & Species**: Habitat mapping, species tracking
- **TNFD LEAP**: Full LEAP workflow (Locate → Evaluate → Assess → Prepare)
- **Ecosystem Services**: Valuation, dependency mapping
- **Biodiversity Metrics**: MSA, PDF, footprint, net impact, STAR
- **NbS & Offsets**: Restoration projects, offset management
- **Supply Chain**: Commodity risk, deforestation monitoring, certifications
- **SBTN Targets**: Target setting, action plans, progress tracking

**Environment Variables**: Development, staging, production

## 10. Glossary

**Biodiversity**: Variability among living organisms from all sources (terrestrial, marine, other aquatic ecosystems)

**Biome**: Large naturally occurring community of flora and fauna (e.g., tropical rainforest, tundra, savanna)

**Ecoregion**: Ecologically distinct area with characteristic biodiversity patterns (WWF classification)

**Biodiversity Hotspot**: Region with exceptional concentrations of endemic species undergoing exceptional loss of habitat (Conservation International definition: >1,500 endemic vascular plants, >70% habitat loss)

**Key Biodiversity Area (KBA)**: Sites contributing significantly to the global persistence of biodiversity

**IUCN Red List Categories**:
- **LC**: Least Concern
- **NT**: Near Threatened
- **VU**: Vulnerable
- **EN**: Endangered
- **CR**: Critically Endangered
- **EW**: Extinct in the Wild
- **EX**: Extinct

**MSA (Mean Species Abundance)**: Measure of biodiversity intactness, expressed as % of original species abundance remaining (0-100%)

**PDF (Potentially Disappeared Fraction)**: Expected fraction of species that may become extinct due to environmental impacts (species·year)

**STAR (Species Threat Abatement and Restoration)**: Metric quantifying contributions to reducing global species extinction risk

**TNFD LEAP**: Locate, Evaluate, Assess, Prepare - TNFD's four-stage nature risk assessment framework

**SBTN**: Science Based Targets Network - organization developing science-based targets for nature (land, freshwater, ocean, biodiversity)

**Mitigation Hierarchy**: Avoid → Minimize → Restore → Offset (sequential steps for addressing biodiversity impacts)

**No Net Loss**: Development and conservation actions designed to ensure that impacts on biodiversity are balanced by measures to avoid and minimize impacts, restore affected ecosystems, and offset residual impacts

**Net Positive Impact**: Development and conservation actions designed to deliver net gains for biodiversity (beyond no net loss)

**Nature-Based Solutions (NbS)**: Actions to protect, sustainably manage, and restore natural or modified ecosystems that address societal challenges effectively and adaptively (IUCN definition)

**High Conservation Value (HCV)**: Biological, ecological, social, or cultural values of outstanding significance or critical importance

**FPIC (Free, Prior and Informed Consent)**: Principle that indigenous peoples have the right to give or withhold consent to activities affecting their lands

---

**Document Version**: 1.0
**Last Updated**: November 20, 2025
**Service Owner**: Biodiversity Agent
**Review Cycle**: Quarterly (align with TNFD updates, IUCN Red List releases)
