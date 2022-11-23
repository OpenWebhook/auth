import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Authenticator, UserModel } from './types';

// Human-readable title for your website
const rpName = 'SimpleWebAuthn Example';
// A unique identifier for your website
const rpID = 'localhost'; // 'openwebhook-auth.herokuapp.com';
// The URL at which registrations and authentications should occur
const origin = `http://${rpID}:5173`;

@Controller('webauthn')
export class WebAuthnController {
  @Get('register')
  async getRegistrationOptions() {
    // (Pseudocode) Retrieve the user from the database
    // after they've logged in
    const user: UserModel = this.getUserFromDB('loggedInUserId');
    // (Pseudocode) Retrieve any of the user's previously-
    // registered authenticators
    const userAuthenticators: Authenticator[] =
      this.getUserAuthenticators(user);

    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.username,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: 'none',
      // Prevent users from re-registering existing authenticators
      excludeCredentials: userAuthenticators.map((authenticator) => ({
        id: authenticator.credentialID,
        type: 'public-key',
        // Optional
        transports: authenticator.transports,
      })),
    });

    // (Pseudocode) Remember the challenge for this user
    this.setUserCurrentChallenge(user, options.challenge);

    return options;
  }

  @Post('register')
  async verifyRegistration(@Req() req, @Res() res) {
    const { body } = req;

    // (Pseudocode) Retrieve the logged-in user
    const user: UserModel = this.getUserFromDB('loggedInUserId');
    // (Pseudocode) Get `options.challenge` that was saved above
    const expectedChallenge: string = this.getUserCurrentChallenge(user);

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      const { registrationInfo } = verification;
      const { credentialPublicKey, credentialID, counter } = registrationInfo;

      const newAuthenticator: Authenticator = {
        credentialID,
        credentialPublicKey,
        counter,
      };

      // (Pseudocode) Save the authenticator info so that we can
      // get it by user ID later
      this.saveNewUserAuthenticatorInDB(user, newAuthenticator);
    } catch (error: any) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }

    const { verified } = verification;
    return res.status(200).send({ verified });
  }

  @Get('authenticate')
  generateAuthenticationOptions() {
    // (Pseudocode) Retrieve the logged-in user
    const user: UserModel = this.getUserFromDB('loggedInUserId');
    // (Pseudocode) Retrieve any of the user's previously-
    // registered authenticators
    const userAuthenticators: Authenticator[] =
      this.getUserAuthenticators(user);

    const options = generateAuthenticationOptions({
      // Require users to use a previously-registered authenticator
      allowCredentials: userAuthenticators.map((authenticator) => ({
        id: authenticator.credentialID,
        type: 'public-key',
        // Optional
        transports: authenticator.transports,
      })),
      userVerification: 'preferred',
    });

    // (Pseudocode) Remember this challenge for this user
    this.setUserCurrentChallenge(user, options.challenge);

    return options;
  }

  @Post('authenticate')
  async verifyAuthentication(@Req() req, @Res() res) {
    const { body } = req;

    // (Pseudocode) Retrieve the logged-in user
    const user: UserModel = this.getUserFromDB('loggedInUserId');
    // (Pseudocode) Get `options.challenge` that was saved above
    const expectedChallenge: string = this.getUserCurrentChallenge(user);
    // (Pseudocode} Retrieve an authenticator from the DB that
    // should match the `id` in the returned credential
    const authenticator = this.getUserAuthenticator(user, body.id);

    if (!authenticator) {
      throw new Error(
        `Could not find authenticator ${body.id} for user ${user.id}`,
      );
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator,
      });
      const { authenticationInfo } = verification;
      const { newCounter } = authenticationInfo;

      this.saveUpdatedAuthenticatorCounter(authenticator, newCounter);
    } catch (error: any) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }

    const { verified } = verification;
    return res.status(200).send({ verified });
  }

  private getUserFromDB(loggedInUserId: string): UserModel {
    console.log(loggedInUserId);
    return { id: '1', username: 'test' };
  }

  private userChallenge: Record<UserModel['id'], string> = {};
  private setUserCurrentChallenge(user: UserModel, challenge: string) {
    this.userChallenge[user.id] = challenge;
  }

  private getUserCurrentChallenge(user: UserModel) {
    return this.userChallenge[user.id];
  }

  private userAuthenticators: Record<
    UserModel['id'],
    (Authenticator & { authId: string })[]
  > = {};

  private saveNewUserAuthenticatorInDB(
    user: UserModel,
    authenticator: Authenticator,
  ) {
    console.log('saveNewUserAuthenticatorInDB', user, authenticator);
    const userAuthenticators = this.userAuthenticators[user.id] || [];
    userAuthenticators.push({
      authId: Buffer.from(authenticator.credentialID).toString('base64url'),
      ...authenticator,
    });
    console.log('Saved autenticators', userAuthenticators);
    this.userAuthenticators[user.id] = userAuthenticators;
  }
  private getUserAuthenticators(user: UserModel): Authenticator[] {
    console.log('getUserAuthenticators', user);
    return this.userAuthenticators[user.id] || [];
  }
  private getUserAuthenticator(user: UserModel, authId: string): Authenticator {
    console.log(
      'getUserAuthenticator',
      user,
      authId,
      this.userAuthenticators[user.id],
    );
    console.debug('input', authId);
    console.debug('firstAuthId', this.userAuthenticators[user.id][0].authId);
    console.debug(
      'equal',
      authId === this.userAuthenticators[user.id][0].authId,
    );

    const authenticator = this.userAuthenticators[user.id].find(
      (localAuthenticator) => {
        return localAuthenticator.authId === authId;
      },
    );
    return authenticator;
  }

  private saveUpdatedAuthenticatorCounter(
    authenticator: Authenticator,
    newCounter: number,
  ) {
    console.log('saveUpdatedAuthenticatorCounter', authenticator, newCounter);
  }
}
