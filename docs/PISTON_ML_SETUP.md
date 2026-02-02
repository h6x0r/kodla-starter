# Piston ML Libraries Setup

## Overview

This document describes how to set up Python ML libraries in Piston for the AI/ML courses.

## Current Approach

Piston uses isolated environments for each code execution, which means standard pip packages are not available by default. For ML courses, we have several options:

### Option 1: Custom Python Package (Recommended for Production)

Create a custom Piston package with pre-installed ML libraries.

#### Steps:

1. **Create custom package repository**

```bash
# Clone Piston packages repo
git clone https://github.com/engineer-man/piston.git
cd piston/packages/python/3.10.0

# Add requirements.txt with ML libs
cat > requirements.txt << 'EOF'
numpy>=1.24
pandas>=2.0
scikit-learn>=1.3
matplotlib>=3.7
seaborn>=0.12
xgboost>=2.0
lightgbm>=4.0
EOF
```

2. **Build custom package**

```bash
# Build and install in Piston
docker exec practix_piston ppman install python
docker exec practix_piston pip install -r requirements.txt
```

### Option 2: Pre-built Docker Image (Quick Setup)

Use a pre-built Docker image with ML libraries:

```yaml
# docker-compose.override.yml
services:
  piston:
    image: your-registry/piston-ml:latest
    volumes:
      - piston_packages:/piston/packages
```

### Option 3: Mock Mode for Development

During development, use the mock execution mode which simulates test results without actually executing ML code.

## Required ML Libraries

| Package | Version | Used For |
|---------|---------|----------|
| numpy | >=1.24 | Array operations, linear algebra |
| pandas | >=2.0 | DataFrame operations, data cleaning |
| scikit-learn | >=1.3 | ML algorithms, model training |
| matplotlib | >=3.7 | Plotting (output as JSON) |
| seaborn | >=0.12 | Statistical visualization |
| xgboost | >=2.0 | Gradient boosting |
| lightgbm | >=4.0 | Fast gradient boosting |

## Testing Setup

Run the test script to verify ML libraries are available:

```bash
./server/scripts/install-piston-ml-packages.sh
```

## Visualization Output Format

ML tasks output visualizations as JSON that the frontend renders:

```python
import json

chart_data = {
    "type": "line",  # line | bar | scatter | heatmap | confusion_matrix
    "data": [
        {"x": 1, "y": 10},
        {"x": 2, "y": 25},
        {"x": 3, "y": 15}
    ],
    "config": {
        "title": "Training Loss",
        "xLabel": "Epoch",
        "yLabel": "Loss"
    }
}

# Use __CHART__ markers for frontend parsing
print("__CHART__" + json.dumps(chart_data) + "__CHART__")
```

## Memory Considerations

ML libraries are memory-intensive. Update Piston limits in docker-compose.yml:

```yaml
piston:
  mem_limit: 2g  # Increase from 1g to 2g for ML tasks
  memswap_limit: 2g
  environment:
    - PISTON_RUN_TIMEOUT=30000  # 30s for training tasks
```

## Future: Deep Learning

For PyTorch/TensorFlow courses, additional setup is needed:

```
torch>=2.0
transformers>=4.30
```

These require significantly more memory and may need GPU support.
