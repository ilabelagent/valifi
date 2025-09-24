#!/bin/bash
# VALIFI DEPLOYMENT MONITORING SCRIPT
# Monitors App Runner deployment and provides status updates

SERVICE_ARN="arn:aws:apprunner:us-east-1:772161509286:service/valifi-fintech-production/a675420ec2c24bce96f43903ba204c4d"
REGION="us-east-1"

echo "🚀 VALIFI FINTECH DEPLOYMENT MONITOR"
echo "===================================="
echo "Service ARN: $SERVICE_ARN"
echo "Region: $REGION"
echo ""

while true; do
    STATUS=$(aws apprunner describe-service \
        --service-arn "$SERVICE_ARN" \
        --region $REGION \
        --query 'Service.Status' \
        --output text)

    SERVICE_URL=$(aws apprunner describe-service \
        --service-arn "$SERVICE_ARN" \
        --region $REGION \
        --query 'Service.ServiceUrl' \
        --output text)

    echo "⏰ $(date): Status = $STATUS"

    case $STATUS in
        "RUNNING")
            echo ""
            echo "🎉 SUCCESS! Valifi is now LIVE!"
            echo "🌐 Production URL: https://$SERVICE_URL"
            echo ""
            echo "Testing health endpoint..."
            if curl -f "https://$SERVICE_URL/api/health" --max-time 10 --silent; then
                echo "✅ Health check passed!"
            else
                echo "⚠️ Health check pending - service may still be starting"
            fi
            break
            ;;
        "CREATE_FAILED"|"PAUSED")
            echo "❌ Deployment failed with status: $STATUS"
            echo "Check AWS Console for detailed error messages"
            break
            ;;
        *)
            echo "   Deployment in progress..."
            sleep 30
            ;;
    esac
done