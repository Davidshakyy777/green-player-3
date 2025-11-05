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
  const [audioLoaded, setAudioLoaded] = useState(false) // iPhone үшін жаңа state
  const audioRef = useRef(null)
  const fileInputRef = useRef(null)

  const togglePlay = () => {
    if (!audioRef.current || !hasAudio) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      // iPhone үшін: әуенді қайта жүктеп, ойнату
      if (audioRef.current.src) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch(error => {
            console.log('iPhone play error:', error)
            // iPhone үшін: қайта жүктеп, ойнату
            audioRef.current.load()
            setTimeout(() => {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.log('Retry failed:', e))
            }, 100)
          })
      }
    }
  }

  const handleFileUpload = (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'mp4']
    
    if (!allowedExtensions.includes(fileExtension)) return

    // Алдыңғы URL-ді тазарту
    if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
      URL.revokeObjectURL(audioRef.current.src)
    }

    const audioUrl = URL.createObjectURL(file)
    
    // Аудио элементін толық қайта баптау
    audioRef.current.src = audioUrl
    audioRef.current.volume = volume
    
    const fileName = file.name.replace(/\.[^/.]+$/, "")
    setTrackName(fileName)
    setHasAudio(true)
    setIsPlaying(false)
    setCurrentTime(0)
    setAudioLoaded(false)

    // iPhone үшін маңызды event-тер
    audioRef.current.onloadstart = () => {
      console.log('Audio load started')
    }

    audioRef.current.onloadeddata = () => {
      console.log('Audio data loaded')
      setAudioLoaded(true)
      setDuration(audioRef.current.duration)
    }

    audioRef.current.oncanplay = () => {
      console.log('Audio can play')
      setAudioLoaded(true)
    }

    audioRef.current.oncanplaythrough = () => {
      console.log('Audio can play through')
      setAudioLoaded(true)
    }

    audioRef.current.onerror = (e) => {
      console.error('Audio error:', audioRef.current.error)
      setHasAudio(false)
      setAudioLoaded(false)
    }

    // iPhone үшін: load() әдісі
    audioRef.current.load()

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

  // iPhone үшін: файл жүктелгеннен кейін ойнату батырмасы
  const handleiPhonePlay = () => {
    if (!audioRef.current || !hasAudio || !audioLoaded) return
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true)
      })
      .catch(error => {
        console.log('iPhone direct play error:', error)
        // Соңғы әдіс: currentTime өзгерту
        audioRef.current.currentTime = 0
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.log('Final attempt failed:', e))
      })
  }

  return (
    <div className={`app ${theme}-theme`}>
      <div className="player-fullscreen">
        
        <div className="header-fullscreen">
          <h1>🌿 Green Player</h1>
          <p style={{color: '#666', fontSize: '14px', marginTop: '5px'}}>
            {hasAudio ? `${trackName}` : ''}
          </p>
          {hasAudio && !isPlaying && (
            <p style={{color: '#888', fontSize: '12px', marginTop: '2px'}}>
              {audioLoaded ? 'Дабыс дайын' : 'Жүктелуде...'}
            </p>
          )}
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
          <h3>{hasAudio ? trackName : ''}</h3>
          <p>{hasAudio ? `${formatTime(currentTime)} / ${formatTime(duration)}` : ''}</p>
          
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
          
          {/* iPhone үшін арнайы ойнату батырмасы */}
          {hasAudio && audioLoaded && !isPlaying ? (
            <button 
              className="play-fullscreen" 
              onClick={handleiPhonePlay}
            >
              ▶️
            </button>
          ) : (
            <button 
              className="play-fullscreen" 
              onClick={togglePlay}
              disabled={!hasAudio}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          )}
          
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
          accept=".mp3,.wav,.ogg,.m4a,.aac,audio/*"
          style={{ display: 'none' }}
        />
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        playsInline // iPhone үшін маңызды
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration)
          setAudioLoaded(true)
        }}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  )
}

export default App