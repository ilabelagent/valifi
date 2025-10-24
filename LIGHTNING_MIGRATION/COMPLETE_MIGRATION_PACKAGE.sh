#!/bin/bash

echo "========================================"
echo "VALIFI → LIGHTNING AI MIGRATION PACKAGE"
echo "Jesus Cartel & Cyber Lab Extraction"
echo "========================================"
echo ""

# Copy Jesus Cartel Service
echo "✓ Copying Jesus Cartel service..."
cp server/jesusCartelService.ts LIGHTNING_MIGRATION/jesus-cartel-standalone/src/services/jesusCartelService.ts

# Copy Web3 Service
echo "✓ Copying Web3 service..."
cp server/web3Service.ts LIGHTNING_MIGRATION/jesus-cartel-standalone/src/services/web3Service.ts

# Copy Encryption Service
echo "✓ Copying Encryption service..."
cp server/encryptionService.ts LIGHTNING_MIGRATION/jesus-cartel-standalone/src/services/encryptionService.ts

# Copy Cyber Lab
echo "✓ Extracting Cyber Lab bot..."
grep -A 500 "export class BotCyberLab" server/analyticsBot.ts > LIGHTNING_MIGRATION/cyber-lab-standalone/src/services/cyberLabService.ts

echo ""
echo "========================================"
echo "FILES PACKAGED:"
echo "========================================"
find LIGHTNING_MIGRATION -type f | sort

echo ""
echo "✅ MIGRATION PACKAGE COMPLETE!"
echo ""
echo "Next Steps:"
echo "1. cd LIGHTNING_MIGRATION/jesus-cartel-standalone && npm install"
echo "2. cd LIGHTNING_MIGRATION/cyber-lab-standalone && npm install"
echo "3. Upload to Lightning AI Studio"
echo ""
