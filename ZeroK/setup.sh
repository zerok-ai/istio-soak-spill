#!/bin/bash



action=$1
service=$2

function replicate {
    pwd=$(pwd)
    action=$1
    service=$2
    cd Replicator
    ./setup.sh $action $service
    cd $pwd
}

if [ $action = "test" ]; then
    kubectl create namespace zerok
    kubectl label namespace zerok "istio-injection=enabled"

    replicate apply $service

    kubectl apply -k ./LoadServer

    cd ../SampleApp/kustomize
    ./deploy.sh -n zerok-mockserver -s zerok -r 1 -k 0 -l 1

    echo 'ZeroK target setup complete'
    exit 0
fi

if [ $action = "clean" ]; then
    kubectl delete namespace zerok
    replicate delete zerok-target
    exit 0
fi

if [ $action = "latency" ]; then
    cd ../SampleApp/kustomize
    ./deploy.sh -n zerok-mockserver -s zerok -r 1 -k $2 -l $3
    exit 0
fi


