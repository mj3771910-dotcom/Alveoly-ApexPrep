import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../src/models/User.js";
import generateToken from "../src/utils/generateToken.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email from Google"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });
        }

        const token = generateToken(user);

        return done(null, { user, token });

      } catch (err) {
        console.error("GOOGLE AUTH ERROR:", err);
        done(err, null);
      }
    }
  )
);

// ❌ NO session serialize needed (JWT system)
export default passport;