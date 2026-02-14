import React, { useState } from 'react';
import './SpotifySongs.css';

interface Song {
  id: string;
  spotifyId: string;
  note: string;
}

const SpotifySongs: React.FC = () => {
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);
  // Add your Spotify track IDs here
  const songs: Song[] = [
      {
      id: '1',
      spotifyId: '7c1KTn1z8Gw8ouYdcF4qaG?si=799b231b33734162', // Replace with your track ID
      note: "Reminds me of the first night, we hung out"
    },
      {
      id: '2',
      spotifyId: '6qqrTXSdwiJaq8SO0X2lSe?si=c6718d4091254227', // Replace with your track ID
      note: "I can't hear without just thinking of you and how you make me feel"
    },
    {
      id: '3',
      spotifyId: '3pBYIDSYwHpGMjq0nss6KZ?si=196dfb97447d4eed', // Replace with your track ID
      note: "Your always worth the wait"
    }
  
  ];

  // Optional: Your playlist ID
const playlistId = '5m1dvixQjBNwlw5PHye9I7';

  return (
    <div className="spotify-container">
      <div className="spotify-header">
        <div className="spotify-icon">♫</div>
        <h2 className="spotify-title">Songs That Make Me Think of You</h2>
        <p className="spotify-subtitle">Every melody reminds me of us</p>
      </div>

      <div className="songs-list">
        {songs.map((song) => (
          <div
            key={song.id}
            className={`song-card ${hoveredSong === song.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredSong(song.id)}
            onMouseLeave={() => setHoveredSong(null)}
          >
            <iframe
              src={`https://open.spotify.com/embed/track/${song.spotifyId}?theme=0`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="encrypted-media"
              title={`Song ${song.id}`}
            />
            <p className="song-note">{song.note}</p>
          </div>
        ))}
      </div>

      {playlistId && (
        <div className="playlist-section">
          <h3 className="playlist-heading">Our Playlist</h3>
          <div className="playlist-embed">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${playlistId}?theme=0`}
              width="100%"
              height="380"
              frameBorder="0"
              allow="encrypted-media"
              title="Our Playlist"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifySongs;