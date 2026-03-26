import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateVaultId } from '../utils/generateVaultId.js';

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        try {
          // 1. Check if user with googleId exists
          let user = await User.findOne({ googleId: id });

          if (user) {
            user.lastLoginDate = new Date().toISOString().split('T')[0];
            await user.save();
            return done(null, user);
          }

          // 2. If not, check if user with Google email exists (Account Linking)
          user = await User.findOne({ email });

          if (user) {
            user.googleId = id;
            user.authMethod = 'google';
            user.lastLoginDate = new Date().toISOString().split('T')[0];
            await user.save();
            return done(null, user);
          }

          // 3. New User creation
          const newUser = new User({
            name: displayName,
            email: email,
            googleId: id,
            authMethod: 'google',
            lastLoginDate: new Date().toISOString().split('T')[0],
            level: 1,
            isOnboarded: false, // Will require onboarding
          });

          // Generate Vault ID
          newUser.vaultId = generateVaultId(newUser);

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          console.error('[Passport] Error in Google Strategy:', error);
          return done(error, null);
        }
      }
    )
  );

  // No session support needed for JWT-based auth, but Passport requires these if session: true
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
