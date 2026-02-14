# GenAI Evaluation Platform - Complete Schema

## Core Concept
This platform allows users to:
1. Create projects for specific GenAI evaluation tasks
2. Upload Excel files with input data
3. Select/version prompts (system + user prompts)
4. Configure model parameters (temperature, token size, etc.)
5. Run evaluations (send data to GPT)
6. Track metrics (precision, recall, accuracy, tokens, cost)
7. Visualize results and compare across versions

---

## Database Schema

### 1. PROJECTS (Already implemented)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  name VARCHAR(255),
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. EVAL_CONFIGURATIONS (NEW)
Stores project-specific evaluation settings
```sql
CREATE TABLE eval_configurations (
  id UUID PRIMARY KEY,
  project_id UUID FOREIGN KEY,
  model VARCHAR(50),  -- gpt-4, gpt-3.5-turbo, etc
  temperature FLOAT,  -- 0.0 to 2.0
  max_tokens INT,
  top_p FLOAT,
  frequency_penalty FLOAT,
  presence_penalty FLOAT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. PROMPTS (Already implemented with versions)
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY,
  project_id UUID FOREIGN KEY,
  name VARCHAR(255),
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY,
  prompt_id UUID FOREIGN KEY,
  version_number INT,
  system_prompt TEXT,      -- System instruction for GPT
  user_prompt_template TEXT, -- Template with {placeholders}
  description TEXT,
  status VARCHAR(50),       -- draft, published, archived
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 4. EVAL_DATASETS (NEW)
Uploaded Excel files with input data
```sql
CREATE TABLE eval_datasets (
  id UUID PRIMARY KEY,
  project_id UUID FOREIGN KEY,
  name VARCHAR(255),
  file_path VARCHAR(512),   -- Path to uploaded Excel file
  total_rows INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. EVAL_CYCLES (NEW)
Each evaluation run with specific config
```sql
CREATE TABLE eval_cycles (
  id UUID PRIMARY KEY,
  project_id UUID FOREIGN KEY,
  dataset_id UUID FOREIGN KEY,
  prompt_version_id UUID FOREIGN KEY,
  eval_config_id UUID FOREIGN KEY,
  name VARCHAR(255),
  status VARCHAR(50),       -- pending, running, completed, failed
  progress INT,             -- 0-100%
  total_rows INT,
  processed_rows INT,
  failed_rows INT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### 6. EVAL_ENTRIES (NEW)
Individual data points being evaluated
```sql
CREATE TABLE eval_entries (
  id UUID PRIMARY KEY,
  eval_cycle_id UUID FOREIGN KEY,
  row_number INT,
  input_data JSON,          -- Original row data from Excel
  system_prompt TEXT,
  user_prompt TEXT,         -- Rendered with data substitutions
  gpt_response TEXT,        -- Response from GPT
  tokens_used INT,
  cost DECIMAL(10, 6),      -- Calculated from tokens
  latency_ms INT,           -- Response time
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 7. EVAL_METRICS (NEW)
Metrics for each entry (ground truth comparison)
```sql
CREATE TABLE eval_metrics (
  id UUID PRIMARY KEY,
  eval_entry_id UUID FOREIGN KEY,
  expected_output TEXT,     -- Ground truth from Excel
  actual_output TEXT,       -- GPT response (copy of gpt_response)
  similarity_score FLOAT,   -- 0-1 (cosine similarity)
  exact_match BOOLEAN,
  token_f1 FLOAT,          -- Token-level F1
  bleu_score FLOAT,        -- BLEU metric
  rouge_score FLOAT,       -- ROUGE metric
  custom_metrics JSON,     -- Custom evaluation metrics
  created_at TIMESTAMP
);
```

### 8. EVAL_CYCLE_SUMMARY (NEW)
Aggregated metrics per eval cycle
```sql
CREATE TABLE eval_cycle_summary (
  id UUID PRIMARY KEY,
  eval_cycle_id UUID FOREIGN KEY,
  total_tokens INT,
  total_cost DECIMAL(12, 6),
  avg_latency_ms INT,
  accuracy FLOAT,          -- % exact matches
  precision FLOAT,         -- TP / (TP + FP)
  recall FLOAT,           -- TP / (TP + FN)
  f1_score FLOAT,         -- Harmonic mean of precision/recall
  avg_similarity FLOAT,   -- Average cosine similarity
  avg_bleu FLOAT,
  avg_rouge FLOAT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 9. EVAL_COMPARISONS (NEW)
Compare metrics across prompt versions
```sql
CREATE TABLE eval_comparisons (
  id UUID PRIMARY KEY,
  project_id UUID FOREIGN KEY,
  eval_cycle_id_1 UUID FOREIGN KEY,  -- Version A
  eval_cycle_id_2 UUID FOREIGN KEY,  -- Version B
  accuracy_diff FLOAT,     -- B accuracy - A accuracy
  precision_diff FLOAT,
  recall_diff FLOAT,
  f1_diff FLOAT,
  cost_diff DECIMAL(10, 6),
  latency_diff INT,
  winner VARCHAR(50),      -- which is better
  created_at TIMESTAMP
);
```

---

## API Endpoints Required

### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/{id}` - Get project

### Evaluation Configurations
- `POST /api/v1/eval-configs` - Create config
- `GET /api/v1/eval-configs/{project_id}` - Get config
- `PUT /api/v1/eval-configs/{id}` - Update config

### Datasets
- `POST /api/v1/datasets` - Upload Excel file
- `GET /api/v1/datasets/{project_id}` - List datasets
- `GET /api/v1/datasets/{id}/preview` - Preview file

### Prompts & Versions (Already implemented)

### Evaluation Cycles
- `POST /api/v1/eval-cycles` - Start evaluation
- `GET /api/v1/eval-cycles/{project_id}` - List cycles
- `GET /api/v1/eval-cycles/{id}` - Get cycle details
- `POST /api/v1/eval-cycles/{id}/cancel` - Cancel running cycle
- `GET /api/v1/eval-cycles/{id}/progress` - Real-time progress

### Metrics & Results
- `GET /api/v1/eval-cycles/{id}/metrics` - Get summary metrics
- `GET /api/v1/eval-cycles/{id}/entries` - Get individual entries
- `GET /api/v1/eval-cycles/{id}/entries/{entry_id}` - Get entry detail
- `GET /api/v1/projects/{id}/comparisons` - Compare versions

### Export
- `GET /api/v1/eval-cycles/{id}/export` - Export results as Excel

---

## Key Features

### 1. Excel Processing Pipeline
```
Upload Excel → Parse (openpyxl/pandas)
  ↓
Extract columns → Map to template variables
  ↓
For each row:
  - Render user prompt with data
  - Keep system prompt constant
  - Send to GPT API
  - Store response + tokens + latency
  ↓
Merge results back to Excel
```

### 2. Metrics Calculation
For each evaluation entry:
- **Exact Match**: exact_output == expected_output (binary)
- **Similarity Score**: Cosine similarity of embeddings
- **BLEU**: Bilingual Evaluation Understudy (machine translation metric)
- **ROUGE**: Recall-Oriented Understudy for Gisting Evaluation
- **Token-level F1**: Precision/recall at token level

Aggregate metrics:
- **Accuracy**: % of exact matches
- **Precision**: TP / (TP + FP)
- **Recall**: TP / (TP + FN)
- **F1 Score**: 2 × (Precision × Recall) / (Precision + Recall)

### 3. Cost Tracking
```
Cost = (input_tokens / 1000 × input_cost) + (output_tokens / 1000 × output_cost)

For GPT-4:
  - Input: $0.03 / 1K tokens
  - Output: $0.06 / 1K tokens

For GPT-3.5-turbo:
  - Input: $0.0005 / 1K tokens
  - Output: $0.0015 / 1K tokens
```

---

## Frontend Features Needed

### Pages
1. **Dataset Upload** - Upload Excel files
2. **Configuration** - Select model, set parameters
3. **Prompt Manager** - Version and test prompts
4. **Evaluation Runner** - Start/monitor eval jobs
5. **Results Dashboard** - View metrics and comparison
6. **Visualization** - Charts for accuracy, cost, latency
7. **Export** - Download results as Excel

### Components
- Excel file uploader with preview
- Parameter configuration form
- Real-time job progress bar
- Metrics comparison tables
- Chart library (recharts) for visualization
- Results table with filtering/sorting
