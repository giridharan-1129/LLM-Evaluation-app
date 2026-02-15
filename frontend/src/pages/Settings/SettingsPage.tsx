import React, { useState, useEffect } from 'react'
import styles from './Settings.module.css'

interface APIKeys {
  openai: string
  deepseek: string
  anthropic: string
}

const SettingsPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openai: '',
    deepseek: '',
    anthropic: ''
  })
  const [showKeys, setShowKeys] = useState({
    openai: false,
    deepseek: false,
    anthropic: false
  })
  const [saved, setSaved] = useState(false)

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('llm_api_keys')
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys))
      } catch (e) {
        console.log('Error loading API keys')
      }
    }
  }, [])

  const handleKeyChange = (provider: keyof APIKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }))
    setSaved(false)
  }

  const handleSaveKeys = () => {
    localStorage.setItem('llm_api_keys', JSON.stringify(apiKeys))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const toggleKeyVisibility = (provider: keyof APIKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const getKeyStatus = (key: string) => {
    if (!key) return { status: 'empty', color: '#999' }
    if (key.length < 10) return { status: 'invalid', color: '#ff6b6b' }
    return { status: 'configured', color: '#28a745' }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔑 API Keys Configuration</h1>
        <p>Manage your LLM provider API keys securely</p>
      </div>

      {saved && (
        <div className={styles.successMessage}>
          ✅ API keys saved successfully!
        </div>
      )}

      <div className={styles.content}>
        {/* OpenAI Section */}
        <div className={styles.keySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionInfo}>
              <h2>🤖 OpenAI</h2>
              <p>For GPT-4, GPT-4 Turbo, GPT-3.5 Turbo models</p>
            </div>
            <span className={styles.statusBadge} style={{ color: getKeyStatus(apiKeys.openai).color }}>
              {getKeyStatus(apiKeys.openai).status}
            </span>
          </div>

          <div className={styles.keyInputGroup}>
            <label htmlFor="openai-key">API Key</label>
            <div className={styles.inputWrapper}>
              <input
                id="openai-key"
                type={showKeys.openai ? 'text' : 'password'}
                value={apiKeys.openai}
                onChange={(e) => handleKeyChange('openai', e.target.value)}
                placeholder="sk-..."
                className={styles.input}
              />
              <button
                className={styles.toggleBtn}
                onClick={() => toggleKeyVisibility('openai')}
                title={showKeys.openai ? 'Hide' : 'Show'}
              >
                {showKeys.openai ? '🙈' : '👁️'}
              </button>
            </div>
            <p className={styles.hint}>
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a>
            </p>
          </div>
        </div>

        {/* DeepSeek Section */}
        <div className={styles.keySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionInfo}>
              <h2>🚀 DeepSeek</h2>
              <p>For DeepSeek Chat and Code models</p>
            </div>
            <span className={styles.statusBadge} style={{ color: getKeyStatus(apiKeys.deepseek).color }}>
              {getKeyStatus(apiKeys.deepseek).status}
            </span>
          </div>

          <div className={styles.keyInputGroup}>
            <label htmlFor="deepseek-key">API Key</label>
            <div className={styles.inputWrapper}>
              <input
                id="deepseek-key"
                type={showKeys.deepseek ? 'text' : 'password'}
                value={apiKeys.deepseek}
                onChange={(e) => handleKeyChange('deepseek', e.target.value)}
                placeholder="sk-..."
                className={styles.input}
              />
              <button
                className={styles.toggleBtn}
                onClick={() => toggleKeyVisibility('deepseek')}
                title={showKeys.deepseek ? 'Hide' : 'Show'}
              >
                {showKeys.deepseek ? '🙈' : '👁️'}
              </button>
            </div>
            <p className={styles.hint}>
              Get your API key from <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer">DeepSeek Platform</a>
            </p>
          </div>
        </div>

        {/* Anthropic Section */}
        <div className={styles.keySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionInfo}>
              <h2>🤖 Anthropic (Claude)</h2>
              <p>For Claude 3 Opus, Sonnet, Haiku models</p>
            </div>
            <span className={styles.statusBadge} style={{ color: getKeyStatus(apiKeys.anthropic).color }}>
              {getKeyStatus(apiKeys.anthropic).status}
            </span>
          </div>

          <div className={styles.keyInputGroup}>
            <label htmlFor="anthropic-key">API Key</label>
            <div className={styles.inputWrapper}>
              <input
                id="anthropic-key"
                type={showKeys.anthropic ? 'text' : 'password'}
                value={apiKeys.anthropic}
                onChange={(e) => handleKeyChange('anthropic', e.target.value)}
                placeholder="sk-ant-..."
                className={styles.input}
              />
              <button
                className={styles.toggleBtn}
                onClick={() => toggleKeyVisibility('anthropic')}
                title={showKeys.anthropic ? 'Hide' : 'Show'}
              >
                {showKeys.anthropic ? '🙈' : '👁️'}
              </button>
            </div>
            <p className={styles.hint}>
              Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">Anthropic Console</a>
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className={styles.footer}>
        <button className={styles.saveBtn} onClick={handleSaveKeys}>
          💾 Save All API Keys
        </button>
        <p className={styles.securityNote}>
          🔒 Your API keys are stored securely in your browser's local storage and never sent to our servers.
        </p>
      </div>

      {/* Usage Info */}
      <div className={styles.infoSection}>
        <h3>📌 How to use</h3>
        <ol className={styles.infoList}>
          <li>Save your API keys here</li>
          <li>Keys will be automatically used when you evaluate in Playground</li>
          <li>You can change keys anytime and re-evaluate</li>
          <li>Each evaluation will use the latest saved keys</li>
        </ol>
      </div>
    </div>
  )
}

export default SettingsPage
