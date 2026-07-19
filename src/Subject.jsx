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

  const toggleFavorite = (fileId) => {
    let updated
    if (favorites.includes(fileId)) {
      updated = favorites.filter(id => id !== fileId)
    } else {
      updated = [...favorites, fileId]
    }
    setFavorites(updated)
    localStorage.setItem('studynova_favorites', JSON.stringify(updated))
  }

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
    const files = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    setFilesData(files)
    setLoadingFiles(false)
  }

  const uploadOneFile = async (file) => {
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
      fileSize: file.size,
      createdAt: new Date().toISOString()
    })
  }

  const handleUpload = async (e) => {
    if (!bookName.trim()) {
      alert('Pehle book ka naam likhein')
      return
    }
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProg