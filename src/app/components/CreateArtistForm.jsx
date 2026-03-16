'use client';

import pageStyles from '../page.module.css';
// components/ArtistForm.js
import styles from './createartistform.module.css';
import { useState } from 'react';

export default function CreateArtistForm({ token }) {
  const [name, setName] = useState('');
  const [spotifyFollowers, setSpotifyFollowers] = useState('');
  const [instagramFollowers, setInstagramFollowers] = useState('');
  const [error, setError] = useState('');

  const [instagram, setInstagram] = useState('');
  const [artists, setArtists] = useState([]);
  const APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID;
  const IG_SECRET = process.env.NEXT_PUBLIC_IG_SECRET;
  const ENV_ACCESS_TOKEN = process.env.NEXT_PUBLIC_IG_ACCESS_TOKEN;

  // Returns a valid IG access token, refreshing it if it's been more than 30 days
  const getIgToken = async () => {
    const stored = window.localStorage.getItem("ig_token");
    const lastRefresh = window.localStorage.getItem("ig_token_refresh");
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const needsRefresh = !lastRefresh || Date.now() - parseInt(lastRefresh) > thirtyDays;

    const currentToken = stored || ENV_ACCESS_TOKEN;

    if (needsRefresh) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${IG_SECRET}&fb_exchange_token=${currentToken}`
        );
        const data = await res.json();
        if (data.access_token) {
          window.localStorage.setItem("ig_token", data.access_token);
          window.localStorage.setItem("ig_token_refresh", Date.now().toString());
          return data.access_token;
        }
      } catch (e) {
        console.warn("IG token refresh failed, using existing token", e);
      }
    }

    return currentToken;
  };

  const getSpotifyFollowers = async () => {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (res.status === 401) {
      throw new Error('Spotify session expired. Please log in again.');
    }
    const data = await res.json();
    console.log(data);
    return data.artists.items[0].followers.total;
  }


  const getInstagramFollowers = async () => {
    const accessToken = await getIgToken();
    const res = await fetch(`https://graph.facebook.com/v21.0/${APP_ID}?fields=business_discovery.username(${instagram})%7Bfollowers_count%2Cmedia_count%2Cname%2Cusername%7D&access_token=${accessToken}`);
    const data = await res.json();
    console.log(data)
    return data.business_discovery.followers_count;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Check if the artist's name already exists in the artists array
      if (artists.some(artist => artist.name.toLowerCase() === name.toLowerCase())) {
        setError('This artist is already in your list.');
        return;
      }

      const spotifyFollowers = await getSpotifyFollowers();
      const instagramFollowers = await getInstagramFollowers();
      setSpotifyFollowers(spotifyFollowers);
      setInstagramFollowers(instagramFollowers);

      let artistObj = {
        name: name,
        spotifyFollowers: spotifyFollowers,
        instagramHandle: instagram,
        instagramFollowers: instagramFollowers
      }

      console.log(artistObj);
      setArtists([...artists, artistObj]);
      setName('');
      setInstagram('');
    } catch (err) {
      console.error("Error fetching data: ", err);
      setError(err.message || 'Error fetching data. Please try again.');
    }
  };

  const handleSort = () => {
    const sortedArtists = sortArtists(artists);
    setArtists(sortedArtists);
  }
  
  const sortArtists = (artists) => {
    return [...artists].sort((a, b) => {
      const aWeightedFollowers = a.spotifyFollowers * 0.5 + a.instagramFollowers * 0.5;
      const bWeightedFollowers = b.spotifyFollowers * 0.5 + b.instagramFollowers * 0.5;
      return bWeightedFollowers - aWeightedFollowers;
    });
  }

  return (
    <>
    <article className={styles.article}>
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Add an Artist</h2>
      <label className={styles.label}>
        Artist Name:
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className={styles.label}>
        Instagram Handle:
        <input
          className={styles.input}
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </label>
      <button className={`${pageStyles.button} ${pageStyles.buttonGradient}`} type="submit">Add Artist</button>
      {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
    </form>

    <div id="top-artists">
      <h2>Lineup</h2>
      <button className={`${pageStyles.button} ${pageStyles.buttonGradient}`} onClick={handleSort}>Sort Lineup</button>
      <ul id='artists'>{artists.map(artist => <li key={artist.name}><div>{artist.name} - <small><strong>S:</strong> {artist.spotifyFollowers} - <strong>IG:</strong> {artist.instagramFollowers}</small></div></li>)}</ul>
    </div>
    </article>

    </>
  );
}
