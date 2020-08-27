import got, { Options as GotOptions } from 'got';

import { URL } from 'url';

export interface Options {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  gotOptions: GotOptions;
  gotOAuthOptions: GotOptions;
}

export class MALClient {
  public clientId?: string;

  public clientSecret?: string;

  public accessToken?: string;

  public refreshToken?: string;

  public gotOptions: GotOptions;

  public gotOAuthOptions: GotOptions;

  public constructor({
    clientId,
    clientSecret,
    accessToken,
    refreshToken,
    gotOptions = {
      prefixUrl: 'https://api.myanimelist.net/v2',
      responseType: 'json',
    },
    gotOAuthOptions = {
      prefixUrl: 'https://api.myanimelist.net/v1/oauth2',
      responseType: 'json',
    },
  }: Options) {
    if ((!clientSecret || !clientId) && !(accessToken || refreshToken)) {
      // if either ( clientSecret or clientId ) not preset, AND accessToken or
      // refreshToken is provided...
      throw new Error(
        'either you provide both `clientSecret` and `clientId` OR one of `accessToken` or `refreshToken`',
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.gotOptions = gotOptions;
    this.gotOAuthOptions = gotOAuthOptions;
  }

  /**
   * Get Access Token & Refresh Token from given Authorization Code.
   *
   * @param authCode Authorization code
   * @param codeVerifier PKCE Code Challenge
   * @param redirectUri Redirect url, specified on on previous step
   */
  public async getTokensFromAuthCode(authCode: string, codeVerifier: string, redirectUri?: string): Promise<any> {
    if (!this.clientSecret || !this.clientId) {
      throw new Error('clientSecret and clientId must be filled to use this function!');
    }

    const resp: any = await got.post('token', {
      ...this.gotOAuthOptions,
      ...{
        form: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        },
      },
    });
    const { access_token, refresh_token } = resp.body;
    this.accessToken = access_token;
    this.refreshToken = refresh_token;
    return resp.body;
  }

  /**
   *
   * @param codeChallenge PKCE Code Challenge
   * @param redirectUri If you have more than one Redirect URL, please specify
   * the url you use.
   * @param state Your app state
   * @param codeChallengeMethod Only accept "plain". Don't change unless you know
   * what you're doing!
   */
  public getOAuthURL(
    codeChallenge: string,
    redirectUri?: string,
    state?: string,
    codeChallengeMethod: string = 'plain',
  ): string {
    if (!this.clientSecret || !this.clientId) {
      throw new Error('clientSecret and clientId must be filled to use this function!');
    }

    const query: any = {
      response_type: 'code',
      client_id: this.clientId,
      state,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    };

    const urlBuilder = new URL('authorize', this.gotOAuthOptions?.prefixUrl);
    Object.keys(query).forEach((key) => {
      urlBuilder.searchParams.append(key, query[key]);
    });

    return urlBuilder.toString();
  }
}
