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
    
    console.log('Toggle play, current state:', isPlaying)
    console.log('Audio src:', audioRef.current.src)
    console.log('Audio readyState:', audioRef.current.readyState)

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      // Аудионы қайта жүктеу iPhone үшін
      audioRef.current.load()
      
      audioRef.current.play()
        .then(() => {
          console.log('Play success')
          setIsPlaying(true)
        })
        .catch(error => {
          console.log('Play error:', error)
          // iPhone үшін: user gesture керек
          alert('Ән ойнату сәтсіз. Бір рет басып, қайта басып көріңіз.')
        })
    }
  }

  const handleFileUpload = (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Бірінші файлды алу
    const file = files[0]

    // Файл түрін тексеру
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'mp4']
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Тек аудио файлдарын жүктеңіз! (MP3, WAV, OGG, M4A, AAC)')
      return
    }

    console.log('File selected:', file.name, 'Size:', file.size)

    // Алдыңғы аудио URL-ді тазарту
    if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
      URL.revokeObjectURL(audioRef.current.src)
    }

    const audioUrl = URL.createObjectURL(file)
    console.log('Audio URL created:', audioUrl)

    // Аудио элементін дайындау
    audioRef.current.src = audioUrl
    audioRef.current.volume = volume
    
    // iPhone үшін маңызды: load() әдісі
    audioRef.current.load()

    const fileName = file.name.replace(/\.[^/.]+$/, "")
    setTrackName(fileName)
    setHasAudio(true)
    setIsPlaying(false)
    setCurrentTime(0)

    // Аудио дайын болғанда
    audioRef.current.onloadeddata = () => {
      console.log('Audio loaded data, duration:', audioRef.current.duration)
      setDuration(audioRef.current.duration)
    }

    audioRef.current.oncanplay = () => {
      console.log('Audio can play now')
    }

    audioRef.current.oncanplaythrough = () => {
      console.log('Audio can play through without stopping')
    }

    audioRef.current.onerror = (e) => {
      console.error('Audio error:', audioRef.current.error)
      alert('Аудио файлын жүктеу сәтсіз аяқталды: ' + audioRef.current.error?.message)
      setHasAudio(false)
    }

    // Бірнеше файл жүктеу үшін input-ты тазарту
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

  // iPhone үшін: бірінші рет басқанда ойнату
  const handleFirstPlay = () => {
    if (!hasAudio) {
      alert('Алдымен ән жүктеңіз!')
      return
    }
    
    // Аудионы қайта жүктеу
    audioRef.current.load()
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true)
      })
      .catch(error => {
        console.log('First play error:', error)
        alert('Бірінші рет ойнату сәтсіз. Қайта басып көріңіз.')
      })
  }

  return (
    <div className={`app ${theme}-theme`}>
      <div className="player-fullscreen">
        
        <div className="header-fullscreen">
          <h1>🌿 Green Player</h1>
          <p style={{color: '#666', fontSize: '14px', marginTop: '5px'}}>
            {hasAudio ? `Жүктелген: ${trackName}` : 'Файл жүктеңіз'}
          </p>
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
          <h3>{hasAudio ? trackName : 'Ән жүктелмеген'}</h3>
          <p>{hasAudio ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'Файл жүктеңіз'}</p>
          
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
          {/* БІРНЕШЕ ФАЙЛ ЖҮКТЕУ ҮШІН multiple АТРИБУТЫ */}
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

        {/* BIRNEŞE FAYL JÜKTEU ÜŞIN multiple QOSYLĞAN */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".mp3,.wav,.ogg,.m4a,.aac,audio/*"
          multiple={false} // Бір уақытта бір файл ғана
          style={{ display: 'none' }}
        />
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={(e) => {
          setCurrentTime(e.target.currentTime)
        }}
        onLoadedMetadata={(e) => {
          console.log('Metadata loaded, duration:', e.target.duration)
          setDuration(e.target.duration)
        }}
        onEnded={() => {
          console.log('Audio ended')
          setIsPlaying(false)
        }}
        onPlay={() => {
          console.log('Audio play event')
          setIsPlaying(true)
        }}
        onPause={() => {
          console.log('Audio pause event')
          setIsPlaying(false)
        }}
      />
    </div>
  )
}

export default App