#!/bin/bash

# Build backend
echo "Building backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Build extension
echo "Building extension..."
cd ../extension
npm install
npm run build

# Create distribution directory
echo "Creating distribution..."
cd ..
mkdir -p dist
cp -r backend dist/
cp -r extension/dist/* dist/extension/
cp -r extension/public dist/extension/

# Create zip file
echo "Creating zip file..."
cd dist
zip -r ../gmail-copilot.zip .

echo "Build complete! Distribution files are in the dist directory and gmail-copilot.zip" 