import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [theme, setTheme] = useState('green')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasAudio, setHasAudio] = useState(false)
  const [volume, setVolume] = useState(1)
  const [trackName, setTrackName] = useState('')
  const audioRef = useRef(null)
  const fileInputRef = useRef(null)

  const togglePlay = () => {
    if (!audioRef.current || !hasAudio) {
      alert('Алдымен ән жүктеңіз!')
      return
    }
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(error => {
          console.log('Play error:', error)
          alert('Ән ойнату сәтсіз аяқталды: ' + error.message)
        })
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Файл түрін тексеру
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac']
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Тек аудио файлдарын жүктеңіз! (MP3, WAV, OGG, M4A, AAC)')
      return
    }

    // Алдыңғы аудио URL-ді тазарту
    if (audioRef.current.src) {
      URL.revokeObjectURL(audioRef.current.src)
    }

    const audioUrl = URL.createObjectURL(file)
    
    // Аудио элементін дайындау
    audioRef.current.src = audioUrl
    audioRef.current.volume = volume
    audioRef.current.load() // iPhone үшін маңызды

    const fileName = file.name.replace(/\.[^/.]+$/, "")
    setTrackName(fileName)
    setHasAudio(true)
    setIsPlaying(false)
    setCurrentTime(0)

    // Аудио дайын болғанда
    audioRef.current.onloadedmetadata = () => {
      console.log('Audio loaded, duration:', audioRef.current.duration)
      setDuration(audioRef.current.duration)
      
      // iPhone үшін: қолмен басу керек
      console.log('Audio ready for playback')
    }

    audioRef.current.oncanplaythrough = () => {
      console.log('Audio can play through')
    }

    audioRef.current.onerror = (e) => {
      console.error('Audio error:', e)
      alert('Аудио файлын жүктеу сәтсіз аяқталды')
      setHasAudio(false)
    }

    // Input-ты тазарту (бірнеше файл жүктеу үшін)
    event.target.value = ''
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current && hasAudio) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  return (
    <div className={`app ${theme}-theme`}>
      <div className="player-fullscreen">
        
        <div className="header-fullscreen">
          <h1>🌿 Green Player</h1>
        </div>

        <div className="turntable-container">
          <div className="turntable-fullscreen">
            <div className={`vinyl-fullscreen ${isPlaying ? 'spin' : ''}`}>
              <div className="vinyl-center-hole-fullscreen"></div>
              <div className={`vinyl-light-fullscreen ${isPlaying ? 'active' : ''}`}></div>
            </div>

            <div className="record-fullscreen">
              <img src="https://i.imgur.com/hqF5n0f.jpeg" alt="Album" className="album-cover-fullscreen" />
            </div>

            <div className={`tonearm-fullscreen ${isPlaying ? 'active' : ''}`}>
              <div className="tonearm-base-fullscreen"></div>
              <div className="tonearm-body-fullscreen"></div>
              <div className="tonearm-head-fullscreen"></div>
            </div>
          </div>
        </div>

        <div className="track-info-fullscreen">
          <h3>{hasAudio ? (trackName || 'Жүктелген ән') : 'Ән жүктелмеген'}</h3>
          <p>{hasAudio ? 'Аудио файлы' : 'Файл жүктеңіз'}</p>
          
          <div className="volume-control">
            <span>🔊</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!hasAudio}
            />
          </div>

          <div className="progress-fullscreen">
            <span>{formatTime(currentTime)}</span>
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              value={currentTime}
              onChange={handleSeek}
              disabled={!hasAudio}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="controls-fullscreen">
          <button onClick={() => fileInputRef.current?.click()}>📁</button>
          <button disabled={!hasAudio}>⏮️</button>
          <button 
            className="play-fullscreen" 
            onClick={togglePlay}
            disabled={!hasAudio}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button disabled={!hasAudio}>⏭️</button>
          <button disabled={!hasAudio}>📜</button>
        </div>

        <div className="theme-buttons-fullscreen">
          <button onClick={() => setTheme('green')}>🌿 Green</button>
          <button onClick={() => setTheme('purple')}>💜 Purple</button>
          <button onClick={() => setTheme('neon')}>🌈 Neon</button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".mp3,.wav,.ogg,.m4a,.aac"
          style={{ display: 'none' }}
        />
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  )
}

export default App