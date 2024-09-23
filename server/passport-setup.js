// passport-setup.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import AppleStrategy from 'passport-apple';
import dotenv from 'dotenv';

dotenv.config();
console.log('process.env.GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID);
// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Facebook OAuth strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Apple OAuth strategy
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    callbackURL: "/auth/apple/callback",
    scope: ['name', 'email'],
  },
  (accessToken, refreshToken, idToken, profile, done) => {
    return done(null, profile);
  }
));
