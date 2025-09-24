# AWS Deployment Guide for Valifi

## Prerequisites

1. **AWS Account Setup**
   - Go to https://aws.amazon.com and create an account
   - Navigate to IAM > Users > Create User
   - Attach policy: `PowerUserAccess` or `AdministratorAccess`
   - Generate Access Keys (Access Key ID + Secret Access Key)

2. **Configure AWS CLI**
   ```bash
   aws configure
   ```
   Enter:
   - AWS Access Key ID: [your-access-key]
   - AWS Secret Access Key: [your-secret-key]
   - Default region: us-east-1
   - Default output format: json

## Option 1: Quick Deploy with AWS App Runner (Recommended)

This is the fastest way to deploy to AWS:

```bash
# Build the application
bun run build

# Create deployment package
aws apprunner create-service \
  --service-name valifi-fintech \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "public.ecr.aws/lambda/nodejs:18",
      "ImageConfiguration": {
        "Port": "8080",
        "StartCommand": "bun full-stack-server.ts"
      },
      "ImageRepositoryType": "ECR_PUBLIC"
    },
    "AutoDeploymentsEnabled": false
  }' \
  --instance-configuration '{
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  }'
```

## Option 2: Deploy with Elastic Beanstalk

1. **Create Application**
   ```bash
   # Create EB application
   aws elasticbeanstalk create-application \
     --application-name valifi-fintech \
     --description "Valifi AI-Powered Financial Platform"

   # Create environment
   aws elasticbeanstalk create-environment \
     --application-name valifi-fintech \
     --environment-name valifi-production \
     --solution-stack-name "64bit Amazon Linux 2 v5.8.0 running Node.js 18"
   ```

2. **Deploy Code**
   ```bash
   # Create deployment package
   zip -r valifi-deployment.zip . -x "node_modules/*" ".git/*"

   # Upload to S3 and deploy
   aws s3 cp valifi-deployment.zip s3://your-bucket-name/
   aws elasticbeanstalk create-application-version \
     --application-name valifi-fintech \
     --version-label v1.0.0 \
     --source-bundle S3Bucket=your-bucket-name,S3Key=valifi-deployment.zip
   ```

## Option 3: Containerized Deployment with ECS

1. **Create Dockerfile**
   ```dockerfile
   FROM oven/bun:latest
   WORKDIR /app
   COPY . .
   RUN bun install
   RUN bun run build
   EXPOSE 8080
   CMD ["bun", "full-stack-server.ts"]
   ```

2. **Deploy to ECS**
   ```bash
   # Build and push container
   docker build -t valifi-fintech .
   aws ecr create-repository --repository-name valifi-fintech
   docker tag valifi-fintech:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/valifi-fintech:latest
   docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/valifi-fintech:latest
   ```

## Environment Variables for AWS

Set these environment variables in your AWS service:

```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=file:./valifi.db
JWT_SECRET=valifi_jwt_production_secret_2025_secure_key
CORS_ORIGIN=*
```

## Free Tier Costs

- **AWS App Runner**: $0.007/hour (~$5/month) for 0.25 vCPU
- **Elastic Beanstalk**: Free (pay for underlying EC2)
- **Lambda**: 1M free requests/month
- **S3**: 5GB free storage

## Manual Deployment Steps

1. **Configure AWS credentials** (run once):
   ```bash
   aws configure
   ```

2. **Deploy the application**:
   ```bash
   # Option A: Simple Lambda deployment
   aws lambda create-function \
     --function-name valifi-fintech \
     --runtime nodejs18.x \
     --role arn:aws:iam::YOUR-ACCOUNT:role/lambda-execution-role \
     --handler full-stack-server.handler \
     --zip-file fileb://valifi-deployment.zip

   # Option B: App Runner (recommended)
   # Follow Option 1 above
   ```

3. **Access your deployed application**:
   - App Runner: `https://[random-id].us-east-1.awsapprunner.com`
   - Elastic Beanstalk: `http://[app-name].us-east-1.elasticbeanstalk.com`

## Troubleshooting

- **No AWS credentials**: Run `aws configure`
- **Permission errors**: Check IAM permissions
- **Build failures**: Ensure `bun run build` works locally
- **Port issues**: Use PORT=8080 for AWS

## Next Steps After Deployment

1. **Custom Domain**: Configure Route 53 + CloudFront
2. **SSL Certificate**: Use AWS Certificate Manager
3. **Database**: Set up RDS PostgreSQL
4. **Monitoring**: Enable CloudWatch logs
5. **CI/CD**: Set up GitHub Actions deployment