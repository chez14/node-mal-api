# MyAnimeList.net API Client for Node.js: Lite Version

To see the API Documentation, please consult to:

- [MyAnimeList API Authorization Documentation](https://myanimelist.net/apiconfig/references/authorization)
- [MyAnimeList API beta Version 2 Documentation](https://myanimelist.net/apiconfig/references/api/v2)

## Features

- TypeScript supported
- V2 API Support
- Typecasting, if you're that kind of person (No, we don't offer the models *just yet*. They'll release v3 API quite soon.)

## Table of Contents

- [MyAnimeList.net API Client for Node.js: Lite Version](#myanimelistnet-api-client-for-nodejs-lite-version)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Install](#install)
    - [Consuming the API](#consuming-the-api)
      - [Get Animes from Winter 2020](#get-animes-from-winter-2020)
      - [Get Anime Info](#get-anime-info)
  - [Docs](#docs)
    - [Constructor Options](#constructor-options)
    - [Methods](#methods)
      - [get](#get)
      - [patch](#patch)
      - [put](#put)
      - [delete](#delete)
      - [post](#post)
      - [getOAuthURL](#getoauthurl)
      - [resolveAuthCode](#resolveauthcode)
      - [resolveRefreshToken](#resolverefreshtoken)
  - [FAQ](#faq)
  - [License](#license)

## Usage

### Install

```shell
$ npm i -s @chez14/mal-api-lite
# OR
$ yarn add @chez14/mal-api-lite
```

### Consuming the API

Before using this package, please make sure that you have the `client_secret` and `client_id` key. To obtain the key, you need to register to the [API page of your MyAnimeList account](https://myanimelist.net/apiconfig).

After that, you can create an instance for the API Client, providing either (`clientId` and `clientSecret`) OR (`accessToken` or `refreshToken`).

```typescript
import { MALClient } from '@chez14/mal-api-lite'

const mal = new MALClient({
    // Both of the field should be filled if you want to generate authenticate link
    clientId: "client-id here",
    clientSecret: "client-secret here",
    
    // or if you have the tokens, you can ignore the client settings and
    // add either:
    accessToken: "accessToken here",
    // or provide refreshToken, the accessToken will be fetched 
    // automatically
    refreshToken: "refreshToken here"
});
```

To start authentication, you need to generate the authentication link:

```typescript
const {url, codeChallenge} = malClient.getOAuthURL();
// NOTE: you need to save the `codeChallenge` to session storage for next step.
```

Then redirect the user to the `url`, let the user authenticate, then the MAL will redirect back to your `redirect_url` field, carrying the authorization code `code`.

To get the access token for the resources, you need to "convert" the authorization code `code` first by:

```typescript
const { access_token, refresh_token, expires_in } = mal.getTokensFromAuthCode(authCode, codeChallenge);
```

**💡 Tip:** You will need to save the `acess_token` and especially `refresh_token`.

The token will be automatically added to the class. You're now ready to go! Just a quick note from our fellas:

> It's better if you always double-check by yourself the behaviour of all API functions you want to use. There're several imprecisions and typos in the documentation. —  [ZeroCrystal](https://myanimelist.net/profile/ZeroCrystal) @ [MAL API forum](https://myanimelist.net/forum/?topicid=1861482)

#### Get Animes from Winter 2020

```typescript
let animes = await mal.get("anime/season/2020/winter", {
    sort: "anime_score",
    limit: 4,
    fields: [
        "id",
        "title",
        "start_date",
        "end_date",
        "mean",
        "rank"
    ]
});
console.log(animes.data);
// Will results:
// [
//  ...
//   {
//     node: {
//       id: 36862,
//       title: 'Made in Abyss Movie 3: Fukaki Tamashii no Reimei',
//       main_picture: [Object],
//       start_date: '2020-01-17',
//       end_date: '2020-01-17',
//       mean: 8.72,
//       rank: 39
//     }
//   },
//   ...
// ]
```

#### Get Anime Info

```typescript
let animeInfo = await malClient.get("anime/36862", {
    fields: [
        "id",
        "title",
        "start_date",
        "end_date",
        "mean",
        "rank"
    ]
});
console.log(animeInfo);
// Will result as:
// {
//   id: 36862,
//   title: 'Made in Abyss Movie 3: Fukaki Tamashii no Reimei',
//   main_picture: {
//     medium: 'https://api-cdn.myanimelist.net/images/anime/1175/101926.jpg',
//     large: 'https://api-cdn.myanimelist.net/images/anime/1175/101926l.jpg'
//   },
//   start_date: '2020-01-17',
//   end_date: '2020-01-17',
//   mean: 8.72,
//   rank: 39
// }
```

## Docs

### Constructor Options

| Name & Type                                                  | Required                      | Default           | Descriptions                                                 |
| ------------------------------------------------------------ | ----------------------------- | ----------------- | ------------------------------------------------------------ |
| clientId: string                                             | yes, for OAuth related stuff. | `undefined`       | Self explanatory.                                            |
| clientSecret: string                                         | yes, for OAuth related stuff. | `undefined`       | Self explanatory.                                            |
| accessToken: string                                          | yes, to use API               | `undefined`       | Self explanatory.                                            |
| refreshToken: string                                         | yes, to use API               | `undefined`       | Self explanatory.                                            |
| gotOptions: [GotOptions](https://www.npmjs.com/package/got)  | no                            | (see it yourself) | Add your options for the Got. Things like proxy, and etcs.   |
| gotOAuthOptions: [GotOptions](https://www.npmjs.com/package/got) | no                            | (see it yourself) | Same like above, but for OAuth related stuffs.               |
| autoRefreshAccessToken: boolean                              | no                            | `false`           | We're able to request update for your access token when it gor `401`ed. We'll use `refreshToken` to request update automatically. This way, you'll be guaranteed to be able to access all API with ease.<br /><br />**⚠ WARN:** You'll need to save the `refrehsToken` afterwards. Old refresh token will be revoked once used to refresh the `accessToken`. |

### Methods

#### get

Signature: `get<T = any>(resource: string, param?: PaginatableRequest): Promise<T>`

Parameter `fields` will accept either string or array string. If array is given, it will be converted automatically to string, by gluing them with comma.

#### patch

Signature `patch<T = any>(resource: string, param?: BaseRequest): Promise<T>`

**[🤖](https://madeinabyss.fandom.com/wiki/Reg#Personality) Note:** The documentation states that some function uses PATCH while the cUrl sample states PUT and they obediently accept both method as a valid one. *Irredeemable*, right? Well as ... stated: you need to recheck the documentation again.

#### put

Signature: `put<T = any>(resource: string, param?: BaseRequest): Promise<T>`

**[🤖](https://madeinabyss.fandom.com/wiki/Reg#Personality) Note:** The documentation states that some function uses PATCH while the cUrl sample states PUT and they obediently accept both method as a valid one. *Irredeemable*, right? Well as ... stated: you need to recheck the documentation again.

#### delete

Signature: `delete<T = any>(resource: string, param?: BaseRequest): Promise<T>`

#### post

Signature: `post<T = any>(resource: string, param?: BaseRequest): Promise<T>`

While there's no endpoint currently used this method, but it's weird when you implement `get` and many others but `post`. It's just a habit of mine, don't mind me.

#### getOAuthURL

Signature:`getOAuthURL( redirectUri?: string, codeChallenge?: string, state?: string ):{ url, codeChallenge, state? }`

We support OAuth URL generation, this function will automatically generate the `codeChallenge` variable and you can receive it on the return result. To override, you can add something to the `codeChallenge` parameter itself.

As stated by the documentation, `redirectUrl` can be left blank **IF** you have single RedirectUrl on the app page.

Also, just for the records, state will be left alone, even if it is `undefined`. We'll just send them back on the return function to help you. You can left them alone if you don't want to.

#### resolveAuthCode

Signature: `resolveAuthCode(authCode: string, codeVerifier: string, redirectUri?: string): Promise<any>`

This function will resolve your Authorization Code  to `access_token` and `refresh_token`. 

#### resolveRefreshToken

Signature: `resolveRefreshToken(refreshToken?: string): Promise<any>`

Refresh given `refreshToken` (from constructor by default). Will return **new** `access_token` and `refresh_token`. 

## FAQ

**How to convert MAL URL to ID?** \
Do it by yourself with substring, or with the fancy [myanimelist-url-to-id](https://www.npmjs.com/package/myanimelist-url-to-id) NPM Package.

**How can this be an FAQ when you wrote it before the package released?** \
[In this case, "FAQ" stands for "Fully Anticipated Questions"](https://www.youtube.com/watch?v=8YUWDrLazCg).

## License

[MIT](LICENSE). Yesh, it's free.
