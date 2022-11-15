#!/bin/bash

DEFAULT_DEPLOYMENT='service-deployment'
DEPLOYMENT="${1:-$DEFAULT_ACTION}"

kubectl rollout restart deployment $DEPLOYMENT -n default
kubectl rollout status deployment

sleep 5

./lable-zerok.sh $DEPLOYMENT

kubectl apply -k ./