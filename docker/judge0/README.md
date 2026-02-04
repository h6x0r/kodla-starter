# Custom Judge0 CE with ML Packages

This is a custom Judge0 CE image that includes Python ML packages (numpy, pandas, scikit-learn, scipy) while preserving all original languages.

## Why Custom Image?

Standard Judge0 CE doesn't include numpy and other ML packages. Judge0 Extra CE has ML packages but lacks Go, JavaScript, TypeScript, and Rust support. This custom image provides the best of both worlds.

## Included ML Packages

- numpy
- pandas
- scikit-learn
- scipy
- matplotlib

## Build Instructions

### Local Build (for testing)

```bash
cd docker/judge0
docker build -t practix/judge0:1.13.1-ml .
```

### Production Build & Push

```bash
# Build for linux/amd64 (required for production servers)
docker buildx build --platform linux/amd64 -t practix/judge0:1.13.1-ml --push .
```

Or build and save as tar:

```bash
docker buildx build --platform linux/amd64 -t practix/judge0:1.13.1-ml -o type=docker,dest=judge0-ml.tar .
```

## Deployment

### Update docker-compose.coolify.judge0.yml

Change the image from:
```yaml
image: judge0/judge0:1.13.1
```

To:
```yaml
image: practix/judge0:1.13.1-ml
```

### Coolify Deployment

1. Build and push the image to Docker Hub or your registry
2. Update the Judge0 stack in Coolify with the new image
3. Redeploy the stack

## Verification

After deployment, verify numpy is available:

```bash
# SSH into production server
docker exec -it judge0-workers /usr/local/python-3.8.1/bin/python3 -c "import numpy; print(numpy.__version__)"
```

## Supported Languages

All original Judge0 CE 1.13.1 languages are preserved:
- Python 3.8.1 (now with ML packages)
- Go 1.13.5
- Java (OpenJDK 13.0.1)
- JavaScript (Node.js 12.14.0)
- TypeScript 3.7.4
- Rust 1.40.0
- C/C++ (GCC 9.2.0)
- And 50+ more languages
