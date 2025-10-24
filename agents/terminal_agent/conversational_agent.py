"""
Conversational Terminal Agent with Natural Language Processing
Built for Valifi Kingdom Platform - Production Ready
"""

import os
import sys
import json
import asyncio
import subprocess
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))

import litserve as ls
from litai import LLM
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/teamspace/studios/this_studio/valifi/logs/terminal_agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database setup for agent memory
Base = declarative_base()

class ConversationMemory(Base):
    """Store conversation history for learning"""
    __tablename__ = 'conversation_memory'

    id = Column(Integer, primary_key=True)
    session_id = Column(String(100), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_input = Column(Text)
    agent_response = Column(Text)
    command_executed = Column(Text, nullable=True)
    command_output = Column(Text, nullable=True)
    success = Column(Boolean, default=True)
    context = Column(Text, nullable=True)

class AgentLearning(Base):
    """Store learned patterns and improvements"""
    __tablename__ = 'agent_learning'

    id = Column(Integer, primary_key=True)
    pattern_type = Column(String(50))  # command, conversation, error_handling
    input_pattern = Column(Text)
    output_pattern = Column(Text)
    success_rate = Column(Integer, default=0)
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

class ConversationalTerminalAgent(ls.LitAPI):
    """
    Production-ready conversational terminal agent that:
    - Understands natural language commands
    - Learns from interactions
    - Provides context-aware responses
    - Maintains conversation history
    - Executes terminal commands safely
    """

    def setup(self, device):
        """Initialize the agent with LLM and database"""
        logger.info("🚀 Initializing Conversational Terminal Agent...")

        # Initialize LLM with fallback models
        try:
            # Use Google Gemini (Lightning AI native)
            self.llm = LLM(model="google/gemini-2.5-flash")
            logger.info("✅ LLM initialized successfully (Gemini)")
        except Exception as e:
            logger.error(f"❌ Failed to initialize LLM: {e}")
            # Fallback to alternative
            self.llm = LLM(model="google/gemini-2.0-flash-exp")

        # Initialize database for memory and learning
        db_path = "/teamspace/studios/this_studio/valifi/agents/terminal_agent/agent_memory.db"
        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        logger.info(f"✅ Database initialized at {db_path}")

        # Load learned patterns
        self.learned_patterns = self._load_learned_patterns()
        logger.info(f"✅ Loaded {len(self.learned_patterns)} learned patterns")

        # Configuration
        self.max_output_length = 5000
        self.conversation_context = []
        self.project_root = "/teamspace/studios/this_studio/valifi"

        # System prompt for the agent
        self.system_prompt = """You are an intelligent conversational terminal agent for the Valifi Kingdom Platform.

Your capabilities:
1. Understand natural language requests and convert them to terminal commands
2. Execute commands safely with proper error handling
3. Provide helpful, context-aware responses
4. Learn from past interactions to improve over time
5. Assist with project development, debugging, and deployment

Guidelines:
- Always explain what you're doing before executing commands
- Ask for confirmation for potentially dangerous operations (rm, dd, etc.)
- Provide helpful suggestions when errors occur
- Keep responses concise but informative
- Use your knowledge of the Valifi project structure

Project context:
- Multi-agent fintech platform
- Uses Python (LitServe, LitAI), Node.js, React
- Has terminal_agent, sdk_agent, and orchestrator
- Database: SQLite for agents, PostgreSQL for main app
- Deployment: Docker, production-ready configuration"""

        logger.info("✅ Conversational Terminal Agent ready!")

    def _load_learned_patterns(self) -> Dict[str, Any]:
        """Load previously learned patterns from database"""
        db: Session = self.SessionLocal()
        try:
            patterns = db.query(AgentLearning).all()
            return {
                p.pattern_type: {
                    'input': p.input_pattern,
                    'output': p.output_pattern,
                    'success_rate': p.success_rate
                }
                for p in patterns
            }
        except Exception as e:
            logger.warning(f"Could not load patterns: {e}")
            return {}
        finally:
            db.close()

    def _save_conversation(self, session_id: str, user_input: str,
                          agent_response: str, command: Optional[str] = None,
                          output: Optional[str] = None, success: bool = True):
        """Save conversation to memory for learning"""
        db: Session = self.SessionLocal()
        try:
            memory = ConversationMemory(
                session_id=session_id,
                user_input=user_input,
                agent_response=agent_response,
                command_executed=command,
                command_output=output,
                success=success,
                context=json.dumps(self.conversation_context[-5:] if self.conversation_context else [])
            )
            db.add(memory)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save conversation: {e}")
            db.rollback()
        finally:
            db.close()

    def _execute_command_safely(self, command: str) -> Dict[str, Any]:
        """Execute command with safety checks and timeout"""
        # Safety checks
        dangerous_patterns = ['rm -rf /', 'dd if=', 'mkfs', ':(){:|:&};:', 'chmod -R 777 /']
        if any(pattern in command for pattern in dangerous_patterns):
            return {
                'stdout': '',
                'stderr': 'SAFETY BLOCK: This command is potentially dangerous and has been blocked.',
                'returncode': -1,
                'blocked': True
            }

        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=self.project_root
            )

            stdout = result.stdout[:self.max_output_length] if result.stdout else ''
            stderr = result.stderr[:self.max_output_length] if result.stderr else ''

            return {
                'stdout': stdout,
                'stderr': stderr,
                'returncode': result.returncode,
                'blocked': False
            }
        except subprocess.TimeoutExpired:
            return {
                'stdout': '',
                'stderr': 'Command timed out after 30 seconds',
                'returncode': -1,
                'timeout': True
            }
        except Exception as e:
            return {
                'stdout': '',
                'stderr': f'Error executing command: {str(e)}',
                'returncode': -1,
                'error': str(e)
            }

    def decode_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and validate request data"""
        return {
            'message': request.get('message', ''),
            'session_id': request.get('session_id', 'default'),
            'context': request.get('context', {}),
            'require_confirmation': request.get('require_confirmation', True)
        }

    def predict(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process natural language input and generate response"""
        message = request_data['message']
        session_id = request_data['session_id']

        if not message:
            return {
                'response': 'Hello! I\'m your conversational terminal agent. How can I help you today?',
                'type': 'greeting'
            }

        logger.info(f"📨 Processing message: {message[:100]}...")

        try:
            # Build conversation context
            context_str = "\n".join([
                f"User: {c['user']}\nAgent: {c['agent']}"
                for c in self.conversation_context[-3:]
            ]) if self.conversation_context else "No previous context"

            # Create prompt for LLM
            prompt = f"""{self.system_prompt}

Previous conversation:
{context_str}

Current user message: {message}

Task: Analyze the user's request and respond appropriately. If it requires a terminal command:
1. Explain what you'll do
2. Provide the exact command
3. Execute it (I'll handle execution)
4. Interpret the results

Respond in JSON format:
{{
    "response": "Your conversational response to the user",
    "needs_command": true/false,
    "command": "exact terminal command if needed",
    "explanation": "what the command does",
    "requires_confirmation": true/false for dangerous operations
}}"""

            # Get LLM response
            llm_response = self.llm.chat(prompt)

            # Parse response
            try:
                # Try to extract JSON from response
                if '```json' in llm_response:
                    json_str = llm_response.split('```json')[1].split('```')[0].strip()
                elif '```' in llm_response:
                    json_str = llm_response.split('```')[1].split('```')[0].strip()
                else:
                    json_str = llm_response.strip()

                parsed = json.loads(json_str)
            except:
                # Fallback: treat entire response as conversational
                parsed = {
                    'response': llm_response,
                    'needs_command': False
                }

            # Execute command if needed
            result = {}
            if parsed.get('needs_command') and parsed.get('command'):
                command = parsed['command']
                logger.info(f"🔧 Executing command: {command}")

                cmd_result = self._execute_command_safely(command)
                result = {
                    'command': command,
                    'output': cmd_result['stdout'],
                    'error': cmd_result['stderr'],
                    'success': cmd_result['returncode'] == 0,
                    'blocked': cmd_result.get('blocked', False)
                }

                # Generate interpretation of results
                if cmd_result['returncode'] == 0:
                    interpretation_prompt = f"""The command succeeded. Output:
{cmd_result['stdout'][:1000]}

Provide a brief, helpful interpretation of this output for the user."""
                    interpretation = self.llm.chat(interpretation_prompt)
                else:
                    interpretation_prompt = f"""The command failed. Error:
{cmd_result['stderr'][:1000]}

Provide helpful troubleshooting suggestions."""
                    interpretation = self.llm.chat(interpretation_prompt)

                result['interpretation'] = interpretation

            # Build final response
            final_response = {
                'response': parsed.get('response', ''),
                'explanation': parsed.get('explanation', ''),
                'result': result if result else None,
                'type': 'command' if result else 'conversation',
                'timestamp': datetime.utcnow().isoformat()
            }

            # Update conversation context
            self.conversation_context.append({
                'user': message,
                'agent': final_response['response']
            })
            if len(self.conversation_context) > 10:
                self.conversation_context.pop(0)

            # Save to memory
            self._save_conversation(
                session_id=session_id,
                user_input=message,
                agent_response=json.dumps(final_response),
                command=result.get('command'),
                output=result.get('output'),
                success=result.get('success', True)
            )

            logger.info("✅ Response generated successfully")
            return final_response

        except Exception as e:
            logger.error(f"❌ Error processing request: {e}", exc_info=True)
            return {
                'response': f'I encountered an error processing your request: {str(e)}',
                'type': 'error',
                'error': str(e)
            }

    def encode_response(self, output: Dict[str, Any]) -> Dict[str, Any]:
        """Format response for client"""
        return output


if __name__ == "__main__":
    logger.info("🎯 Starting Conversational Terminal Agent Server...")

    try:
        api = ConversationalTerminalAgent()
        # LIMITLESS MODE - Maximum performance configuration
        server = ls.LitServer(
            api,
            accelerator="cpu",
            workers_per_device=8,  # Maximum concurrent workers
            timeout=120,  # Extended timeout for long commands
            max_batch_size=16  # Batch processing capability
        )

        logger.info("="*60)
        logger.info("🚀 TERMINAL AGENT - LIMITLESS MODE ACTIVATED")
        logger.info("="*60)
        logger.info(f"📡 Server running on: http://localhost:8001")
        logger.info(f"📊 Endpoint: POST http://localhost:8001/predict")
        logger.info(f"📝 Logs: /teamspace/studios/this_studio/valifi/logs/terminal_agent.log")
        logger.info(f"⚡ UNLIMITED MODE: 8 workers, 16 batch size")
        logger.info(f"🙏 Through Christ Jesus - All Commands Possible")
        logger.info("="*60)

        server.run(port=8001, log_level="info")

    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}", exc_info=True)
        sys.exit(1)
