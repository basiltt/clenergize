# Service Specification: Energy Service

## Service Overview

**Service Name**: Energy Service
**Port**: 3015
**Purpose**: Manages comprehensive energy consumption tracking, renewable energy transition, energy efficiency programs, and ISO 50001 energy management systems
**Domain**: Environmental - Energy Management
**Team Ownership**: Environmental Domain Team
**Phase**: 3 (Environmental Domain)
**Story Points**: 40
**Priority**: HIGH (Critical for Scope 2 emissions, RE100, and ISO 50001)

## 1. Functional Requirements

### 1.1 Core Features

#### Energy Consumption Tracking
- Multi-source energy tracking (electricity, natural gas, diesel, fuel oil, propane, coal, biomass)
- Facility-level, equipment-level, and process-level metering
- IoT smart meter integration for real-time monitoring
- Peak demand tracking and load profiling
- Time-of-use (TOU) energy tracking
- Energy balance calculations (inputs vs. outputs)
- Interval data collection (15-minute, hourly, daily)
- Estimated vs. metered consumption tracking
- Energy source mix tracking (grid, on-site generation)
- Degree day normalization for weather adjustments

#### Renewable Energy Management
- On-site renewable generation tracking (solar PV, wind, hydro, geothermal, biomass)
- Renewable energy procurement tracking (PPAs, VPPAs, green tariffs)
- Renewable Energy Certificates (RECs) management:
  - REC purchase tracking
  - REC retirement tracking
  - REC registry integration (M-RETS, PJM-GATS, APX TIGR, I-RECs)
- Guarantees of Origin (GOs) for European markets
- RE100 progress tracking (% renewable electricity)
- Behind-the-meter (BTM) vs. grid renewable split
- Virtual power purchase agreements (VPPAs) management
- Community solar participation tracking
- Green tariff contracts management
- Carbon-free energy (CFE) tracking (24/7 matching)

#### Energy Efficiency Programs
- Energy intensity metrics calculation:
  - kWh per unit of production
  - kWh per square foot
  - kWh per revenue dollar
  - kWh per employee
  - Custom intensity metrics
- Efficiency improvement project tracking:
  - LED lighting upgrades
  - HVAC optimization
  - Variable frequency drives (VFDs)
  - Building envelope improvements
  - Process optimization
  - Compressed air system improvements
  - Motor upgrades
- Energy savings verification (M&V protocols - IPMVP):
  - Option A: Retrofit isolation with key parameter measurement
  - Option B: Retrofit isolation with all parameter measurement
  - Option C: Whole facility measurement
  - Option D: Calibrated simulation
- Commissioning and retro-commissioning tracking
- Behavioral change program management
- Energy efficiency ROI and payback calculations
- Avoided cost analysis

#### Energy Management System (ISO 50001)
- Energy policy and objectives management
- Energy baseline establishment and updates
- Energy performance indicators (EnPIs):
  - Static EnPIs (absolute consumption)
  - Regression-based EnPIs (normalized)
  - Engineering-based EnPIs (theoretical)
- Significant energy use (SEU) identification and tracking
- Operational controls and procedures
- Energy audit management and results tracking
- Energy review process support
- Management review preparation
- ISO 50001 certification readiness assessment
- Energy action plan tracking
- Competence and training tracking
- Energy design considerations

#### Grid & Market Integration
- Real-time electricity pricing integration:
  - Time-of-use (TOU) rates
  - Real-time pricing (RTP)
  - Critical peak pricing (CPP)
- Demand response (DR) program participation:
  - DR event tracking
  - Load curtailment verification
  - DR incentive calculations
  - Automated DR (AutoDR) integration
- Grid carbon intensity tracking:
  - Location-based grid factors (regional averages)
  - Market-based factors (supplier-specific)
  - Real-time marginal emissions (WattTime, ElectricityMap)
  - Carbon-free energy percentage (24/7 CFE)
- Energy arbitrage opportunity identification
- Battery energy storage system (BESS) management:
  - Charge/discharge optimization
  - State of charge (SOC) monitoring
  - Battery health tracking
  - Grid services participation (frequency regulation, peak shaving)
- Vehicle-to-grid (V2G) integration
- Microgrid management

#### Scope 2 Emissions Integration
- Location-based Scope 2 calculations:
  - Regional grid emission factors
  - Transmission and distribution (T&D) losses
- Market-based Scope 2 calculations:
  - Supplier-specific emission factors
  - Contractual instruments (RECs, GOs, PPAs)
  - Residual mix factors
- Dual reporting compliance (GHG Protocol Scope 2 Guidance)
- REC retirement tracking for Scope 2 claims
- Quality criteria assessment:
  - Vintage (same calendar year)
  - Geography (same market)
  - Additionality
  - Vintage alignment with consumption
- Carbon-free energy (CFE) score calculation (24/7 matching)
- Avoided emissions from renewable energy

#### Energy Procurement Strategy
- Competitive procurement planning and RFP management
- Supplier contract management:
  - Fixed-price contracts
  - Index-based contracts
  - Green tariffs
  - PPAs (physical and financial)
  - Community choice aggregation (CCA)
- Price forecasting and hedging strategies
- Green tariff evaluation and comparison
- Community solar participation management
- Aggregated purchasing coordination
- Contract renewal tracking
- Supplier performance tracking
- Energy spend analytics

### 1.2 API Endpoints

#### Energy Consumption Endpoints
```yaml
POST /v1/energy/consumption
  Description: Record energy consumption data
  Request:
    - facilityId: string (required, ref to organization service)
    - meterId: string (optional, for metered data)
    - energySource: string (required, "electricity" | "natural_gas" | "diesel" | "fuel_oil" | "propane" | "coal" | "biomass")
    - consumptionAmount: number (required)
    - unit: string (required, "kWh" | "MWh" | "GWh" | "therms" | "MMBtu" | "GJ")
    - startDate: Date (required)
    - endDate: Date (required)
    - intervalType: string (required, "15min" | "hourly" | "daily" | "monthly")
    - readingType: string (required, "metered" | "estimated" | "calculated")
    - peakDemand: number (optional, kW or MW)
    - loadProfile: object (optional, time-series data)
    - cost: number (optional)
    - metadata: object (optional)
  Response:
    - consumptionId: string
    - facilityId: string
    - energySource: string
    - consumptionAmount: number
    - unit: string
    - carbonIntensity: number (optional, if available)
    - timestamp: Date

GET /v1/energy/consumption
  Description: Query energy consumption data
  Query:
    - facilityId: string (optional)
    - organizationId: string (optional)
    - energySource: string (optional)
    - startDate: Date (required)
    - endDate: Date (required)
    - intervalType: string (optional)
    - aggregation: string (optional, "sum" | "avg" | "max" | "min")
    - groupBy: string (optional, "facility" | "source" | "day" | "month")
    - page: number (optional)
    - limit: number (optional)
  Response:
    - consumptions: ConsumptionRecord[]
    - total: number
    - aggregated: object (if aggregation requested)
    - page: number
    - metadata: object

GET /v1/energy/consumption/:consumptionId
  Description: Get specific consumption record
  Response:
    - consumption: ConsumptionRecord
    - associatedEvents: Event[]

PUT /v1/energy/consumption/:consumptionId
  Description: Update consumption record
  Request:
    - consumptionAmount: number (optional)
    - readingType: string (optional)
    - metadata: object (optional)
  Response:
    - consumption: ConsumptionRecord

DELETE /v1/energy/consumption/:consumptionId
  Description: Delete consumption record
  Response:
    - success: boolean
    - message: string
```

#### Smart Meter Management Endpoints
```yaml
POST /v1/energy/meters
  Description: Register smart meter or sub-meter
  Request:
    - meterName: string (required)
    - meterType: string (required, "main" | "sub-meter" | "virtual")
    - facilityId: string (required)
    - energySource: string (required)
    - manufacturer: string (optional)
    - model: string (optional)
    - serialNumber: string (optional)
    - meterIdentifier: string (required, utility meter ID)
    - location: object (optional, GPS coordinates)
    - equipmentId: string (optional, for equipment-level meters)
    - collectionFrequency: string (required, "15min" | "hourly" | "daily")
    - communicationProtocol: string (optional, "MQTT" | "Modbus" | "BACnet")
    - status: string (required, "active" | "inactive" | "maintenance")
    - metadata: object (optional)
  Response:
    - meterId: string
    - meterName: string
    - facilityId: string
    - energySource: string
    - status: string

GET /v1/energy/meters
  Description: List all meters
  Query:
    - facilityId: string (optional)
    - organizationId: string (optional)
    - energySource: string (optional)
    - status: string (optional)
    - page: number
    - limit: number
  Response:
    - meters: Meter[]
    - total: number
    - page: number

GET /v1/energy/meters/:meterId
  Description: Get meter details
  Response:
    - meter: Meter
    - latestReading: Reading
    - healthStatus: object

PUT /v1/energy/meters/:meterId
  Description: Update meter configuration
  Request:
    - status: string (optional)
    - collectionFrequency: string (optional)
    - metadata: object (optional)
  Response:
    - meter: Meter

DELETE /v1/energy/meters/:meterId
  Description: Decommission meter
  Response:
    - success: boolean

GET /v1/energy/meters/:meterId/readings
  Description: Get meter reading history
  Query:
    - startDate: Date
    - endDate: Date
    - intervalType: string (optional)
  Response:
    - readings: Reading[]
    - total: number
```

#### Renewable Energy Generation Endpoints
```yaml
POST /v1/energy/renewable/generation
  Description: Record on-site renewable generation
  Request:
    - facilityId: string (required)
    - systemId: string (required, ref to renewable system)
    - renewableType: string (required, "solar_pv" | "wind" | "hydro" | "geothermal" | "biomass")
    - generationAmount: number (required)
    - unit: string (required, "kWh" | "MWh" | "GWh")
    - startDate: Date (required)
    - endDate: Date (required)
    - selfConsumed: number (optional, amount used on-site)
    - exportedToGrid: number (optional, amount sold to grid)
    - intervalType: string (required, "15min" | "hourly" | "daily" | "monthly")
    - metadata: object (optional)
  Response:
    - generationId: string
    - facilityId: string
    - renewableType: string
    - generationAmount: number
    - selfConsumed: number
    - exportedToGrid: number

GET /v1/energy/renewable/generation
  Description: Query renewable generation data
  Query:
    - facilityId: string (optional)
    - organizationId: string (optional)
    - renewableType: string (optional)
    - startDate: Date (required)
    - endDate: Date (required)
    - aggregation: string (optional)
  Response:
    - generations: GenerationRecord[]
    - total: number
    - aggregated: object

POST /v1/energy/renewable/systems
  Description: Register renewable energy system
  Request:
    - systemName: string (required)
    - facilityId: string (required)
    - renewableType: string (required)
    - capacity: number (required, kW or MW)
    - installationDate: Date (required)
    - manufacturer: string (optional)
    - model: string (optional)
    - warrantyExpiry: Date (optional)
    - performanceRatio: number (optional, %)
    - degradationRate: number (optional, % per year)
    - metadata: object (optional)
  Response:
    - systemId: string
    - systemName: string
    - renewableType: string
    - capacity: number

GET /v1/energy/renewable/systems
  Description: List renewable systems
  Query:
    - facilityId: string (optional)
    - organizationId: string (optional)
    - renewableType: string (optional)
  Response:
    - systems: RenewableSystem[]
    - totalCapacity: number
```

#### Renewable Energy Certificate (REC) Endpoints
```yaml
POST /v1/energy/recs/purchase
  Description: Record REC purchase
  Request:
    - recType: string (required, "REC" | "GO" | "I-REC")
    - quantity: number (required, MWh)
    - vintage: number (required, year)
    - registry: string (required, "M-RETS" | "PJM-GATS" | "APX_TIGR" | "I-REC")
    - certificateIds: string[] (required, certificate numbers)
    - generationSource: string (required, "solar" | "wind" | "hydro" | "biomass")
    - generationLocation: string (required, country/state)
    - generationFacility: string (optional)
    - purchaseDate: Date (required)
    - vintageYear: number (required)
    - price: number (optional)
    - currency: string (optional)
    - supplier: string (required)
    - contractType: string (required, "bundled" | "unbundled")
    - isAdditional: boolean (optional)
    - metadata: object (optional)
  Response:
    - purchaseId: string
    - recType: string
    - quantity: number
    - vintage: number
    - certificateIds: string[]
    - status: "active"

POST /v1/energy/recs/retire
  Description: Retire RECs for Scope 2 claims
  Request:
    - purchaseId: string (required)
    - quantityToRetire: number (required, MWh)
    - retirementReason: string (required, "scope2_claim" | "voluntary" | "compliance")
    - retirementPeriod: object (required, { year: number, month?: number })
    - beneficiary: string (required, organization claiming)
    - registryRetirementId: string (optional)
    - notes: string (optional)
  Response:
    - retirementId: string
    - purchaseId: string
    - quantityRetired: number
    - retirementDate: Date
    - certificateIds: string[]

GET /v1/energy/recs/inventory
  Description: Get current REC inventory
  Query:
    - organizationId: string (required)
    - vintage: number (optional)
    - status: string (optional, "active" | "retired" | "expired")
  Response:
    - inventory: RecInventory[]
    - totalActive: number (MWh)
    - totalRetired: number (MWh)
    - vintageBreakdown: object

GET /v1/energy/recs/quality-check
  Description: Validate REC quality for Scope 2 claims
  Query:
    - purchaseId: string (required)
    - claimYear: number (required)
    - claimLocation: string (required)
  Response:
    - isValid: boolean
    - qualityCriteria: object
      - vintageMatch: boolean
      - geographyMatch: boolean
      - isAdditional: boolean
      - registryRecognized: boolean
    - warnings: string[]
```

#### Energy Efficiency Project Endpoints
```yaml
POST /v1/energy/efficiency/projects
  Description: Create energy efficiency project
  Request:
    - projectName: string (required)
    - facilityId: string (required)
    - projectType: string (required, "lighting" | "hvac" | "motors" | "building_envelope" | "process" | "behavioral" | "other")
    - description: string (required)
    - startDate: Date (required)
    - expectedCompletionDate: Date (required)
    - expectedSavings: number (required, kWh/year)
    - expectedCostSavings: number (optional, $/year)
    - investmentCost: number (required)
    - paybackPeriod: number (optional, years)
    - mvProtocol: string (required, "IPMVP_A" | "IPMVP_B" | "IPMVP_C" | "IPMVP_D")
    - baseline: object (required)
      - baselinePeriod: object (startDate, endDate)
      - baselineConsumption: number (kWh)
      - baselineConditions: object
    - status: string (required, "planned" | "in_progress" | "completed" | "verified")
    - metadata: object (optional)
  Response:
    - projectId: string
    - projectName: string
    - facilityId: string
    - expectedSavings: number
    - investmentCost: number
    - paybackPeriod: number

PUT /v1/energy/efficiency/projects/:projectId/complete
  Description: Mark project as completed
  Request:
    - completionDate: Date (required)
    - actualCost: number (optional)
    - postImplementationData: object (optional)
  Response:
    - project: EfficiencyProject
    - status: "completed"

POST /v1/energy/efficiency/projects/:projectId/verify-savings
  Description: Verify energy savings (M&V)
  Request:
    - verificationPeriod: object (required, { startDate, endDate })
    - postConsumption: number (required, kWh)
    - adjustments: object (optional, weather, production, etc.)
    - verifiedSavings: number (required, kWh)
    - verificationMethod: string (required)
    - verifier: string (optional, third-party verifier)
    - certificationBody: string (optional)
    - notes: string (optional)
  Response:
    - verificationId: string
    - projectId: string
    - verifiedSavings: number
    - savingsPercentage: number
    - status: "verified"

GET /v1/energy/efficiency/projects
  Description: List efficiency projects
  Query:
    - facilityId: string (optional)
    - organizationId: string (optional)
    - status: string (optional)
    - projectType: string (optional)
  Response:
    - projects: EfficiencyProject[]
    - totalSavings: number (kWh/year)
    - totalInvestment: number
    - averagePayback: number
```

#### ISO 50001 Energy Management Endpoints
```yaml
POST /v1/energy/iso50001/baselines
  Description: Establish energy baseline
  Request:
    - facilityId: string (required)
    - baselineName: string (required)
    - baselinePeriod: object (required, { startDate, endDate })
    - energySources: string[] (required)
    - totalConsumption: number (required, kWh)
    - normalizationFactors: object (required)
      - production: number (optional)
      - squareFeet: number (optional)
      - heatingDegreeDays: number (optional)
      - coolingDegreeDays: number (optional)
      - custom: object (optional)
    - significantEnergyUses: string[] (required, SEU IDs)
    - baselineModel: object (optional, regression model)
    - uncertaintyAnalysis: object (optional)
    - metadata: object (optional)
  Response:
    - baselineId: string
    - facilityId: string
    - baselineName: string
    - totalConsumption: number
    - normalizationFactors: object

POST /v1/energy/iso50001/enpis
  Description: Create Energy Performance Indicator
  Request:
    - enpiName: string (required)
    - facilityId: string (required)
    - enpiType: string (required, "static" | "regression" | "engineering")
    - numerator: object (required, { metric: string, unit: string })
    - denominator: object (optional, { metric: string, unit: string })
    - targetValue: number (optional)
    - baselineValue: number (required)
    - formula: string (optional, for engineering EnPIs)
    - reportingFrequency: string (required, "monthly" | "quarterly" | "annually")
    - thresholds: object (optional, { warning: number, critical: number })
    - metadata: object (optional)
  Response:
    - enpiId: string
    - enpiName: string
    - enpiType: string
    - baselineValue: number
    - currentValue: number

POST /v1/energy/iso50001/enpis/:enpiId/readings
  Description: Record EnPI value
  Request:
    - period: object (required, { startDate, endDate })
    - value: number (required)
    - normalizedValue: number (optional)
    - adjustments: object (optional)
    - notes: string (optional)
  Response:
    - readingId: string
    - enpiId: string
    - value: number
    - percentageChange: number
    - status: "on_track" | "warning" | "critical"

POST /v1/energy/iso50001/seus
  Description: Identify Significant Energy Use
  Request:
    - seuName: string (required)
    - facilityId: string (required)
    - description: string (required)
    - energySources: string[] (required)
    - annualConsumption: number (required, kWh)
    - percentageOfTotal: number (required)
    - variability: string (required, "high" | "medium" | "low")
    - controlPotential: string (required, "high" | "medium" | "low")
    - performanceVariables: string[] (required)
    - currentPerformance: object (optional)
    - operationalControls: string[] (optional)
    - opportunities: string[] (optional)
    - metadata: object (optional)
  Response:
    - seuId: string
    - seuName: string
    - annualConsumption: number
    - percentageOfTotal: number

POST /v1/energy/iso50001/audits
  Description: Record energy audit
  Request:
    - auditName: string (required)
    - facilityId: string (required)
    - auditType: string (required, "initial" | "compliance" | "surveillance" | "recertification")
    - auditDate: Date (required)
    - auditor: string (required)
    - certificationBody: string (optional)
    - scope: string (required)
    - findings: object[] (required)
      - category: string
      - severity: string
      - description: string
      - recommendation: string
    - opportunities: object[] (optional)
    - nonConformities: object[] (optional)
    - nextAuditDate: Date (optional)
    - metadata: object (optional)
  Response:
    - auditId: string
    - auditName: string
    - auditDate: Date
    - findingsCount: number
    - status: "open" | "closed"

GET /v1/energy/iso50001/certification-readiness
  Description: Assess ISO 50001 certification readiness
  Query:
    - facilityId: string (required)
  Response:
    - readiness: object
      - energyPolicy: boolean
      - energyBaseline: boolean
      - enpis: boolean
      - seus: boolean
      - operationalControls: boolean
      - competenceTraining: boolean
      - energyAudits: boolean
      - managementReview: boolean
    - score: number (0-100)
    - gaps: string[]
    - recommendations: string[]
```

#### Grid Integration & Demand Response Endpoints
```yaml
POST /v1/energy/grid/pricing
  Description: Update electricity pricing data
  Request:
    - facilityId: string (required)
    - utilityProvider: string (required)
    - pricingModel: string (required, "TOU" | "RTP" | "CPP" | "flat")
    - effectiveDate: Date (required)
    - rates: object[] (required)
      - period: string (e.g., "on_peak", "off_peak", "shoulder")
      - price: number ($/kWh)
      - timeOfDay: object (optional, { start, end })
      - season: string (optional)
    - demandCharges: object (optional)
      - rate: number ($/kW)
      - applicablePeriods: string[]
    - metadata: object (optional)
  Response:
    - pricingId: string
    - facilityId: string
    - pricingModel: string
    - effectiveDate: Date

POST /v1/energy/demand-response/events
  Description: Record demand response event
  Request:
    - facilityId: string (required)
    - programName: string (required)
    - eventType: string (required, "economic" | "emergency" | "test")
    - startTime: Date (required)
    - endTime: Date (required)
    - requestedReduction: number (required, kW)
    - actualReduction: number (optional, kW)
    - baselineLoad: number (required, kW)
    - eventLoad: number (optional, kW)
    - incentiveRate: number (optional, $/kWh)
    - totalIncentive: number (optional)
    - participationStatus: string (required, "opted_in" | "opted_out")
    - curtailmentActions: string[] (optional)
    - metadata: object (optional)
  Response:
    - eventId: string
    - facilityId: string
    - programName: string
    - requestedReduction: number
    - actualReduction: number
    - performance: number (% of target)

GET /v1/energy/grid/carbon-intensity
  Description: Get grid carbon intensity
  Query:
    - location: string (required, grid region or lat/long)
    - timestamp: Date (optional, defaults to now)
    - forecast: boolean (optional, get 24-hour forecast)
  Response:
    - carbonIntensity: number (gCO2/kWh)
    - location: string
    - timestamp: Date
    - source: string (data provider)
    - forecast: object[] (optional)

POST /v1/energy/storage/systems
  Description: Register battery energy storage system
  Request:
    - systemName: string (required)
    - facilityId: string (required)
    - capacity: number (required, kWh)
    - powerRating: number (required, kW)
    - manufacturer: string (optional)
    - chemistry: string (optional, "lithium_ion" | "lead_acid" | "flow_battery")
    - installationDate: Date (required)
    - warrantyExpiry: Date (optional)
    - cycleLife: number (optional)
    - roundTripEfficiency: number (optional, %)
    - metadata: object (optional)
  Response:
    - storageSystemId: string
    - systemName: string
    - capacity: number
    - powerRating: number

POST /v1/energy/storage/:systemId/operations
  Description: Record battery charge/discharge
  Request:
    - operationType: string (required, "charge" | "discharge")
    - startTime: Date (required)
    - endTime: Date (required)
    - energyAmount: number (required, kWh)
    - power: number (required, kW)
    - stateOfCharge: number (required, %)
    - gridService: string (optional, "peak_shaving" | "frequency_regulation" | "arbitrage")
    - revenue: number (optional)
    - metadata: object (optional)
  Response:
    - operationId: string
    - storageSystemId: string
    - operationType: string
    - energyAmount: number
```

#### Energy Procurement & Contract Management Endpoints
```yaml
POST /v1/energy/procurement/contracts
  Description: Create energy procurement contract
  Request:
    - contractName: string (required)
    - facilityIds: string[] (required)
    - supplier: string (required)
    - contractType: string (required, "fixed_price" | "index_based" | "green_tariff" | "PPA" | "CCA")
    - energySource: string (required)
    - startDate: Date (required)
    - endDate: Date (required)
    - annualVolume: number (required, kWh)
    - pricing: object (required)
      - fixedPrice: number (optional, $/kWh)
      - indexBased: object (optional, { index: string, premium: number })
      - escalationRate: number (optional, % per year)
    - isRenewable: boolean (required)
    - recIncluded: boolean (optional)
    - renewalTerms: object (optional)
    - terminationClauses: object (optional)
    - metadata: object (optional)
  Response:
    - contractId: string
    - contractName: string
    - supplier: string
    - contractType: string
    - startDate: Date
    - endDate: Date

GET /v1/energy/procurement/contracts
  Description: List energy contracts
  Query:
    - facilityId: string (optional)
    - organizationId: string (optional)
    - supplier: string (optional)
    - contractType: string (optional)
    - status: string (optional, "active" | "expired" | "pending")
  Response:
    - contracts: Contract[]
    - totalAnnualVolume: number
    - totalAnnualCost: number

POST /v1/energy/procurement/rfps
  Description: Create energy procurement RFP
  Request:
    - rfpName: string (required)
    - facilityIds: string[] (required)
    - energySource: string (required)
    - annualVolume: number (required, kWh)
    - loadProfile: object (optional)
    - startDate: Date (required)
    - contractDuration: number (required, years)
    - renewablePreference: boolean (optional)
    - requirements: object (optional)
    - issueDate: Date (required)
    - responseDeadline: Date (required)
    - metadata: object (optional)
  Response:
    - rfpId: string
    - rfpName: string
    - status: "open"

POST /v1/energy/procurement/rfps/:rfpId/proposals
  Description: Add supplier proposal to RFP
  Request:
    - supplier: string (required)
    - proposedPrice: number (required, $/kWh)
    - pricingStructure: object (required)
    - isRenewable: boolean (required)
    - recIncluded: boolean (optional)
    - terms: object (optional)
    - submissionDate: Date (required)
  Response:
    - proposalId: string
    - rfpId: string
    - supplier: string
    - proposedPrice: number
```

#### Energy Intensity & Benchmarking Endpoints
```yaml
POST /v1/energy/intensity/metrics
  Description: Calculate energy intensity metric
  Request:
    - facilityId: string (required)
    - metricName: string (required)
    - period: object (required, { startDate, endDate })
    - energyConsumption: number (required, kWh)
    - denominator: object (required)
      - type: string (required, "production" | "revenue" | "sqft" | "employees" | "custom")
      - value: number (required)
      - unit: string (required)
    - weatherNormalized: boolean (optional)
    - targetValue: number (optional)
    - benchmarkValue: number (optional)
    - metadata: object (optional)
  Response:
    - intensityId: string
    - facilityId: string
    - metricName: string
    - intensity: number
    - unit: string
    - percentageOfTarget: number
    - percentageOfBenchmark: number

GET /v1/energy/intensity/trends
  Description: Get energy intensity trends
  Query:
    - facilityId: string (required)
    - metricName: string (required)
    - startDate: Date (required)
    - endDate: Date (required)
    - granularity: string (optional, "monthly" | "quarterly" | "annually")
  Response:
    - trends: IntensityTrend[]
    - percentageChange: number
    - regression: object

GET /v1/energy/benchmarking
  Description: Benchmark facility energy performance
  Query:
    - facilityId: string (required)
    - industryCode: string (optional, NAICS)
    - region: string (optional)
  Response:
    - facility: object
      - energyIntensity: number
      - percentile: number
    - industryAverage: number
    - topQuartile: number
    - medianValue: number
    - recommendations: string[]
```

#### RE100 Reporting Endpoints
```yaml
GET /v1/energy/re100/progress
  Description: Calculate RE100 progress
  Query:
    - organizationId: string (required)
    - year: number (required)
  Response:
    - year: number
    - totalElectricityConsumption: number (MWh)
    - renewableElectricity: number (MWh)
    - renewablePercentage: number
    - breakdown: object
      - onSiteGeneration: number
      - ppaRenewable: number
      - greenTariff: number
      - recsRetired: number
    - re100Target: number (%)
    - onTrack: boolean

POST /v1/energy/re100/report
  Description: Generate RE100 annual report
  Request:
    - organizationId: string (required)
    - reportingYear: number (required)
    - electricityConsumption: number (required, MWh)
    - renewableSources: object[] (required)
      - source: string
      - amount: number (MWh)
      - qualityCriteria: object
    - scope2Emissions: object (required)
      - locationBased: number (tCO2e)
      - marketBased: number (tCO2e)
    - targets: object (required)
      - targetYear: number
      - targetPercentage: number
    - commentary: string (optional)
  Response:
    - reportId: string
    - reportingYear: number
    - renewablePercentage: number
    - status: "draft" | "submitted"
```

### 1.3 Business Rules

#### Energy Consumption Rules
1. Consumption records must not overlap for same meter/facility/source
2. Metered data takes precedence over estimated data
3. Consumption amounts must be non-negative
4. Interval data must align with declared interval type
5. Peak demand must be less than or equal to facility contracted demand
6. Energy balance: total consumption = metered + estimated + calculated
7. Missing data must be estimated using approved methodologies
8. Data quality flags: "verified", "estimated", "questionable", "missing"
9. Automatic alerts for consumption anomalies (>20% variance)
10. Degree day normalization required for year-over-year comparisons

#### Renewable Energy Rules
1. REC vintage must match or precede claim year
2. RECs must be from same market/grid region as consumption
3. One REC can only be retired once (no double-counting)
4. Bundled RECs preferred over unbundled for Scope 2 claims
5. REC quality criteria: vintage, geography, additionality
6. On-site generation prioritized over purchased renewable energy
7. Self-consumed renewable energy cannot be double-counted with RECs
8. Exported renewable generation tracked separately
9. RE100 only counts renewable electricity (not thermal energy)
10. Community solar allocation based on subscription percentage

#### Energy Efficiency Rules
1. Baseline period minimum 12 months of data
2. M&V protocol selected before project implementation
3. Savings verification within 12 months of project completion
4. Weather normalization required for HVAC projects
5. Production normalization required for process efficiency
6. Negative savings require investigation and explanation
7. Payback period calculated using simple and discounted methods
8. Project costs include equipment, installation, commissioning, M&V
9. Avoided costs based on facility-specific marginal rates
10. Behavioral change savings degradation assumed at 20%/year

#### ISO 50001 Rules
1. Energy baseline updated every 3 years or after major changes
2. Significant Energy Uses (SEUs) comprise minimum 80% of consumption
3. EnPIs must have statistical significance (R² > 0.75 for regression)
4. Energy audits required every 3 years
5. Management review required at least annually
6. Operational controls documented for all SEUs
7. Competence requirements defined for energy management roles
8. Energy objectives must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
9. Continuous improvement required (year-over-year efficiency gains)
10. Non-conformities must be addressed within defined timeframes

#### Scope 2 Emissions Rules (GHG Protocol)
1. Both location-based and market-based methods required (dual reporting)
2. Market-based method requires contractual instruments (RECs, PPAs, etc.)
3. Residual mix factors used when no contractual instruments available
4. Transmission and distribution (T&D) losses included in Scope 2
5. Quality criteria for contractual instruments: vintage, geography, tracking
6. Hierarchy of instruments: own generation > PPAs > RECs > supplier-specific > residual mix
7. Renewable claims must match consumption geography and vintage
8. Default to location-based method if market-based criteria not met
9. Carbon-free energy (CFE) tracking uses hourly matching
10. Avoided emissions reported separately (not subtracted from Scope 2)

#### Grid Integration Rules
1. Demand response participation requires minimum 100 kW curtailment
2. Battery storage must maintain state of charge (SOC) within safe limits (20-80%)
3. Real-time pricing requires interval meter data
4. Peak demand charges applied to highest 15-minute interval
5. Grid carbon intensity updated at least hourly
6. Energy arbitrage limited to price differential > $0.02/kWh
7. V2G participation requires bidirectional charger and grid approval
8. Microgrid operations must maintain power quality standards
9. Automated demand response (AutoDR) requires OpenADR 2.0b compliance
10. Battery warranty considerations for grid services cycling

#### Procurement Rules
1. Contract renewals flagged 6 months before expiry
2. Price comparisons normalized to $/kWh for all contract types
3. Green tariff premium must be disclosed separately
4. PPA financial vs. physical delivery tracked distinctly
5. Aggregated purchasing requires minimum 1 GWh annual volume
6. RFP responses evaluated on price, renewability, and terms
7. Community choice aggregation (CCA) opt-outs tracked
8. Index-based contracts require index source disclosure
9. Early termination penalties documented
10. Supplier performance scorecard updated quarterly

### 1.4 Error Handling

```yaml
Error Responses:
  400 Bad Request:
    - INVALID_ENERGY_SOURCE
    - INVALID_UNIT_CONVERSION
    - OVERLAPPING_CONSUMPTION_PERIOD
    - NEGATIVE_CONSUMPTION_VALUE
    - INVALID_INTERVAL_TYPE
    - MISSING_REQUIRED_FIELD
    - INVALID_REC_VINTAGE
    - INVALID_METER_CONFIGURATION

  401 Unauthorized:
    - TOKEN_EXPIRED
    - INVALID_API_KEY
    - INSUFFICIENT_PERMISSIONS

  403 Forbidden:
    - FACILITY_ACCESS_DENIED
    - METER_ACCESS_DENIED
    - ORGANIZATION_ACCESS_DENIED

  404 Not Found:
    - METER_NOT_FOUND
    - FACILITY_NOT_FOUND
    - CONSUMPTION_RECORD_NOT_FOUND
    - REC_PURCHASE_NOT_FOUND
    - EFFICIENCY_PROJECT_NOT_FOUND
    - CONTRACT_NOT_FOUND

  409 Conflict:
    - REC_ALREADY_RETIRED
    - CONSUMPTION_DATA_EXISTS
    - METER_ALREADY_REGISTERED
    - BASELINE_ALREADY_EXISTS
    - CONTRACT_OVERLAP

  422 Unprocessable Entity:
    - REC_VINTAGE_MISMATCH
    - REC_GEOGRAPHY_MISMATCH
    - INSUFFICIENT_REC_INVENTORY
    - BASELINE_DATA_INSUFFICIENT
    - SAVINGS_VERIFICATION_FAILED
    - INTENSITY_CALCULATION_FAILED

  500 Internal Server Error:
    - IOT_INTEGRATION_FAILURE
    - CALCULATION_ENGINE_ERROR
    - DATABASE_ERROR
    - EVENT_PUBLISH_FAILED

  503 Service Unavailable:
    - GRID_API_UNAVAILABLE
    - REC_REGISTRY_UNAVAILABLE
    - UTILITY_API_UNAVAILABLE
```

## 2. Data Model

### 2.1 MongoDB Collections

#### energy_meters Collection
```javascript
{
  _id: ObjectId,
  meterName: String,
  meterType: String, // "main" | "sub-meter" | "virtual"
  facilityId: ObjectId, // References organization.facilities
  organizationId: ObjectId, // Denormalized for queries

  energySource: String, // "electricity" | "natural_gas" | "diesel" | etc.

  physical: {
    manufacturer: String,
    model: String,
    serialNumber: String,
    meterIdentifier: String, // Utility meter ID
    location: {
      type: String, // "Point"
      coordinates: [Number], // [longitude, latitude]
      description: String
    },
    installationDate: Date,
    lastCalibrationDate: Date,
    nextCalibrationDue: Date
  },

  configuration: {
    collectionFrequency: String, // "15min" | "hourly" | "daily"
    communicationProtocol: String, // "MQTT" | "Modbus" | "BACnet" | "API"
    dataFormat: String,
    mqttTopic: String, // For IoT integration
    apiEndpoint: String, // For utility API integration
    multiplier: Number, // Meter multiplier
    units: String // Primary unit (kWh, therms, etc.)
  },

  equipment: {
    equipmentId: ObjectId, // Optional: link to specific equipment
    equipmentType: String, // "HVAC" | "lighting" | "process" | etc.
    equipmentName: String
  },

  health: {
    status: String, // "active" | "inactive" | "maintenance" | "error"
    lastCommunication: Date,
    communicationFailures: Number,
    dataQualityScore: Number, // 0-100
    alerts: [{
      alertType: String,
      timestamp: Date,
      resolved: Boolean
    }]
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId,
    tags: [String],
    customFields: Object
  }
}

// Indexes
- facilityId: 1
- organizationId: 1
- energySource: 1
- meterType: 1
- health.status: 1
- configuration.mqttTopic: 1
```

#### energy_consumption Collection (InfluxDB for time-series)
```javascript
// InfluxDB Measurement: energy_consumption
// Time-series optimized storage
{
  timestamp: Time,

  // Tags (indexed)
  facilityId: String,
  organizationId: String,
  meterId: String,
  energySource: String,
  intervalType: String,
  readingType: String, // "metered" | "estimated" | "calculated"

  // Fields (values)
  consumptionAmount: Float,
  unit: String,
  peakDemand: Float,
  cost: Float,

  // Load profile data (for 15-minute intervals)
  loadProfile: JSON, // Array of kW values

  // Data quality
  dataQuality: String, // "verified" | "estimated" | "questionable" | "missing"
  estimationMethod: String,

  // Environmental context
  carbonIntensity: Float, // gCO2/kWh
  outsideTemperature: Float, // For weather normalization
  heatingDegreeDays: Float,
  coolingDegreeDays: Float,

  // Metadata
  correlationId: String,
  source: String // "meter" | "utility_bill" | "manual" | "estimated"
}

// InfluxDB Continuous Queries for aggregation
// Hourly aggregation from 15-minute data
// Daily aggregation from hourly data
// Monthly aggregation from daily data
```

#### energy_consumption_mongodb Collection (MongoDB for metadata/queries)
```javascript
// Complement to InfluxDB for relational queries
{
  _id: ObjectId,
  consumptionId: String, // UUID
  facilityId: ObjectId,
  organizationId: ObjectId,
  meterId: ObjectId,

  energySource: String,
  period: {
    startDate: Date,
    endDate: Date,
    intervalType: String
  },

  consumption: {
    amount: Number,
    unit: String,
    peakDemand: Number,
    cost: Number
  },

  readingType: String,
  dataQuality: String,

  influxDbPointer: {
    measurement: String,
    startTime: Date,
    endTime: Date
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    source: String
  }
}

// Indexes
- facilityId: 1, period.startDate: -1
- organizationId: 1, energySource: 1
- meterId: 1, period.startDate: -1
```

#### renewable_generation Collection (InfluxDB)
```javascript
// InfluxDB Measurement: renewable_generation
{
  timestamp: Time,

  // Tags
  facilityId: String,
  organizationId: String,
  systemId: String,
  renewableType: String, // "solar_pv" | "wind" | "hydro" | etc.

  // Fields
  generationAmount: Float,
  unit: String,
  selfConsumed: Float,
  exportedToGrid: Float,

  // Environmental conditions
  solarIrradiance: Float, // W/m²
  windSpeed: Float, // m/s
  temperature: Float,

  // System performance
  systemEfficiency: Float, // %
  availabilityFactor: Float, // %

  correlationId: String
}
```

#### renewable_systems Collection
```javascript
{
  _id: ObjectId,
  systemName: String,
  facilityId: ObjectId,
  organizationId: ObjectId,

  renewableType: String, // "solar_pv" | "wind" | "hydro" | "geothermal" | "biomass"

  capacity: {
    rating: Number, // kW or MW
    unit: String,
    acRating: Number, // For solar (DC to AC conversion)
    dcRating: Number
  },

  installation: {
    installationDate: Date,
    commissioningDate: Date,
    manufacturer: String,
    model: String,
    installer: String,
    warrantyExpiry: Date
  },

  performance: {
    performanceRatio: Number, // % (actual vs. theoretical)
    degradationRate: Number, // % per year
    expectedLifetime: Number, // years
    annualGeneration: Number, // kWh
    capacityFactor: Number // %
  },

  financials: {
    capitalCost: Number,
    currencyCode: String,
    incentives: [{
      incentiveType: String, // "ITC" | "PTC" | "grant" | "rebate"
      amount: Number,
      receivedDate: Date
    }],
    feedInTariff: {
      rate: Number,
      unit: String,
      expiryDate: Date
    }
  },

  maintenance: {
    lastMaintenanceDate: Date,
    nextScheduledMaintenance: Date,
    maintenanceSchedule: String,
    maintenanceHistory: [{
      date: Date,
      type: String,
      notes: String,
      cost: Number
    }]
  },

  status: String, // "active" | "inactive" | "maintenance" | "decommissioned"

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    tags: [String],
    customFields: Object
  }
}

// Indexes
- facilityId: 1
- organizationId: 1
- renewableType: 1
- status: 1
```

#### rec_purchases Collection
```javascript
{
  _id: ObjectId,
  purchaseId: String, // UUID
  organizationId: ObjectId,

  recType: String, // "REC" | "GO" | "I-REC"

  quantity: Number, // MWh
  vintage: Number, // Year

  registry: {
    name: String, // "M-RETS" | "PJM-GATS" | "APX_TIGR" | "I-REC"
    certificateIds: [String], // Individual certificate numbers
    accountId: String
  },

  generation: {
    source: String, // "solar" | "wind" | "hydro" | "biomass"
    location: {
      country: String,
      state: String,
      gridRegion: String
    },
    facilityName: String,
    facilityId: String // Registry facility ID
  },

  purchase: {
    purchaseDate: Date,
    vintageYear: Number,
    price: Number,
    currency: String,
    supplier: String,
    contractType: String, // "bundled" | "unbundled"
    contractReference: String
  },

  quality: {
    isAdditional: Boolean,
    addionalityEvidence: String,
    eligibilityStandards: [String], // "GHG_Protocol" | "RE100" | "CDP"
  },

  status: String, // "active" | "retired" | "expired"

  retirement: {
    retirementId: String,
    retirementDate: Date,
    quantityRetired: Number, // MWh
    remainingQuantity: Number, // MWh
    retirementReason: String,
    beneficiary: String,
    registryRetirementId: String
  },

  expiry: {
    expiryDate: Date,
    autoExpire: Boolean
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    tags: [String],
    documents: [{
      documentType: String,
      url: String,
      uploadDate: Date
    }]
  }
}

// Indexes
- organizationId: 1, status: 1
- vintage: 1
- registry.name: 1
- status: 1
- purchase.purchaseDate: -1
```

#### rec_retirements Collection
```javascript
{
  _id: ObjectId,
  retirementId: String, // UUID
  purchaseId: ObjectId, // Reference to rec_purchases
  organizationId: ObjectId,

  retirement: {
    retirementDate: Date,
    quantityRetired: Number, // MWh
    retirementReason: String, // "scope2_claim" | "voluntary" | "compliance"
    retirementPeriod: {
      year: Number,
      month: Number // Optional
    },
    beneficiary: String,
    registryRetirementId: String,
    certificateUrl: String
  },

  claim: {
    claimType: String, // "scope2" | "re100" | "cdp" | "voluntary"
    claimLocation: String, // Facility/region claimed for
    facilityIds: [ObjectId],
    claimYear: Number
  },

  validation: {
    vintageMatch: Boolean,
    geographyMatch: Boolean,
    quantitySufficient: Boolean,
    qualityCriteriaMet: Boolean,
    warnings: [String]
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    notes: String,
    correlationId: String
  }
}

// Indexes
- organizationId: 1, retirement.retirementDate: -1
- purchaseId: 1
- retirement.retirementPeriod.year: 1
- claim.claimType: 1
```

#### energy_efficiency_projects Collection
```javascript
{
  _id: ObjectId,
  projectId: String, // UUID
  projectName: String,
  facilityId: ObjectId,
  organizationId: ObjectId,

  projectType: String, // "lighting" | "hvac" | "motors" | "building_envelope" | "process" | "behavioral" | "other"
  description: String,

  timeline: {
    plannedStartDate: Date,
    actualStartDate: Date,
    plannedCompletionDate: Date,
    actualCompletionDate: Date,
    status: String // "planned" | "in_progress" | "completed" | "verified" | "cancelled"
  },

  baseline: {
    baselinePeriod: {
      startDate: Date,
      endDate: Date
    },
    baselineConsumption: Number, // kWh
    baselineConditions: {
      production: Number,
      operatingHours: Number,
      heatingDegreeDays: Number,
      coolingDegreeDays: Number,
      customFactors: Object
    },
    baselineModel: {
      modelType: String, // "simple" | "regression" | "engineering"
      equation: String,
      rSquared: Number,
      coefficients: Object
    }
  },

  expected: {
    expectedSavings: Number, // kWh/year
    expectedCostSavings: Number, // $/year
    expectedDemandReduction: Number, // kW
    expectedLifetime: Number, // years
    lifetimeSavings: Number // kWh
  },

  financials: {
    investmentCost: Number,
    currency: String,
    incentivesReceived: [{
      incentiveType: String,
      amount: Number,
      source: String
    }],
    simplePayback: Number, // years
    discountedPayback: Number, // years
    netPresentValue: Number,
    internalRateOfReturn: Number // %
  },

  mvProtocol: String, // "IPMVP_A" | "IPMVP_B" | "IPMVP_C" | "IPMVP_D"

  verification: {
    verificationDate: Date,
    verificationPeriod: {
      startDate: Date,
      endDate: Date
    },
    postConsumption: Number, // kWh
    adjustments: {
      productionAdjustment: Number,
      weatherAdjustment: Number,
      otherAdjustments: Object
    },
    verifiedSavings: Number, // kWh
    savingsPercentage: Number, // % of expected
    verificationMethod: String,
    verifier: String,
    certificationBody: String,
    verified: Boolean
  },

  implementation: {
    equipmentInstalled: [String],
    contractors: [String],
    commissioningCompleted: Boolean,
    trainingCompleted: Boolean,
    operationalChanges: [String]
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId,
    tags: [String],
    documents: [{
      documentType: String,
      url: String,
      uploadDate: Date
    }],
    notes: String
  }
}

// Indexes
- facilityId: 1, timeline.status: 1
- organizationId: 1
- projectType: 1
- timeline.actualCompletionDate: -1
```

#### energy_baselines Collection
```javascript
{
  _id: ObjectId,
  baselineId: String, // UUID
  baselineName: String,
  facilityId: ObjectId,
  organizationId: ObjectId,

  baselinePeriod: {
    startDate: Date,
    endDate: Date,
    durationMonths: Number
  },

  energySources: [String], // Sources included in baseline

  consumption: {
    totalConsumption: Number, // kWh
    breakdown: [{
      energySource: String,
      amount: Number,
      percentage: Number
    }]
  },

  normalizationFactors: {
    production: {
      value: Number,
      unit: String
    },
    squareFeet: Number,
    heatingDegreeDays: Number,
    coolingDegreeDays: Number,
    occupancy: Number,
    operatingHours: Number,
    customFactors: [{
      name: String,
      value: Number,
      unit: String
    }]
  },

  baselineModel: {
    modelType: String, // "simple" | "multivariate_regression" | "engineering"
    equation: String,
    coefficients: Object,
    rSquared: Number,
    standardError: Number,
    confidenceInterval: Number // %
  },

  significantEnergyUses: [ObjectId], // References to SEUs

  adjustment: {
    lastAdjustmentDate: Date,
    adjustmentReason: String,
    previousBaseline: ObjectId,
    significantChange: Boolean // Trigger for baseline update
  },

  validity: {
    isActive: Boolean,
    expiryDate: Date, // ISO 50001: update every 3 years
    nextReviewDate: Date
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    approvedAt: Date,
    approvedBy: ObjectId,
    notes: String,
    documents: [{
      documentType: String,
      url: String
    }]
  }
}

// Indexes
- facilityId: 1, validity.isActive: 1
- organizationId: 1
- validity.expiryDate: 1
```

#### energy_performance_indicators Collection
```javascript
{
  _id: ObjectId,
  enpiId: String, // UUID
  enpiName: String,
  facilityId: ObjectId,
  organizationId: ObjectId,

  enpiType: String, // "static" | "regression" | "engineering"

  definition: {
    numerator: {
      metric: String, // "total_energy" | "electricity" | "natural_gas"
      unit: String
    },
    denominator: {
      metric: String, // "production" | "sqft" | "revenue" | "none" (for static)
      unit: String
    },
    formula: String // For engineering EnPIs
  },

  baseline: {
    baselineId: ObjectId,
    baselineValue: Number,
    baselineDate: Date
  },

  target: {
    targetValue: Number,
    targetDate: Date,
    improvementPercentage: Number // % improvement from baseline
  },

  current: {
    currentValue: Number,
    lastUpdated: Date,
    percentageChange: Number, // From baseline
    trendDirection: String // "improving" | "declining" | "stable"
  },

  thresholds: {
    warningThreshold: Number,
    criticalThreshold: Number
  },

  reportingFrequency: String, // "monthly" | "quarterly" | "annually"

  history: [{
    period: {
      startDate: Date,
      endDate: Date
    },
    value: Number,
    normalizedValue: Number,
    adjustments: Object,
    notes: String,
    timestamp: Date
  }],

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    isActive: Boolean,
    tags: [String]
  }
}

// Indexes
- facilityId: 1, metadata.isActive: 1
- organizationId: 1
- enpiType: 1
```

#### significant_energy_uses Collection
```javascript
{
  _id: ObjectId,
  seuId: String, // UUID
  seuName: String,
  facilityId: ObjectId,
  organizationId: ObjectId,

  description: String,

  energySources: [String],

  consumption: {
    annualConsumption: Number, // kWh
    percentageOfTotal: Number, // %
    peakDemand: Number // kW
  },

  characteristics: {
    variability: String, // "high" | "medium" | "low"
    controlPotential: String, // "high" | "medium" | "low"
    performanceVariables: [String], // Factors affecting performance
    operatingSchedule: String
  },

  currentPerformance: {
    energyEfficiency: Number,
    benchmarkComparison: Number,
    opportunitiesIdentified: [String]
  },

  controls: {
    operationalControls: [String],
    maintenanceControls: [String],
    designControls: [String],
    responsiblePersons: [String]
  },

  opportunities: [{
    opportunityDescription: String,
    estimatedSavings: Number, // kWh/year
    estimatedCost: Number,
    priority: String, // "high" | "medium" | "low"
    status: String // "identified" | "under_review" | "planned" | "implemented"
  }],

  monitoring: {
    kpis: [String], // Key performance indicators
    monitoringFrequency: String,
    lastReviewed: Date,
    nextReviewDue: Date
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    isActive: Boolean
  }
}

// Indexes
- facilityId: 1, metadata.isActive: 1
- organizationId: 1
- consumption.percentageOfTotal: -1
```

#### energy_audits Collection
```javascript
{
  _id: ObjectId,
  auditId: String, // UUID
  auditName: String,
  facilityId: ObjectId,
  organizationId: ObjectId,

  auditType: String, // "initial" | "compliance" | "surveillance" | "recertification" | "internal"
  standard: String, // "ISO_50001" | "ENERGY_STAR" | "ASHRAE_Level_1" | "ASHRAE_Level_2" | "ASHRAE_Level_3"

  schedule: {
    auditDate: Date,
    auditDuration: Number, // days
    auditor: String,
    certificationBody: String,
    nextAuditDate: Date
  },

  scope: {
    scopeDescription: String,
    areasAudited: [String],
    systemsAudited: [String],
    exclusions: [String]
  },

  findings: [{
    findingId: String,
    category: String, // "energy_policy" | "planning" | "implementation" | "monitoring" | "review"
    severity: String, // "major_nc" | "minor_nc" | "observation" | "opportunity"
    description: String,
    evidence: String,
    requirement: String, // ISO 50001 clause reference
    recommendation: String,
    status: String, // "open" | "in_progress" | "closed"
    dueDate: Date,
    closureDate: Date,
    closureEvidence: String
  }],

  opportunities: [{
    opportunityId: String,
    description: String,
    estimatedSavings: Number, // kWh/year
    estimatedCost: Number,
    payback: Number, // years
    priority: String
  }],

  nonConformities: [{
    ncId: String,
    type: String, // "major" | "minor"
    clause: String, // ISO clause
    description: String,
    correctiveAction: String,
    rootCause: String,
    preventiveAction: String,
    responsible: String,
    dueDate: Date,
    status: String
  }],

  summary: {
    overallAssessment: String,
    strengths: [String],
    areasForImprovement: [String],
    certificationDecision: String, // "certified" | "conditional" | "not_certified"
    certificationValidUntil: Date
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    documents: [{
      documentType: String,
      url: String
    }]
  }
}

// Indexes
- facilityId: 1, schedule.auditDate: -1
- organizationId: 1
- auditType: 1
- schedule.nextAuditDate: 1
```

#### energy_pricing Collection
```javascript
{
  _id: ObjectId,
  pricingId: String, // UUID
  facilityId: ObjectId,
  organizationId: ObjectId,

  utilityProvider: String,
  accountNumber: String,

  pricingModel: String, // "TOU" | "RTP" | "CPP" | "flat"

  effectiveDate: Date,
  expiryDate: Date,

  rates: [{
    period: String, // "on_peak" | "mid_peak" | "off_peak" | "super_off_peak"
    price: Number, // $/kWh
    currency: String,
    timeOfDay: {
      start: String, // "HH:MM"
      end: String
    },
    daysOfWeek: [String], // ["Monday", "Tuesday", ...]
    season: String, // "summer" | "winter" | "all_year"
    months: [Number] // [6, 7, 8] for summer
  }],

  demandCharges: {
    rate: Number, // $/kW
    applicablePeriods: [String],
    billingDemandType: String, // "monthly_peak" | "annual_ratchet" | "coincident_peak"
    ratchetPercentage: Number // For annual ratchet
  },

  otherCharges: [{
    chargeName: String,
    chargeType: String, // "fixed" | "variable"
    amount: Number,
    unit: String // "$/month" | "$/kWh"
  }],

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    source: String // "utility_bill" | "tariff_sheet" | "api"
  }
}

// Indexes
- facilityId: 1, effectiveDate: -1
- organizationId: 1
- utilityProvider: 1
```

#### demand_response_events Collection
```javascript
{
  _id: ObjectId,
  eventId: String, // UUID
  facilityId: ObjectId,
  organizationId: ObjectId,

  program: {
    programName: String,
    programType: String, // "economic" | "emergency" | "ancillary_services"
    operator: String // Grid operator or utility
  },

  event: {
    eventType: String, // "economic" | "emergency" | "test"
    startTime: Date,
    endTime: Date,
    duration: Number, // minutes
    notificationTime: Date,
    notificationMethod: String
  },

  demand: {
    requestedReduction: Number, // kW
    baselineLoad: Number, // kW
    eventLoad: Number, // kW
    actualReduction: Number, // kW
    performance: Number // % of target
  },

  participation: {
    participationStatus: String, // "opted_in" | "opted_out" | "auto_dispatched"
    optOutReason: String,
    curtailmentActions: [String],
    loadShiftActions: [String]
  },

  financials: {
    incentiveRate: Number, // $/kWh or $/kW
    totalIncentive: Number,
    penaltyRate: Number,
    totalPenalty: Number,
    netPayment: Number
  },

  verification: {
    baselineMethod: String, // "last_10_days" | "customer_baseline" | "meter_before_after"
    verified: Boolean,
    verificationDate: Date,
    verifier: String
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    notes: String,
    correlationId: String
  }
}

// Indexes
- facilityId: 1, event.startTime: -1
- organizationId: 1
- program.programName: 1
```

#### energy_storage_systems Collection
```javascript
{
  _id: ObjectId,
  systemId: String, // UUID
  systemName: String,
  facilityId: ObjectId,
  organizationId: ObjectId,

  type: String, // "battery" | "thermal" | "mechanical"

  specifications: {
    capacity: Number, // kWh
    powerRating: Number, // kW
    manufacturer: String,
    model: String,
    chemistry: String, // "lithium_ion" | "lead_acid" | "flow_battery" | "sodium_sulfur"
    installationDate: Date
  },

  performance: {
    roundTripEfficiency: Number, // %
    cycleLife: Number, // cycles
    cyclesCompleted: Number,
    degradationRate: Number, // % per year
    currentCapacity: Number, // kWh (accounting for degradation)
    warrantyExpiry: Date
  },

  operational: {
    status: String, // "active" | "standby" | "charging" | "discharging" | "maintenance"
    currentStateOfCharge: Number, // %
    minStateOfCharge: Number, // % (usually 20%)
    maxStateOfCharge: Number, // % (usually 80%)
    lastOperation: Date
  },

  gridServices: {
    services: [String], // "peak_shaving" | "frequency_regulation" | "voltage_support" | "arbitrage" | "backup"
    revenueToDate: Number,
    cyclesForGridServices: Number
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    tags: [String]
  }
}

// Indexes
- facilityId: 1
- organizationId: 1
- type: 1
- operational.status: 1
```

#### energy_storage_operations Collection (InfluxDB)
```javascript
// InfluxDB Measurement: energy_storage_operations
{
  timestamp: Time,

  // Tags
  storageSystemId: String,
  facilityId: String,
  organizationId: String,
  operationType: String, // "charge" | "discharge"
  gridService: String,

  // Fields
  energyAmount: Float, // kWh
  power: Float, // kW
  stateOfCharge: Float, // %
  efficiency: Float, // %
  revenue: Float,
  cost: Float,

  // Grid context
  gridPrice: Float, // $/kWh
  gridCarbonIntensity: Float, // gCO2/kWh

  correlationId: String
}
```

#### energy_procurement_contracts Collection
```javascript
{
  _id: ObjectId,
  contractId: String, // UUID
  contractName: String,
  organizationId: ObjectId,
  facilityIds: [ObjectId],

  supplier: {
    supplierName: String,
    supplierType: String, // "utility" | "retailer" | "generator"
    accountNumber: String,
    contactPerson: String,
    contactEmail: String,
    contactPhone: String
  },

  contractType: String, // "fixed_price" | "index_based" | "green_tariff" | "PPA" | "CCA"
  energySource: String,

  term: {
    startDate: Date,
    endDate: Date,
    durationMonths: Number,
    autoRenew: Boolean,
    renewalNotice: Number // days
  },

  volume: {
    annualVolume: Number, // kWh
    monthlyVolume: Number,
    takeOrPay: Boolean,
    minimumTake: Number, // %
    maximumTake: Number // %
  },

  pricing: {
    pricingStructure: String, // "fixed" | "indexed" | "hybrid"
    fixedPrice: Number, // $/kWh
    currency: String,
    indexBased: {
      index: String, // "HenryHub" | "NYMEX" | "ISO_RealTime"
      premium: Number, // $/kWh above index
      updateFrequency: String
    },
    escalationRate: Number, // % per year
    priceFloor: Number, // $/kWh
    priceCeiling: Number // $/kWh
  },

  renewable: {
    isRenewable: Boolean,
    renewableSource: String,
    recsIncluded: Boolean,
    recDeliveryMethod: String, // "bundled" | "unbundled"
    greenPremium: Number // $/kWh
  },

  deliveryType: String, // "physical" | "financial"

  terms: {
    renewalTerms: String,
    terminationClauses: String,
    earlyTerminationPenalty: Number,
    forcemajeure: String,
    disputeResolution: String
  },

  performance: {
    volumeDeliveredToDate: Number, // kWh
    totalCostToDate: Number,
    averagePriceToDate: Number, // $/kWh
    complianceRate: Number // %
  },

  status: String, // "active" | "pending" | "expired" | "terminated"

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    approvedAt: Date,
    approvedBy: ObjectId,
    documents: [{
      documentType: String,
      url: String,
      uploadDate: Date
    }],
    notes: String
  }
}

// Indexes
- organizationId: 1, status: 1
- facilityIds: 1
- supplier.supplierName: 1
- term.endDate: 1
- contractType: 1
```

#### energy_intensity_metrics Collection
```javascript
{
  _id: ObjectId,
  metricId: String, // UUID
  facilityId: ObjectId,
  organizationId: ObjectId,

  metricName: String,
  metricType: String, // "production" | "revenue" | "area" | "employees" | "custom"

  period: {
    startDate: Date,
    endDate: Date,
    periodType: String // "monthly" | "quarterly" | "annually"
  },

  energy: {
    consumption: Number, // kWh
    energySources: [{
      source: String,
      amount: Number
    }]
  },

  denominator: {
    type: String,
    value: Number,
    unit: String
  },

  intensity: {
    value: Number,
    unit: String, // "kWh/unit" | "kWh/sqft" | "kWh/$revenue" | "kWh/employee"
  },

  normalization: {
    weatherNormalized: Boolean,
    heatingDegreeDays: Number,
    coolingDegreeDays: Number,
    adjustmentFactor: Number
  },

  benchmarking: {
    targetValue: Number,
    percentageOfTarget: Number,
    industryBenchmark: Number,
    percentileRank: Number
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    calculationMethod: String,
    notes: String
  }
}

// Indexes
- facilityId: 1, period.startDate: -1
- organizationId: 1, metricType: 1
- period.startDate: 1, period.endDate: 1
```

### 2.2 Redis Cache Structure

```javascript
// Real-time meter readings cache (TTL: 1 hour)
energy:meter:{meterId}:latest = {
  timestamp: Date,
  reading: Number,
  unit: String,
  dataQuality: String
}

// Real-time electricity pricing cache (TTL: 15 minutes)
energy:pricing:{facilityId}:current = {
  timestamp: Date,
  price: Number,
  period: String,
  carbonIntensity: Number
}

// Grid carbon intensity cache (TTL: 1 hour)
energy:grid:carbon:{region}:current = {
  timestamp: Date,
  carbonIntensity: Number,
  source: String
}

// Demand response active events cache (TTL: event duration)
energy:dr:active:{facilityId} = {
  eventId: String,
  startTime: Date,
  endTime: Date,
  requestedReduction: Number
}

// Battery storage state cache (TTL: 5 minutes)
energy:storage:{systemId}:state = {
  timestamp: Date,
  stateOfCharge: Number,
  status: String,
  currentOperation: String
}

// REC inventory summary cache (TTL: 1 day)
energy:rec:inventory:{organizationId} = {
  totalActive: Number,
  totalRetired: Number,
  vintages: Object
}

// Energy consumption aggregations cache (TTL: 1 hour)
energy:consumption:daily:{facilityId}:{date} = Number
energy:consumption:monthly:{facilityId}:{yearMonth} = Number

// ISO 50001 EnPI current values cache (TTL: 1 day)
energy:enpi:{enpiId}:current = {
  value: Number,
  percentageChange: Number,
  status: String
}
```

## 3. Integration Points

### 3.1 Service Dependencies

#### Consumes Events From:

**Organization Service (3002)**:
```yaml
organization.facility.created.v1:
  Purpose: Initialize energy tracking for new facility
  Action: Create default meters, establish baseline capability

organization.facility.updated.v1:
  Purpose: Update facility energy configuration
  Action: Update meter associations, recalculate intensity metrics

organization.facility.deleted.v1:
  Purpose: Archive energy data for deleted facility
  Action: Soft delete meters, archive consumption data
```

**Activity Service (3004)**:
```yaml
activity.iot-data.ingested.v1:
  Purpose: Receive real-time smart meter readings
  Action: Store consumption data, trigger anomaly detection

activity.data.validation-failed.v1:
  Purpose: Handle failed meter data validation
  Action: Flag data quality issues, estimate missing values
```

**Carbon Service (3011)** [CRITICAL BIDIRECTIONAL INTEGRATION]:
```yaml
carbon.emission-factor.updated.v1:
  Purpose: Update grid carbon intensity factors
  Action: Recalculate Scope 2 emissions, update CFE scores

carbon.scope2.calculation-requested.v1:
  Purpose: Provide electricity consumption for Scope 2
  Action: Query consumption data, aggregate by source and location
```

**Reference Service (3003)**:
```yaml
reference.emission-factor.created.v1:
  Purpose: Receive new grid emission factors
  Action: Update location-based and market-based factors

reference.rec-factor.updated.v1:
  Purpose: Update renewable energy certificate factors
  Action: Recalculate market-based Scope 2
```

#### Publishes Events:

```yaml
energy.consumption.recorded.v1:
  Payload:
    - consumptionId: string
    - facilityId: string
    - organizationId: string
    - energySource: string
    - consumptionAmount: number
    - unit: string
    - period: { startDate, endDate }
    - readingType: string
    - carbonIntensity: number
  Consumers:
    - Carbon Service (3011) - Scope 2 calculations
    - Calculation Service (3005) - Emissions aggregation
    - Reporting Service (3044) - GRI 302, CSRD reporting
    - Analytics Service (3045) - Trend analysis

energy.renewable-generation.recorded.v1:
  Payload:
    - generationId: string
    - facilityId: string
    - renewableType: string
    - generationAmount: number
    - selfConsumed: number
    - exportedToGrid: number
  Consumers:
    - Carbon Service (3011) - Avoided emissions
    - Reporting Service (3044) - RE100 reporting

energy.rec.purchased.v1:
  Payload:
    - purchaseId: string
    - organizationId: string
    - recType: string
    - quantity: number
    - vintage: number
    - registry: string
  Consumers:
    - Carbon Service (3011) - Market-based Scope 2
    - Reporting Service (3044) - CDP disclosure

energy.rec.retired.v1:
  Payload:
    - retirementId: string
    - purchaseId: string
    - quantityRetired: number
    - retirementPeriod: object
    - claimType: string
  Consumers:
    - Carbon Service (3011) - Update market-based Scope 2
    - Reporting Service (3044) - Scope 2 dual reporting
    - Audit Service (3007) - REC retirement audit trail

energy.efficiency-project.completed.v1:
  Payload:
    - projectId: string
    - facilityId: string
    - verifiedSavings: number
    - actualCost: number
    - payback: number
  Consumers:
    - Reporting Service (3044) - Energy efficiency disclosure
    - Strategy Service (3042) - Target progress tracking

energy.target.achieved.v1:
  Payload:
    - targetId: string
    - targetType: string (efficiency | renewable | intensity)
    - achievementDate: Date
  Consumers:
    - Strategy Service (3042) - Goal tracking
    - Reporting Service (3044) - Milestone reporting

energy.peak-demand.exceeded.v1:
  Payload:
    - facilityId: string
    - peakDemand: number
    - thresholdExceeded: number
    - timestamp: Date
  Consumers:
    - Notification Service - Alert facility manager
    - Analytics Service (3045) - Demand pattern analysis

energy.demand-response.triggered.v1:
  Payload:
    - eventId: string
    - facilityId: string
    - requestedReduction: number
    - eventDuration: number
  Consumers:
    - Activity Service (3004) - Track DR actions
    - Reporting Service (3044) - Grid services revenue

energy.baseline.established.v1:
  Payload:
    - baselineId: string
    - facilityId: string
    - totalConsumption: number
    - normalizationFactors: object
  Consumers:
    - Strategy Service (3042) - ISO 50001 tracking
    - Reporting Service (3044) - EnMS reporting

energy.enpi.threshold-exceeded.v1:
  Payload:
    - enpiId: string
    - currentValue: number
    - threshold: number
    - severity: string
  Consumers:
    - Notification Service - Alert energy manager
    - Strategy Service (3042) - Corrective action planning
```

### 3.2 External Integrations

#### Smart Meter & IoT Platforms:
```yaml
Schneider Electric EcoStruxure:
  Protocol: REST API + MQTT
  Data: Real-time electricity, gas consumption
  Frequency: 15-minute intervals

Siemens Building Automation:
  Protocol: BACnet/IP, Modbus TCP
  Data: HVAC energy, lighting, equipment meters
  Frequency: 1-minute intervals

ABB Ability:
  Protocol: REST API
  Data: Industrial equipment energy monitoring
  Frequency: Real-time

Utility Smart Meters (AMI):
  Protocol: Green Button API, utility-specific APIs
  Data: Whole-building consumption, demand
  Frequency: Hourly or 15-minute
```

#### Grid & Market Data:
```yaml
WattTime API:
  Purpose: Real-time grid carbon intensity
  Protocol: REST API
  Data: Marginal emissions (MOER), location-based emissions
  Frequency: 5-minute updates

ElectricityMap API:
  Purpose: Global grid carbon intensity
  Protocol: REST API
  Data: Real-time and historical carbon intensity
  Coverage: 50+ countries

ISO/RTO Real-Time Pricing:
  Examples: CAISO, PJM, ERCOT, NYISO, ISO-NE
  Protocol: REST API, OASIS
  Data: Real-time electricity prices (LMP), day-ahead prices
  Frequency: 5-minute or hourly

EIA Grid Emission Factors:
  Purpose: Annual average grid factors
  Protocol: REST API
  Data: eGRID subregion emission factors
  Frequency: Annual updates
```

#### REC Registries:
```yaml
M-RETS (Midwest):
  Protocol: REST API + SFTP
  Operations: REC purchase, retirement, transfer
  Data: Certificate details, ownership, vintage

PJM-GATS (PJM region):
  Protocol: Web portal + API
  Operations: REC management, retirement
  Data: Generation attributes, certificate tracking

APX TIGR (Texas):
  Protocol: REST API
  Operations: REC issuance, retirement
  Data: Texas renewable generation tracking

I-REC Standard (International):
  Protocol: Registry-specific APIs
  Operations: International REC tracking
  Coverage: 50+ countries
```

#### RE100 Reporting:
```yaml
RE100 Reporting Platform:
  Protocol: Web portal + data upload
  Frequency: Annual
  Data: Total electricity, renewable percentage, sources

CDP Climate Change:
  Protocol: Web portal + API
  Frequency: Annual
  Data: Energy consumption (C8), Scope 2 methodology (C6)
```

#### Building Management Systems:
```yaml
Johnson Controls Metasys:
  Protocol: BACnet, REST API
  Data: HVAC energy, setpoints, schedules

Honeywell Building Solutions:
  Protocol: BACnet, REST API
  Data: Building automation energy data

Tridium Niagara:
  Protocol: BACnet, Haystack
  Data: Unified building data
```

#### ERP Integration:
```yaml
SAP S/4HANA:
  Purpose: Production data for intensity metrics
  Protocol: OData, REST API
  Data: Production volumes, operating hours, revenue

Oracle ERP Cloud:
  Purpose: Financial data for energy spend analytics
  Protocol: REST API
  Data: Invoice data, budget vs. actual
```

#### Utility Company APIs:
```yaml
Utility Bill Upload:
  Protocol: Green Button Connect My Data
  Data: Historical consumption, demand, cost
  Format: XML (ESPI)

Utility Demand Response:
  Protocol: OpenADR 2.0b
  Data: DR event notifications, baseline, performance

Utility Rate Tariffs:
  Protocol: Utility-specific APIs
  Data: Current tariff rates, TOU schedules
```

### 3.3 API Authentication

```yaml
Internal Services (Service-to-Service):
  Method: JWT with service account
  Headers:
    - Authorization: Bearer {service-token}
    - X-Correlation-Id: {uuid}

External IoT Devices:
  Method: MQTT with TLS + API Key
  Auth: Username/password + certificate

External APIs (WattTime, registries):
  Method: API Key or OAuth 2.0
  Rate Limits: Varies by provider

User-facing APIs:
  Method: JWT (via Gateway)
  RBAC: Facility-level permissions
```

## 4. Technical Requirements

### 4.1 Performance Requirements

```yaml
API Response Times (p95):
  - GET /energy/consumption (single record): <50ms
  - GET /energy/consumption (query): <200ms
  - POST /energy/consumption: <100ms
  - GET /energy/meters/:meterId/readings: <150ms
  - GET /energy/re100/progress: <300ms
  - GET /energy/iso50001/certification-readiness: <500ms

Data Ingestion:
  - Real-time meter readings: 5M+ readings/day
  - Batch consumption upload: 100k records in <2 minutes
  - IoT data ingestion throughput: 10,000 readings/second

Database Performance:
  - InfluxDB write throughput: 100k points/second
  - MongoDB query response: <100ms (p95)
  - Redis cache hit rate: >95%

Concurrent Users:
  - Support 5,000 concurrent facility managers
  - Support 50,000 concurrent IoT devices

Data Retention:
  - Real-time data (15-min intervals): 2 years (InfluxDB)
  - Hourly aggregations: 5 years
  - Daily aggregations: 10 years
  - Monthly/Annual: Indefinite
  - MongoDB transactional data: 7 years
```

### 4.2 Scalability Requirements

```yaml
Horizontal Scaling:
  - Auto-scale API pods based on CPU (target: 70%)
  - Scale InfluxDB read replicas for query performance
  - Partition MongoDB by organizationId (sharding)

Data Volume:
  - Support 100,000+ facilities
  - Support 1M+ smart meters
  - Store 10B+ meter readings per year
  - Handle 1M+ REC transactions per year

Multi-Region:
  - US, EU, APAC regions
  - Data residency compliance (GDPR)
  - <100ms cross-region API latency
```

### 4.3 Security Requirements

```yaml
Data Protection:
  - Encrypt PII at rest (AES-256)
  - Encrypt data in transit (TLS 1.3)
  - Encrypt sensitive fields (API keys, secrets)

Access Control:
  - Facility-level RBAC
  - Energy manager role
  - Sustainability manager role
  - Read-only analyst role

Audit Trail:
  - Log all REC retirements
  - Log all baseline changes
  - Log all efficiency project verifications
  - Retain audit logs for 7 years

Compliance:
  - SOC 2 Type II
  - ISO 27001
  - GDPR (for EU facilities)
```

### 4.4 Monitoring & Observability

```yaml
Application Metrics:
  - API request rate, latency, errors
  - Database connection pool utilization
  - Cache hit/miss rates
  - Event publish success/failure rates

Business Metrics:
  - Total energy consumption (real-time dashboard)
  - Renewable energy percentage (RE100)
  - Energy efficiency project savings
  - REC inventory levels
  - Demand response participation rate

IoT Monitoring:
  - Meter communication health (last seen)
  - Data quality score by meter
  - Missing data percentage
  - Anomaly detection alerts

Alerts:
  - Peak demand threshold exceeded
  - Meter communication failure (>1 hour offline)
  - REC inventory low (<10% of annual consumption)
  - Energy consumption anomaly (>20% deviation)
  - ISO 50001 audit due soon
  - EnPI threshold exceeded
```

## 5. Testing Strategy

### 5.1 Unit Tests (Target: 90% coverage)

```yaml
Focus Areas:
  - Energy intensity calculations
  - REC quality criteria validation
  - Scope 2 emission calculation logic
  - M&V savings verification algorithms
  - Baseline model regression calculations
  - EnPI calculations (static, regression, engineering)
  - Demand response performance calculations
  - Battery storage optimization algorithms
  - Unit conversions (kWh, MWh, therms, MMBtu, GJ)
  - Weather normalization (degree days)
```

### 5.2 Integration Tests (Target: 80% coverage)

```yaml
Service Integration:
  - Organization Service: Facility creation triggers meter setup
  - Activity Service: IoT data ingestion to consumption records
  - Carbon Service: Consumption event triggers Scope 2 calculation
  - Reference Service: Emission factor updates propagate

External Integration Tests:
  - Mock WattTime API for carbon intensity
  - Mock REC registry APIs
  - Mock utility DR API (OpenADR)
  - Mock smart meter MQTT messages

Database Integration:
  - MongoDB + InfluxDB dual-write consistency
  - Redis cache invalidation on data update
  - Time-series aggregation queries
```

### 5.3 E2E Tests

```yaml
Critical User Flows:
  1. Facility Energy Manager Records Consumption:
     - Upload monthly utility bill data
     - Verify consumption stored in both MongoDB and InfluxDB
     - Check energy intensity auto-calculated
     - Verify Scope 2 event published to Carbon Service

  2. Sustainability Manager Purchases and Retires RECs:
     - Purchase RECs with quality criteria validation
     - Verify inventory updated
     - Retire RECs for Scope 2 claim
     - Check market-based Scope 2 recalculated
     - Verify audit trail created

  3. Energy Manager Implements Efficiency Project:
     - Create project with baseline data
     - Mark project completed
     - Verify M&V savings with IPMVP protocol
     - Check project ROI calculated
     - Verify efficiency target progress updated

  4. ISO 50001 Coordinator Establishes Baseline:
     - Define baseline period and normalization factors
     - Create regression-based baseline model
     - Identify significant energy uses (SEUs)
     - Create EnPIs with targets
     - Verify certification readiness assessment

  5. IoT Device Sends Real-Time Meter Reading:
     - MQTT message received from smart meter
     - Consumption stored in InfluxDB
     - Anomaly detection runs
     - Peak demand alert triggered if threshold exceeded
     - Dashboard updated in real-time

  6. Demand Response Coordinator Participates in DR Event:
     - Receive DR event notification via OpenADR
     - Record baseline and event load
     - Calculate actual reduction
     - Verify performance against target
     - Calculate incentive payment

  7. Sustainability Director Generates RE100 Report:
     - Aggregate total electricity consumption
     - Sum renewable sources (on-site + purchased)
     - Calculate renewable percentage
     - Validate quality criteria for all RECs retired
     - Generate annual RE100 submission report
```

### 5.4 Performance Tests

```yaml
Load Tests:
  - 10,000 concurrent smart meter readings/second
  - 1,000 concurrent API requests
  - Batch upload 100k consumption records
  - Query 1 year of 15-minute interval data

Stress Tests:
  - Peak DR event (10,000 facilities participating simultaneously)
  - End-of-month billing (all facilities upload utility bills)
  - Annual RE100 reporting (aggregate all consumption)

Endurance Tests:
  - 72-hour continuous meter data ingestion
  - 30-day continuous operation under normal load
```

### 5.5 Security Tests

```yaml
Authentication:
  - JWT token validation
  - Service-to-service authentication
  - API key validation for IoT devices

Authorization:
  - Facility-level access control
  - Cannot access other organization's data
  - Energy manager vs. analyst permissions

Input Validation:
  - SQL/NoSQL injection prevention
  - XSS prevention
  - Consumption amount validation (non-negative, reasonable range)
  - REC vintage validation (year <= current year)

Data Protection:
  - PII encryption at rest
  - TLS for all API calls
  - Secrets encrypted in database
```

## 6. Deployment Strategy

### 6.1 Infrastructure

```yaml
AWS Services:
  Compute:
    - ECS Fargate for API services (auto-scaling 2-20 tasks)

  Databases:
    - MongoDB Atlas M30 cluster (3 nodes, auto-scaling)
    - InfluxDB Cloud (dedicated, auto-scaling)
    - ElastiCache Redis (cluster mode, 3 shards)

  Storage:
    - S3 for document storage (efficiency project docs, contracts)

  Networking:
    - Application Load Balancer
    - VPC with private subnets
    - NAT Gateway for external API calls

  Messaging:
    - EventBridge for event bus
    - IoT Core for MQTT device connections

  Monitoring:
    - CloudWatch for logs and metrics
    - X-Ray for distributed tracing

Resource Estimates (Production):
  API Service:
    - 4 vCPU, 8GB RAM per task
    - Auto-scale: 2-20 tasks

  InfluxDB:
    - Dedicated cluster with SSD storage
    - 16GB RAM minimum
    - Auto-scaling storage (100GB - 10TB)

  MongoDB:
    - M30 cluster (8GB RAM, 2 vCPU per node)
    - 500GB storage initial, auto-scaling

  Redis:
    - 3 shards, 2 replicas per shard
    - 4GB RAM per shard
```

### 6.2 CI/CD Pipeline

```yaml
GitHub Actions Workflow:
  1. Code Push to feature branch
  2. Run linter (ESLint)
  3. Run unit tests (Jest)
  4. Run integration tests (Testcontainers)
  5. Build Docker image
  6. Push to ECR (dev tag)
  7. Deploy to dev environment

  Pull Request to develop:
  8. Run E2E tests (Cypress)
  9. Run security scan (Snyk, Trivy)
  10. Require code review approval

  Merge to develop:
  11. Deploy to staging environment
  12. Run smoke tests
  13. Run performance tests

  Release tag (vX.Y.Z):
  14. Build production image
  15. Push to ECR (production tag)
  16. Deploy to production (blue-green)
  17. Health check
  18. Route traffic to new version
  19. Monitor for 1 hour
  20. Rollback if errors >1%

Deployment Frequency:
  - Dev: On every commit
  - Staging: Daily
  - Production: Weekly (or on-demand)
```

### 6.3 Rollback Strategy

```yaml
Automated Rollback Triggers:
  - Error rate >1% for 5 minutes
  - p95 latency >500ms for 5 minutes
  - Health check failures >3 consecutive

Manual Rollback:
  - On-call engineer decision
  - Blue-green deployment swap
  - Rollback time: <5 minutes

Database Migrations:
  - Backward-compatible migrations only
  - Never drop columns in same release
  - Data backups before migration
  - Migration rollback scripts ready
```

## 7. Documentation Requirements

```yaml
API Documentation:
  - OpenAPI 3.0 specification
  - Swagger UI hosted at /api/docs
  - Request/response examples
  - Error code reference

Integration Guides:
  - Smart meter integration guide
  - REC registry integration guide
  - Utility API integration guide
  - OpenADR demand response guide

User Guides:
  - Energy manager quick start
  - ISO 50001 implementation guide
  - RE100 reporting guide
  - M&V savings verification guide
  - REC procurement best practices

Runbooks:
  - Meter communication failure
  - InfluxDB performance degradation
  - Demand response event handling
  - REC retirement process
  - Baseline recalculation procedure
```

## 8. Compliance & Standards

```yaml
Energy Management Standards:
  ISO 50001:
    - Energy policy and objectives
    - Energy baseline and EnPIs
    - Significant energy uses (SEUs)
    - Operational controls
    - Management review
    - Continuous improvement

  IPMVP (M&V Protocol):
    - Option A: Retrofit isolation (key parameters)
    - Option B: Retrofit isolation (all parameters)
    - Option C: Whole facility
    - Option D: Calibrated simulation

Reporting Frameworks:
  GRI 302 (Energy):
    - 302-1: Energy consumption within organization
    - 302-2: Energy consumption outside organization
    - 302-3: Energy intensity
    - 302-4: Reduction of energy consumption
    - 302-5: Reductions in energy requirements

  CSRD ESRS E1 (Climate Change):
    - Energy consumption and mix
    - Energy intensity
    - Renewable energy percentage

  CDP Climate Change:
    - C8: Energy (consumption, renewable %)
    - C6: Emissions data (Scope 2 methodology)

  GHG Protocol Scope 2 Guidance:
    - Dual reporting (location-based + market-based)
    - Quality criteria for contractual instruments
    - Hierarchy of instruments
    - Residual mix factors

  RE100 Technical Criteria:
    - 100% renewable electricity target
    - Eligible renewable sources
    - Credible renewable energy sourcing
    - Quality criteria alignment

  UN SDG 7 (Affordable and Clean Energy):
    - 7.2: Renewable energy share
    - 7.3: Energy efficiency improvement

Certifications Supported:
  - ISO 50001 Energy Management System
  - ENERGY STAR Portfolio Manager
  - LEED Energy & Atmosphere credits
  - BREEAM Energy performance
```

## 9. Migration from Legacy System

```yaml
Legacy Data Sources:
  - Manual utility bill uploads (Excel/CSV)
  - Scattered meter data in building management systems
  - REC purchases tracked in spreadsheets
  - Efficiency projects in project management tools

Migration Strategy:
  Phase 1: Data Extraction
    - Export historical consumption (3 years minimum)
    - Extract meter configurations
    - Export REC purchase and retirement records
    - Extract efficiency project data

  Phase 2: Data Transformation
    - Normalize units (all to kWh for electricity)
    - Standardize energy source names
    - Validate REC quality criteria
    - Recalculate baselines with new methodology

  Phase 3: Data Loading
    - Load meters first
    - Load historical consumption to InfluxDB
    - Load REC inventory to MongoDB
    - Load efficiency projects with status
    - Establish baselines for ISO 50001

  Phase 4: Validation
    - Verify total consumption matches legacy
    - Verify REC inventory balances
    - Recalculate Scope 2 with new system
    - Compare results to legacy reports

  Phase 5: Cutover
    - Parallel run for 1 month
    - Compare reports side-by-side
    - Train users on new system
    - Deprecate legacy system

Data Quality Checks:
  - No negative consumption values
  - No future-dated consumption
  - REC vintage <= current year
  - Retired RECs <= purchased RECs
  - Baseline period >= 12 months
  - EnPI denominators non-zero
```

## 10. Future Enhancements (Post-MVP)

```yaml
Advanced Analytics:
  - Machine learning for consumption forecasting
  - Anomaly detection for meter data
  - Predictive maintenance for renewable systems
  - Energy price forecasting
  - Optimal battery dispatch algorithms

Enhanced Integrations:
  - DERMS (Distributed Energy Resource Management) integration
  - Vehicle-to-Grid (V2G) bidirectional charging
  - Blockchain-based REC tracking
  - Carbon-free energy 24/7 matching (Google/Microsoft model)

User Experience:
  - Mobile app for facility managers
  - Real-time energy dashboard (WebSocket)
  - Augmented reality for equipment energy audits
  - Voice commands for energy queries

Regulatory:
  - SEC climate disclosure rules (when finalized)
  - EU Taxonomy alignment
  - California SB 253 climate disclosure
  - Task Force on Climate-related Financial Disclosures (TCFD)
```

---

## Appendix A: Energy Source Reference

```yaml
Electricity:
  Unit: kWh, MWh, GWh
  Scope: Scope 2 (purchased electricity)
  Carbon Intensity: Varies by grid region (0-1000+ gCO2/kWh)

Natural Gas:
  Unit: therms, MMBtu, GJ, m³
  Scope: Scope 1 (combustion)
  Carbon Intensity: ~53 kgCO2/MMBtu

Diesel:
  Unit: gallons, liters, MMBtu
  Scope: Scope 1 (mobile or stationary combustion)
  Carbon Intensity: ~10.2 kgCO2/gallon

Fuel Oil:
  Unit: gallons, liters, MMBtu
  Scope: Scope 1
  Carbon Intensity: ~11.3 kgCO2/gallon (No. 2 fuel oil)

Propane (LPG):
  Unit: gallons, liters, MMBtu
  Scope: Scope 1
  Carbon Intensity: ~5.7 kgCO2/gallon

Coal:
  Unit: short tons, metric tons, MMBtu
  Scope: Scope 1
  Carbon Intensity: ~93 kgCO2/MMBtu

Biomass:
  Unit: MMBtu, metric tons
  Scope: Scope 1 (often reported as net-zero under certain standards)
  Carbon Intensity: Varies (biogenic vs. fossil CO2)
```

## Appendix B: Renewable Energy Source Reference

```yaml
Solar PV:
  Typical Capacity Factor: 15-25%
  Expected Lifetime: 25-30 years
  Degradation Rate: 0.5-0.8% per year
  Performance Ratio: 75-85%

Wind (Onshore):
  Typical Capacity Factor: 30-45%
  Expected Lifetime: 20-25 years

Wind (Offshore):
  Typical Capacity Factor: 40-50%
  Expected Lifetime: 25-30 years

Hydroelectric:
  Typical Capacity Factor: 40-90%
  Expected Lifetime: 50+ years

Geothermal:
  Typical Capacity Factor: 70-90%
  Expected Lifetime: 20-30 years

Biomass:
  Typical Capacity Factor: 70-85%
  Expected Lifetime: 20-30 years
  Sustainability Criteria: Important for RE100 eligibility
```

## Appendix C: Grid Carbon Intensity Factors (Sample)

```yaml
United States (eGRID 2021):
  CAMX (California): 203 gCO2/kWh
  ERCT (Texas): 411 gCO2/kWh
  NYCW (New York City): 244 gCO2/kWh
  RFCE (Mid-Atlantic): 340 gCO2/kWh
  WECC (West): 357 gCO2/kWh

Europe (2023 estimates):
  France: 52 gCO2/kWh (high nuclear)
  Germany: 380 gCO2/kWh
  UK: 220 gCO2/kWh
  Norway: 17 gCO2/kWh (high hydro)
  Poland: 750 gCO2/kWh (high coal)

Asia Pacific:
  Japan: 480 gCO2/kWh
  South Korea: 420 gCO2/kWh
  Australia (NSW): 720 gCO2/kWh
  Singapore: 420 gCO2/kWh
  India: 630 gCO2/kWh
```

## Appendix D: Energy Unit Conversions

```yaml
Electricity:
  1 kWh = 3,412 Btu
  1 MWh = 1,000 kWh
  1 GWh = 1,000,000 kWh

Natural Gas:
  1 therm = 100,000 Btu
  1 MMBtu = 10 therms
  1 GJ = 0.948 MMBtu
  1 m³ (natural gas) ≈ 0.037 MMBtu (varies by gas quality)

Fuel Oil:
  1 gallon No. 2 fuel oil = 138,500 Btu
  1 gallon = 3.785 liters

Diesel:
  1 gallon diesel = 137,381 Btu
  1 liter diesel = 36,300 Btu

Propane:
  1 gallon propane = 91,452 Btu

Coal:
  1 short ton bituminous coal = 24.93 MMBtu (average)
  1 metric ton = 1.102 short tons
```

---

**Service Owner**: Environmental Domain Team
**Last Updated**: November 20, 2025
**Version**: 1.0.0
**Next Review**: End of Phase 3 Sprint 2
