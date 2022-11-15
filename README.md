# Setup: 

### Deploy sample service with 3 replicas
```bash
cd SampleApp/kustomize/
./deploy.sh -n default -s service -r 3
cd ../../
```
This should deploy service in default namespace.   

### Setup istio
```
istioctl install
```

### Setup soak/spill pods.
```
cd istio 
./setup.sh
```
Followup:
- check the ip address of soak-service service and update it in soak.yaml
- apply soak.yaml

### Expose minikube service 
```
minikube service service --url
```

### K6
update the port exposed above in k6 script.js 

#### run K6
```
cd k6
k6 run script.js
```


