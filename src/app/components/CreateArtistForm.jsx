'use client';

import pageStyles from '../page.module.css';
import styles from './createartistform.module.css';
import { useState } from 'react';

export default function CreateArtistForm({ token }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [instagram, setInstagram] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spotifyWeight, setSpotifyWeight] = useState(50);
  const instagramWeight = 100 - spotifyWeight;
  const IG_ACCOUNT_ID = process.env.NEXT_PUBLIC_FB_IG_ACCOUNT_ID;
  const IG_ACCESS_TOKEN = process.env.NEXT_PUBLIC_IG_ACCESS_TOKEN;

  const formatFollowers = (value) => {
    if (typeof value !== 'number') {
      return '0';
    }

    return new Intl.NumberFormat('en-US').format(value);
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
    const res = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}?fields=business_discovery.username(${instagram})%7Bfollowers_count%2Cmedia_count%2Cname%2Cusername%7D&access_token=${IG_ACCESS_TOKEN}`);
    const data = await res.json();
    console.log(data)
    return data.business_discovery.followers_count;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (artists.some(artist => artist.name.toLowerCase() === name.toLowerCase())) {
        setError('This artist is already in your list.');
        return;
      }

      setLoading(true);
      const [spotifyFollowers, instagramFollowers] = await Promise.all([
        getSpotifyFollowers(),
        getInstagramFollowers(),
      ]);

      let artistObj = {
        name: name,
        spotifyFollowers: spotifyFollowers,
        instagramHandle: instagram,
        instagramFollowers: instagramFollowers,
        locked: false,
      }

      console.log(artistObj);
      setArtists([...artists, artistObj]);
      setName('');
      setInstagram('');
    } catch (err) {
      console.error("Error fetching data: ", err);
      setError(err.message || 'Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const sortedArtists = sortArtists(artists);
    setArtists(sortedArtists);
  }

  const toggleLock = (artistName) => {
    setArtists(artists.map(a => a.name === artistName ? { ...a, locked: !a.locked } : a));
  }

  const sortArtists = (artists) => {
    const sw = spotifyWeight / 100;
    const iw = instagramWeight / 100;
    const locked = artists.filter(a => a.locked);
    const unlocked = artists.filter(a => !a.locked).sort((a, b) => {
      const aWeightedFollowers = a.spotifyFollowers * sw + a.instagramFollowers * iw;
      const bWeightedFollowers = b.spotifyFollowers * sw + b.instagramFollowers * iw;
      return bWeightedFollowers - aWeightedFollowers;
    });
    return [...locked, ...unlocked];
  }

  const totalAudience = artists.reduce((total, artist) => {
    return total + artist.spotifyFollowers + artist.instagramFollowers;
  }, 0);

  return (
    <article className={styles.article}>
      <section className={styles.formPanel}>
        <div className={styles.panelHeader}>
          <p className={styles.kicker}>Artist workspace</p>
          <h2>Build the shortlist</h2>
          <p className={styles.panelText}>
            Search one artist at a time and combine Spotify followers with Instagram audience size.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Artist Name
            <input
              className={styles.input}
              type="text"
              placeholder="ex. Fred again.."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Instagram Handle
            <input
              className={styles.input}
              type="text"
              placeholder="without @"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </label>
          <button
            className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
            type="submit"
            disabled={!token || loading}
          >
            {loading ? 'Pulling audience data...' : 'Add artist'}
          </button>
          {!token && <p className={styles.helper}>Connect Spotify above before running artist searches.</p>}
          {error && <p className={styles.error}>{error}</p>}
        </form>

        <div className={styles.weightingSection}>
          <p className={styles.weightingLabel}>Signal weighting</p>
          <div className={styles.weightingSlider}>
            <div className={styles.weightingPlatform}>
              <span className={styles.platformName}>Spotify</span>
              <span className={styles.platformPct}>{spotifyWeight}%</span>
            </div>
            <input
              className={styles.slider}
              type="range"
              min="0"
              max="100"
              value={spotifyWeight}
              onChange={(e) => setSpotifyWeight(Number(e.target.value))}
            />
            <div className={styles.sliderTrackLabels}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div className={styles.weightingSlider}>
            <div className={styles.weightingPlatform}>
              <span className={styles.platformName}>Instagram</span>
              <span className={styles.platformPct}>{instagramWeight}%</span>
            </div>
            <input
              className={styles.slider}
              type="range"
              min="0"
              max="100"
              value={instagramWeight}
              onChange={(e) => setSpotifyWeight(100 - Number(e.target.value))}
            />
            <div className={styles.sliderTrackLabels}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.lineupPanel}>
        <div className={styles.lineupHeader}>
          <div>
            <p className={styles.kicker}>Live lineup</p>
            <h2>Ranking board</h2>
          </div>
          <button
            className={`${pageStyles.button} ${pageStyles.buttonSecondaryDark}`}
            onClick={handleSort}
            disabled={artists.length < 2}
          >
            Sort lineup
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span>Artists tracked</span>
            <strong>{artists.length}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Total audience touchpoints</span>
            <strong>{formatFollowers(totalAudience)}</strong>
          </div>
        </div>

        {artists.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No artists added yet.</p>
            <span>Your shortlist will appear here once you start comparing acts.</span>
          </div>
        ) : (
          <ul className={styles.artistList} id="artists">
            {artists.map((artist, index) => {
              const weightedFollowers = Math.round(artist.spotifyFollowers * (spotifyWeight / 100) + artist.instagramFollowers * (instagramWeight / 100));

              return (
                <li className={`${styles.artistCard}${artist.locked ? ` ${styles.artistCardLocked}` : ''}`} key={artist.name}>
                  <div className={styles.artistRank}>{String(index + 1).padStart(2, '0')}</div>
                  <div className={styles.artistInfo}>
                    <div className={styles.artistTitleRow}>
                      <h3>{artist.name}</h3>
                      <span className={styles.handle}>@{artist.instagramHandle}</span>
                      <button
                        className={`${styles.lockButton}${artist.locked ? ` ${styles.lockButtonActive}` : ''}`}
                        onClick={() => toggleLock(artist.name)}
                        aria-label={artist.locked ? 'Unlock artist' : 'Lock artist'}
                      >
                        {artist.locked ? 'Locked' : 'Lock'}
                      </button>
                    </div>
                    <div className={styles.metricRow}>
                      <span>Spotify {formatFollowers(artist.spotifyFollowers)}</span>
                      <span>Instagram {formatFollowers(artist.instagramFollowers)}</span>
                      <span>Weighted signal {formatFollowers(weightedFollowers)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </article>
  );
}
