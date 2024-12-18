'use client';

import { useEffect, useState } from 'react'

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
    let token = window.localStorage.getItem("token");
  
    if (!token && hash) {
      const accessToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"));
      if (accessToken) {
        token = accessToken.split("=")[1];
      }
  
      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
  
    setToken(token);
  }, []);

  const logout = () => {
      setToken("")
      window.localStorage.removeItem("token")
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
    </main>
  )
}
