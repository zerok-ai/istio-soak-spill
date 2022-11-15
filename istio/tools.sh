#!/bin/bash

action=${1:-apply}
echo $action

kubectl $action -f https://raw.githubusercontent.com/istio/istio/release-1.15/samples/addons/grafana.yaml
kubectl $action -f https://raw.githubusercontent.com/istio/istio/release-1.15/samples/addons/prometheus.yaml
kubectl $action -f https://raw.githubusercontent.com/istio/istio/release-1.15/samples/addons/kiali.yaml

