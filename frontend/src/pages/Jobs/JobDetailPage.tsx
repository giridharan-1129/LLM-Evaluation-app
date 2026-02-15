import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchJobById } from '../../store/thunks'

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const dispatch = useAppDispatch()
  const { selectedJob, isLoading, error } = useAppSelector(state => state.job)

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId))
    }
  }, [jobId, dispatch])

  if (isLoading) return <div style={{ padding: '20px' }}>⏳ Loading job details...</div>
  if (error) return <div style={{ padding: '20px', color: 'red' }}>❌ Error: {error}</div>
  if (!selectedJob) return <div style={{ padding: '20px' }}>Job not found</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>📋 Job Details</h1>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '15px' }}>
        <p><strong>Name:</strong> {selectedJob.name}</p>
        <p><strong>ID:</strong> {selectedJob.id}</p>
        <p><strong>Status:</strong> {selectedJob.status}</p>
        <p><strong>Progress:</strong> {selectedJob.progress}%</p>
        <p><strong>Total Entries:</strong> {selectedJob.total_entries}</p>
        <p><strong>Completed:</strong> {selectedJob.completed_entries}</p>
        
        <p><strong>Created:</strong> {new Date(selectedJob.created_at).toLocaleString()}</p>
      </div>
    </div>
  )
}

export default JobDetailPage
