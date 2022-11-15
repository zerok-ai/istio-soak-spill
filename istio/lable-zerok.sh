DEFAULT_DEPLOYMENT=service-deployment
deployment="${1:-$DEFAULT_DEPLOYMENT}"

NAMESPACE=default

echo "Tagging Deployment: " $deployment
kubectl label namespace $NAMESPACE istio-injection=enabled --overwrite
# kubectl rollout restart deployment $deployment -n default
# kubectl label pods -n default -l "owner=zerok" "sidecar.istio.io/inject=false" --overwrite

podCount=$(kubectl -n $NAMESPACE get pods -l app=service --field-selector status.phase=Running --no-headers | wc -l )
prevCount=$(( $podCount - 1 ))

soakPod=$(kubectl -n $NAMESPACE get pods -l app=service --field-selector status.phase=Running --output=jsonpath='{.items[0].metadata.name}')

# Remove label app from soakPod
kubectl label pod -n $NAMESPACE $soakPod "app-"
kubectl label pod -n $NAMESPACE $soakPod "owner=zerok" --overwrite
kubectl label pod -n $NAMESPACE $soakPod "type=soak" --overwrite 

echo "Soak pod: $soakPod"
echo

echo "awaiting pod restructuring"
count=0
while [[ "$count" != "$prevCount" ]]
do
    podCount=$(kubectl -n $NAMESPACE get pods -l app=service --field-selector status.phase=Running --no-headers | wc -l )
    count=$(( $podCount - 1 ))
    sleep 1
done

echo "Labling spill pods"
for i in $(seq 0 $count)
do
  pod=$(kubectl -n $NAMESPACE get pods -l app=service --output=jsonpath="{.items[$i].metadata.name}")
  echo
  echo "Labeling pod: "$pod
  kubectl label pod -n $NAMESPACE $pod "owner=zerok" --overwrite
  kubectl label pod -n $NAMESPACE $pod "type=spill" --overwrite
  kubectl exec -n $NAMESPACE --container istio-proxy -it $pod -- /bin/bash -c "curl -sf -XPOST http://127.0.0.1:15020/quitquitquit"
done

# Restart envoy proxy
# curl -sf -XPOST http://127.0.0.1:15020/quitquitquit

