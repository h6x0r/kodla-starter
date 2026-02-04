#!/bin/bash
# Build and deploy custom Judge0 CE with ML packages
# Run this script on the production server (linux/amd64)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="practix/judge0:1.13.1-ml"

echo "=== Building custom Judge0 CE with ML packages ==="
echo "Image: $IMAGE_NAME"
echo ""

cd "$SCRIPT_DIR"

# Build the image
echo "Building Docker image..."
docker build -t "$IMAGE_NAME" .

echo ""
echo "=== Build complete! ==="
echo ""
echo "Verify numpy installation:"
docker run --rm "$IMAGE_NAME" /usr/local/python-3.8.1/bin/python3 -c "import numpy; print(f'NumPy {numpy.__version__}')"

echo ""
echo "=== Next steps ==="
echo "1. Update Judge0 stack in Coolify to use: $IMAGE_NAME"
echo "2. Or redeploy with: docker compose -f docker-compose.coolify.judge0.yml up -d"
echo ""
