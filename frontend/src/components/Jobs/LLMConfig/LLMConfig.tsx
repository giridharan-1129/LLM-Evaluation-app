import React, { useState } from 'react'
import styles from './LLMConfig.module.css'

export interface DualLLMConfiguration {
  modelA: {
    provider: 'openai' | 'deepseek' | 'anthropic'
    model: string
    temperature: number
    maxTokens: number
  }
  modelB: {
    provider: 'openai' | 'deepseek' | 'anthropic'
    model: string
    temperature: number
    maxTokens: number
  }
}

interface LLMConfigProps {
  onConfigChange?: (config: DualLLMConfiguration) => void
}

const LLMConfig: React.FC<LLMConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<DualLLMConfiguration>({
    modelA: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000
    },
    modelB: {
      provider: 'deepseek',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000
    }
  })

  const handleConfigChange = (modelKey: 'modelA' | 'modelB', field: string, value: any) => {
    const updated = {
      ...config,
      [modelKey]: {
        ...config[modelKey],
        [field]: value
      }
    }
    setConfig(updated)
    onConfigChange?.(updated)
  }

  const getModelOptions = (provider: string) => {
    switch (provider) {
      case 'openai':
        return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
      case 'deepseek':
        return ['deepseek-chat', 'deepseek-coder']
      case 'anthropic':
        return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
      default:
        return []
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.apiKeyWarning}>
        ℹ️ API keys are configured in <strong>Settings</strong> → <strong>API Keys</strong>
      </div>

      <div className={styles.modelsGrid}>
        {/* Model A */}
        <div className={styles.modelSection}>
          <h3>🤖 Model A (Primary)</h3>
          
          <div className={styles.formGroup}>
            <label>Provider</label>
            <select
              value={config.modelA.provider}
              onChange={(e) => {
                handleConfigChange('modelA', 'provider', e.target.value)
                handleConfigChange('modelA', 'model', getModelOptions(e.target.value)[0])
              }}
            >
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Model</label>
            <select
              value={config.modelA.model}
              onChange={(e) => handleConfigChange('modelA', 'model', e.target.value)}
            >
              {getModelOptions(config.modelA.provider).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Temperature: {config.modelA.temperature.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.modelA.temperature}
              onChange={(e) => handleConfigChange('modelA', 'temperature', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Max Tokens: {config.modelA.maxTokens}</label>
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              value={config.modelA.maxTokens}
              onChange={(e) => handleConfigChange('modelA', 'maxTokens', parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Model B */}
        <div className={styles.modelSection}>
          <h3>🤖 Model B (Comparison)</h3>
          
          <div className={styles.formGroup}>
            <label>Provider</label>
            <select
              value={config.modelB.provider}
              onChange={(e) => {
                handleConfigChange('modelB', 'provider', e.target.value)
                handleConfigChange('modelB', 'model', getModelOptions(e.target.value)[0])
              }}
            >
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Model</label>
            <select
              value={config.modelB.model}
              onChange={(e) => handleConfigChange('modelB', 'model', e.target.value)}
            >
              {getModelOptions(config.modelB.provider).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Temperature: {config.modelB.temperature.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.modelB.temperature}
              onChange={(e) => handleConfigChange('modelB', 'temperature', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Max Tokens: {config.modelB.maxTokens}</label>
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              value={config.modelB.maxTokens}
              onChange={(e) => handleConfigChange('modelB', 'maxTokens', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LLMConfig
