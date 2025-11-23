# Service Specification: ML Service (Machine Learning & AI Platform)

## Service Overview

**Service Name**: ML Service
**Version**: 1.0.0
**Port**: 3046
**Type**: Python Microservice (FastAPI)
**Criticality**: Tier 1 - Core ML/AI Platform
**Phase**: 6 (Analytics & ML Domain)
**Story Points**: 45 (LARGEST in Phase 6)

### Purpose

The ML Service provides comprehensive machine learning and artificial intelligence capabilities for the Clenergize V3 ESG Platform. As the largest service in Phase 6, it delivers predictive analytics, anomaly detection, natural language processing, computer vision, and automated machine learning capabilities to enhance ESG insights and decision-making.

### Business Context

This service enables organizations to leverage advanced AI/ML techniques for ESG management, including emissions forecasting, risk prediction, text analysis of ESG reports, satellite imagery analysis for environmental monitoring, and automated detection of data quality issues and potential greenwashing.

## Technology Stack

### Core Technologies (Python-based)

- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104+
- **Runtime**: Python with uvicorn ASGI server
- **Process Manager**: Gunicorn with multiple workers
- **Containerization**: Docker with multi-stage builds

### ML/AI Libraries

```python
# Core ML Libraries
tensorflow = "^2.15.0"          # Deep learning framework
torch = "^2.1.0"               # PyTorch for neural networks
scikit-learn = "^1.3.0"        # Classic ML algorithms
xgboost = "^2.0.0"             # Gradient boosting
lightgbm = "^4.1.0"            # Light gradient boosting

# NLP Libraries
transformers = "^4.35.0"       # Hugging Face transformers
spacy = "^3.7.0"               # Industrial NLP
nltk = "^3.8.0"                # Natural language toolkit
sentence-transformers = "^2.2.0" # Sentence embeddings

# Computer Vision
opencv-python = "^4.8.0"       # Computer vision library
pillow = "^10.0.0"             # Image processing
ultralytics = "^8.0.0"         # YOLO models
torchvision = "^0.16.0"        # PyTorch vision models

# MLOps & Infrastructure
mlflow = "^2.8.0"              # ML lifecycle management
optuna = "^3.4.0"              # Hyperparameter optimization
dvc = "^3.3.0"                 # Data version control
ray = "^2.8.0"                 # Distributed computing
```

### Data & Infrastructure

```python
# Data Processing
pandas = "^2.1.0"              # Data manipulation
numpy = "^1.25.0"              # Numerical computing
polars = "^0.19.0"             # Fast dataframes
dask = "^2023.11.0"            # Distributed computing

# Database & Storage
asyncpg = "^0.29.0"            # Async PostgreSQL
motor = "^3.3.0"               # Async MongoDB driver
aioboto3 = "^12.0.0"           # Async AWS S3 client
redis = "^5.0.0"               # Cache and feature store

# API & Validation
pydantic = "^2.5.0"            # Data validation
pydantic-settings = "^2.0.0"   # Settings management
httpx = "^0.25.0"              # Async HTTP client

# Monitoring & Logging
prometheus-client = "^0.19.0"   # Metrics
structlog = "^23.2.0"          # Structured logging
sentry-sdk = "^1.38.0"         # Error tracking
```

## Service Architecture

### Component Structure

```
ml-service/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── predictions.py    # Prediction endpoints
│   │   │   │   ├── training.py       # Model training
│   │   │   │   ├── models.py         # Model management
│   │   │   │   ├── features.py       # Feature store
│   │   │   │   ├── experiments.py    # Experiment tracking
│   │   │   │   └── monitoring.py     # Model monitoring
│   │   │   └── router.py
│   │   └── dependencies.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Configuration
│   │   ├── security.py            # Security utilities
│   │   ├── logging.py             # Logging setup
│   │   └── exceptions.py          # Custom exceptions
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas/               # Pydantic models
│   │   │   ├── prediction.py
│   │   │   ├── training.py
│   │   │   ├── feature.py
│   │   │   └── experiment.py
│   │   └── db/                    # Database models
│   │       ├── model_registry.py
│   │       ├── training_job.py
│   │       └── prediction_log.py
│   │
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── predictive/            # Predictive models
│   │   │   ├── emissions.py      # Emission forecasting
│   │   │   ├── energy.py         # Energy demand
│   │   │   ├── waste.py          # Waste generation
│   │   │   └── social.py         # Social metrics
│   │   │
│   │   ├── anomaly/               # Anomaly detection
│   │   │   ├── detector.py       # Base detector
│   │   │   ├── isolation.py      # Isolation forest
│   │   │   ├── autoencoder.py    # Deep learning
│   │   │   └── statistical.py    # Statistical methods
│   │   │
│   │   ├── nlp/                   # NLP models
│   │   │   ├── text_analysis.py  # Text processing
│   │   │   ├── sentiment.py      # Sentiment analysis
│   │   │   ├── classification.py # Document classification
│   │   │   ├── ner.py           # Named entity recognition
│   │   │   └── greenwashing.py   # Greenwashing detection
│   │   │
│   │   ├── vision/                # Computer vision
│   │   │   ├── satellite.py      # Satellite imagery
│   │   │   ├── deforestation.py  # Forest monitoring
│   │   │   ├── land_use.py       # Land classification
│   │   │   └── facility.py       # Facility monitoring
│   │   │
│   │   ├── recommendation/       # Recommendation engine
│   │   │   ├── engine.py         # Core engine
│   │   │   ├── collaborative.py  # Collaborative filtering
│   │   │   └── content_based.py  # Content-based
│   │   │
│   │   └── automl/                # AutoML
│   │       ├── pipeline.py       # AutoML pipeline
│   │       ├── feature_eng.py    # Feature engineering
│   │       ├── model_selection.py # Model selection
│   │       └── hyperopt.py       # Hyperparameter tuning
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_service.py      # Model management
│   │   ├── training_service.py   # Training orchestration
│   │   ├── prediction_service.py # Prediction handling
│   │   ├── feature_service.py    # Feature store
│   │   ├── mlflow_service.py     # MLflow integration
│   │   └── monitoring_service.py # Model monitoring
│   │
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   ├── database.py           # Database connections
│   │   ├── cache.py              # Redis caching
│   │   ├── storage.py            # S3 storage
│   │   ├── message_broker.py     # Kafka integration
│   │   └── metrics.py            # Prometheus metrics
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── data_processing.py    # Data utilities
│   │   ├── model_utils.py        # Model helpers
│   │   ├── evaluation.py         # Evaluation metrics
│   │   ├── explainability.py     # XAI utilities
│   │   └── fairness.py           # Bias detection
│   │
│   └── main.py                    # FastAPI application
│
├── notebooks/                      # Jupyter notebooks
│   ├── exploratory/               # EDA notebooks
│   ├── model_development/         # Model experiments
│   └── evaluation/                # Model evaluation
│
├── scripts/
│   ├── train_models.py           # Training scripts
│   ├── deploy_model.py           # Deployment scripts
│   ├── data_preparation.py       # Data prep scripts
│   └── performance_test.py       # Performance testing
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.gpu            # GPU-enabled container
│   └── docker-compose.yml
│
├── configs/
│   ├── model_configs/            # Model configurations
│   ├── training_configs/         # Training parameters
│   └── deployment_configs/       # Deployment settings
│
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml
└── README.md
```

## API Specification

### Endpoints

#### Prediction Endpoints

```python
# POST /api/v1/ml/predict
@router.post("/predict", response_model=PredictionResponse)
async def create_prediction(
    request: PredictionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PredictionResponse:
    """
    Generate prediction using specified model.

    Request Body:
    {
        "model_id": "emissions_forecast_v2",
        "model_version": "2.1.0",
        "input_data": {
            "energy_consumption": 1500.0,
            "production_volume": 10000,
            "vehicle_fleet_size": 50,
            "facility_area": 5000.0
        },
        "prediction_type": "emissions_forecast",
        "time_horizon": "monthly",
        "confidence_level": 0.95
    }

    Response:
    {
        "prediction_id": "pred_123",
        "model_id": "emissions_forecast_v2",
        "predictions": {
            "scope1_emissions": 125.5,
            "scope2_emissions": 450.3,
            "scope3_emissions": 890.2,
            "total_emissions": 1466.0,
            "confidence_intervals": {
                "lower": 1320.4,
                "upper": 1612.6
            }
        },
        "metadata": {
            "model_version": "2.1.0",
            "inference_time_ms": 45,
            "feature_importance": {...},
            "explanation": {...}
        },
        "timestamp": "2025-01-15T10:30:00Z"
    }
    """

# POST /api/v1/ml/batch-predict
@router.post("/batch-predict", response_model=BatchPredictionResponse)
async def create_batch_prediction(
    request: BatchPredictionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> BatchPredictionResponse:
    """Batch prediction for multiple inputs"""

# GET /api/v1/ml/predictions/{prediction_id}
@router.get("/predictions/{prediction_id}")
async def get_prediction(
    prediction_id: str,
    db: AsyncSession = Depends(get_db)
) -> PredictionResponse:
    """Retrieve prediction results"""
```

#### Model Training Endpoints

```python
# POST /api/v1/ml/train
@router.post("/train", response_model=TrainingJobResponse)
async def start_training(
    request: TrainingRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> TrainingJobResponse:
    """
    Start model training job.

    Request Body:
    {
        "model_type": "emissions_forecasting",
        "algorithm": "xgboost",
        "dataset_id": "ds_2025_q1",
        "training_config": {
            "test_size": 0.2,
            "validation_size": 0.1,
            "random_state": 42,
            "hyperparameters": {
                "n_estimators": 100,
                "max_depth": 10,
                "learning_rate": 0.1
            }
        },
        "automl_enabled": true,
        "experiment_name": "Q1_2025_emissions"
    }

    Response:
    {
        "job_id": "job_456",
        "status": "running",
        "model_type": "emissions_forecasting",
        "estimated_completion": "2025-01-15T12:00:00Z",
        "experiment_url": "http://mlflow.clenergize.com/experiments/123"
    }
    """

# GET /api/v1/ml/training-jobs/{job_id}
@router.get("/training-jobs/{job_id}")
async def get_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db)
) -> TrainingJobResponse:
    """Get training job status and results"""

# POST /api/v1/ml/hyperparameter-tuning
@router.post("/hyperparameter-tuning")
async def start_hyperparameter_tuning(
    request: HyperparameterTuningRequest,
    background_tasks: BackgroundTasks
) -> TuningJobResponse:
    """Start hyperparameter optimization"""
```

#### Model Management Endpoints

```python
# GET /api/v1/ml/models
@router.get("/models", response_model=List[ModelInfo])
async def list_models(
    model_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> List[ModelInfo]:
    """List available models"""

# GET /api/v1/ml/models/{model_id}
@router.get("/models/{model_id}")
async def get_model(
    model_id: str,
    db: AsyncSession = Depends(get_db)
) -> ModelDetails:
    """Get model details and metadata"""

# POST /api/v1/ml/models/{model_id}/deploy
@router.post("/models/{model_id}/deploy")
async def deploy_model(
    model_id: str,
    deployment_config: DeploymentConfig,
    db: AsyncSession = Depends(get_db)
) -> DeploymentResponse:
    """Deploy model to production"""

# POST /api/v1/ml/models/{model_id}/evaluate
@router.post("/models/{model_id}/evaluate")
async def evaluate_model(
    model_id: str,
    evaluation_request: EvaluationRequest,
    db: AsyncSession = Depends(get_db)
) -> EvaluationResponse:
    """Evaluate model performance"""
```

#### Feature Store Endpoints

```python
# POST /api/v1/ml/features
@router.post("/features", response_model=FeatureResponse)
async def create_feature(
    feature: FeatureDefinition,
    db: AsyncSession = Depends(get_db)
) -> FeatureResponse:
    """Register new feature in feature store"""

# GET /api/v1/ml/features
@router.get("/features")
async def list_features(
    feature_group: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[FeatureInfo]:
    """List available features"""

# GET /api/v1/ml/feature-sets/{dataset_id}
@router.get("/feature-sets/{dataset_id}")
async def get_feature_set(
    dataset_id: str,
    features: List[str] = Query(default=[])
) -> FeatureSetResponse:
    """Retrieve feature set for training/inference"""
```

#### NLP Endpoints

```python
# POST /api/v1/ml/nlp/analyze-text
@router.post("/nlp/analyze-text")
async def analyze_text(
    request: TextAnalysisRequest
) -> TextAnalysisResponse:
    """
    Analyze ESG-related text.

    Request Body:
    {
        "text": "Our company reduced emissions by 25%...",
        "analysis_types": ["sentiment", "entities", "greenwashing", "topics"],
        "language": "en"
    }

    Response:
    {
        "sentiment": {
            "polarity": 0.85,
            "subjectivity": 0.3,
            "label": "positive"
        },
        "entities": [
            {"text": "25%", "type": "PERCENTAGE", "category": "emissions"},
            {"text": "company", "type": "ORGANIZATION"}
        ],
        "greenwashing_score": 0.15,
        "topics": ["emissions_reduction", "sustainability"],
        "key_phrases": ["reduced emissions", "sustainability goals"]
    }
    """

# POST /api/v1/ml/nlp/classify-document
@router.post("/nlp/classify-document")
async def classify_document(
    request: DocumentClassificationRequest
) -> DocumentClassificationResponse:
    """Classify ESG documents"""

# POST /api/v1/ml/nlp/extract-metrics
@router.post("/nlp/extract-metrics")
async def extract_metrics(
    request: MetricExtractionRequest
) -> MetricExtractionResponse:
    """Extract ESG metrics from text"""
```

#### Computer Vision Endpoints

```python
# POST /api/v1/ml/vision/analyze-satellite
@router.post("/vision/analyze-satellite")
async def analyze_satellite_imagery(
    image: UploadFile,
    analysis_type: str = Form(...),
    coordinates: Optional[str] = Form(None)
) -> SatelliteAnalysisResponse:
    """
    Analyze satellite imagery for ESG monitoring.

    Analysis Types:
    - deforestation: Detect forest loss
    - land_use: Classify land usage
    - water_quality: Assess water bodies
    - urban_sprawl: Monitor urbanization

    Response:
    {
        "analysis_id": "sat_789",
        "analysis_type": "deforestation",
        "results": {
            "forest_coverage": 65.3,
            "deforestation_area_hectares": 12.5,
            "change_from_baseline": -5.2,
            "confidence": 0.92
        },
        "bounding_boxes": [...],
        "heatmap_url": "https://s3.../heatmap.png",
        "timestamp": "2025-01-15T10:30:00Z"
    }
    """

# POST /api/v1/ml/vision/facility-monitoring
@router.post("/vision/facility-monitoring")
async def monitor_facility(
    images: List[UploadFile],
    facility_id: str = Form(...)
) -> FacilityMonitoringResponse:
    """Monitor facility conditions via imagery"""
```

#### Anomaly Detection Endpoints

```python
# POST /api/v1/ml/anomaly/detect
@router.post("/anomaly/detect")
async def detect_anomalies(
    request: AnomalyDetectionRequest
) -> AnomalyDetectionResponse:
    """
    Detect anomalies in ESG data.

    Request Body:
    {
        "data_source": "emissions_timeseries",
        "entity_id": "facility_123",
        "time_range": {
            "start": "2025-01-01",
            "end": "2025-01-31"
        },
        "detection_method": "isolation_forest",
        "sensitivity": 0.95
    }

    Response:
    {
        "anomalies": [
            {
                "timestamp": "2025-01-15T14:00:00Z",
                "metric": "scope1_emissions",
                "expected_value": 125.5,
                "actual_value": 450.8,
                "anomaly_score": 0.98,
                "severity": "high",
                "explanation": "3.6x above expected range"
            }
        ],
        "summary": {
            "total_anomalies": 5,
            "high_severity": 2,
            "medium_severity": 2,
            "low_severity": 1
        }
    }
    """

# POST /api/v1/ml/anomaly/configure-monitoring
@router.post("/anomaly/configure-monitoring")
async def configure_anomaly_monitoring(
    config: AnomalyMonitoringConfig
) -> MonitoringConfigResponse:
    """Configure continuous anomaly monitoring"""
```

#### AutoML Endpoints

```python
# POST /api/v1/ml/automl/start
@router.post("/automl/start")
async def start_automl(
    request: AutoMLRequest
) -> AutoMLJobResponse:
    """
    Start AutoML pipeline.

    Request Body:
    {
        "problem_type": "regression",
        "target_column": "emissions",
        "dataset_id": "ds_2025_q1",
        "optimization_metric": "rmse",
        "time_budget_hours": 2,
        "max_models": 10,
        "include_algorithms": ["xgboost", "lightgbm", "neural_network"],
        "feature_engineering": {
            "enabled": true,
            "max_features": 50
        }
    }
    """

# GET /api/v1/ml/automl/jobs/{job_id}/leaderboard
@router.get("/automl/jobs/{job_id}/leaderboard")
async def get_automl_leaderboard(
    job_id: str
) -> AutoMLLeaderboardResponse:
    """Get AutoML model leaderboard"""
```

## Data Models

### PostgreSQL Schema (Model Metadata)

```sql
-- Model Registry
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(100) NOT NULL, -- emissions, energy, waste, social, etc.
    algorithm VARCHAR(100) NOT NULL, -- xgboost, neural_network, etc.
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- training, validation, production, archived

    -- Model Artifacts
    artifact_uri TEXT NOT NULL, -- S3 path to model files
    model_size_mb DECIMAL(10, 2),
    input_schema JSONB NOT NULL,
    output_schema JSONB NOT NULL,

    -- Performance Metrics
    metrics JSONB NOT NULL, -- {rmse, mae, r2, accuracy, etc.}
    validation_metrics JSONB,
    test_metrics JSONB,

    -- Training Info
    training_job_id UUID REFERENCES training_jobs(id),
    training_duration_seconds INTEGER,
    training_data_version VARCHAR(50),
    hyperparameters JSONB,

    -- Deployment Info
    deployment_status VARCHAR(50),
    deployment_endpoint TEXT,
    deployment_config JSONB,
    last_prediction_time TIMESTAMP WITH TIME ZONE,
    prediction_count INTEGER DEFAULT 0,

    -- Monitoring
    drift_status VARCHAR(50),
    last_drift_check TIMESTAMP WITH TIME ZONE,
    performance_degradation DECIMAL(5, 2),

    -- Metadata
    tags JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_model_type CHECK (
        model_type IN ('emissions', 'energy', 'waste', 'water', 'social', 'governance', 'risk', 'general')
    ),
    CONSTRAINT valid_status CHECK (
        status IN ('training', 'validation', 'staging', 'production', 'archived', 'failed')
    )
);

-- Training Jobs
CREATE TABLE training_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- pending, running, completed, failed

    -- Configuration
    training_config JSONB NOT NULL,
    dataset_id VARCHAR(255) NOT NULL,
    dataset_version VARCHAR(50),
    feature_columns TEXT[],
    target_column VARCHAR(255),

    -- AutoML
    automl_enabled BOOLEAN DEFAULT FALSE,
    automl_config JSONB,
    best_model_id UUID REFERENCES ml_models(id),

    -- Execution
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    compute_resources JSONB, -- {cpu, memory, gpu}

    -- Results
    trained_models JSONB, -- Array of model IDs with scores
    best_score DECIMAL(10, 6),
    optimization_metric VARCHAR(50),

    -- MLflow Integration
    experiment_id VARCHAR(255),
    run_id VARCHAR(255),
    mlflow_uri TEXT,

    -- Error Handling
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,

    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Predictions Log
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id VARCHAR(255) UNIQUE NOT NULL,
    model_id UUID REFERENCES ml_models(id),
    model_version VARCHAR(50),

    -- Input/Output
    input_data JSONB NOT NULL,
    predictions JSONB NOT NULL,
    confidence_scores JSONB,

    -- Explainability
    feature_importance JSONB,
    shap_values JSONB,
    explanation_text TEXT,

    -- Performance
    inference_time_ms INTEGER,
    preprocessing_time_ms INTEGER,
    postprocessing_time_ms INTEGER,

    -- Context
    organization_id VARCHAR(255),
    user_id VARCHAR(255),
    correlation_id VARCHAR(255),
    batch_id VARCHAR(255),

    -- Feedback
    actual_value JSONB,
    feedback_score INTEGER,
    feedback_comments TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_predictions_model_id (model_id),
    INDEX idx_predictions_created_at (created_at),
    INDEX idx_predictions_correlation_id (correlation_id)
);

-- Feature Store
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_name VARCHAR(255) UNIQUE NOT NULL,
    feature_group VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,

    -- Definition
    description TEXT,
    formula TEXT,
    source_tables TEXT[],
    dependencies TEXT[],

    -- Statistics
    statistics JSONB, -- {mean, std, min, max, nulls, unique}
    last_computed TIMESTAMP WITH TIME ZONE,
    computation_time_ms INTEGER,

    -- Versioning
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    deprecated_at TIMESTAMP WITH TIME ZONE,

    -- Quality
    quality_score DECIMAL(3, 2),
    missing_rate DECIMAL(5, 2),
    drift_detected BOOLEAN DEFAULT FALSE,

    -- Usage
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    models_using TEXT[],

    -- Metadata
    tags JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Experiments (MLflow integration)
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Configuration
    model_type VARCHAR(100),
    objective VARCHAR(255),
    metrics_tracked TEXT[],

    -- Best Results
    best_run_id VARCHAR(255),
    best_metric_value DECIMAL(10, 6),
    best_model_id UUID REFERENCES ml_models(id),

    -- Statistics
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    avg_run_time_seconds DECIMAL(10, 2),

    -- MLflow
    mlflow_experiment_id VARCHAR(255),
    mlflow_uri TEXT,
    artifact_location TEXT,

    -- Metadata
    tags JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Model Monitoring
CREATE TABLE model_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id),
    monitoring_type VARCHAR(50) NOT NULL, -- drift, performance, fairness

    -- Drift Detection
    feature_drift JSONB,
    prediction_drift JSONB,
    data_quality_issues JSONB,
    drift_score DECIMAL(5, 4),

    -- Performance Monitoring
    performance_metrics JSONB,
    baseline_metrics JSONB,
    degradation_percentage DECIMAL(5, 2),

    -- Fairness & Bias
    fairness_metrics JSONB,
    bias_detected BOOLEAN DEFAULT FALSE,
    protected_attributes JSONB,

    -- Alerts
    alert_triggered BOOLEAN DEFAULT FALSE,
    alert_severity VARCHAR(20),
    alert_message TEXT,

    monitored_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_monitoring_model_id (model_id),
    INDEX idx_monitoring_timestamp (monitored_at)
);

-- Datasets
CREATE TABLE ml_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dataset_type VARCHAR(50) NOT NULL, -- training, validation, test

    -- Storage
    storage_location TEXT NOT NULL, -- S3 path
    format VARCHAR(20) NOT NULL, -- parquet, csv, json
    size_mb DECIMAL(10, 2),
    row_count INTEGER,
    column_count INTEGER,

    -- Schema
    schema_definition JSONB NOT NULL,
    target_column VARCHAR(255),
    feature_columns TEXT[],

    -- Versioning
    version VARCHAR(50) NOT NULL,
    parent_dataset_id UUID REFERENCES ml_datasets(id),

    -- Quality
    quality_report JSONB,
    validation_status VARCHAR(50),
    issues_found JSONB,

    -- Usage
    used_by_models TEXT[],
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,

    -- Metadata
    tags JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_models_status ON ml_models(status);
CREATE INDEX idx_models_type ON ml_models(model_type);
CREATE INDEX idx_models_created_at ON ml_models(created_at DESC);
CREATE INDEX idx_training_jobs_status ON training_jobs(status);
CREATE INDEX idx_features_group ON features(feature_group);
CREATE INDEX idx_experiments_model_type ON experiments(model_type);
```

### MongoDB Schema (Unstructured ML Data)

```javascript
// Model Artifacts Collection
{
  _id: ObjectId,
  model_id: "emissions_forecast_v2",
  artifact_type: "weights", // weights, config, preprocessor

  // Binary Data
  model_binary: BinData, // Serialized model
  file_format: "pickle", // pickle, onnx, tensorflow, pytorch
  compression: "gzip",

  // Large Configs
  preprocessing_pipeline: {
    steps: [
      { type: "scaler", params: {...} },
      { type: "encoder", params: {...} },
      { type: "feature_selector", params: {...} }
    ]
  },

  // Neural Network Architecture
  architecture: {
    layers: [
      { type: "dense", units: 128, activation: "relu" },
      { type: "dropout", rate: 0.2 },
      { type: "dense", units: 64, activation: "relu" },
      { type: "output", units: 1, activation: "linear" }
    ],
    optimizer: "adam",
    loss: "mse"
  },

  created_at: ISODate(),
  version: "2.1.0"
}

// Training Data Collection
{
  _id: ObjectId,
  dataset_id: "ds_2025_q1",
  batch_id: "batch_001",

  // Raw Data
  raw_data: [
    {
      timestamp: ISODate(),
      facility_id: "facility_123",
      energy_consumption: 1500.0,
      production_volume: 10000,
      weather_data: {...},
      sensor_readings: [...]
    }
  ],

  // Processed Features
  features: [
    {
      feature_vector: [0.23, 0.45, 0.67, ...],
      target: 125.5,
      metadata: {...}
    }
  ],

  // Data Quality
  quality_checks: {
    missing_values: {...},
    outliers: {...},
    distribution_shifts: {...}
  },

  created_at: ISODate()
}

// NLP Corpus Collection
{
  _id: ObjectId,
  document_id: "doc_456",
  document_type: "sustainability_report",

  // Text Data
  raw_text: "Full sustainability report text...",
  processed_text: "Cleaned and normalized text...",

  // NLP Analysis
  tokens: ["token1", "token2", ...],
  embeddings: [0.12, 0.34, 0.56, ...], // Document embeddings

  entities: [
    { text: "25%", type: "PERCENTAGE", start: 45, end: 48 },
    { text: "Scope 1", type: "EMISSION_SCOPE", start: 123, end: 130 }
  ],

  topics: [
    { topic: "emissions_reduction", score: 0.85 },
    { topic: "renewable_energy", score: 0.72 }
  ],

  sentiment: {
    overall: 0.75,
    aspects: {
      environmental: 0.82,
      social: 0.68,
      governance: 0.71
    }
  },

  greenwashing_analysis: {
    score: 0.15,
    flags: ["vague_claims", "cherry_picking"],
    evidence: [...]
  },

  created_at: ISODate()
}

// Computer Vision Data Collection
{
  _id: ObjectId,
  image_id: "img_789",
  image_type: "satellite",

  // Image Metadata
  source: "sentinel-2",
  coordinates: {
    lat: 40.7128,
    lon: -74.0060,
    bbox: [...]
  },
  capture_date: ISODate(),
  resolution_meters: 10,

  // Processed Data
  image_features: {
    histogram: [...],
    texture_features: [...],
    color_moments: [...]
  },

  // Analysis Results
  segmentation: {
    forest: 0.653,
    water: 0.125,
    urban: 0.180,
    agriculture: 0.042
  },

  change_detection: {
    baseline_date: ISODate(),
    forest_loss_hectares: 12.5,
    urban_growth_hectares: 8.3
  },

  // Object Detection
  detected_objects: [
    {
      class: "deforestation_area",
      bbox: [x, y, width, height],
      confidence: 0.92
    }
  ],

  created_at: ISODate()
}
```

## Service Integration

### Event Publishing

```python
# Domain Events for ML Service
from app.events import EventPublisher
from app.models.events import (
    ModelTrainedEvent,
    PredictionGeneratedEvent,
    AnomalyDetectedEvent,
    ModelDeployedEvent
)

class MLEventPublisher:
    def __init__(self, event_publisher: EventPublisher):
        self.publisher = event_publisher

    async def publish_model_trained(
        self,
        model_id: str,
        metrics: dict,
        experiment_id: str
    ):
        event = ModelTrainedEvent(
            model_id=model_id,
            metrics=metrics,
            experiment_id=experiment_id,
            timestamp=datetime.utcnow()
        )
        await self.publisher.publish(
            "ml.model.trained.v1",
            event
        )

    async def publish_anomaly_detected(
        self,
        entity_id: str,
        anomaly_type: str,
        severity: str,
        details: dict
    ):
        event = AnomalyDetectedEvent(
            entity_id=entity_id,
            anomaly_type=anomaly_type,
            severity=severity,
            details=details,
            timestamp=datetime.utcnow()
        )
        await self.publisher.publish(
            "ml.anomaly.detected.v1",
            event
        )
```

### Event Consumption

```python
# Consuming events from other services
from app.events import EventConsumer
from app.services import MLTrainingService

class MLEventConsumer:
    def __init__(
        self,
        consumer: EventConsumer,
        training_service: MLTrainingService
    ):
        self.consumer = consumer
        self.training_service = training_service

        # Subscribe to relevant events
        self.consumer.subscribe(
            "activity.data.ingested.v1",
            self.handle_data_ingested
        )
        self.consumer.subscribe(
            "calculation.emission.calculated.v1",
            self.handle_emission_calculated
        )

    async def handle_data_ingested(self, event: dict):
        """Trigger anomaly detection on new data"""
        await self.training_service.check_data_quality(
            event["dataset_id"]
        )

    async def handle_emission_calculated(self, event: dict):
        """Update predictions based on actual calculations"""
        await self.training_service.update_model_feedback(
            event["prediction_id"],
            event["actual_value"]
        )
```

## Performance Requirements

### Response Time SLAs

| Operation | Target | Maximum |
|-----------|--------|---------|
| Single Prediction | < 200ms | 500ms |
| Batch Prediction (100 items) | < 2s | 5s |
| Model Loading | < 5s | 10s |
| Feature Retrieval | < 50ms | 100ms |
| NLP Analysis | < 500ms | 1s |
| Image Analysis | < 3s | 5s |
| Anomaly Detection | < 300ms | 500ms |

### Throughput Requirements

- Predictions: 1000 requests/second
- Training Jobs: 50 concurrent jobs
- Feature Store: 10,000 queries/second
- Model Registry: 100 operations/second

### Resource Limits

```yaml
# Kubernetes Resource Configuration
resources:
  ml-service:
    requests:
      memory: "4Gi"
      cpu: "2"
    limits:
      memory: "8Gi"
      cpu: "4"

  ml-training-job:
    requests:
      memory: "16Gi"
      cpu: "8"
      nvidia.com/gpu: "1"  # For GPU training
    limits:
      memory: "32Gi"
      cpu: "16"
      nvidia.com/gpu: "1"

  ml-inference:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "4Gi"
      cpu: "2"
```

## Security & Compliance

### Model Security

```python
# Model Validation and Security
class ModelSecurity:
    def __init__(self):
        self.validator = ModelValidator()
        self.encryptor = ModelEncryptor()

    async def validate_model(self, model_path: str) -> bool:
        """Validate model integrity and safety"""
        # Check for malicious code
        if not self.validator.check_pickle_safety(model_path):
            raise SecurityError("Model contains unsafe operations")

        # Verify digital signature
        if not self.validator.verify_signature(model_path):
            raise SecurityError("Model signature verification failed")

        # Check model size limits
        if not self.validator.check_size_limits(model_path):
            raise SecurityError("Model exceeds size limits")

        return True

    async def encrypt_model(self, model_path: str) -> str:
        """Encrypt model for storage"""
        return await self.encryptor.encrypt_file(
            model_path,
            algorithm="AES-256-GCM"
        )
```

### Data Privacy

```python
# Privacy-Preserving ML
class PrivacyPreservingML:
    def __init__(self):
        self.differential_privacy = DifferentialPrivacy()
        self.federated_learning = FederatedLearning()

    async def train_with_privacy(
        self,
        dataset: pd.DataFrame,
        epsilon: float = 1.0
    ) -> Model:
        """Train model with differential privacy"""
        # Add noise to gradients
        private_dataset = self.differential_privacy.add_noise(
            dataset,
            epsilon=epsilon
        )

        # Train on private data
        model = await self.train_model(private_dataset)

        # Validate privacy guarantees
        privacy_report = self.differential_privacy.generate_report(
            model,
            epsilon=epsilon
        )

        return model, privacy_report
```

### Explainable AI

```python
# Model Explainability
class ExplainableAI:
    def __init__(self):
        self.shap_explainer = ShapExplainer()
        self.lime_explainer = LimeExplainer()

    async def explain_prediction(
        self,
        model: Model,
        input_data: dict
    ) -> ExplanationResponse:
        """Generate explanation for prediction"""
        # SHAP values
        shap_values = await self.shap_explainer.explain(
            model,
            input_data
        )

        # Feature importance
        feature_importance = self.calculate_feature_importance(
            shap_values
        )

        # Natural language explanation
        explanation_text = self.generate_explanation_text(
            feature_importance,
            input_data
        )

        return ExplanationResponse(
            shap_values=shap_values,
            feature_importance=feature_importance,
            explanation=explanation_text,
            confidence=0.95
        )
```

### Bias Detection

```python
# Fairness and Bias Detection
class FairnessAuditor:
    def __init__(self):
        self.metrics = FairnessMetrics()

    async def audit_model(
        self,
        model: Model,
        test_data: pd.DataFrame,
        protected_attributes: List[str]
    ) -> FairnessReport:
        """Audit model for bias"""
        predictions = model.predict(test_data)

        # Calculate fairness metrics
        demographic_parity = self.metrics.demographic_parity(
            predictions,
            test_data,
            protected_attributes
        )

        equal_opportunity = self.metrics.equal_opportunity(
            predictions,
            test_data,
            protected_attributes
        )

        # Generate recommendations
        recommendations = self.generate_bias_mitigation_recommendations(
            demographic_parity,
            equal_opportunity
        )

        return FairnessReport(
            demographic_parity=demographic_parity,
            equal_opportunity=equal_opportunity,
            bias_detected=demographic_parity < 0.8,
            recommendations=recommendations
        )
```

## Testing Strategy

### Unit Tests

```python
# tests/unit/test_prediction_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from app.services import PredictionService

@pytest.mark.asyncio
async def test_create_prediction():
    # Arrange
    model_service = Mock()
    model_service.load_model = AsyncMock(return_value=Mock())
    prediction_service = PredictionService(model_service)

    request = {
        "model_id": "test_model",
        "input_data": {"feature1": 1.0, "feature2": 2.0}
    }

    # Act
    result = await prediction_service.create_prediction(request)

    # Assert
    assert result.prediction_id is not None
    assert result.model_id == "test_model"
    assert "predictions" in result
```

### Integration Tests

```python
# tests/integration/test_ml_api.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_ml_prediction_flow():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Train model
        training_response = await client.post(
            "/api/v1/ml/train",
            json={
                "model_type": "emissions_forecasting",
                "algorithm": "xgboost",
                "dataset_id": "test_dataset"
            }
        )
        assert training_response.status_code == 200
        job_id = training_response.json()["job_id"]

        # Wait for training completion
        # ... (polling logic)

        # Make prediction
        prediction_response = await client.post(
            "/api/v1/ml/predict",
            json={
                "model_id": "test_model",
                "input_data": {"energy": 1000.0}
            }
        )
        assert prediction_response.status_code == 200
        assert "predictions" in prediction_response.json()
```

### Performance Tests

```python
# tests/performance/test_inference_performance.py
import asyncio
import time
from app.services import PredictionService

async def test_inference_latency():
    service = PredictionService()

    # Warm up
    await service.create_prediction(test_request)

    # Measure latency
    latencies = []
    for _ in range(100):
        start = time.time()
        await service.create_prediction(test_request)
        latencies.append(time.time() - start)

    # Assert P95 < 200ms
    p95 = sorted(latencies)[95]
    assert p95 < 0.2, f"P95 latency {p95}s exceeds 200ms target"
```

## Deployment

### Docker Configuration

```dockerfile
# docker/Dockerfile
FROM python:3.11-slim as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application
WORKDIR /app
COPY . .

# Set Python path
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

# Run as non-root user
RUN useradd -m -u 1000 mlservice && chown -R mlservice:mlservice /app
USER mlservice

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:3046/health').raise_for_status()"

# Start service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3046", "--workers", "4"]
```

### Kubernetes Deployment

```yaml
# k8s/ml-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-service
  namespace: clenergize
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-service
  template:
    metadata:
      labels:
        app: ml-service
    spec:
      containers:
      - name: ml-service
        image: clenergize/ml-service:latest
        ports:
        - containerPort: 3046
        env:
        - name: ENVIRONMENT
          value: production
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ml-service-secrets
              key: database-url
        - name: MLFLOW_TRACKING_URI
          value: http://mlflow-service:5000
        - name: MODEL_CACHE_SIZE
          value: "10"
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
        volumeMounts:
        - name: model-cache
          mountPath: /app/models
        livenessProbe:
          httpGet:
            path: /health
            port: 3046
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3046
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: model-cache
        emptyDir:
          sizeLimit: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ml-service
  namespace: clenergize
spec:
  selector:
    app: ml-service
  ports:
  - protocol: TCP
    port: 3046
    targetPort: 3046
  type: ClusterIP
```

### GPU Support for Training

```yaml
# k8s/ml-training-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ml-training-job
  namespace: clenergize
spec:
  template:
    spec:
      containers:
      - name: training
        image: clenergize/ml-training:latest
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "32Gi"
            cpu: "16"
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0"
        - name: TF_GPU_MEMORY_GROWTH
          value: "true"
      nodeSelector:
        accelerator: nvidia-tesla-v100
      restartPolicy: OnFailure
```

## Monitoring & Observability

### Metrics Collection

```python
# app/infrastructure/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
prediction_counter = Counter(
    'ml_predictions_total',
    'Total number of predictions',
    ['model_type', 'status']
)

prediction_latency = Histogram(
    'ml_prediction_duration_seconds',
    'Prediction latency in seconds',
    ['model_type']
)

model_accuracy = Gauge(
    'ml_model_accuracy',
    'Current model accuracy',
    ['model_id', 'metric_type']
)

active_training_jobs = Gauge(
    'ml_training_jobs_active',
    'Number of active training jobs'
)

class MLMetrics:
    @staticmethod
    def record_prediction(model_type: str, status: str, duration: float):
        prediction_counter.labels(
            model_type=model_type,
            status=status
        ).inc()
        prediction_latency.labels(
            model_type=model_type
        ).observe(duration)

    @staticmethod
    def update_model_accuracy(model_id: str, accuracy: float):
        model_accuracy.labels(
            model_id=model_id,
            metric_type='accuracy'
        ).set(accuracy)
```

### Logging

```python
# app/core/logging.py
import structlog
from app.core.correlation import get_correlation_id

logger = structlog.get_logger()

class MLLogger:
    @staticmethod
    def log_prediction(
        model_id: str,
        prediction_id: str,
        duration_ms: float,
        status: str
    ):
        logger.info(
            "ml_prediction_completed",
            model_id=model_id,
            prediction_id=prediction_id,
            duration_ms=duration_ms,
            status=status,
            correlation_id=get_correlation_id()
        )

    @staticmethod
    def log_training(
        job_id: str,
        model_type: str,
        status: str,
        metrics: dict = None
    ):
        logger.info(
            "ml_training_update",
            job_id=job_id,
            model_type=model_type,
            status=status,
            metrics=metrics,
            correlation_id=get_correlation_id()
        )
```

## Error Handling

### Custom Exceptions

```python
# app/core/exceptions.py
class MLServiceError(Exception):
    """Base exception for ML Service"""
    pass

class ModelNotFoundError(MLServiceError):
    """Model not found in registry"""
    pass

class PredictionError(MLServiceError):
    """Error during prediction"""
    pass

class TrainingError(MLServiceError):
    """Error during model training"""
    pass

class DataQualityError(MLServiceError):
    """Data quality issues detected"""
    pass

class ModelValidationError(MLServiceError):
    """Model validation failed"""
    pass

# Exception handlers
from fastapi import Request, status
from fastapi.responses import JSONResponse

@app.exception_handler(ModelNotFoundError)
async def model_not_found_handler(
    request: Request,
    exc: ModelNotFoundError
):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "MODEL_NOT_FOUND",
            "message": str(exc),
            "correlation_id": get_correlation_id()
        }
    )

@app.exception_handler(PredictionError)
async def prediction_error_handler(
    request: Request,
    exc: PredictionError
):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "PREDICTION_ERROR",
            "message": str(exc),
            "correlation_id": get_correlation_id()
        }
    )
```

## Development Guidelines

### Code Structure

```python
# Follow Python best practices
# app/services/prediction_service.py
from typing import Optional, Dict, Any
from datetime import datetime
import asyncio

class PredictionService:
    """Service for handling ML predictions"""

    def __init__(
        self,
        model_registry: ModelRegistry,
        feature_store: FeatureStore,
        cache: RedisCache
    ):
        self.model_registry = model_registry
        self.feature_store = feature_store
        self.cache = cache
        self._model_cache: Dict[str, Model] = {}

    async def create_prediction(
        self,
        model_id: str,
        input_data: Dict[str, Any],
        options: Optional[PredictionOptions] = None
    ) -> PredictionResponse:
        """
        Create a new prediction.

        Args:
            model_id: ID of the model to use
            input_data: Input features for prediction
            options: Optional prediction configuration

        Returns:
            PredictionResponse with results

        Raises:
            ModelNotFoundError: If model doesn't exist
            PredictionError: If prediction fails
        """
        try:
            # Load model
            model = await self._load_model(model_id)

            # Prepare features
            features = await self._prepare_features(
                model,
                input_data
            )

            # Make prediction
            prediction = await self._predict(
                model,
                features,
                options
            )

            # Generate explanation if requested
            if options and options.explain:
                explanation = await self._explain(
                    model,
                    features,
                    prediction
                )
                prediction.explanation = explanation

            return prediction

        except Exception as e:
            logger.error(
                "Prediction failed",
                model_id=model_id,
                error=str(e)
            )
            raise PredictionError(f"Prediction failed: {e}")
```

### Testing Best Practices

```python
# tests/conftest.py
import pytest
from unittest.mock import AsyncMock
from app.main import app
from app.services import ModelRegistry, FeatureStore

@pytest.fixture
def mock_model_registry():
    """Mock model registry for testing"""
    registry = AsyncMock(spec=ModelRegistry)
    registry.get_model.return_value = {
        "model_id": "test_model",
        "version": "1.0.0",
        "status": "production"
    }
    return registry

@pytest.fixture
def mock_feature_store():
    """Mock feature store for testing"""
    store = AsyncMock(spec=FeatureStore)
    store.get_features.return_value = {
        "feature1": 1.0,
        "feature2": 2.0
    }
    return store

@pytest.fixture
async def client():
    """Test client for API testing"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

## Migration & Upgrade Strategy

### Model Version Migration

```python
# scripts/migrate_models.py
import asyncio
from app.services import ModelMigrationService

async def migrate_models_to_v2():
    """Migrate models from v1 to v2 format"""
    migration_service = ModelMigrationService()

    # List all v1 models
    v1_models = await migration_service.list_v1_models()

    for model in v1_models:
        try:
            # Convert model format
            v2_model = await migration_service.convert_to_v2(model)

            # Validate converted model
            await migration_service.validate_v2_model(v2_model)

            # Save to new registry
            await migration_service.save_v2_model(v2_model)

            print(f"Migrated model: {model.model_id}")

        except Exception as e:
            print(f"Failed to migrate {model.model_id}: {e}")

    print(f"Migration complete. Migrated {len(v1_models)} models")

if __name__ == "__main__":
    asyncio.run(migrate_models_to_v2())
```

## Summary

The ML Service is the cornerstone of advanced analytics in the Clenergize V3 ESG Platform, providing comprehensive machine learning and AI capabilities. Built with Python and FastAPI, it delivers predictive analytics, anomaly detection, NLP, computer vision, and AutoML functionality. The service integrates with MLflow for experiment tracking, implements explainable AI for transparency, and includes bias detection for fairness. With support for GPU acceleration, distributed training, and real-time inference, it enables data-driven ESG insights and decision-making at scale.

Key differentiators include:
- Multi-modal AI (text, image, time-series)
- ESG-specific pre-trained models
- Automated model retraining and deployment
- Comprehensive explainability and fairness features
- Integration with all other platform services
- Production-ready MLOps pipeline