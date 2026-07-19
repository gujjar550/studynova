import { useState } from 'react'
import { db } from './firebaseConfig'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

const CLOUD_NAME = "judww3bl"
const UPLOAD_PRESET = "studynova_unsigned"

function Subject({ isAdmin, subjectName, collectionName, search }) {
  const [view, setView] = useState('main')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [filesData, setFilesData] = useState([])
  const [bookName, setBookName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)

  const mainTopics = ['Class 9', 'Class 10', '1st Year', '2nd Year']
  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']

  const openTopic = async (topic) => {
    setSelectedTopic(topic)
    setBookName('')
    setView('upload')
    loadFiles(topic)
  }

  const loadFiles = async (topic) => {
    setLoadingFiles(true)
    const q = query(collection(db, collectionName), where("topic", "==", topic))
    const snapshot = await getDocs(q)
    const files = snapshot.docs.map(doc => doc.data())
    setFilesData(files)
    setLoadingFiles(false)
  }

  const handleUpload = async (e) => {
    if (!bookName.trim()) {
      alert('Pehle book ka naam likhein')
      return
    }
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      await addDoc(collection(db, collectionName), {
        topic: selectedTopic,
        book: bookName,
        fileName: file.name,
        url: data.secure_url,
        createdAt: new Date().toISOString()
      })

      loadFiles(selectedTopic)
      e.target.value = ''
    } catch (err) {
      alert('Upload mein error aayi: ' + err.message)
    }
    setUploading(false)
  }

  const goBack = () => {
    if (view === 'upload' && selectedTopic.startsWith('Semester')) {
      setView('bsSemesters')
    } else {
      setView('main')
    }
  }

  if (view === 'main') {
    return (
      <div style={{ padding: '40px' }}>
        <h2>{subjectName}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
          {mainTopics.map((topic) => (
            <div key={topic} onClick={() => openTopic(topic)} className="card">
              {topic}
            </div>
          ))}
          <div onClick={() => setView('bsSemesters')} className="card">
            BS {subjectName}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'bsSemesters') {
    return (
      <div style={{ padding: '40px' }}>
        <button onClick={() => setView('main')} style={{ marginBottom: '20px' }}>← Back</button>
        <h2>BS {subjectName} - Select Semester</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
          {semesters.map((sem) => (
            <div key={sem} onClick={() => openTopic(sem)} className="card">
              {sem}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'upload' && selectedTopic) {
    const filteredFiles = filesData.filter(entry => {
      if (!search || !search.trim()) return true
      const term = search.toLowerCase()
      return entry.book.toLowerCase().includes(term) || entry.fileName.toLowerCase().includes(term)
    })

    const grouped = {}
    filteredFiles.forEach(entry => {
      if (!grouped[entry.book]) grouped[entry.book] = []
      grouped[entry.book].push(entry)
    })

    return (
      <div style={{ padding: '40px' }}>
        <button onClick={goBack} style={{ marginBottom: '20px' }}>← Back</button>
        <h2>{selectedTopic} - {subjectName} Notes</h2>

        {isAdmin && (
          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Book ka naam likhein"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              style={{ padding: '8px', width: '300px', marginRight: '10px' }}
            />
            <input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} />
            {uploading && <p style={{ color: '#2b59c3' }}>Upload ho rahi hai, ruk jaiye...</p>}
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          {loadingFiles && (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '4px solid #d7dce5',
                borderTop: '4px solid #2b59c3',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading...</p>
            </div>
          )}

          {!loadingFiles && Object.keys(grouped).length === 0 && (
            <p>{search && search.trim() ? 'Koi PDF is naam se nahi mili.' : 'Abhi koi PDF upload nahi hui.'}</p>
          )}

          {!loadingFiles && Object.keys(grouped).map((book) => (
            <div key={book} style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2b59c3' }}>{book}</h3>
              <ul>
                {grouped[book].map((entry, idx) => (
                  <li key={idx}>
                    <a href={entry.url} target="_blank" rel="noopener noreferrer">
                      {entry.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default Subject