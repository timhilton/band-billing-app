'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'

import CreateArtistForm from './components/CreateArtistForm';
import styles from './page.module.css'

export default function Home() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID
  let REDIRECT_URI = process.env.NODE_ENV === 'production' ? 'https://band-billing-app.vercel.app' : 'http://localhost:3000';
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");
    const tokenExpiry = window.localStorage.getItem("token_expiry");

    // Clear expired token
    if (storedToken && tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      storedToken = null;
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_expiry");
    }

    if (!storedToken && hash) {
      const params = hash.substring(1).split("&").reduce((acc, elem) => {
        const [key, val] = elem.split("=");
        acc[key] = val;
        return acc;
      }, {});

      if (params.access_token) {
        storedToken = params.access_token;
        const expiresIn = parseInt(params.expires_in || 3600);
        window.localStorage.setItem("token", storedToken);
        window.localStorage.setItem("token_expiry", Date.now() + expiresIn * 1000);
      }

      window.location.hash = "";
    }

    setToken(storedToken || "");
  }, []);

  const logout = () => {
      setToken("")
      window.localStorage.removeItem("token")
      window.localStorage.removeItem("token_expiry")
  }

  return (
    <main className={styles.main}>
      <div className="App">
          <header className="App-header">
              <h1>Band Billing App</h1>
              {!token ?
                  <a className={`${styles.button} ${styles.buttonGreen}`} href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}`}>
                    Login to Spotify
                  </a>
                  : <button className={`${styles.button} ${styles.buttonGreen}`} onClick={logout}>Logout of Spotify</button>
              }
          </header>
      </div>
      <CreateArtistForm token={token} />
      <footer style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </main>
  )
}
