import { Router } from 'express';
import { loginHelper, googleLoginHelper } from '../controllers/auth.js';
import passport from 'passport';

const router = Router();

router.post('/login', loginHelper);
router.post('/oauth-login', googleLoginHelper);
// Google auth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    // You might return a small script to close the popup
    res.send(`
      <script>
        window.opener.location.reload(); // Refresh parent window
        window.close(); // Close the popup
      </script>
    `);
  }
);


// Facebook auth routes
router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

// Apple auth routes
router.get('/apple', passport.authenticate('apple'));

router.post(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});
export default router;
