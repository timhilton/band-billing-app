'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'

import CreateArtistForm from './components/CreateArtistForm';
import styles from './page.module.css'

function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://band-billing-app.vercel.app';
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SCOPE = "user-read-private";

export default function Home() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    let storedToken = window.localStorage.getItem("token");
    const tokenExpiry = window.localStorage.getItem("token_expiry");

    if (storedToken && tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      storedToken = null;
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_expiry");
    }

    if (!storedToken && code) {
      const codeVerifier = window.localStorage.getItem("pkce_code_verifier");
      window.history.replaceState({}, '', window.location.pathname);

      fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            const expiresIn = parseInt(data.expires_in || 3600);
            window.localStorage.setItem("token", data.access_token);
            window.localStorage.setItem("token_expiry", Date.now() + expiresIn * 1000);
            window.localStorage.removeItem("pkce_code_verifier");
            setToken(data.access_token);
          }
        })
        .catch(err => console.error("Token exchange failed", err));
    } else {
      setToken(storedToken || "");
    }
  }, []);

  const login = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    window.localStorage.setItem("pkce_code_verifier", verifier);

    const url = new URL(AUTH_ENDPOINT);
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('scope', SCOPE);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('code_challenge', challenge);

    window.location.href = url.toString();
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("token_expiry");
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.eyebrow}>Audience-led billing</h1>
          <p className={styles.subtitle}>
            Compare Spotify reach and Instagram pull in one place so your lineup decisions feel fast,
            informed, and presentation-ready.
          </p>
          <div className={styles.ctaRow}>
            {!token ? (
              <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={login}>
                Connect Spotify
              </button>
            ) : (
              <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={logout}>
                Disconnect Spotify
              </button>
            )}
            <a className={styles.inlineLink} href="#artist-workspace">Jump to workspace</a>
          </div>
        </div>

        <aside className={styles.heroPanel}>
          <div className={styles.panelTop}>
            <span className={styles.statusDot} />
            <span>{token ? 'Spotify connected' : 'Spotify login required'}</span>
          </div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Data sources</span>
              <strong>Spotify + Instagram</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Outcome</span>
              <strong>Ranked lineup signal</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.featureStrip}>
        <div className={styles.feature}>
          <span className={styles.featureKicker}>01</span>
          <p>Pull artist follower counts from Spotify search results.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureKicker}>02</span>
          <p>Layer in Instagram audience size for a broader view of traction.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureKicker}>03</span>
          <p>Sort your lineup by weighted audience signal to spot stronger placements.</p>
        </div>
      </section>

      <section id="artist-workspace" className={styles.workspace}>
        <CreateArtistForm token={token} />
      </section>

      <footer className={styles.footer}>
        <span>Built for fast artist shortlist sessions.</span>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </main>
  )
}
