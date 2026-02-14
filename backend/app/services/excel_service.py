"""
Excel Service Module
Handles all Excel file operations:
- Parsing Excel files
- Validating data
- Rendering prompts with data
- Merging results back to Excel
"""

import io
import pandas as pd
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
import logging

logger = logging.getLogger(__name__)


class ExcelService:
    """
    Service for handling Excel file operations
    """
    
    @staticmethod
    def parse_excel_file(file_path: str) -> Tuple[List[str], List[Dict], int]:
        """
        Parse an Excel file and extract headers, data rows, and row count
        
        Args:
            file_path: Path to the Excel file
            
        Returns:
            Tuple of (headers, data_rows, total_rows)
        """
        try:
            # Read Excel file using pandas
            df = pd.read_excel(file_path)
            
            # Get headers (column names)
            headers = df.columns.tolist()
            
            # Convert rows to list of dictionaries
            data_rows = df.to_dict('records')
            
            # Get total row count
            total_rows = len(df)
            
            logger.info(f"Successfully parsed Excel file: {file_path}")
            logger.info(f"Headers: {headers}, Total rows: {total_rows}")
            
            return headers, data_rows, total_rows
            
        except FileNotFoundError:
            logger.error(f"File not found: {file_path}")
            raise Exception(f"File not found: {file_path}")
        except Exception as e:
            logger.error(f"Error parsing Excel file: {str(e)}")
            raise Exception(f"Error parsing Excel file: {str(e)}")
    
    
    @staticmethod
    def validate_headers(headers: List[str], required_headers: List[str]) -> bool:
        """
        Validate that required headers exist in the Excel file
        
        Args:
            headers: Headers from Excel file
            required_headers: Headers that must be present
            
        Returns:
            True if all required headers present, False otherwise
        """
        missing_headers = set(required_headers) - set(headers)
        
        if missing_headers:
            logger.error(f"Missing required headers: {missing_headers}")
            raise Exception(f"Missing required headers: {', '.join(missing_headers)}")
        
        logger.info("Headers validation passed")
        return True
    
    
    @staticmethod
    def render_prompt_template(template: str, data_row: Dict[str, any]) -> str:
        """
        Replace variables in prompt template with actual data from row
        
        Args:
            template: Prompt template with {variable} placeholders
            data_row: Dictionary with data to fill in
            
        Returns:
            Rendered prompt with values substituted
            
        Example:
            template = "Customer query: {customer_query}, Context: {context}"
            data_row = {"customer_query": "How to reset?", "context": "Banking"}
            result = render_prompt_template(template, data_row)
            # result = "Customer query: How to reset?, Context: Banking"
        """
        try:
            rendered = template.format(**data_row)
            logger.debug(f"Successfully rendered prompt template")
            return rendered
        except KeyError as e:
            logger.error(f"Missing key in data row: {e}")
            raise Exception(f"Template variable {e} not found in data row")
        except Exception as e:
            logger.error(f"Error rendering template: {str(e)}")
            raise Exception(f"Error rendering template: {str(e)}")
    
    
    @staticmethod
    def save_results_to_excel(
        original_file_path: str,
        output_file_path: str,
        results: List[Dict[str, any]],
        new_column_name: str = "llm_response"
    ) -> str:
        """
        Merge LLM results back to original Excel file
        
        Args:
            original_file_path: Path to original Excel file
            output_file_path: Where to save the new file
            results: List of result dictionaries with original data + LLM response
            new_column_name: Name of column for LLM response
            
        Returns:
            Path to saved file
        """
        try:
            # Read original file
            df_original = pd.read_excel(original_file_path)
            
            # Create new columns from results
            new_columns = {}
            for key in results[0].keys():
                if key not in df_original.columns:
                    new_columns[key] = [r.get(key, "") for r in results]
            
            # Add new columns to dataframe
            for col_name, col_data in new_columns.items():
                df_original[col_name] = col_data
            
            # Save to new Excel file
            df_original.to_excel(output_file_path, index=False)
            
            logger.info(f"Results saved to {output_file_path}")
            return output_file_path
            
        except Exception as e:
            logger.error(f"Error saving results to Excel: {str(e)}")
            raise Exception(f"Error saving results to Excel: {str(e)}")
    
    
    @staticmethod
    def validate_file_type(file_name: str) -> bool:
        """
        Check if file is valid Excel format
        
        Args:
            file_name: Name of the file
            
        Returns:
            True if valid, raises exception otherwise
        """
        valid_extensions = ['.xlsx', '.xls']
        file_ext = Path(file_name).suffix.lower()
        
        if file_ext not in valid_extensions:
            logger.error(f"Invalid file type: {file_ext}")
            raise Exception(f"Invalid file type. Must be .xlsx or .xls, got {file_ext}")
        
        logger.info(f"File type validation passed: {file_ext}")
        return True
    
    
    @staticmethod
    def validate_file_size(file_size_bytes: int, max_size_mb: int = 50) -> bool:
        """
        Check if file size is within limits
        
        Args:
            file_size_bytes: Size of file in bytes
            max_size_mb: Maximum allowed size in MB (default 50MB)
            
        Returns:
            True if valid, raises exception otherwise
        """
        max_size_bytes = max_size_mb * 1024 * 1024
        
        if file_size_bytes > max_size_bytes:
            logger.error(f"File too large: {file_size_bytes} bytes")
            raise Exception(f"File too large. Maximum size is {max_size_mb}MB")
        
        logger.info(f"File size validation passed: {file_size_bytes} bytes")
        return True

