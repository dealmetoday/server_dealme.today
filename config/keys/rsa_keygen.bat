@echo off
set KEYPATH=%~dp0
set PRVKEY=%KEYPATH%private_key.pem
set PUBKEY=%KEYPATH%public_key.pem

if exist %PRVKEY% (
	if exist %PUBKEY% (
		echo Public and private keys already exist
		echo Will not generate another key pair
		goto :done
	)
)
openssl genpkey -algorithm RSA -out %PRVKEY% -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in %PRVKEY% -out %PUBKEY%
:done