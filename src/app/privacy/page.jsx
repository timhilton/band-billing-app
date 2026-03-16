import Link from 'next/link';
import styles from './privacy.module.css';

export const metadata = {
  title: 'Privacy Policy — Band Billing App',
};

export default function PrivacyPolicy() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/">&larr; Back to App</Link>
      </nav>

      <h1>Privacy Policy</h1>
      <p className={styles.updated}>Last updated: March 15, 2026</p>

      <section>
        <h2>Overview</h2>
        <p>
          Band Billing App is a client-side tool that helps music event organizers build and rank
          artist lineups by social media following. We do not operate a backend server and do not
          collect, store, or sell any personal data on our end.
        </p>
      </section>

      <section>
        <h2>Data We Store Locally</h2>
        <p>
          To function, the app stores the following data in your browser&apos;s <code>localStorage</code>.
          This data never leaves your device and is not sent to us.
        </p>
        <ul>
          <li>
            <strong>Spotify access token</strong> — a temporary OAuth token (expires in 1 hour)
            used to look up artist follower counts via the Spotify API.
          </li>
          <li>
            <strong>Instagram access token</strong> — a long-lived token used to look up Instagram
            follower counts via the Facebook Graph API. The token is refreshed automatically every
            30 days and stored locally.
          </li>
        </ul>
        <p>
          You can clear this data at any time by logging out of Spotify in the app or by clearing
          your browser&apos;s local storage.
        </p>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>
          When you use the app, your browser makes requests directly to the following third-party
          APIs. Your use of those services is subject to their respective privacy policies.
        </p>
        <ul>
          <li>
            <strong>Spotify</strong> — used for OAuth login and artist search.{' '}
            <a href="https://www.spotify.com/us/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">
              Spotify Privacy Policy
            </a>
          </li>
          <li>
            <strong>Facebook / Instagram (Meta)</strong> — used to fetch Instagram follower counts
            via the Facebook Graph API.{' '}
            <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
              Meta Privacy Policy
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>We do not use cookies.</p>
      </section>

      <section>
        <h2>Children&apos;s Privacy</h2>
        <p>
          This app is not directed at children under 13 and we do not knowingly collect information
          from children.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          If this policy changes, the updated date at the top of this page will reflect that. We
          encourage you to review this page periodically.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          If you have any questions about this privacy policy, please reach out at{' '}
          <a href="mailto:tim@timhilton.net">tim@timhilton.net</a>.
        </p>
      </section>
    </main>
  );
}
