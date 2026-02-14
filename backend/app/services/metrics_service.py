"""
Metrics Service Module
Calculates evaluation metrics:
- Accuracy
- Precision & Recall
- F1 Score
- BLEU Score
- ROUGE Score
- Similarity Scores
"""

import logging
from typing import List, Dict, Any, Tuple
from collections import Counter
import math

logger = logging.getLogger(__name__)


class MetricsService:
    """
    Service for calculating evaluation metrics
    """
    
    @staticmethod
    def calculate_exact_match(actual: str, expected: str) -> int:
        """
        Check if actual output exactly matches expected output
        
        Args:
            actual: The actual LLM response
            expected: The ground truth / expected response
            
        Returns:
            1 if exact match, 0 otherwise
        """
        # Normalize: lowercase and strip whitespace
        actual_normalized = actual.strip().lower()
        expected_normalized = expected.strip().lower()
        
        is_match = 1 if actual_normalized == expected_normalized else 0
        
        logger.debug(f"Exact match: {is_match}")
        return is_match
    
    
    @staticmethod
    def calculate_token_f1(actual: str, expected: str) -> float:
        """
        Calculate F1 score at token level
        Treats each word as a token and calculates precision/recall
        
        Args:
            actual: Actual output tokens
            expected: Expected output tokens
            
        Returns:
            F1 score between 0 and 1
            
        Example:
            actual = "The cat sat on mat"
            expected = "The cat sat on the mat"
            
            actual_tokens = ["the", "cat", "sat", "on", "mat"]
            expected_tokens = ["the", "cat", "sat", "on", "the", "mat"]
            
            Common tokens = ["the", "cat", "sat", "on", "mat"] (5)
            Precision = 5 / 5 = 1.0
            Recall = 5 / 6 = 0.833
            F1 = 2 * (1.0 * 0.833) / (1.0 + 0.833) = 0.909
        """
        
        # Tokenize: split by whitespace and lowercase
        actual_tokens = set(actual.lower().split())
        expected_tokens = set(expected.lower().split())
        
        # Find common tokens
        common_tokens = actual_tokens.intersection(expected_tokens)
        
        if len(actual_tokens) == 0 or len(expected_tokens) == 0:
            logger.debug("Token F1: 0.0 (empty tokens)")
            return 0.0
        
        # Calculate precision and recall
        precision = len(common_tokens) / len(actual_tokens) if len(actual_tokens) > 0 else 0.0
        recall = len(common_tokens) / len(expected_tokens) if len(expected_tokens) > 0 else 0.0
        
        # Calculate F1
        if precision + recall == 0:
            f1 = 0.0
        else:
            f1 = 2 * (precision * recall) / (precision + recall)
        
        logger.debug(f"Token F1: {f1:.4f} (precision={precision:.4f}, recall={recall:.4f})")
        return f1
    
    
    @staticmethod
    def calculate_bleu_score(actual: str, expected: str, max_n: int = 4) -> float:
        """
        Calculate BLEU (Bilingual Evaluation Understudy) score
        Used for machine translation and text generation evaluation
        
        BLEU measures:
        - How many consecutive word sequences (n-grams) appear in both texts
        
        Args:
            actual: Actual output
            expected: Expected output
            max_n: Maximum n-gram size (default 4 for 1-gram to 4-gram)
            
        Returns:
            BLEU score between 0 and 1
            
        Example:
            actual = "the cat is on the mat"
            expected = "the cat is on the mat"
            → BLEU = 1.0 (perfect match)
            
            actual = "the dog is on the mat"
            expected = "the cat is on the mat"
            → BLEU = 0.5 (4 out of 6 unigrams match)
        """
        
        # Tokenize into words
        actual_tokens = actual.lower().split()
        expected_tokens = expected.lower().split()
        
        if len(actual_tokens) == 0 or len(expected_tokens) == 0:
            logger.debug("BLEU: 0.0 (empty tokens)")
            return 0.0
        
        # Calculate n-gram precision for each n
        precisions = []
        
        for n in range(1, max_n + 1):
            # Generate n-grams
            actual_ngrams = [" ".join(actual_tokens[i:i+n]) for i in range(len(actual_tokens) - n + 1)]
            expected_ngrams = [" ".join(expected_tokens[i:i+n]) for i in range(len(expected_tokens) - n + 1)]
            
            if len(actual_ngrams) == 0:
                precisions.append(0.0)
                continue
            
            # Count matching n-grams
            actual_count = Counter(actual_ngrams)
            expected_count = Counter(expected_ngrams)
            
            # Matching n-grams: take min count from both
            matches = sum((actual_count & expected_count).values())
            
            # Precision for this n
            precision_n = matches / len(actual_ngrams) if len(actual_ngrams) > 0 else 0.0
            precisions.append(precision_n)
        
        # BLEU = geometric mean of precisions
        if any(p == 0 for p in precisions):
            bleu = 0.0
        else:
            log_precisions = [math.log(p) for p in precisions]
            bleu = math.exp(sum(log_precisions) / len(log_precisions))
        
        logger.debug(f"BLEU: {bleu:.4f}")
        return bleu
    
    
    @staticmethod
    def calculate_rouge_score(actual: str, expected: str) -> float:
        """
        Calculate ROUGE (Recall-Oriented Understudy for Gisting Evaluation) score
        Specifically ROUGE-L (Longest Common Subsequence)
        
        Used for summarization and text generation
        
        Args:
            actual: Actual output
            expected: Expected output
            
        Returns:
            ROUGE-L score between 0 and 1
            
        Example:
            actual = "the cat sat"
            expected = "the cat is sitting"
            
            LCS = "the cat" (length 7 characters)
            ROUGE = 2 * LCS / (len(actual) + len(expected))
        """
        
        # Calculate longest common subsequence (LCS)
        lcs_length = MetricsService._lcs_length(actual, expected)
        
        actual_len = len(actual)
        expected_len = len(expected)
        
        if actual_len == 0 or expected_len == 0:
            logger.debug("ROUGE: 0.0 (empty text)")
            return 0.0
        
        # ROUGE-L F-score
        rouge = (2 * lcs_length) / (actual_len + expected_len)
        
        logger.debug(f"ROUGE: {rouge:.4f}")
        return rouge
    
    
    @staticmethod
    def _lcs_length(s1: str, s2: str) -> int:
        """
        Calculate length of longest common subsequence
        
        Args:
            s1: First string
            s2: Second string
            
        Returns:
            Length of LCS
        """
        m, n = len(s1), len(s2)
        
        # Create DP table
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        # Fill DP table
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i-1] == s2[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        
        return dp[m][n]
    
    
    @staticmethod
    def calculate_cosine_similarity(actual: str, expected: str) -> float:
        """
        Calculate cosine similarity between two texts
        Based on word frequency vectors
        
        Args:
            actual: Actual output
            expected: Expected output
            
        Returns:
            Similarity score between 0 and 1
        """
        
        # Tokenize
        actual_tokens = actual.lower().split()
        expected_tokens = expected.lower().split()
        
        # Create word frequency vectors
        all_words = set(actual_tokens + expected_tokens)
        
        actual_vector = [actual_tokens.count(word) for word in all_words]
        expected_vector = [expected_tokens.count(word) for word in all_words]
        
        # Calculate dot product
        dot_product = sum(a * b for a, b in zip(actual_vector, expected_vector))
        
        # Calculate magnitudes
        magnitude_actual = math.sqrt(sum(a ** 2 for a in actual_vector))
        magnitude_expected = math.sqrt(sum(b ** 2 for b in expected_vector))
        
        if magnitude_actual == 0 or magnitude_expected == 0:
            logger.debug("Cosine similarity: 0.0")
            return 0.0
        
        # Calculate cosine similarity
        similarity = dot_product / (magnitude_actual * magnitude_expected)
        
        logger.debug(f"Cosine similarity: {similarity:.4f}")
        return similarity
    
    
    @staticmethod
    def calculate_metrics(actual: str, expected: str) -> Dict[str, float]:
        """
        Calculate all metrics for a single evaluation entry
        
        Args:
            actual: Actual LLM output
            expected: Expected/ground truth output
            
        Returns:
            Dictionary with all metrics
        """
        
        metrics = {
            "exact_match": MetricsService.calculate_exact_match(actual, expected),
            "token_f1": MetricsService.calculate_token_f1(actual, expected),
            "bleu_score": MetricsService.calculate_bleu_score(actual, expected),
            "rouge_score": MetricsService.calculate_rouge_score(actual, expected),
            "cosine_similarity": MetricsService.calculate_cosine_similarity(actual, expected),
        }
        
        logger.debug(f"Calculated metrics: {metrics}")
        return metrics
    
    
    @staticmethod
    def aggregate_metrics(entries_with_metrics: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Aggregate metrics across multiple entries
        
        Args:
            entries_with_metrics: List of entries with their metrics
            
        Returns:
            Dictionary with aggregated metrics
            
        Example:
            entries = [
                {"exact_match": 1, "token_f1": 0.95, ...},
                {"exact_match": 0, "token_f1": 0.87, ...},
                {"exact_match": 1, "token_f1": 0.92, ...},
            ]
            
            aggregated = {
                "accuracy": 0.667,  (2 out of 3 exact matches)
                "avg_token_f1": 0.913,
                "avg_bleu_score": ...,
                ...
            }
        """
        
        if not entries_with_metrics:
            logger.warning("No entries to aggregate")
            return {}
        
        # Calculate accuracy (percentage of exact matches)
        exact_matches = sum(e.get("exact_match", 0) for e in entries_with_metrics)
        accuracy = exact_matches / len(entries_with_metrics)
        
        # Calculate average for other metrics
        aggregated = {
            "accuracy": accuracy,
            "total_entries": len(entries_with_metrics),
            "exact_match_count": exact_matches,
        }
        
        # Average scores
        metric_names = ["token_f1", "bleu_score", "rouge_score", "cosine_similarity"]
        
        for metric_name in metric_names:
            values = [e.get(metric_name, 0) for e in entries_with_metrics if metric_name in e]
            if values:
                aggregated[f"avg_{metric_name}"] = sum(values) / len(values)
        
        logger.info(f"Aggregated metrics for {len(entries_with_metrics)} entries: {aggregated}")
        
        return aggregated
    
    
    @staticmethod
    def calculate_precision_recall_f1(
        exact_matches: int,
        total_entries: int
    ) -> Dict[str, float]:
        """
        Calculate precision, recall, and F1 score
        Simplified version for classification tasks
        
        Args:
            exact_matches: Number of exact matches
            total_entries: Total number of entries
            
        Returns:
            Dictionary with precision, recall, f1
        """
        
        # For exact match, precision = recall = accuracy
        accuracy = exact_matches / total_entries if total_entries > 0 else 0.0
        
        return {
            "precision": accuracy,
            "recall": accuracy,
            "f1_score": accuracy,  # For exact match, F1 = accuracy
        }

