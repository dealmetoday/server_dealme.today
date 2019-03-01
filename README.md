# server_dealme.today
Server Portion of dealme.today

To run locally: npm run serve

To deploy: npm run deploy

Before doing either, you must complete the following:

1. Install serverless with: npm install -g serverless

2. Create IAM user in AWS with: Programmatic Access and Admin Permissions

3. Configure serverless with: serverless config credentials --provider aws --key xxxxxxxxxxxxxx --secret xxxxxxxxxxxxxx

Note:
- To run locally, uncomment lines [27 - 29](https://github.com/RyanLiu6/server_dealme.today/blob/master/serverless.yml#L27)

- Do the opposite for deployment
