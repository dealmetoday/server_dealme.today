#!/bin/bash

KEYPATH="$( cd "$(dirname "$0")"; pwd -P )"
if [[ ! -f $KEYPATH/private_key.pem || ! -f $KEYPATH/public_key.pem ]]
then
    openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:4096
    openssl rsa -pubout -in private_key.pem -out public_key.pem
else
    echo "Public and private keys already exist"
    echo "Will not generate another key pair"
fi
