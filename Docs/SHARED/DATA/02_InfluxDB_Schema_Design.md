# InfluxDB Schema Design for ESG Time-Series Data

## Overview

This document defines the InfluxDB schema design for storing and querying time-series ESG (Environmental, Social, Governance) metrics in the Clenergize V3 platform. InfluxDB 2.x is used to handle high-volume, high-velocity environmental sensor data, operational metrics, and real-time ESG indicators.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              INFLUXDB ESG DATA ARCHITECTURE                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Data Sources:                                              │
│  • IoT Sensors (energy meters, water flow, air quality)    │
│  • Building Management Systems (HVAC, lighting)            │
│  • Manufacturing Equipment (production lines, machines)     │
│  • Vehicle Telematics (fleet emissions, fuel consumption)  │
│  • Manual Data Entry (waste audits, safety incidents)      │
│                                                             │
│  Buckets (Databases):                                       │
│  • environmental_metrics - E dimension data                │
│  • social_metrics - S dimension data                       │
│  • governance_metrics - G dimension data                   │
│  • operational_metrics - Cross-cutting operational data    │
│  • aggregated_metrics - Pre-computed aggregations          │
│                                                             │
│  Retention Policies:                                        │
│  • Raw data: 2 years                                       │
│  • Hourly aggregates: 5 years                              │
│  • Daily aggregates: 10 years                              │
│  • Monthly/Yearly: Indefinite                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Model Design

### Core Concepts

**Measurement**: Category of ESG metric (e.g., `energy_consumption`, `water_usage`, `emissions`)
**Tags**: Indexed metadata for filtering (e.g., `facility_id`, `source`, `scope`)
**Fields**: Actual metric values (e.g., `value`, `carbon_intensity`, `uncertainty`)
**Timestamp**: Time of measurement (nanosecond precision)

## Environmental Metrics Schema

### 1. Energy Consumption

```influx
measurement: energy_consumption
tags:
  - organization_id (string): Organization identifier
  - facility_id (string): Facility/site identifier
  - building_id (string): Building identifier
  - meter_id (string): Energy meter identifier
  - energy_type (string): electricity|natural_gas|fuel_oil|steam|solar|wind|other
  - source_category (string): purchased|generated|renewable
  - scope (string): scope1|scope2|scope3
  - unit (string): kWh|MWh|GJ|BTU
fields:
  - value (float): Energy consumption value
  - carbon_intensity (float): kgCO2e per unit
  - renewable_percentage (float): % of renewable energy
  - cost (float): Energy cost in currency
  - peak_demand (float): Peak demand value
  - power_factor (float): Power quality metric
  - uncertainty (float): Measurement uncertainty %
timestamp: 2024-11-23T10:30:00Z
```

**Example Data Point**:
```influx
energy_consumption,organization_id=org-001,facility_id=fac-001,building_id=bld-001,meter_id=meter-001,energy_type=electricity,source_category=purchased,scope=scope2,unit=kWh value=1250.5,carbon_intensity=0.385,renewable_percentage=35.2,cost=187.58,peak_demand=85.3,power_factor=0.95,uncertainty=2.5 1700740200000000000
```

### 2. GHG Emissions

```influx
measurement: ghg_emissions
tags:
  - organization_id (string): Organization identifier
  - facility_id (string): Facility identifier
  - source_id (string): Emission source identifier
  - scope (string): scope1|scope2|scope3
  - category (string): stationary|mobile|process|fugitive|purchased
  - ghg_type (string): CO2|CH4|N2O|HFCs|PFCs|SF6|NF3
  - activity_type (string): combustion|transportation|manufacturing|etc
  - calculation_method (string): measured|calculated|estimated
  - unit (string): kgCO2e|tCO2e|MTCO2e
fields:
  - value (float): Emissions value
  - co2_equivalent (float): CO2 equivalent value
  - emission_factor (float): Applied emission factor
  - activity_data (float): Activity data used in calculation
  - uncertainty (float): Uncertainty percentage
  - biogenic_co2 (float): Biogenic CO2 emissions
timestamp: 2024-11-23T10:30:00Z
```

### 3. Water Metrics

```influx
measurement: water_usage
tags:
  - organization_id (string): Organization identifier
  - facility_id (string): Facility identifier
  - meter_id (string): Water meter identifier
  - water_source (string): municipal|groundwater|surface|rainwater|recycled
  - water_quality (string): potable|non_potable|process|cooling
  - usage_category (string): production|cooling|domestic|irrigation
  - unit (string): liters|gallons|cubic_meters
fields:
  - volume (float): Water volume consumed
  - flow_rate (float): Current flow rate
  - temperature (float): Water temperature
  - ph_level (float): pH level
  - tds (float): Total dissolved solids
  - cost (float): Water cost
  - recycled_percentage (float): % of recycled water
timestamp: 2024-11-23T10:30:00Z
```

### 4. Waste Metrics

```influx
measurement: waste_generation
tags:
  - organization_id (string): Organization identifier
  - facility_id (string): Facility identifier
  - waste_stream (string): Stream identifier
  - waste_type (string): hazardous|non_hazardous|recyclable|compostable
  - material_type (string): plastic|paper|metal|glass|organic|electronic|other
  - disposal_method (string): landfill|incineration|recycling|composting|recovery
  - unit (string): kg|tons|cubic_meters
fields:
  - weight (float): Waste weight
  - volume (float): Waste volume
  - recycling_rate (float): Recycling percentage
  - diversion_rate (float): Landfill diversion rate
  - contamination_rate (float): Contamination percentage
  - disposal_cost (float): Disposal cost
  - recovered_value (float): Value from waste recovery
timestamp: 2024-11-23T10:30:00Z
```

### 5. Air Quality Metrics

```influx
measurement: air_quality
tags:
  - organization_id (string): Organization identifier
  - facility_id (string): Facility identifier
  - sensor_id (string): Air quality sensor ID
  - location_type (string): indoor|outdoor|stack|ambient
  - pollutant (string): PM2.5|PM10|NOx|SO2|CO|O3|VOC
  - unit (string): ug/m3|ppm|ppb
fields:
  - concentration (float): Pollutant concentration
  - aqi_value (integer): Air Quality Index
  - temperature (float): Ambient temperature
  - humidity (float): Relative humidity
  - wind_speed (float): Wind speed (outdoor)
  - wind_direction (float): Wind direction degrees
  - pressure (float): Atmospheric pressure
timestamp: 2024-11-23T10:30:00Z
```

## Social Metrics Schema

### 6. Health & Safety

```influx
measurement: safety_metrics
tags:
  - organization_id (string): Organization identifier
  - facility_id (string): Facility identifier
  - department_id (string): Department identifier
  - incident_type (string): injury|illness|near_miss|fatality
  - severity (string): minor|moderate|severe|fatal
  - body_part (string): hand|back|eye|respiratory|other
  - root_cause (string): equipment|procedure|training|environment
fields:
  - incident_count (integer): Number of incidents
  - lost_time_days (integer): Days of lost time
  - trir (float): Total Recordable Incident Rate
  - ltifr (float): Lost Time Injury Frequency Rate
  - severity_rate (float): Injury severity rate
  - first_aid_cases (integer): First aid cases
  - medical_treatment_cases (integer): Medical treatment cases
  - restricted_work_cases (integer): Restricted work cases
timestamp: 2024-11-23T10:30:00Z
```

### 7. Workforce Metrics

```influx
measurement: workforce_metrics
tags:
  - organization_id (string): Organization identifier
  - facility_id (string): Facility identifier
  - department_id (string): Department identifier
  - demographic_category (string): gender|age|ethnicity|disability
  - employment_type (string): full_time|part_time|contract|temporary
  - job_level (string): entry|professional|management|executive
fields:
  - headcount (integer): Number of employees
  - turnover_rate (float): Employee turnover %
  - retention_rate (float): Employee retention %
  - engagement_score (float): Engagement survey score
  - training_hours (float): Training hours per employee
  - diversity_index (float): Diversity index score
  - pay_equity_ratio (float): Pay equity ratio
timestamp: 2024-11-23T10:30:00Z
```

## Governance Metrics Schema

### 8. Compliance Metrics

```influx
measurement: compliance_metrics
tags:
  - organization_id (string): Organization identifier
  - regulation_id (string): Regulation identifier
  - jurisdiction (string): Country/state/region
  - compliance_area (string): environmental|safety|data_privacy|financial
  - framework (string): ISO14001|ISO45001|GDPR|SOX|etc
fields:
  - compliance_score (float): Compliance percentage
  - violations_count (integer): Number of violations
  - fines_amount (float): Monetary fines
  - corrective_actions (integer): Number of corrective actions
  - audit_findings (integer): Audit finding count
  - critical_findings (integer): Critical findings
  - open_items (integer): Open compliance items
timestamp: 2024-11-23T10:30:00Z
```

## Aggregation Strategies

### Continuous Queries for Aggregation

```sql
-- Hourly energy aggregation
CREATE CONTINUOUS QUERY cq_hourly_energy ON environmental_metrics
BEGIN
  SELECT
    mean("value") as avg_consumption,
    sum("value") as total_consumption,
    max("value") as peak_consumption,
    mean("carbon_intensity") as avg_carbon_intensity,
    mean("renewable_percentage") as avg_renewable_pct
  INTO aggregated_metrics.hourly_energy
  FROM energy_consumption
  GROUP BY time(1h), organization_id, facility_id, energy_type
END

-- Daily emissions aggregation
CREATE CONTINUOUS QUERY cq_daily_emissions ON environmental_metrics
BEGIN
  SELECT
    sum("value") as total_emissions,
    sum("co2_equivalent") as total_co2e,
    mean("uncertainty") as avg_uncertainty
  INTO aggregated_metrics.daily_emissions
  FROM ghg_emissions
  GROUP BY time(1d), organization_id, facility_id, scope
END

-- Monthly water aggregation
CREATE CONTINUOUS QUERY cq_monthly_water ON environmental_metrics
BEGIN
  SELECT
    sum("volume") as total_volume,
    mean("flow_rate") as avg_flow_rate,
    mean("recycled_percentage") as avg_recycled_pct,
    sum("cost") as total_cost
  INTO aggregated_metrics.monthly_water
  FROM water_usage
  GROUP BY time(30d), organization_id, facility_id, water_source
END
```

### Downsampling Tasks

```flux
// Downsample raw data to hourly averages
task_hourly_downsample = from(bucket: "environmental_metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> to(bucket: "environmental_metrics_hourly", org: "clenergize")

// Downsample hourly to daily
task_daily_downsample = from(bucket: "environmental_metrics_hourly")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
  |> to(bucket: "environmental_metrics_daily", org: "clenergize")
```

## Query Patterns

### 1. Current Energy Consumption

```flux
from(bucket: "environmental_metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> filter(fn: (r) => r.organization_id == "org-001")
  |> filter(fn: (r) => r._field == "value")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> yield(name: "current_energy")
```

### 2. Daily Emissions by Scope

```flux
from(bucket: "environmental_metrics")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "ghg_emissions")
  |> filter(fn: (r) => r.organization_id == "org-001")
  |> filter(fn: (r) => r._field == "co2_equivalent")
  |> group(columns: ["scope"])
  |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
  |> yield(name: "daily_emissions_by_scope")
```

### 3. Water Usage Trend Analysis

```flux
from(bucket: "environmental_metrics")
  |> range(start: -90d)
  |> filter(fn: (r) => r._measurement == "water_usage")
  |> filter(fn: (r) => r.facility_id == "fac-001")
  |> filter(fn: (r) => r._field == "volume")
  |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
  |> movingAverage(n: 7)
  |> yield(name: "water_usage_trend")
```

### 4. Real-time Air Quality Monitoring

```flux
from(bucket: "environmental_metrics")
  |> range(start: -15m)
  |> filter(fn: (r) => r._measurement == "air_quality")
  |> filter(fn: (r) => r.pollutant == "PM2.5" or r.pollutant == "PM10")
  |> filter(fn: (r) => r._field == "concentration")
  |> last()
  |> yield(name: "current_air_quality")
```

### 5. Safety Performance Dashboard

```flux
from(bucket: "social_metrics")
  |> range(start: -365d)
  |> filter(fn: (r) => r._measurement == "safety_metrics")
  |> filter(fn: (r) => r._field == "trir" or r._field == "ltifr")
  |> aggregateWindow(every: 30d, fn: mean, createEmpty: false)
  |> yield(name: "safety_performance")
```

## Performance Optimization

### 1. Index Strategy

```yaml
# Tag cardinality guidelines
High Cardinality (avoid as tags):
  - sensor_reading_id
  - timestamp_string
  - raw_value

Low/Medium Cardinality (use as tags):
  - organization_id (10-100 values)
  - facility_id (100-1000 values)
  - energy_type (5-10 values)
  - scope (3 values)
```

### 2. Shard Configuration

```yaml
# Optimal shard configuration for ESG data
shard_group_duration: 7d  # Weekly shards
shard_count: 4            # Based on write throughput
cache_size: 2GB           # In-memory cache
wal_size: 1GB            # Write-ahead log
```

### 3. Query Optimization

```flux
// Optimized query with pushdown predicates
optimized_query = from(bucket: "environmental_metrics")
  |> range(start: -7d, stop: now())  // Limit time range
  |> filter(fn: (r) => r.organization_id == "org-001")  // Filter early
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> filter(fn: (r) => r._field == "value")
  |> aggregateWindow(every: 1h, fn: mean)  // Aggregate to reduce data
  |> limit(n: 1000)  // Limit results
```

## Data Ingestion Patterns

### 1. Batch Ingestion (CSV/API)

```typescript
import { InfluxDB, Point } from '@influxdata/influxdb-client';

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});

const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  'environmental_metrics',
  'ms',  // Millisecond precision
  {
    batchSize: 5000,
    flushInterval: 10000,  // 10 seconds
    maxRetries: 3,
    maxRetryDelay: 15000,
  }
);

// Batch write energy data
async function writeEnergyData(data: EnergyReading[]) {
  for (const reading of data) {
    const point = new Point('energy_consumption')
      .tag('organization_id', reading.organizationId)
      .tag('facility_id', reading.facilityId)
      .tag('meter_id', reading.meterId)
      .tag('energy_type', reading.energyType)
      .tag('scope', reading.scope)
      .tag('unit', reading.unit)
      .floatField('value', reading.value)
      .floatField('carbon_intensity', reading.carbonIntensity)
      .timestamp(new Date(reading.timestamp));

    writeApi.writePoint(point);
  }

  await writeApi.flush();
}
```

### 2. Real-time Streaming (IoT)

```typescript
// MQTT to InfluxDB bridge
import * as mqtt from 'mqtt';

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);
const writeApi = influxDB.getWriteApi(org, bucket);

mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());

  const point = new Point('sensor_reading')
    .tag('sensor_id', data.sensor_id)
    .tag('location', data.location)
    .floatField('value', data.value)
    .timestamp(new Date());

  writeApi.writePoint(point);
});

// Auto-flush every 5 seconds
setInterval(() => writeApi.flush(), 5000);
```

## Retention Policies

```sql
-- Create retention policies for different data granularities
CREATE RETENTION POLICY raw_data ON environmental_metrics
  DURATION 2y REPLICATION 1 DEFAULT;

CREATE RETENTION POLICY hourly_data ON environmental_metrics
  DURATION 5y REPLICATION 1;

CREATE RETENTION POLICY daily_data ON environmental_metrics
  DURATION 10y REPLICATION 1;

CREATE RETENTION POLICY monthly_data ON environmental_metrics
  DURATION INF REPLICATION 1;
```

## Backup and Recovery

### Backup Strategy

```bash
#!/bin/bash
# Automated backup script

BACKUP_DIR="/backups/influxdb/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup all buckets
influx backup $BACKUP_DIR \
  --bucket environmental_metrics \
  --bucket social_metrics \
  --bucket governance_metrics \
  --token $INFLUXDB_TOKEN \
  --host http://localhost:8086

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR

# Upload to S3
aws s3 cp $BACKUP_DIR.tar.gz s3://clenergize-backups/influxdb/
```

### Restore Procedure

```bash
#!/bin/bash
# Restore from backup

RESTORE_DATE="20241123"
BACKUP_FILE="s3://clenergize-backups/influxdb/$RESTORE_DATE.tar.gz"

# Download backup
aws s3 cp $BACKUP_FILE /tmp/

# Extract
tar -xzf /tmp/$RESTORE_DATE.tar.gz -C /tmp/

# Restore
influx restore /tmp/$RESTORE_DATE \
  --bucket environmental_metrics \
  --token $INFLUXDB_TOKEN \
  --host http://localhost:8086
```

## Monitoring and Alerting

### Key Metrics to Monitor

```yaml
System Metrics:
  - Write throughput (points/second)
  - Query latency (p50, p95, p99)
  - Disk usage percentage
  - Memory usage
  - CPU utilization
  - Shard count
  - Series cardinality

Data Quality:
  - Missing data gaps
  - Outlier detection
  - Data freshness
  - Ingestion errors
```

### Alert Rules

```flux
// Alert on high energy consumption
alert_high_energy = from(bucket: "environmental_metrics")
  |> range(start: -15m)
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> filter(fn: (r) => r._field == "value")
  |> mean()
  |> map(fn: (r) => ({r with _level:
    if r._value > 10000.0 then "critical"
    else if r._value > 8000.0 then "warning"
    else "ok"
  }))
  |> filter(fn: (r) => r._level != "ok")
  |> yield(name: "high_energy_alert")
```

## Security Considerations

### 1. Authentication & Authorization

```yaml
# User roles and permissions
roles:
  esg_admin:
    - read: [all_buckets]
    - write: [all_buckets]
    - delete: [all_buckets]

  esg_analyst:
    - read: [environmental_metrics, social_metrics, governance_metrics]
    - write: []
    - delete: []

  iot_ingester:
    - read: []
    - write: [environmental_metrics]
    - delete: []
```

### 2. Encryption

```yaml
# TLS Configuration
tls:
  enabled: true
  cert_file: /etc/influxdb/cert.pem
  key_file: /etc/influxdb/key.pem
  min_version: "1.2"
  ciphers:
    - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
```

### 3. Audit Logging

```yaml
audit:
  enabled: true
  path: /var/log/influxdb/audit.log
  events:
    - authentication
    - authorization
    - write_data
    - delete_data
    - create_bucket
    - delete_bucket
```

## Integration with Clenergize Services

### Activity Service Integration

```typescript
// activity-service/src/infrastructure/timeseries/influx.client.ts
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InfluxClient {
  private writeApi;
  private queryApi;

  constructor() {
    const influxDB = new InfluxDB({
      url: process.env.INFLUXDB_URL,
      token: process.env.INFLUXDB_TOKEN,
    });

    this.writeApi = influxDB.getWriteApi(
      process.env.INFLUXDB_ORG,
      'environmental_metrics'
    );

    this.queryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG);
  }

  async recordEnergyConsumption(data: EnergyConsumptionData) {
    const point = new Point('energy_consumption')
      .tag('organization_id', data.organizationId)
      .tag('facility_id', data.facilityId)
      .tag('energy_type', data.energyType)
      .tag('scope', data.scope)
      .floatField('value', data.value)
      .floatField('carbon_intensity', data.carbonIntensity)
      .timestamp(data.timestamp);

    this.writeApi.writePoint(point);
    await this.writeApi.flush();
  }

  async getEnergyTrend(facilityId: string, days: number): Promise<any[]> {
    const query = `
      from(bucket: "environmental_metrics")
        |> range(start: -${days}d)
        |> filter(fn: (r) => r._measurement == "energy_consumption")
        |> filter(fn: (r) => r.facility_id == "${facilityId}")
        |> filter(fn: (r) => r._field == "value")
        |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
    `;

    return this.queryApi.collectRows(query);
  }
}
```

## Capacity Planning

### Storage Requirements

```yaml
# ESG Platform estimation (10,000 facilities)
Metrics:
  Energy: 10,000 facilities × 100 meters × 1 reading/15min = 96M points/day
  Water: 10,000 facilities × 20 meters × 1 reading/hour = 4.8M points/day
  Emissions: 10,000 facilities × 50 sources × 1 reading/hour = 12M points/day
  Air Quality: 10,000 facilities × 10 sensors × 1 reading/5min = 28.8M points/day

Total: ~140M points/day × 20 bytes/point = 2.8GB/day raw data

Storage with compression (10:1):
  - Raw (2 years): 2.8GB × 365 × 2 / 10 = 200GB
  - Aggregated (10 years): 50GB
  - Total: ~250GB
```

## Migration from Legacy Systems

### Data Migration Script

```python
# migrate_legacy_to_influx.py
import pandas as pd
from influxdb_client import InfluxDBClient, Point
from datetime import datetime

def migrate_energy_data(csv_file, influx_client):
    """Migrate legacy energy data from CSV to InfluxDB"""
    df = pd.read_csv(csv_file)

    write_api = influx_client.write_api()

    for _, row in df.iterrows():
        point = Point("energy_consumption") \
            .tag("organization_id", row['org_id']) \
            .tag("facility_id", row['facility_id']) \
            .tag("meter_id", row['meter_id']) \
            .tag("energy_type", row['type']) \
            .field("value", float(row['consumption'])) \
            .time(datetime.fromisoformat(row['timestamp']))

        write_api.write(bucket="environmental_metrics", record=point)

    write_api.flush()
    print(f"Migrated {len(df)} energy records")

# Usage
client = InfluxDBClient(
    url="http://localhost:8086",
    token="your-token",
    org="clenergize"
)

migrate_energy_data("legacy_energy_2023.csv", client)
```

## References

- [InfluxDB 2.0 Documentation](https://docs.influxdata.com/influxdb/v2.0/)
- [Flux Query Language](https://docs.influxdata.com/flux/v0.x/)
- [InfluxDB Best Practices](https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/)
- [Time Series Database Concepts](https://www.influxdata.com/time-series-database/)
- [ESG Data Standards](https://www.globalreporting.org/standards/)