import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateVaultId } from '../utils/generateVaultId.js';

const configurePassport = () => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 
            (process.env.NODE_ENV === 'production' 
              ? '' 
              : 'http://localhost:5000/auth/google/callback'),
        },
        async (accessToken, refreshToken, params, profile, done) => {
          const { id, displayName, emails } = profile;
          const email = emails[0].value;
          const expires_in = params.expires_in;
          const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
          
          // Detect if Classroom or Calendar scopes were granted
          const isClassroomAuth = params.scope && params.scope.includes('classroom');
          const isCalendarAuth = params.scope && params.scope.includes('calendar');

          try {
            // 1. Check if user with googleId exists
            let user = await User.findOne({ googleId: id });

            if (user) {
              user.lastLoginDate = new Date().toISOString().split('T')[0];
              user.googleAccessToken = accessToken;
              if (refreshToken) user.googleRefreshToken = refreshToken;
              user.googleTokenExpiresAt = tokenExpiresAt;
              if (isClassroomAuth) user.googleClassroomLinked = true;
              if (isCalendarAuth) user.googleCalendarLinked = true;
              
              // Auto-verify academic domains
              const academicDomains = ['.ac.in', '.edu', '.edu.in', '.res.in', '.ac.uk', '.edu.au', '.edu.sg', '.edu.np', '.edu.bd', '.edu.lk'];
              if (academicDomains.some(domain => email.toLowerCase().endsWith(domain))) {
                user.isVerifiedStudent = true;
              }

              await user.save();
              return done(null, user);
            }

            // 2. If not, check if user with Google email exists (Account Linking)
            user = await User.findOne({ email });

            if (user) {
              user.googleId = id;
              user.authMethod = 'google';
              user.lastLoginDate = new Date().toISOString().split('T')[0];
              user.googleAccessToken = accessToken;
              if (refreshToken) user.googleRefreshToken = refreshToken;
              user.googleTokenExpiresAt = tokenExpiresAt;
              if (isClassroomAuth) user.googleClassroomLinked = true;
              if (isCalendarAuth) user.googleCalendarLinked = true;
              
              // Auto-verify academic domains
              const academicDomains = ['.ac.in', '.edu', '.edu.in', '.res.in', '.ac.uk', '.edu.au', '.edu.sg', '.edu.np', '.edu.bd', '.edu.lk'];
              if (academicDomains.some(domain => email.toLowerCase().endsWith(domain))) {
                user.isVerifiedStudent = true;
              }

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
              isOnboarded: false,
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              googleTokenExpiresAt: tokenExpiresAt,
              googleClassroomLinked: isClassroomAuth,
              googleCalendarLinked: isCalendarAuth,
              // Auto-verify academic domains
              isVerifiedStudent: ['.ac.in', '.edu', '.edu.in', '.res.in', '.ac.uk', '.edu.au', '.edu.sg', '.edu.np', '.edu.bd', '.edu.lk'].some(domain => email.toLowerCase().endsWith(domain)),
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
  } else {
    console.warn('[Passport] Google Client ID/Secret missing. Google OAuth will be disabled.');
  }

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
