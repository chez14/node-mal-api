import { MALClient } from "../lib";
import nock from "nock";

describe('OAuth', () => {

  const mal = new MALClient({
    clientId: "client-id",
    clientSecret: "client-secret"
  });
  const PKCEChallenge = "someting-like-40-random-characters-or-maybe-56-character";

  it('should be able to generate OAuth link', () => {

    expect(mal.getOAuthURL().codeChallenge).toBeDefined();
    expect(mal.getOAuthURL(undefined, PKCEChallenge).url).toBeDefined();
  });

  it('should be able to resolve the auth code to access & refresh token', async () => {
    const scope = nock("https://myanimelist.net")
      .post("/v1/oauth2/token")
      .reply(200, {
        token_type: "Bearer",
        expires_in: 2415600,
        access_token: "access-token",
        refresh_token: "refresh-token",
      });

    await mal.resolveAuthCode("some-auth-code", PKCEChallenge);
    expect(scope.isDone()).toBeTruthy();
    expect(mal.accessToken).toBe("access-token")
    expect(mal.refreshToken).toBe("refresh-token")
  });

  it('should be able to automatically request things if it got 401 (on get).', async () => {
    // set flag on:
    mal.autoRefreshAccessToken = true;
    const scopeFailed = nock("https://api.myanimelist.net", {reqheaders: {
      authorization: "Bearer access-token"
    }})
      .get("/v2/anime")
      .reply(401, { "error": "invalid_token" });

    const scopeSuccess = nock("https://api.myanimelist.net", {reqheaders: {
      authorization: "Bearer access-token-new"
    }})
      .get("/v2/anime")
      .reply(200, { "data": "something" });

    const scope2 = nock("https://myanimelist.net")
      .post("/v1/oauth2/token")
      .reply(200, {
        token_type: "Bearer",
        expires_in: 2415600,
        access_token: "access-token-new",
        refresh_token: "refresh-token-new",
      });

    await mal.get("anime");
    expect(scopeFailed.isDone()).toBeTruthy();
    expect(scopeSuccess.isDone()).toBeTruthy();
    expect(scope2.isDone()).toBeTruthy();
    expect(mal.accessToken).toBe("access-token-new");
    expect(mal.refreshToken).toBe("refresh-token-new");
  });
});
