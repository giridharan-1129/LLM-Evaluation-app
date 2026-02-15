"""
LLM Service Module
Handles all LLM API interactions:
- Calling OpenAI API
- Calling DeepSeek API
- Calling Anthropic API
- Token counting
- Cost calculation
- Error handling and retries
"""

import os
import time
import logging
from typing import Dict, Any, Optional, Tuple, List
from abc import ABC, abstractmethod
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """
    Abstract base class for LLM providers
    All LLM providers must implement these methods
    """
    
    @abstractmethod
    def call(self, system_prompt: str, user_prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Call the LLM with given prompts
        
        Args:
            system_prompt: System instruction for the LLM
            user_prompt: The actual user message
            **kwargs: Additional parameters (temperature, max_tokens, etc)
            
        Returns:
            Dict with keys: response, tokens_used, cost
        """
        pass
    
    @abstractmethod
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text without calling API
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Number of tokens
        """
        pass


class OpenAIProvider(LLMProvider):
    """
    OpenAI LLM Provider
    Handles calls to OpenAI's API (GPT-4, GPT-3.5, etc)
    """
    
    # Token pricing per 1000 tokens (as of Feb 2025)
    PRICING = {
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    }
    
    # Approximate tokens per word (for estimation)
    TOKENS_PER_WORD = 0.75
    
    def __init__(self):
        """Initialize OpenAI provider with API key"""
        try:
            import openai
            self.openai = openai
            
            # Get API key from environment
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set in environment")
            
            self.openai.api_key = api_key
            self.client = openai.OpenAI(api_key=api_key)
            logger.info("OpenAI provider initialized")
            
        except ImportError:
            logger.error("openai package not installed. Run: pip install openai")
            raise Exception("openai package required. Run: pip install openai")
    
    
    def call(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Call OpenAI API with exponential backoff retry logic
        
        Args:
            system_prompt: System instruction
            user_prompt: User message
            model: Model name (gpt-4, gpt-3.5-turbo, etc)
            temperature: Randomness (0.0 = deterministic, 1.0 = random)
            max_tokens: Maximum response length
            max_retries: Number of retry attempts on failure
            
        Returns:
            Dict with:
            - response: The LLM response text
            - tokens_used: Total tokens consumed
            - cost: Cost in dollars
            - model: Model used
            - temperature: Temperature used
        """
        
        retry_count = 0
        last_error = None
        
        while retry_count < max_retries:
            try:
                logger.debug(f"Calling OpenAI {model} (attempt {retry_count + 1}/{max_retries})")
                
                # Call OpenAI API
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                # Extract response text
                response_text = response.choices[0].message.content
                
                # Get token counts
                input_tokens = response.usage.prompt_tokens
                output_tokens = response.usage.completion_tokens
                total_tokens = input_tokens + output_tokens
                
                # Calculate cost
                cost = self._calculate_cost(model, input_tokens, output_tokens)
                
                logger.info(f"OpenAI call successful. Tokens: {total_tokens}, Cost: ${cost:.6f}")
                
                return {
                    "response": response_text,
                    "tokens_used": total_tokens,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "cost": cost,
                    "model": model,
                    "temperature": temperature,
                    "provider": "openai"
                }
                
            except Exception as e:
                last_error = e
                retry_count += 1
                
                if retry_count < max_retries:
                    # Exponential backoff: wait 2^retry_count seconds
                    wait_time = 2 ** retry_count
                    logger.warning(f"OpenAI call failed: {str(e)}. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"OpenAI call failed after {max_retries} retries: {str(e)}")
        
        raise Exception(f"Failed to call OpenAI after {max_retries} retries: {str(last_error)}")
    
    
    def count_tokens(self, text: str) -> int:
        """
        Estimate token count without calling API
        Uses approximate ratio: 1 token ≈ 0.75 words
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Estimated token count
        """
        word_count = len(text.split())
        estimated_tokens = int(word_count * self.TOKENS_PER_WORD)
        
        logger.debug(f"Estimated tokens: {estimated_tokens} (for {word_count} words)")
        
        return estimated_tokens
    
    
    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """
        Calculate cost based on token usage and pricing
        
        Args:
            model: Model name
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            
        Returns:
            Cost in dollars
        """
        
        # Get pricing for model
        if model not in self.PRICING:
            logger.warning(f"Pricing not found for {model}, using gpt-3.5-turbo pricing")
            pricing = self.PRICING["gpt-3.5-turbo"]
        else:
            pricing = self.PRICING[model]
        
        # Calculate cost: (tokens / 1000) * price_per_1k_tokens
        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost
        
        logger.debug(f"Cost calculation: input=${input_cost:.6f}, output=${output_cost:.6f}, total=${total_cost:.6f}")
        
        return total_cost


class DeepSeekProvider(LLMProvider):
    """
    DeepSeek LLM Provider
    Handles calls to DeepSeek's API (DeepSeek-V2, etc)
    """
    
    # Token pricing per 1000 tokens (as of Feb 2025)
    PRICING = {
        "deepseek-chat": {"input": 0.0014, "output": 0.0028},
        "deepseek-coder": {"input": 0.0014, "output": 0.0028},
    }
    
    TOKENS_PER_WORD = 0.75
    BASE_URL = "https://api.deepseek.com/v1"
    
    def __init__(self):
        """Initialize DeepSeek provider with API key"""
        try:
            import openai
            self.openai = openai
            
            # Get API key from environment
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise ValueError("DEEPSEEK_API_KEY not set in environment")
            
            # DeepSeek uses OpenAI-compatible API
            self.client = openai.OpenAI(
                api_key=api_key,
                base_url=self.BASE_URL
            )
            logger.info("DeepSeek provider initialized")
            
        except ImportError:
            logger.error("openai package not installed. Run: pip install openai")
            raise Exception("openai package required. Run: pip install openai")
    
    
    def call(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = "deepseek-chat",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Call DeepSeek API with exponential backoff retry logic
        
        Args:
            system_prompt: System instruction
            user_prompt: User message
            model: Model name (deepseek-chat, deepseek-coder, etc)
            temperature: Randomness (0.0 = deterministic, 1.0 = random)
            max_tokens: Maximum response length
            max_retries: Number of retry attempts on failure
            
        Returns:
            Dict with response, tokens_used, cost
        """
        
        retry_count = 0
        last_error = None
        
        while retry_count < max_retries:
            try:
                logger.debug(f"Calling DeepSeek {model} (attempt {retry_count + 1}/{max_retries})")
                
                # Call DeepSeek API (OpenAI-compatible)
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                # Extract response text
                response_text = response.choices[0].message.content
                
                # Get token counts
                input_tokens = response.usage.prompt_tokens
                output_tokens = response.usage.completion_tokens
                total_tokens = input_tokens + output_tokens
                
                # Calculate cost
                cost = self._calculate_cost(model, input_tokens, output_tokens)
                
                logger.info(f"DeepSeek call successful. Tokens: {total_tokens}, Cost: ${cost:.6f}")
                
                return {
                    "response": response_text,
                    "tokens_used": total_tokens,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "cost": cost,
                    "model": model,
                    "temperature": temperature,
                    "provider": "deepseek"
                }
                
            except Exception as e:
                last_error = e
                retry_count += 1
                
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.warning(f"DeepSeek call failed: {str(e)}. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"DeepSeek call failed after {max_retries} retries: {str(e)}")
        
        raise Exception(f"Failed to call DeepSeek after {max_retries} retries: {str(last_error)}")
    
    
    def count_tokens(self, text: str) -> int:
        """
        Estimate token count without calling API
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Estimated token count
        """
        word_count = len(text.split())
        estimated_tokens = int(word_count * self.TOKENS_PER_WORD)
        
        logger.debug(f"Estimated tokens: {estimated_tokens} (for {word_count} words)")
        
        return estimated_tokens
    
    
    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost based on token usage and pricing"""
        
        if model not in self.PRICING:
            logger.warning(f"Pricing not found for {model}, using deepseek-chat pricing")
            pricing = self.PRICING["deepseek-chat"]
        else:
            pricing = self.PRICING[model]
        
        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost
        
        logger.debug(f"Cost calculation: input=${input_cost:.6f}, output=${output_cost:.6f}, total=${total_cost:.6f}")
        
        return total_cost


class AnthropicProvider(LLMProvider):
    """
    Anthropic LLM Provider
    Handles calls to Anthropic's API (Claude 3, etc)
    """
    
    # Token pricing per 1000 tokens (as of Feb 2025)
    PRICING = {
        "claude-3-opus": {"input": 0.015, "output": 0.075},
        "claude-3-sonnet": {"input": 0.003, "output": 0.015},
        "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
    }
    
    TOKENS_PER_WORD = 0.75
    
    def __init__(self):
        """Initialize Anthropic provider with API key"""
        try:
            import anthropic
            self.anthropic = anthropic
            
            # Get API key from environment
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not set in environment")
            
            self.client = anthropic.Anthropic(api_key=api_key)
            logger.info("Anthropic provider initialized")
            
        except ImportError:
            logger.error("anthropic package not installed. Run: pip install anthropic")
            raise Exception("anthropic package required. Run: pip install anthropic")
    
    
    def call(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = "claude-3-sonnet",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Call Anthropic API with exponential backoff retry logic
        
        Args:
            system_prompt: System instruction
            user_prompt: User message
            model: Model name (claude-3-opus, claude-3-sonnet, etc)
            temperature: Randomness (0.0 = deterministic, 1.0 = random)
            max_tokens: Maximum response length
            max_retries: Number of retry attempts on failure
            
        Returns:
            Dict with response, tokens_used, cost
        """
        
        retry_count = 0
        last_error = None
        
        while retry_count < max_retries:
            try:
                logger.debug(f"Calling Anthropic {model} (attempt {retry_count + 1}/{max_retries})")
                
                # Call Anthropic API
                response = self.client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                )
                
                # Extract response text
                response_text = response.content[0].text
                
                # Get token counts
                input_tokens = response.usage.input_tokens
                output_tokens = response.usage.output_tokens
                total_tokens = input_tokens + output_tokens
                
                # Calculate cost
                cost = self._calculate_cost(model, input_tokens, output_tokens)
                
                logger.info(f"Anthropic call successful. Tokens: {total_tokens}, Cost: ${cost:.6f}")
                
                return {
                    "response": response_text,
                    "tokens_used": total_tokens,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "cost": cost,
                    "model": model,
                    "temperature": temperature,
                    "provider": "anthropic"
                }
                
            except Exception as e:
                last_error = e
                retry_count += 1
                
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.warning(f"Anthropic call failed: {str(e)}. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Anthropic call failed after {max_retries} retries: {str(e)}")
        
        raise Exception(f"Failed to call Anthropic after {max_retries} retries: {str(last_error)}")
    
    
    def count_tokens(self, text: str) -> int:
        """
        Estimate token count without calling API
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Estimated token count
        """
        word_count = len(text.split())
        estimated_tokens = int(word_count * self.TOKENS_PER_WORD)
        
        logger.debug(f"Estimated tokens: {estimated_tokens} (for {word_count} words)")
        
        return estimated_tokens
    
    
    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost based on token usage and pricing"""
        
        if model not in self.PRICING:
            logger.warning(f"Pricing not found for {model}, using claude-3-sonnet pricing")
            pricing = self.PRICING["claude-3-sonnet"]
        else:
            pricing = self.PRICING[model]
        
        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost
        
        logger.debug(f"Cost calculation: input=${input_cost:.6f}, output=${output_cost:.6f}, total=${total_cost:.6f}")
        
        return total_cost


class LLMService:
    """
    Main LLM Service
    Provides unified interface to all LLM providers
    Supports dual-model parallel execution
    """
    
    def __init__(self, provider: str = "openai"):
        """
        Initialize LLM service with specified provider
        
        Args:
            provider: "openai", "deepseek", or "anthropic"
        """
        self.provider = provider
        
        if provider == "openai":
            self.llm = OpenAIProvider()
        elif provider == "deepseek":
            self.llm = DeepSeekProvider()
        elif provider == "anthropic":
            self.llm = AnthropicProvider()
        else:
            raise ValueError(f"Unknown provider: {provider}")
        
        logger.info(f"LLMService initialized with {provider} provider")
    
    
    def evaluate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        Evaluate a single prompt with LLM
        
        Args:
            system_prompt: System instruction
            user_prompt: User message
            model: Model to use
            temperature: Randomness level
            max_tokens: Max response length
            
        Returns:
            Dict with response, tokens, cost, model
        """
        
        try:
            result = self.llm.call(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return result
            
        except Exception as e:
            logger.error(f"LLM evaluation failed: {str(e)}")
            raise
    
    
    def evaluate_dual_models(
        self,
        system_prompt: str,
        user_prompt: str,
        model_a: str,
        model_b: str,
        provider_a: str = "openai",
        provider_b: str = "deepseek",
        temperature_a: float = 0.7,
        temperature_b: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        Evaluate same prompt with TWO models in PARALLEL
        
        Args:
            system_prompt: System instruction
            user_prompt: User message
            model_a: First model name
            model_b: Second model name
            provider_a: Provider for first model
            provider_b: Provider for second model
            temperature_a: Temperature for first model
            temperature_b: Temperature for second model
            max_tokens: Max response length
            
        Returns:
            Dict with:
            - response_a: Response from model A
            - response_b: Response from model B
            - tokens_a: Tokens used by model A
            - tokens_b: Tokens used by model B
            - cost_a: Cost for model A
            - cost_b: Cost for model B
            - total_cost: Combined cost
        """
        
        try:
            # Initialize both providers
            service_a = LLMService(provider=provider_a)
            service_b = LLMService(provider=provider_b)
            
            logger.info(f"Starting dual-model evaluation: {model_a} ({provider_a}) vs {model_b} ({provider_b})")
            
            # Run both LLM calls in parallel
            result_a = service_a.evaluate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model_a,
                temperature=temperature_a,
                max_tokens=max_tokens
            )
            
            result_b = service_b.evaluate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model_b,
                temperature=temperature_b,
                max_tokens=max_tokens
            )
            
            # Combine results
            combined_result = {
                "response_a": result_a["response"],
                "response_b": result_b["response"],
                "model_a": model_a,
                "model_b": model_b,
                "provider_a": provider_a,
                "provider_b": provider_b,
                "tokens_a": result_a["tokens_used"],
                "tokens_b": result_b["tokens_used"],
                "total_tokens": result_a["tokens_used"] + result_b["tokens_used"],
                "input_tokens_a": result_a["input_tokens"],
                "output_tokens_a": result_a["output_tokens"],
                "input_tokens_b": result_b["input_tokens"],
                "output_tokens_b": result_b["output_tokens"],
                "cost_a": result_a["cost"],
                "cost_b": result_b["cost"],
                "total_cost": result_a["cost"] + result_b["cost"],
                "temperature_a": temperature_a,
                "temperature_b": temperature_b,
            }
            
            logger.info(f"Dual-model evaluation complete. Total cost: ${combined_result['total_cost']:.6f}")
            
            return combined_result
            
        except Exception as e:
            logger.error(f"Dual-model evaluation failed: {str(e)}")
            raise



    async def improve_prompt_with_deepseek(self, prompt: str, api_key: str) -> str:
        """
        Use DeepSeek to improve a prompt
        """
        import httpx
        
        improvement_prompt = f"""You are an expert prompt engineer. Improve the following prompt to make it clearer, more specific, and more effective.

Original Prompt:
{prompt}

Provide ONLY the improved prompt, nothing else."""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "user", "content": improvement_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"DeepSeek API error: {response.text}")
            
            result = response.json()
            improved = result['choices'][0]['message']['content'].strip()
            return improved
