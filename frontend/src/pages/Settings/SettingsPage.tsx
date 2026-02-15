import React, { useState } from 'react'
import { useAppSelector } from '../../store/hooks'

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const [apiKey, setApiKey] = useState('')

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>⚙️ Settings</h1>

      <div style={{ marginTop: '30px' }}>
        <h2>Account Settings</h2>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '15px' }}>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>API Configuration</h2>
        <div style={{ marginTop: '15px' }}>
          <label htmlFor="apikey" style={{ display: 'block', marginBottom: '10px' }}>
            <strong>OpenAI API Key:</strong>
          </label>
          <input
            id="apikey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Your API key is stored securely and never shared.
          </p>
          <button
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Settings
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>About</h2>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '15px' }}>
          <p><strong>LLM Evaluation Platform</strong></p>
          <p>Version 1.0.0</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Evaluate and compare LLM outputs at scale.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
