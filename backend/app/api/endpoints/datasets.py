"""
Datasets API Endpoints
Handles Excel file upload and dataset management
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import os
from pathlib import Path
import logging

from app.db.database import get_session
from app.core.dependencies import get_current_user
from app.db.repositories.eval import EvalDatasetRepository
from app.schemas.eval import EvalDatasetResponse
from app.services.excel_service import ExcelService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/datasets", tags=["datasets"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload", response_model=EvalDatasetResponse)
async def upload_dataset(
    project_id: UUID = Query(..., description="Project ID to upload dataset to"),
    file: UploadFile = File(..., description="Excel file (.xlsx or .xls)"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """
    Upload an Excel file as a dataset for evaluation
    
    Args:
        project_id: The project this dataset belongs to
        file: The Excel file to upload
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        EvalDatasetResponse with dataset metadata
        
    Raises:
        400: Invalid file type or file too large
        404: Project not found
        500: Error reading Excel file
    """
    
    try:
        logger.info(f"Upload dataset request from user {current_user.id} for project {project_id}")
        
        # Validate file type
        try:
            ExcelService.validate_file_type(file.filename)
        except Exception as e:
            logger.error(f"File type validation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file size (max 50MB)
        try:
            ExcelService.validate_file_size(file_size, max_size_mb=50)
        except Exception as e:
            logger.error(f"File size validation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
        # Create project-specific upload directory
        project_upload_dir = UPLOAD_DIR / str(project_id)
        project_upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file to disk
        file_path = project_upload_dir / file.filename
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        logger.info(f"File saved to {file_path}")
        
        # Parse Excel file to get headers and row count
        try:
            headers, data_rows, total_rows = ExcelService.parse_excel_file(str(file_path))
        except Exception as e:
            logger.error(f"Excel parsing failed: {str(e)}")
            # Clean up the file if parsing fails
            file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error reading Excel file: {str(e)}"
            )
        
        logger.info(f"Excel file parsed: {total_rows} rows, {len(headers)} columns")
        
        # Save dataset metadata to database
        repo = EvalDatasetRepository(session)
        dataset = await repo.create(
            project_id=project_id,
            name=file.filename,
            file_path=str(file_path),
            total_rows=total_rows,
            column_mappings=",".join(headers)  # Store headers as comma-separated
        )
        
        logger.info(f"Dataset created in database with ID {dataset.id}")
        
        return EvalDatasetResponse(
            id=dataset.id,
            project_id=dataset.project_id,
            name=dataset.name,
            file_path=str(file_path),
            total_rows=dataset.total_rows,
            created_at=dataset.created_at,
            updated_at=dataset.updated_at
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload_dataset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading dataset"
        )


@router.get("/{dataset_id}", response_model=EvalDatasetResponse)
async def get_dataset(
    dataset_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """
    Get dataset details by ID
    
    Args:
        dataset_id: The dataset ID
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        EvalDatasetResponse with dataset information
        
    Raises:
        404: Dataset not found
    """
    
    try:
        repo = EvalDatasetRepository(session)
        dataset = await repo.get_by_id(dataset_id)
        
        if not dataset:
            logger.warning(f"Dataset {dataset_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        return EvalDatasetResponse.from_orm(dataset)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dataset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving dataset"
        )


@router.get("/project/{project_id}/list")
async def list_datasets(
    project_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """
    List all datasets for a project
    
    Args:
        project_id: The project ID
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        List of EvalDatasetResponse objects
    """
    
    try:
        repo = EvalDatasetRepository(session)
        datasets = await repo.get_by_project_id(project_id)
        
        return [EvalDatasetResponse.from_orm(d) for d in datasets]
        
    except Exception as e:
        logger.error(f"Error listing datasets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving datasets"
        )


@router.post("/{dataset_id}/preview")
async def preview_dataset(
    dataset_id: UUID,
    rows: int = Query(5, ge=1, le=100, description="Number of rows to preview"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """
    Preview the first N rows of a dataset
    
    Args:
        dataset_id: The dataset ID
        rows: Number of rows to return (1-100)
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        Dictionary with headers and preview rows
    """
    
    try:
        # Get dataset metadata
        repo = EvalDatasetRepository(session)
        dataset = await repo.get_by_id(dataset_id)
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        # Parse Excel file
        headers, data_rows, total_rows = ExcelService.parse_excel_file(dataset.file_path)
        
        # Return preview
        return {
            "dataset_id": str(dataset.id),
            "name": dataset.name,
            "total_rows": total_rows,
            "headers": headers,
            "preview_rows": data_rows[:rows],
            "preview_count": min(rows, len(data_rows)),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error previewing dataset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error previewing dataset"
        )


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """
    Delete a dataset and its associated file
    
    Args:
        dataset_id: The dataset ID
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    
    try:
        repo = EvalDatasetRepository(session)
        dataset = await repo.get_by_id(dataset_id)
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        # Delete file from disk
        if os.path.exists(dataset.file_path):
            os.remove(dataset.file_path)
            logger.info(f"Deleted file: {dataset.file_path}")
        
        # Delete from database
        await repo.delete(dataset_id)
        
        logger.info(f"Dataset {dataset_id} deleted")
        
        return {"message": "Dataset deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting dataset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting dataset"
        )

