# MyAnimeList.net API Client for Node.js

**I'M STILL WORKING ON THIS**

This repo has several version (as a package) you can choose:

- [Lite version](packages/mal-api-lite/) of the API Client
- *Strongly Typed version of the API Client* (planned)

To better see the client documentation, please check the package folder.

To see the API Documentation, please consult to:

- [MyAnimeList API Authorization Documentation](https://myanimelist.net/apiconfig/references/authorization)
- [MyAnimeList API beta Version 2 Documentation](https://myanimelist.net/apiconfig/references/api/v2)

## Features:

- Typescript supported
- You can choose the Lite version if you don't want to use the Typescript.
- ~~Pagination support~~ (still on development)

## Usage

### Install

Lite version:

```shell
$ npm i -s @chez14/mal-api-lite
# OR
$ yarn add @chez14/mal-api-lite

```

Strongly Typed version: (under construction)

```shell
$ npm i -s @chez14/mal-api
# OR
$ yarn add @chez14/mal-api
```

### Consuming the API

Before using this package, please make sure that you have the `client_secret` and `client_id` key. To obtain the key, you need to register to the [API page of your MyAnimeList account](https://myanimelist.net/apiconfig).

After that, you can create an instance for the API Client, providing either (`clientId` and `clientSecret`) OR (`accessToken` or `refreshToken`).

```typescript
import { MALClient } from '@chez14/mal-api-lite' // (or @chez14/mal-api)

const mal = new MALClient({
    // Both of the field should be filled if you want to generate authenticate link
    clientId: "client-id here",
    clientSecret: "client-secret here",
    
    // or if you have the tokens, you can ignore the client settings and
    // add either:
    accessToken: "accessTokenHere",
    // or provide refreshToken, the accessToken will be fetched 
    // automatically
    refreshToken: "refreshTokenHere"
});
```

To start authentication, you need to generate the authentication link:

```typescript
let PKCECodeChallenge = "random 43-128 chars just for code challenge"; // DON'T FORGET TO SAVE IT (to session)!
let authUrl = mal.getOAuthURL(PKCECodeChallenge);
```

Then redirect the user to the AuthURl, let the user authenticate, then the MAL will redirect back to your `redirect_url` field, carrying the authorization code `code`.

To get the access token for the resources, you need to "convert" the authorization code `code` first by:

```typescript
const { access_token, refresh_token, expires_in } = mal.getTokensFromAuthCode(authCode, PKCECodeChallenge);
```

**💡 Tip:** You will need to save the `acess_token` and especially `refresh_token`.

The token will be automatically added to the class. You can now access the resources all you want!

// TODO: Add documentation for this.

## License

[MIT](LICENSE).