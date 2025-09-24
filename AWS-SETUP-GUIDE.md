# AWS Configuration for Valifi Fintech Platform

## 🔑 Step 1: Configure AWS CLI

Run this command in your terminal:

```bash
aws configure
```

You'll be prompted to enter:

1. **AWS Access Key ID**: Your AWS access key
2. **AWS Secret Access Key**: Your AWS secret key  
3. **Default region name**: `us-east-1` (recommended)
4. **Default output format**: `json` (recommended)

## 🏗️ Step 2: Create Required AWS Resources

After AWS CLI is configured, we'll create:

### 🗄️ Database (RDS PostgreSQL)
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier valifi-production-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username valifi_admin \
    --master-user-password YOUR_SECURE_PASSWORD \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-subnet-group-name default \
    --publicly-accessible
```

### 🐳 Container Registry (ECR)
```bash
# Create ECR repository
aws ecr create-repository --repository-name valifi-fintech-platform
```

### ⚡ Container Service (ECS)
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name valifi-production
```

### 🔐 IAM Roles
```bash
# Create ECS execution role
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://trust-policy.json
```

## 🚀 Step 3: Deploy Application

Once resources are created:

```bash
# Build and deploy
bun run production:build
./deploy-production.sh
```

## 📋 Required Information

To proceed, you'll need:

- ✅ AWS Access Key ID
- ✅ AWS Secret Access Key  
- ✅ AWS Account ID
- ✅ Preferred AWS Region (us-east-1 recommended)

## 🔒 Security Notes

- Use IAM user with minimal required permissions
- Enable MFA on AWS account
- Rotate access keys regularly
- Use AWS Secrets Manager for production passwords

---

**Ready to configure?** Run `aws configure` and provide your credentials!