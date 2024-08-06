const express = require("express");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const app = express();
const port = 3000;

// Configuration
const CACHE_TTL = 3600; // 1 hour
let cache = { user_pools: null, timestamp: 0 };

// Middleware to log every request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to strip the base path
app.use((req, res, next) => {
  if (req.url.startsWith("/tenant-management")) {
    req.url = req.url.replace("/tenant-management", "");
  }
  next();
});

// Function to fetch user pools from AWS Cognito
const getUserPools = async () => {
  const currentTime = Date.now() / 1000; // Current time in seconds
  if (cache.user_pools && currentTime - cache.timestamp < CACHE_TTL) {
    console.log("Using cached user pools");
    return cache.user_pools;
  }

  console.log("Fetching user pools from Cognito");
  const cognitoISP = new AWS.CognitoIdentityServiceProvider();
  let userPools = [];
  let response = await cognitoISP.listUserPools({ MaxResults: 60 }).promise();
  userPools = userPools.concat(response.UserPools);

  while (response.NextToken) {
    response = await cognitoISP
      .listUserPools({ NextToken: response.NextToken, MaxResults: 60 })
      .promise();
    userPools = userPools.concat(response.UserPools);
  }

  const userPoolUrls = userPools.map(
    (pool) =>
      `https://cognito-idp.${pool.Id.split("_")[0]}.amazonaws.com/${pool.Id}`
  );
  cache.user_pools = userPoolUrls;
  cache.timestamp = currentTime;

  return userPoolUrls;
};

// Function to fetch JWKS for a given issuer
const getJwks = async (issuer) => {
  const response = await fetch(`${issuer}/.well-known/jwks.json`);
  return await response.json();
};

// Middleware to verify token and get AWS credentials
app.use(async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const trustedIssuers = await getUserPools();
    const decodedToken = jwt.decode(token, { complete: true });
    const issuer = decodedToken.payload.iss;

    if (!trustedIssuers.includes(issuer)) {
      console.log("Issuer not trusted");
      return res.status(401).send("Unauthorized");
    }

    const jwks = await getJwks(issuer);
    const jwk = jwks.keys.find((key) => key.kid === decodedToken.header.kid);
    if (!jwk) {
      console.log("JWK not found");
      return res.status(401).send("Unauthorized");
    }

    const pem = jwkToPem(jwk);
    jwt.verify(token, pem, { algorithms: ["RS256"], issuer: issuer });

    const cognitoIdentity = new AWS.CognitoIdentity({
      region: process.env.AWS_REGION,
    });

    const ci = await cognitoIdentity
      .getId({
        IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
        Logins: {
          [`cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`]:
            token,
        },
      })
      .promise();

    const params = {
      IdentityId: ci.IdentityId,
      Logins: {
        [`cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`]:
          token,
      },
    };

    const credentials = await cognitoIdentity
      .getCredentialsForIdentity(params)
      .promise();
    req.awsCredentials = credentials.Credentials;

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
  console.log("API");
  res.json({ message: "Hello from API", credentials: req.awsCredentials });
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
