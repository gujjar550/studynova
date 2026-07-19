import { useState, useEffect } from 'react'
import './App.css'
import Subject from './Subject'

function App() {
  const [page, setPage] = useState('home')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('studynova_admin')
    if (saved === 'true') setIsAdmin(true)
    const savedTheme = localStorage.getItem('studynova_theme')
    if (savedTheme === 'dark') setDarkMode(true)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('studynova_theme', newMode ? 'dark' : 'light')
  }

  const handleLogin = () => {
    if (passwordInput === 'gujjar10#') {
      setIsAdmin(true)
      localStorage.setItem('studynova_admin', 'true')
      setShowLogin(false)
      setPasswordInput('')
      alert('Admin login successful!')
    } else {
      alert('Galat password!')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('studynova_admin')
  }

  const subjectPages = {
    math: { name: 'Math', collection: 'mathNotes' },
    physics: { name: 'Physics', collection: 'physicsNotes' },
    cs: { name: 'Computer Science', collection: 'csNotes' },
    chemistry: { name: 'Chemistry', collection: 'chemistryNotes' }
  }

  if (subjectPages[page]) {
    const subj = subjectPages[page]
    return (
      <div className={darkMode ? 'app dark' : 'app'}>
        <header className="navbar">
          <h1 className="logo" onClick={() => setPage('home')} style={{cursor: 'pointer'}}>📚 StudyNova</h1>
          <input
            type="text"
            placeholder="Search in this subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
          <button onClick={toggleDarkMode}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          {isAdmin && <button onClick={handleLogout}>Logout Admin</button>}
        </header>
        <Subject isAdmin={isAdmin} subjectName={subj.name} collectionName={subj.collection} search={search} setSearch={setSearch} />
      </div>
    )
  }

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <header className="navbar">
        <h1 className="logo">📚 StudyNova</h1>
        <button onClick={toggleDarkMode}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
        {isAdmin ? (
          <button onClick={handleLogout}>Logout Admin</button>
        ) : (
          <button onClick={() => setShowLogin(true)}>Admin Login</button>
        )}
      </header>

      {showLogin && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <input
            type="password"
            placeholder="Admin password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setShowLogin(false)} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      )}

      <section className="hero">
        <h2>Welcome to StudyNova</h2>
        <p>Free study notes for every subject, all in one place.</p>
      </section>

      <section className="categories">
        <div className="card" onClick={() => setPage('math')}>Math</div>
        <div className="card" onClick={() => setPage('physics')}>Physics</div>
        <div className="card" onClick={() => setPage('cs')}>Computer Science</div>
        <div className="card" onClick={() => setPage('chemistry')}>Chemistry</div>
      </section>

      <footer className="footer">
        <p>© 2026 StudyNova. Made for students.</p>
      </footer>
    </div>
  )
}

export default App