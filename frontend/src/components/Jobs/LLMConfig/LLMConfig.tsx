import React, { useState } from 'react'
import styles from './LLMConfig.module.css'

interface LLMConfigProps {
  onConfigChange?: (config: DualLLMConfiguration) => void
}

export interface LLMConfiguration {
  provider: 'openai' | 'deepseek' | 'anthropic'
  model: string
  apiKey: string
  temperature: number
  maxTokens: number
}

export interface DualLLMConfiguration {
  modelA: LLMConfiguration
  modelB: LLMConfiguration
}

/**
 * Dual LLM Configuration Component
 * Allows users to select and configure TWO LLM models for comparison
 */
const LLMConfig: React.FC<LLMConfigProps> = ({ onConfigChange }) => {
  const [dualConfig, setDualConfig] = useState<DualLLMConfiguration>({
    modelA: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: localStorage.getItem('openai_api_key') || '',
      temperature: 0.7,
      maxTokens: 2000,
    },
    modelB: {
      provider: 'deepseek',
      model: 'deepseek-chat',
      apiKey: localStorage.getItem('deepseek_api_key') || '',
      temperature: 0.7,
      maxTokens: 2000,
    }
  })

  const handleChangeA = (field: keyof LLMConfiguration, value: any) => {
    const updated = {
      ...dualConfig,
      modelA: { ...dualConfig.modelA, [field]: value }
    }
    setDualConfig(updated)
    
    if (field === 'apiKey') {
      localStorage.setItem(`${dualConfig.modelA.provider}_api_key`, value)
    }
    
    onConfigChange?.(updated)
  }

  const handleChangeB = (field: keyof LLMConfiguration, value: any) => {
    const updated = {
      ...dualConfig,
      modelB: { ...dualConfig.modelB, [field]: value }
    }
    setDualConfig(updated)
    
    if (field === 'apiKey') {
      localStorage.setItem(`${dualConfig.modelB.provider}_api_key`, value)
    }
    
    onConfigChange?.(updated)
  }

  const openaiModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  const deepseekModels = ['deepseek-chat', 'deepseek-coder']
  const anthropicModels = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']

  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case 'openai':
        return openaiModels
      case 'deepseek':
        return deepseekModels
      case 'anthropic':
        return anthropicModels
      default:
        return []
    }
  }

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI'
      case 'deepseek':
        return 'DeepSeek'
      case 'anthropic':
        return 'Anthropic'
      default:
        return provider
    }
  }

  const getApiKeyPlaceholder = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'sk-...'
      case 'deepseek':
        return 'sk-...'
      case 'anthropic':
        return 'sk-ant-...'
      default:
        return 'API Key'
    }
  }

  return (
    <div className={styles.container}>
      <h3>🤖 Dual LLM Configuration</h3>
      <p className={styles.subtitle}>Select and configure TWO models to compare</p>

      <div className={styles.dualConfigGrid}>
        {/* Model A Configuration */}
        <div className={styles.configSection}>
          <div className={styles.modelLabel}>Model A (Primary)</div>
          
          <div className={styles.formGroup}>
            <label htmlFor="provider-a">Provider</label>
            <select
              id="provider-a"
              value={dualConfig.modelA.provider}
              onChange={(e) => handleChangeA('provider', e.target.value)}
              className={styles.input}
            >
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model-a">Model</label>
            <select
              id="model-a"
              value={dualConfig.modelA.model}
              onChange={(e) => handleChangeA('model', e.target.value)}
              className={styles.input}
            >
              {getModelsForProvider(dualConfig.modelA.provider).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="apikey-a">
              API Key ({getProviderLabel(dualConfig.modelA.provider)})
            </label>
            <input
              id="apikey-a"
              type="password"
              placeholder={getApiKeyPlaceholder(dualConfig.modelA.provider)}
              value={dualConfig.modelA.apiKey}
              onChange={(e) => handleChangeA('apiKey', e.target.value)}
              className={styles.input}
            />
            <p className={styles.hint}>Your API key is stored locally and never sent to our servers.</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="temperature-a">
              Temperature: <strong>{dualConfig.modelA.temperature.toFixed(2)}</strong>
            </label>
            <input
              id="temperature-a"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={dualConfig.modelA.temperature}
              onChange={(e) => handleChangeA('temperature', parseFloat(e.target.value))}
              className={styles.slider}
            />
            <p className={styles.hint}>Lower = deterministic, Higher = creative</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxTokens-a">Max Tokens</label>
            <input
              id="maxTokens-a"
              type="number"
              min="100"
              max="4000"
              value={dualConfig.modelA.maxTokens}
              onChange={(e) => handleChangeA('maxTokens', parseInt(e.target.value))}
              className={styles.input}
            />
          </div>

          <div className={styles.configSummary}>
            <p>
              <strong>{dualConfig.modelA.model}</strong> • Temp {dualConfig.modelA.temperature} • Max {dualConfig.modelA.maxTokens} tokens
            </p>
          </div>
        </div>

        {/* VS Divider */}
        <div className={styles.vsDivider}>
          <span>VS</span>
        </div>

        {/* Model B Configuration */}
        <div className={styles.configSection}>
          <div className={styles.modelLabel}>Model B (Comparison)</div>
          
          <div className={styles.formGroup}>
            <label htmlFor="provider-b">Provider</label>
            <select
              id="provider-b"
              value={dualConfig.modelB.provider}
              onChange={(e) => handleChangeB('provider', e.target.value)}
              className={styles.input}
            >
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model-b">Model</label>
            <select
              id="model-b"
              value={dualConfig.modelB.model}
              onChange={(e) => handleChangeB('model', e.target.value)}
              className={styles.input}
            >
              {getModelsForProvider(dualConfig.modelB.provider).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="apikey-b">
              API Key ({getProviderLabel(dualConfig.modelB.provider)})
            </label>
            <input
              id="apikey-b"
              type="password"
              placeholder={getApiKeyPlaceholder(dualConfig.modelB.provider)}
              value={dualConfig.modelB.apiKey}
              onChange={(e) => handleChangeB('apiKey', e.target.value)}
              className={styles.input}
            />
            <p className={styles.hint}>Your API key is stored locally and never sent to our servers.</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="temperature-b">
              Temperature: <strong>{dualConfig.modelB.temperature.toFixed(2)}</strong>
            </label>
            <input
              id="temperature-b"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={dualConfig.modelB.temperature}
              onChange={(e) => handleChangeB('temperature', parseFloat(e.target.value))}
              className={styles.slider}
            />
            <p className={styles.hint}>Lower = deterministic, Higher = creative</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxTokens-b">Max Tokens</label>
            <input
              id="maxTokens-b"
              type="number"
              min="100"
              max="4000"
              value={dualConfig.modelB.maxTokens}
              onChange={(e) => handleChangeB('maxTokens', parseInt(e.target.value))}
              className={styles.input}
            />
          </div>

          <div className={styles.configSummary}>
            <p>
              <strong>{dualConfig.modelB.model}</strong> • Temp {dualConfig.modelB.temperature} • Max {dualConfig.modelB.maxTokens} tokens
            </p>
          </div>
        </div>
      </div>

      <div className={styles.summary}>
        <h4>Comparison Setup</h4>
        <p>
          <strong>Model A:</strong> {dualConfig.modelA.model} ({getProviderLabel(dualConfig.modelA.provider)})
        </p>
        <p>
          <strong>Model B:</strong> {dualConfig.modelB.model} ({getProviderLabel(dualConfig.modelB.provider)})
        </p>
        <p className={styles.note}>
          ✅ Both models will run in parallel and outputs will be compared
        </p>
      </div>
    </div>
  )
}

export default LLMConfig
