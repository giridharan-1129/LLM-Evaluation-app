"""
Celery Application Configuration
Sets up Celery for asynchronous task processing
"""

import os
import logging
from celery import Celery
from celery.schedules import crontab

logger = logging.getLogger(__name__)

# Get Redis connection string from environment
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app
celery_app = Celery(
    "llm_eval_platform",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

# Configure Celery
celery_app.conf.update(
    # Task configuration
    task_serializer="json",                    # Serialize tasks as JSON
    accept_content=["json"],                   # Accept JSON content
    result_serializer="json",                  # Serialize results as JSON
    timezone="UTC",                            # Use UTC timezone
    enable_utc=True,                           # Enable UTC
    
    # Task execution settings
    task_track_started=True,                   # Track when task starts
    task_time_limit=30 * 60,                   # Hard time limit: 30 minutes
    task_soft_time_limit=25 * 60,              # Soft time limit: 25 minutes
    
    # Worker settings
    worker_prefetch_multiplier=1,              # Fetch 1 task at a time
    worker_max_tasks_per_child=1000,           # Restart worker after 1000 tasks
    
    # Result backend settings
    result_expires=3600,                       # Results expire after 1 hour
    result_backend_transport_options={
        "master_name": "mymaster",
        "socket_timeout": 5,
        "socket_connect_timeout": 5,
        "retry_on_timeout": True,
    },
    
    # Retry settings
    task_autoretry_for=(Exception,),           # Auto-retry on any exception
    task_max_retries=3,                        # Maximum 3 retries
    task_default_retry_delay=60,               # Wait 60 seconds between retries
)

# Auto-discover tasks from all modules
celery_app.autodiscover_tasks([
    'app.tasks',  # Import tasks from app.tasks module
])

logger.info(f"Celery configured with broker: {REDIS_URL}")

