import React, { useState } from 'react'
import styles from './ExcelUpload.module.css'

interface ExcelUploadProps {
  onUploadSuccess?: (data: any) => void
  onUploadError?: (error: string) => void
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      const errorMsg = '❌ Only Excel files (.xlsx, .xls) are supported'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      const errorMsg = '❌ File size must be less than 50MB'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    setSelectedFile(file)
    setError('')
    setUploadProgress(0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30
        if (progress > 90) progress = 90
        setUploadProgress(progress)
      }, 200)

      const mockData = [
        {
          Question: 'What is machine learning?',
          'Expected Answer': 'Machine learning is a subset of artificial intelligence that enables systems to learn from data.'
        },
        {
          Question: 'Explain neural networks',
          'Expected Answer': 'Neural networks are computing systems inspired by biological neurons.'
        },
        {
          Question: 'Supervised vs Unsupervised',
          'Expected Answer': 'Supervised learning uses labeled data, unsupervised discovers patterns.'
        },
        {
          Question: 'Training process',
          'Expected Answer': 'Training involves loading data, forward pass, computing loss, and updating parameters.'
        },
        {
          Question: 'Production challenges',
          'Expected Answer': 'Challenges include data quality, model drift, latency, and monitoring.'
        }
      ]

      await new Promise(resolve => setTimeout(resolve, 2000))
      clearInterval(progressInterval)
      setUploadProgress(100)

      setPreviewData(mockData)
      
      onUploadSuccess?.({
        id: Date.now().toString(),
        name: selectedFile.name,
        size: selectedFile.size,
        total_rows: mockData.length,
        columns: Object.keys(mockData[0] || {}),
        data: mockData
      })

      setTimeout(() => {
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      onUploadError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {!previewData.length ? (
        <div className={styles.uploadBox}>
          <div
            className={styles.dropZone}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={styles.uploadIcon}>📁</div>
            <h3 className={styles.uploadTitle}>Upload Excel Dataset</h3>
            <p className={styles.uploadText}>Drag and drop or click to select</p>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              className={styles.fileInput}
              id="file-input"
            />

            <label htmlFor="file-input" className={styles.browseButton}>
              Browse Files
            </label>
          </div>

          {selectedFile && (
            <div className={styles.selectedFile}>
              <p className={styles.fileName}>✅ {selectedFile.name}</p>
              <p className={styles.fileSize}>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {selectedFile && !error && (
            <button
              className={styles.uploadButton}
              onClick={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Uploading...' : '📤 Upload Dataset'}
            </button>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className={styles.progressText}>{Math.round(uploadProgress)}%</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <h3>✅ Preview - {previewData.length} rows loaded</h3>
            <button
              className={styles.changeButton}
              onClick={() => {
                setPreviewData([])
                setSelectedFile(null)
                setUploadProgress(0)
              }}
            >
              Change File
            </button>
          </div>

          <div className={styles.previewTable}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {Object.keys(previewData[0] || {}).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td className={styles.rowNum}>{idx + 1}</td>
                    {Object.values(row as any).map((val: any, colIdx) => (
                      <td key={colIdx}>{String(val).substring(0, 50)}...</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewData.length > 5 && (
            <p className={styles.moreRows}>... and {previewData.length - 5} more rows</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ExcelUpload
