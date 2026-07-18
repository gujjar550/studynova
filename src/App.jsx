import { useState } from 'react'
import './App.css'
import Math from './Math'

function App() {
  const [page, setPage] = useState('home')

  if (page === 'math') {
    return (
      <div className="app">
        <header className="navbar">
          <h1 className="logo" onClick={() => setPage('home')} style={{cursor: 'pointer'}}>📚 StudyNova</h1>
        </header>
        <Math />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="navbar">
        <h1 className="logo">📚 StudyNova</h1>
        <input type="text" placeholder="Search notes..." className="search-bar" />
      </header>

      <section className="hero">
        <h2>Welcome to StudyNova</h2>
        <p>Free study notes for every subject, all in one place.</p>
      </section>

      <section className="categories">
        <div className="card" onClick={() => setPage('math')}>Math</div>
        <div className="card">Physics</div>
        <div className="card">Computer Science</div>
        <div className="card">Chemistry</div>
      </section>

      <footer className="footer">
        <p>© 2026 StudyNova. Made for students.</p>
      </footer>
    </div>
  )
}

export default App