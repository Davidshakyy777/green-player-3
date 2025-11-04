import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [theme, setTheme] = useState('green')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasAudio, setHasAudio] = useState(false)
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
      if (!file.type.startsWith('audio/')) {
        alert('Тек аудио файлдарын жүктеңіз!')
        return
      }

      const audioUrl = URL.createObjectURL(file)
      audioRef.current.src = audioUrl
      
      setIsPlaying(false)
      setCurrentTime(0)
      setHasAudio(true)
      
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

  const loadDemoAudio = () => {
    const demoAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    audioRef.current.src = demoAudioUrl
    setHasAudio(true)
    
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
          <h3>{hasAudio ? 'Forest Sounds' : 'Ән жүктелмеген'}</h3>
          <p>{hasAudio ? 'Nature Meditation' : 'Файл жүктеңіз'}</p>
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