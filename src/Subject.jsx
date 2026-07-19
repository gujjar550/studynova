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
    if (view === 'upload' && selectedTo