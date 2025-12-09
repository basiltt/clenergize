#!/bin/bash
# Clenergize V3 - LocalStack Initialization Script
# Sets up AWS services for local development (Cognito, S3, SQS, EventBridge, Secrets Manager)
# This script runs automatically when LocalStack container starts

set -e

echo "========================================="
echo "Clenergize V3 - LocalStack Initialization"
echo "========================================="
echo ""

# Wait for LocalStack to be ready
echo "ó Waiting for LocalStack to be ready..."
until awslocal s3 ls > /dev/null 2>&1; do
  echo "  Waiting for LocalStack services..."
  sleep 2
done
echo " LocalStack is ready!"
echo ""

# AWS CLI configuration for LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566

# ==========================================
# 1. Amazon S3 Buckets
# ==========================================
echo "=æ Creating S3 Buckets..."

buckets=(
  "clenergize-uploads"
  "clenergize-exports"
  "clenergize-reports"
  "clenergize-backups"
  "clenergize-temp"
)

for bucket in "${buckets[@]}"; do
  if awslocal s3 ls "s3://${bucket}" 2>&1 | grep -q 'NoSuchBucket'; then
    awslocal s3 mb "s3://${bucket}"
    echo "   Created bucket: ${bucket}"
  else
    echo "  ™ Bucket already exists: ${bucket}"
  fi
done

# Configure CORS for upload bucket
awslocal s3api put-bucket-cors \
  --bucket clenergize-uploads \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }]
  }'
echo "   Configured CORS for uploads bucket"
echo ""

# ==========================================
# 2. Amazon SQS Queues
# ==========================================
echo "=è Creating SQS Queues..."

queues=(
  "clenergize-activity-ingestion.fifo"
  "clenergize-calculation-queue.fifo"
  "clenergize-report-generation"
  "clenergize-notification-queue"
  "clenergize-dead-letter-queue"
)

for queue in "${queues[@]}"; do
  # Check if FIFO queue
  if [[ $queue == *.fifo ]]; then
    awslocal sqs create-queue \
      --queue-name "$queue" \
      --attributes FifoQueue=true,ContentBasedDeduplication=true \
      > /dev/null 2>&1 || echo "  ™ Queue already exists: ${queue}"
    echo "   Created FIFO queue: ${queue}"
  else
    awslocal sqs create-queue \
      --queue-name "$queue" \
      > /dev/null 2>&1 || echo "  ™ Queue already exists: ${queue}"
    echo "   Created standard queue: ${queue}"
  fi
done
echo ""

# ==========================================
# 3. Amazon EventBridge
# ==========================================
echo "=€ Creating EventBridge Event Bus..."

awslocal events create-event-bus \
  --name clenergize-event-bus \
  > /dev/null 2>&1 || echo "  ™ Event bus already exists"
echo "   Created event bus: clenergize-event-bus"

# Create event rules for service-to-service communication
rules=(
  "identity-user-created:identity.user.created.v1"
  "organization-project-created:organization.project.created.v1"
  "activity-data-ingested:activity.data.ingested.v1"
  "calculation-emission-calculated:calculation.emission.calculated.v1"
)

for rule_config in "${rules[@]}"; do
  IFS=':' read -r rule_name event_pattern <<< "$rule_config"

  awslocal events put-rule \
    --name "$rule_name" \
    --event-bus-name clenergize-event-bus \
    --event-pattern "{\"detail-type\":[\"$event_pattern\"]}" \
    --state ENABLED \
    > /dev/null 2>&1

  echo "   Created event rule: ${rule_name}"
done
echo ""

# ==========================================
# 4. AWS Secrets Manager
# ==========================================
echo "= Creating Secrets Manager Secrets..."

secrets=(
  "clenergize/dev/database:mongodb://admin:localdev123@mongodb:27017/?authSource=admin"
  "clenergize/dev/redis:redis://redis:6379"
  "clenergize/dev/jwt-secret:dev-jwt-secret-change-in-production-12345678"
)

for secret_config in "${secrets[@]}"; do
  IFS=':' read -r secret_name secret_value <<< "$secret_config"

  awslocal secretsmanager create-secret \
    --name "$secret_name" \
    --secret-string "$secret_value" \
    > /dev/null 2>&1 || echo "  ™ Secret already exists: ${secret_name}"

  echo "   Created secret: ${secret_name}"
done
echo ""

# ==========================================
# 5. Amazon Cognito (Identity Provider)
# ==========================================
echo "=d Creating Cognito User Pool..."

# Create user pool
USER_POOL_ID=$(awslocal cognito-idp create-user-pool \
  --pool-name clenergize-user-pool \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 12,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }' \
  --auto-verified-attributes email \
  --mfa-configuration OPTIONAL \
  --query 'UserPool.Id' \
  --output text 2>&1 | grep -v 'already exists' || echo "test-user-pool")

if [[ "$USER_POOL_ID" != "test-user-pool" ]]; then
  echo "   Created user pool: ${USER_POOL_ID}"

  # Create user pool client
  CLIENT_ID=$(awslocal cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name clenergize-web-client \
    --generate-secret \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
    --query 'UserPoolClient.ClientId' \
    --output text)

  echo "   Created user pool client: ${CLIENT_ID}"

  # Create test user
  awslocal cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "admin@example.com" \
    --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
    --temporary-password "TempPassword123!" \
    > /dev/null 2>&1

  echo "   Created test user: admin@example.com (password: TempPassword123!)"
else
  echo "  ™ User pool already exists"
fi
echo ""

# ==========================================
# 6. Amazon SNS Topics
# ==========================================
echo "=â Creating SNS Topics..."

topics=(
  "clenergize-email-notifications"
  "clenergize-alert-notifications"
  "clenergize-report-ready"
)

for topic in "${topics[@]}"; do
  awslocal sns create-topic \
    --name "$topic" \
    > /dev/null 2>&1 || echo "  ™ Topic already exists: ${topic}"
  echo "   Created topic: ${topic}"
done
echo ""

# ==========================================
# 7. Verification
# ==========================================
echo "= Verifying LocalStack Resources..."

echo ""
echo "S3 Buckets:"
awslocal s3 ls | awk '{print "  - " $3}'

echo ""
echo "SQS Queues:"
awslocal sqs list-queues --query 'QueueUrls[]' --output text | sed 's|.*/||' | awk '{print "  - " $0}'

echo ""
echo "EventBridge Event Buses:"
awslocal events list-event-buses --query 'EventBuses[].Name' --output text | awk '{print "  - " $0}'

echo ""
echo "Secrets:"
awslocal secretsmanager list-secrets --query 'SecretList[].Name' --output text | awk '{print "  - " $0}'

echo ""
echo "SNS Topics:"
awslocal sns list-topics --query 'Topics[].TopicArn' --output text | sed 's|.*/||' | awk '{print "  - " $0}'

echo ""
echo "========================================="
echo " LocalStack Initialization Complete!"
echo "========================================="
echo ""
echo "Services are ready at: http://localhost:4566"
echo ""
echo "Test Credentials:"
echo "  AWS Access Key: test"
echo "  AWS Secret Key: test"
echo "  Region: us-east-1"
echo ""
echo "Cognito Test User:"
echo "  Username: admin@example.com"
echo "  Temporary Password: TempPassword123!"
echo ""
