import express from "express";
import {
  CognitoIdentityProviderClient,
  ListUserPoolsCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from "@aws-sdk/client-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import fetch from "node-fetch";

console.log("Starting API server");

// Initialize AWS SDK clients
const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);

const app = express();
const port = 3000;

// Configuration
const CACHE_TTL = 3600; // 1 hour
let cache = { user_pools: null, timestamp: 0 };

// Middleware to log every request
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] - ${req.method} ${req.originalUrl}`
  );
  next();
});

// Middleware to strip the base path
app.use((req, res, next) => {
  if (req.url.startsWith("/tenant-management")) {
    req.url = req.url.replace("/tenant-management", "");
  }
  next();
});

// Function to fetch tenant configuration from DynamoDB
const getTenantConfig = async (tenantId) => {
  const params = {
    TableName: process.env.TENANT_TABLE_NAME,
    Key: { TenantId: tenantId },
  };

  const data = await ddbDocClient.send(new GetCommand(params));
  if (!data.Item) {
    throw new Error("Tenant configuration not found");
  }
  return data.Item;
};

// Function to fetch user pools from AWS Cognito
const getUserPools = async () => {
  const currentTime = Date.now() / 1000; // Current time in seconds
  if (cache.user_pools && currentTime - cache.timestamp < CACHE_TTL) {
    console.log("Using cached user pools");
    return cache.user_pools;
  }

  console.log("Fetching user pools from Cognito");
  const cognitoISPClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });
  let userPools = [];
  let response = await cognitoISPClient.send(
    new ListUserPoolsCommand({ MaxResults: 60 })
  );
  userPools = userPools.concat(response.UserPools);

  while (response.NextToken) {
    response = await cognitoISPClient.send(
      new ListUserPoolsCommand({
        NextToken: response.NextToken,
        MaxResults: 60,
      })
    );
    userPools = userPools.concat(response.UserPools);
  }

  const userPoolUrls = userPools.map(
    (pool) =>
      `https://cognito-idp.${pool.Id.split("_")[0]}.amazonaws.com/${pool.Id}`
  );
  cache.user_pools = userPoolUrls;
  cache.timestamp = currentTime;

  console.log(`Fetched and cached ${userPoolUrls.length} user pools`);
  return userPoolUrls;
};

// Function to fetch JWKS for a given issuer
const getJwks = async (issuer) => {
  console.log(`Fetching JWKS for issuer: ${issuer}`);
  const response = await fetch(`${issuer}/.well-known/jwks.json`);
  if (!response.ok) {
    console.error(`Failed to fetch JWKS: ${response.statusText}`);
    throw new Error("Failed to fetch JWKS");
  }
  return await response.json();
};

// Middleware to verify token and get AWS credentials
identityPoolIdapp.use(async (req, res, next) => {
  if (req.url === "/health") {
    return next();
  }

  const bearerToken = req.headers["id-token"];
  const token = bearerToken ? bearerToken.split(" ")[1] : null;
  console.log(`ID token: ${token}`);
  if (!token) {
    console.warn("No ID token found");
    return res.status(401).send("Unauthorized");
  }

  const tenantId = decodedToken.payload.tenantId; // Assuming tenantId is part of the JWT payload

  // Fetch tenant configuration from DynamoDB
  const tenantConfig = await getTenantConfig(tenantId);
  const userPoolId = tenantConfig.UserPoolId;
  const identityPoolId = tenantConfig.IdentityPoolId;

  try {
    const trustedIssuers = await getUserPools();
    const decodedToken = jwt.decode(token, { complete: true });
    const issuer = decodedToken.payload.iss;

    if (!trustedIssuers.includes(issuer)) {
      console.warn(`Issuer not trusted: ${issuer}`);
      return res.status(401).send("Unauthorized");
    }

    const jwks = await getJwks(issuer);
    const jwk = jwks.keys.find((key) => key.kid === decodedToken.header.kid);
    if (!jwk) {
      console.warn("JWK not found");
      return res.status(401).send("Unauthorized");
    }

    const pem = jwkToPem(jwk);
    jwt.verify(token, pem, { algorithms: ["RS256"], issuer: issuer });

    console.log("Token successfully verified");

    const cognitoIdentityClient = new CognitoIdentityClient({
      region: process.env.AWS_REGION,
    });

    const getIdCommand = new GetIdCommand({
      IdentityPoolId: identityPoolId,
    });

    const ci = await cognitoIdentityClient.send(getIdCommand);

    const getCredentialsForIdentityCommand =
      new GetCredentialsForIdentityCommand({
        IdentityId: ci.IdentityId,
        Logins: {
          [`cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${userPoolId}`]:
            token,
        },
      });

    const credentials = await cognitoIdentityClient.send(
      getCredentialsForIdentityCommand
    );
    req.awsCredentials = credentials.Credentials;

    console.log("AWS credentials successfully retrieved");

    next();
  } catch (error) {
    console.error("Error verifying token or getting credentials", error);
    res.status(401).send("Unauthorized");
  }
});

app.get("/", (req, res) => {
  console.log("Hello World!!");
  res.send("Hello World!!");
});

app.get("/api", (req, res) => {
  console.log("API endpoint accessed");
  // res.json({ message: "Hello from API", credentials: req.awsCredentials });
  // sts and getCallerIdentity with credentials
  const stsClient = new STSClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: req.awsCredentials.AccessKeyId,
      secretAccessKey: req.awsCredentials.SecretKey,
      sessionToken: req.awsCredentials.SessionToken,
    },
  });
  const getCallerIdentityCommand = new GetCallerIdentityCommand({});
  stsClient.send(getCallerIdentityCommand).then((data) => {
    console.log("GetCallerIdentityCommand", data.Arn);
  });
  // list dynamodb tables
  const dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: req.awsCredentials.AccessKeyId,
      secretAccessKey: req.awsCredentials.SecretKey,
      sessionToken: req.awsCredentials.SessionToken,
    },
  });
  const listTablesCommand = new ListTablesCommand({});
  dynamoDBClient.send(listTablesCommand).then((data) => {
    console.log("ListTablesCommand", data.TableNames);
  });
  res.send("API endpoint accessed");
});

app.get("/health", (req, res) => {
  console.log("Health check endpoint accessed");
  res.send("OK");
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
