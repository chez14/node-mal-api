import got, { Options as GotOptions, Got } from 'got';

import { URL } from 'url';
import { PaginatableRequest, BaseRequest } from './RequestInterface';

export interface Options {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  gotOptions?: GotOptions;
  gotOAuthOptions?: GotOptions;
}

export class MALClient {
  public clientId?: string;

  public clientSecret?: string;

  public accessToken?: string;

  public refreshToken?: string;

  public got: Got;

  public gotOAuth: Got;

  /**
   * Create MAL API Client
   * @param param0 Your trusty configuration
   */
  public constructor({ clientId, clientSecret, accessToken, refreshToken, gotOptions, gotOAuthOptions }: Options) {
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
    this.got = got.extend({
      ...{
        prefixUrl: 'https://api.myanimelist.net/v2/',
        responseType: 'json',
      },
      ...gotOptions,
    });
    this.gotOAuth = got.extend({
      ...{
        prefixUrl: 'https://myanimelist.net/v1/oauth2/',
        responseType: 'json',
      },
      ...gotOAuthOptions,
    });
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

    const resp: any = await this.gotOAuth.post('token', {
      form: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
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

    const urlBuilder = new URL('authorize', this.gotOAuth.defaults.options.prefixUrl);
    Object.keys(query).forEach((key) => {
      if (query[key]) {
        urlBuilder.searchParams.append(key, query[key]);
      }
    });

    return urlBuilder.toString();
  }

  /**
   * Refresh your access token with refresh token. Sounds amazing, right?
   * @param refreshToken Custom refresh token
   */
  public async refreshAccessToken(refreshToken?: string): Promise<any> {
    if (!refreshToken) {
      refreshToken = this.refreshToken;
    }
    const resp: any = await this.gotOAuth.post('token', {
      form: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    });
    const { access_token, refresh_token } = resp.body;
    this.accessToken = access_token;
    this.refreshToken = refresh_token;
    return resp.body;
  }

  /**
   * Checks for request requirements, such as refresh tokens checkings.
   *
   * @return {boolean} wether we DON'T use refresh token or yes.
   */
  protected async preRequest(): Promise<boolean> {
    if (!this.accessToken) {
      if (!this.refreshToken) {
        throw new Error('accessToken and/or refreshToken must be filled to use this function!');
      }

      await this.refreshAccessToken();
      return false;
    }
    return true;
  }

  /**
   * Do HTTP GET stuffs.
   * @param resource Url to call
   * @param param Parameter body
   */
  public async get(resource: string, param?: PaginatableRequest): Promise<any> {
    const viaRefreshToken = !(await this.preRequest());

    const response = await this.got.get(resource, {
      searchParams: param,
    });

    if (response.statusCode === 401 && !viaRefreshToken) {
      // attempt to request the access token, then rerequest;
      this.accessToken = undefined;
      return this.get(resource, param);
    }

    return response.body;
  }

  /**
   * Do HTTP PATCH — oh wait, they said it was PUT. Hecking bamboozled again.
   * @param resource Url to call
   * @param param Parameter body
   */
  public async patch(resource: string, param?: BaseRequest): Promise<any> {
    await this.preRequest();
    const response = await this.got.put(resource, {
      form: param,
    });
    return response.body;
  }

  /**
   * Do HTTP DELETE stuffs.
   * @param resource Url to call
   * @param param Parameter body (discouraged)
   */
  public async delete(resource: string, param?: BaseRequest): Promise<any> {
    await this.preRequest();
    const response = await this.got.delete(resource, {
      searchParams: param,
    });
    return response.body;
  }
}
