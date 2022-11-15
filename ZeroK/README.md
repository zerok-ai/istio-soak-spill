## Setup Istio
istioctl dashboard kiali

## Base system setup
Path: demo/Deployment
```
setup.sh
```

## ZeroK replicate and run
Path: demo/ZeroK
**Cleanup**:
```
./setup.sh clean
```
**install**:
```
./setup.sh test service3
```

**Update upstream latency**
(min max)
```
./setup.sh latency 10 100
```
