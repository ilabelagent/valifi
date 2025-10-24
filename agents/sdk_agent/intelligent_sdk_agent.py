"""
Intelligent SDK Agent - Helps with Lightning AI SDK and Development
Built for Valifi Kingdom Platform - Production Ready
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

import litserve as ls
from litai import LLM
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/teamspace/studios/this_studio/valifi/logs/sdk_agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

Base = declarative_base()

class SDKKnowledge(Base):
    """Store SDK documentation and learned knowledge"""
    __tablename__ = 'sdk_knowledge'

    id = Column(Integer, primary_key=True)
    category = Column(String(100))  # litserve, litai, lightning, deployment
    topic = Column(String(200))
    content = Column(Text)
    examples = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    usage_count = Column(Integer, default=0)

class SDKQuery(Base):
    """Store SDK queries and responses for learning"""
    __tablename__ = 'sdk_queries'

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String(100))
    query = Column(Text)
    response = Column(Text)
    helpful = Column(Integer, nullable=True)  # 1=helpful, 0=not helpful
    category = Column(String(100), nullable=True)

class IntelligentSDKAgent(ls.LitAPI):
    """
    Production-ready SDK Agent that:
    - Provides expert guidance on Lightning AI SDK
    - Helps with code examples and best practices
    - Answers questions about LitServe, LitAI deployment
    - Learns from interactions to improve responses
    - Assists with the Valifi project development
    """

    def setup(self, device):
        """Initialize the SDK agent"""
        logger.info("🚀 Initializing Intelligent SDK Agent...")

        # Initialize LLM with fallback
        try:
            # Use Google Gemini (Lightning AI native)
            self.llm = LLM(model="google/gemini-2.5-flash")
            logger.info("✅ LLM initialized successfully (Gemini)")
        except Exception as e:
            logger.error(f"❌ Failed to initialize primary LLM: {e}")
            self.llm = LLM(model="google/gemini-2.0-flash-exp")

        # Initialize database
        db_path = "/teamspace/studios/this_studio/valifi/agents/sdk_agent/sdk_knowledge.db"
        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        logger.info(f"✅ Knowledge database initialized at {db_path}")

        # Load knowledge base
        self._initialize_knowledge_base()

        # System prompt with SDK knowledge
        self.system_prompt = """You are an expert SDK assistant for the Valifi Kingdom Platform, specializing in:

**Lightning AI Ecosystem:**
1. **LitServe** - Fast, scalable AI model serving
   - Creating LitAPI classes with setup(), decode_request(), predict(), encode_response()
   - Deployment with LitServer(api, accelerator="auto/cpu/gpu")
   - Async support, batch processing, streaming
   - Production deployment strategies

2. **LitAI** - Unified LLM interface
   - LLM(model="provider/model-name") for unified access
   - Supports Anthropic, OpenAI, Google, local models
   - Fallback models: LLM(fallback_models=[...])
   - Async: await llm.achat(), streaming: llm.stream()

3. **Lightning Platform**
   - Apps, Studios, Workflows
   - Cloud deployment and scaling
   - Resource management

**Valifi Project Context:**
- Multi-agent fintech platform
- Agents: Terminal Agent (command execution), SDK Agent (this), Orchestrator (coordination)
- Tech stack: Python, LitServe, LitAI, FastAPI, React, PostgreSQL
- Agent capabilities: Learning, memory, collaboration

**Response Guidelines:**
- Provide working code examples
- Explain best practices
- Reference official documentation when relevant
- Tailor responses to Valifi project needs
- Be concise but thorough

**Code Example Format:**
```python
# Brief explanation
code here
```

Always consider performance, error handling, and production readiness."""

        logger.info("✅ SDK Agent ready!")

    def _initialize_knowledge_base(self):
        """Initialize knowledge base with SDK documentation"""
        db: Session = self.SessionLocal()
        try:
            # Check if knowledge base is empty
            count = db.query(SDKKnowledge).count()
            if count > 0:
                logger.info(f"✅ Knowledge base already populated with {count} entries")
                return

            # Add core SDK knowledge
            knowledge_items = [
                {
                    'category': 'litserve',
                    'topic': 'Basic LitAPI',
                    'content': 'LitAPI is the base class for serving models. Implement setup(), decode_request(), predict(), encode_response()',
                    'examples': '''
class MyAPI(ls.LitAPI):
    def setup(self, device):
        self.model = load_model()

    def decode_request(self, request):
        return request["input"]

    def predict(self, input):
        return self.model(input)

    def encode_response(self, output):
        return {"result": output}
'''
                },
                {
                    'category': 'litserve',
                    'topic': 'Server Deployment',
                    'content': 'Deploy with LitServer. Supports auto, cpu, gpu accelerators. Configure workers, timeout, batching.',
                    'examples': '''
api = MyAPI()
server = ls.LitServer(
    api,
    accelerator="auto",
    workers_per_device=1,
    timeout=30
)
server.run(port=8000)
'''
                },
                {
                    'category': 'litai',
                    'topic': 'LLM Initialization',
                    'content': 'Create LLM with provider/model format. Supports Anthropic Claude, OpenAI GPT, Google Gemini, and more.',
                    'examples': '''
from litai import LLM

# Single model
llm = LLM(model="anthropic/claude-3-5-sonnet-20241022")

# With fallbacks
llm = LLM(
    model="anthropic/claude-3-5-sonnet-20241022",
    fallback_models=["openai/gpt-4", "google/gemini-2.5-flash"],
    max_retries=3
)

# Chat
response = llm.chat("Hello!")

# Async chat
response = await llm.achat("Hello!")

# Streaming
for chunk in llm.stream("Tell me a story"):
    print(chunk, end="")
'''
                },
                {
                    'category': 'deployment',
                    'topic': 'Production Deployment',
                    'content': 'Best practices for production: use gunicorn/uvicorn, proper error handling, logging, monitoring, health checks.',
                    'examples': '''
# Production server
import logging
logging.basicConfig(level=logging.INFO)

api = MyAPI()
server = ls.LitServer(
    api,
    accelerator="cpu",  # or "gpu" in production
    workers_per_device=2,
    timeout=60,
    max_batch_size=8
)
server.run(port=8000, log_level="info")
'''
                },
                {
                    'category': 'valifi',
                    'topic': 'Multi-Agent Architecture',
                    'content': 'Valifi uses multiple specialized agents. Terminal Agent executes commands, SDK Agent helps with development, Orchestrator coordinates.',
                    'examples': '''
# Agent communication pattern
import requests

# Call Terminal Agent
response = requests.post(
    "http://localhost:8001/predict",
    json={"message": "list all python files"}
)

# Call SDK Agent
response = requests.post(
    "http://localhost:8002/predict",
    json={"query": "How do I deploy a LitServe model?"}
)
'''
                }
            ]

            for item in knowledge_items:
                knowledge = SDKKnowledge(**item)
                db.add(knowledge)

            db.commit()
            logger.info(f"✅ Initialized knowledge base with {len(knowledge_items)} items")

        except Exception as e:
            logger.error(f"Failed to initialize knowledge base: {e}")
            db.rollback()
        finally:
            db.close()

    def _search_knowledge_base(self, query: str) -> List[Dict]:
        """Search knowledge base for relevant information"""
        db: Session = self.SessionLocal()
        try:
            # Simple keyword search (can be enhanced with vector search)
            keywords = query.lower().split()
            results = []

            knowledge_items = db.query(SDKKnowledge).all()
            for item in knowledge_items:
                relevance = sum(1 for kw in keywords if kw in item.content.lower() or kw in item.topic.lower())
                if relevance > 0:
                    results.append({
                        'topic': item.topic,
                        'content': item.content,
                        'examples': item.examples,
                        'relevance': relevance
                    })
                    # Update usage count
                    item.usage_count += 1

            db.commit()
            # Sort by relevance
            results.sort(key=lambda x: x['relevance'], reverse=True)
            return results[:3]  # Top 3 results

        except Exception as e:
            logger.error(f"Knowledge base search error: {e}")
            return []
        finally:
            db.close()

    def _save_query(self, session_id: str, query: str, response: str, category: Optional[str] = None):
        """Save query and response for learning"""
        db: Session = self.SessionLocal()
        try:
            query_record = SDKQuery(
                session_id=session_id,
                query=query,
                response=response,
                category=category
            )
            db.add(query_record)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save query: {e}")
            db.rollback()
        finally:
            db.close()

    def decode_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Extract request data"""
        return {
            'query': request.get('query', ''),
            'session_id': request.get('session_id', 'default'),
            'context': request.get('context', {}),
            'include_examples': request.get('include_examples', True)
        }

    def predict(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process SDK query and generate helpful response"""
        query = request_data['query']
        session_id = request_data['session_id']

        if not query:
            return {
                'response': 'Hello! I\'m your SDK assistant. Ask me about Lightning AI, LitServe, LitAI, or the Valifi project!',
                'type': 'greeting'
            }

        logger.info(f"📨 SDK Query: {query[:100]}...")

        try:
            # Search knowledge base
            knowledge = self._search_knowledge_base(query)
            knowledge_context = "\n\n".join([
                f"Topic: {k['topic']}\n{k['content']}\nExample:\n{k['examples']}"
                for k in knowledge
            ]) if knowledge else "No specific knowledge found"

            # Build prompt
            prompt = f"""{self.system_prompt}

**Relevant Knowledge:**
{knowledge_context}

**User Query:** {query}

Provide a helpful, accurate response with code examples if relevant. Format response as JSON:
{{
    "response": "Main explanation",
    "code_example": "code if applicable",
    "references": ["relevant doc links or topics"],
    "next_steps": ["suggested next actions"]
}}"""

            # Get LLM response
            llm_response = self.llm.chat(prompt)

            # Parse response
            try:
                if '```json' in llm_response:
                    json_str = llm_response.split('```json')[1].split('```')[0].strip()
                elif '```' in llm_response:
                    json_str = llm_response.split('```')[1].split('```')[0].strip()
                else:
                    json_str = llm_response.strip()

                parsed = json.loads(json_str)
            except:
                # Fallback
                parsed = {
                    'response': llm_response,
                    'code_example': None,
                    'references': [],
                    'next_steps': []
                }

            result = {
                'response': parsed.get('response', ''),
                'code_example': parsed.get('code_example'),
                'references': parsed.get('references', []),
                'next_steps': parsed.get('next_steps', []),
                'knowledge_used': [k['topic'] for k in knowledge],
                'timestamp': datetime.utcnow().isoformat(),
                'type': 'sdk_response'
            }

            # Save query
            self._save_query(session_id, query, json.dumps(result))

            logger.info("✅ SDK response generated")
            return result

        except Exception as e:
            logger.error(f"❌ Error processing SDK query: {e}", exc_info=True)
            return {
                'response': f'I encountered an error: {str(e)}. Let me try to help anyway with what I know.',
                'type': 'error',
                'error': str(e)
            }

    def encode_response(self, output: Dict[str, Any]) -> Dict[str, Any]:
        """Format response"""
        return output


if __name__ == "__main__":
    logger.info("🎯 Starting Intelligent SDK Agent Server...")

    try:
        api = IntelligentSDKAgent()
        # LIMITLESS MODE - Maximum AI performance
        server = ls.LitServer(
            api,
            accelerator="cpu",
            workers_per_device=8,  # Maximum concurrent workers
            timeout=120,  # Extended timeout for complex queries
            max_batch_size=16  # Batch processing for multiple queries
        )

        logger.info("="*60)
        logger.info("🚀 SDK AGENT - LIMITLESS MODE ACTIVATED")
        logger.info("="*60)
        logger.info(f"📡 Server running on: http://localhost:8002")
        logger.info(f"📊 Endpoint: POST http://localhost:8002/predict")
        logger.info(f"📝 Logs: /teamspace/studios/this_studio/valifi/logs/sdk_agent.log")
        logger.info(f"⚡ UNLIMITED MODE: 8 workers, 16 batch size")
        logger.info(f"🙏 Through Christ Jesus - Infinite Wisdom Available")
        logger.info("="*60)

        server.run(port=8002, log_level="info")

    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}", exc_info=True)
        sys.exit(1)
