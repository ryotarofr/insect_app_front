import { useState } from 'react'
import './App.css'
import ExcalidrawDemo from './components/ExcalidrawDemo'

function App() {
  const [showExcalidraw, setShowExcalidraw] = useState(false)

  return (
    <>
      {!showExcalidraw ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Excalidraw Demo</h1>
          <p>Click the button below to launch the Excalidraw drawing canvas</p>
          <button
            onClick={() => setShowExcalidraw(true)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#5856d6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Launch Excalidraw
          </button>
        </div>
      ) : (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <button
            onClick={() => setShowExcalidraw(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '8px 16px',
              backgroundColor: '#ff3b30',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              zIndex: 1000,
            }}
          >
            Close
          </button>
          <ExcalidrawDemo />
        </div>
      )}
    </>
  )
}

export default App
