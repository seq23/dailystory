#!/bin/bash

echo "🚀 Enterprise Test Infrastructure Validation"
echo "============================================="

# Make scripts executable
chmod +x validate-test-infrastructure.js
chmod +x setup-test-scripts.js
chmod +x run-tests.sh

echo "📋 Available test execution methods:"
echo "1. node validate-test-infrastructure.js  # Full validation"
echo "2. node setup-test-scripts.js run test:all  # Alternative method"
echo "3. ./run-tests.sh  # Direct script execution"
echo ""

echo "🔄 Executing comprehensive validation..."
node validate-test-infrastructure.js