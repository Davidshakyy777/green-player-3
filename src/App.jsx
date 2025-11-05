import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [theme, setTheme] = useState('green')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasAudio, setHasAudio] = useState(false)
  const [volume, setVolume] = useState(1) // Дыбыс үшін жаңа state
  const [trackName, setTrackName] = useState('') // Ән аты үшін жаңа state
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
          alert('Ән ойнату сәтсіз аяқталды')
        })
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Жақсартылған файл түрін тексеру
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/*']
      if (!allowedTypes.some(type => file.type.includes(type.replace('audio/', '')))) {
        alert('Тек аудио файлдарын жүктеңіз! (MP3, WAV, OGG)')
        return
      }

      const audioUrl = URL.createObjectURL(file)
      audioRef.current.src = audioUrl
      
      setIsPlaying(false)
      setCurrentTime(0)
      setHasAudio(true)
      
      // Файл атын сақтау (кеңейтімсіз)
      const fileName = file.name.replace(/\.[^/.]+$/, "")
      setTrackName(fileName)
      
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration)
      }

      audioRef.current.onerror = () => {
        alert('Аудио файлын жүктеу сәтсіз аяқталды')
        setHasAudio(false)
      }
    }
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

  // Жаңа: Дыбыс баптау функциясы
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const loadDemoAudio = () => {
    const demoAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    audioRef.current.src = demoAudioUrl
    setHasAudio(true)
    setTrackName('Демо ән - SoundHelix')
    
    audioRef.current.onloadedmetadata = () => {
      setDuration(audioRef.current.duration)
    }
  }

  return (
    <div className={`app ${theme}-theme`}>
      {/* PLAYER - БҮКІЛ ЭКРАН, БІРАҚ ЭЛЕМЕНТТЕР ОРНАЛАСҚАН */}
      <div className="player-fullscreen">
        
        {/* HEADER - ЖОҒАРЫ ОРТАДА */}
        <div className="header-fullscreen">
          <h1>🌿 Green Player</h1>
          <button 
            onClick={loadDemoAudio}
            className="demo-btn"
          >
            🎵 Демо әнді жүктеу
          </button>
        </div>

        {/* TURNTABLE - ОРТАДА */}
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

        {/* TRACK INFO - TURNTABLE АСТЫНДА */}
        <div className="track-info-fullscreen">
          {/* Өзгертілген: Ән атын көрсету */}
          <h3>{hasAudio ? (trackName || 'Forest Sounds') : 'Ән жүктелмеген'}</h3>
          <p>{hasAudio ? 'Nature Meditation' : 'Файл жүктеңіз'}</p>
          
          {/* ЖАҢА: Дыбыс баптау */}
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

        {/* CONTROLS - ТӨМЕНГІ БӨЛІКТЕ */}
        <div className="controls-fullscreen">
          <button onClick={() => fileInputRef.current.click()}>📁</button>
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

        {/* THEME BUTTONS - ОҢ ЖАҚ ЖОҒАРЫДА */}
        <div className="theme-buttons-fullscreen">
          <button onClick={() => setTheme('green')}>🌿 Green</button>
          <button onClick={() => setTheme('purple')}>💜 Purple</button>
          <button onClick={() => setTheme('neon')}>🌈 Neon</button>
        </div>

        {/* FILE UPLOAD (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}

export default App