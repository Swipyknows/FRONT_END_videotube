import { useState, useRef, useEffect } from 'react';
import './CustomVideoPlayer.css';

export default function CustomVideoPlayer({ videoUrl, poster }) {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  // Skip time (+/- seconds)
  const skipTime = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(videoRef.current.currentTime + seconds, 0),
      duration
    );
  };

  // Handle Playback Rate change
  const handleSpeedChange = (e) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Handle Volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Handle Seek from progress bar click
  const handleSeek = (e) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Update Buffer status (clip-by-clip loading progress)
  const updateBuffer = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  };

  // Event Listeners on Video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateBuffer();
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onProgress = () => updateBuffer();

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('progress', onProgress);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('progress', onProgress);
    };
  }, []);

  // Keyboard Shortcuts (Space/K for Play/Pause, J/L for +/- 5s, F for Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-5);
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(5);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration, isMuted, volume]);

  // Format Time Helper (MM:SS or HH:MM:SS)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const pad = (num) => String(num).padStart(2, '0');
    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const playedPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="video-element"
        onClick={togglePlay}
        preload="metadata"
      />

      {isLoading && <div className="video-spinner"></div>}

      <div className="player-controls-overlay">
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="progress-bar-container"
          onClick={handleSeek}
        >
          <div
            className="buffered-bar"
            style={{ width: `${bufferedPercent}%` }}
          />
          <div
            className="played-bar"
            style={{ width: `${playedPercent}%` }}
          />
          <div
            className="scrubber-handle"
            style={{ left: `${playedPercent}%` }}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="controls-bottom-row">
          <div className="controls-left-group">
            {/* Play / Pause */}
            <button className="control-btn" onClick={togglePlay} title={isPlaying ? "Pause (Space/K)" : "Play (Space/K)"}>
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Skip -5s */}
            <button className="control-btn" onClick={() => skipTime(-5)} title="Rewind 5s (J / Left Arrow)">
              ⏪ 5s
            </button>

            {/* Skip +5s */}
            <button className="control-btn" onClick={() => skipTime(5)} title="Forward 5s (L / Right Arrow)">
              5s ⏩
            </button>

            {/* Volume Control */}
            <div className="volume-control-container">
              <button className="control-btn" onClick={toggleMute} title={isMuted ? "Unmute (M)" : "Mute (M)"}>
                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                title="Volume"
              />
            </div>

            {/* Time Display */}
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="controls-right-group">
            {/* Speed Selector */}
            <select
              value={playbackSpeed}
              onChange={handleSpeedChange}
              className="speed-selector-select"
              title="Playback Speed"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>

            {/* Fullscreen */}
            <button className="control-btn" onClick={toggleFullscreen} title="Toggle Fullscreen (F)">
              {isFullscreen ? '📉' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
