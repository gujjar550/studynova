import { useState, useEffect } from 'react'
import { db } from './firebaseConfig'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'

const CLOUD_NAME = "judww3bl"
const UPLOAD_PRESET = "studynova_unsigned"

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function Subject({ isAdmin, subjectName, collectionName, search }) {
  const [view, setView] = useState('main')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [filesData, setFilesData] = useState([])
  const [bookName, setBookName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [favorites, setFavorites] = useState([])

  const mainTopics = ['Class 9', 'Class 10', '1st Year', '2nd Year']
  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']

  useEffect(() => {
    const saved = localStorage.getItem('studynova_favorites')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  function toggleFavorite(fileId) {
    let updated
    if (favorites.includes(fileId)) {
      updated = favorites.filter(function (id) { return id !== fileId })
    } else {
      updated = favorites.concat([fileId])
    }
    setFavorites(updated)
    localStorage.setItem('studynova_favorites', JSON.stringify(updated))
  }

  async function openTopic(topic) {
    setSelectedTopic(topic)
    setBookName('')
    setView('upload')
    loadFiles(topic)
  }

  async function loadFiles(topic) {
    setLoadingFiles(true)
    const q = query(collection(db, collectionName), where("topic", "==", topic))
    const snapshot = await getDocs(q)
    const files = snapshot.docs.map(function (d) {
      return Object.assign({ id: d.id }, d.data())
    })
    setFilesData(files)
    setLoadingFiles(false)
  }

  async function uploadOneFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/raw/upload', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()

    await addDoc(collection(db, collectionName), {
      topic: selectedTopic,
      book: bookName,
      fileName: file.name,
      url: data.secure_url,
      fileSize: file.size,
      createdAt: new Date().toISOString()
    })
  }

  async function handleUpload(e) {
    if (!bookName.trim()) {
      alert('Pehle book ka naam likhein')
      return
    }
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress('Uploading file ' + (i + 1) + ' of ' + files.length)
        await uploadOneFile(files[i])
      }
      loadFiles(selectedTopic)
      e.target.value = ''
    } catch (err) {
      alert('Upload mein error aayi: ' + err.message)
    }
    setUploading(false)
    setUploadProgress('')
  }

  async function handleDelete(fileId, fileName) {
    const confirmDelete = window.confirm('Kya aap is file ko delete karna chahte hain: ' + fileName)
    if (!confirmDelete) return
    try {
      await deleteDoc(doc(db, collectionName, fileId))
      loadFiles(selectedTopic)
    } catch (err) {
      alert('Delete mein error aayi: ' + err.message)
    }
  }

  function goBack() {
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
          {mainTopics.map(function (topic) {
            return (
              <div key={topic} onClick={function () { openTopic(topic) }} cl