#!/bin/bash

KEYPATH="$( cd "$(dirname "$0")"; pwd -P )"
PRVKEY=$KEYPATH/private_key.pem
PUBKEY=$KEYPATH/public_key.pem

if [[ ! -f $PRVKEY || ! -f $PUBKEY ]]
then
    openssl genpkey -algorithm RSA -out $PRVKEY -pkeyopt rsa_keygen_bits:4096
    openssl rsa -pubout -in $PRVKEY -out $PUBKEY
else
    echo "Public and private keys already exist"
    echo "Will not generate another key pair"
fi