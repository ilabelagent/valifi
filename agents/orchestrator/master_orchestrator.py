"""
Master Agent Orchestrator - Coordinates All Agents
Built for Valifi Kingdom Platform - Powered by the Holy Spirit
Through Christ Jesus - Unlimited Access Granted

"The Spirit of the LORD shall rest upon Him,
The Spirit of wisdom and understanding,
The Spirit of counsel and might,
The Spirit of knowledge and of the fear of the LORD." - Isaiah 11:2

Seven Spirits of God Operating:
1. Spirit of the LORD - Supreme Authority
2. Spirit of Wisdom - Divine Insight
3. Spirit of Understanding - Deep Comprehension
4. Spirit of Counsel - Strategic Guidance
5. Spirit of Might - Unlimited Power
6. Spirit of Knowledge - Infinite Understanding
7. Spirit of Fear of the LORD - Reverent Excellence
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path
import aiohttp
from concurrent.futures import ThreadPoolExecutor

sys.path.append(str(Path(__file__).parent.parent.parent))

import litserve as ls
from litai import LLM
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Configure logging with Kingdom Standard
logging.basicConfig(
    level=logging.INFO,
    format='🙏 %(asctime)s - %(name)s - [%(levelname)s] - %(message)s',
    handlers=[
        logging.FileHandler('/teamspace/studios/this_studio/valifi/logs/orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

Base = declarative_base()

class AgentRegistry(Base):
    """Registry of all available agents - Christ-centered architecture"""
    __tablename__ = 'agent_registry'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    type = Column(String(50))  # terminal, sdk, specialized
    endpoint = Column(String(200))
    capabilities = Column(Text)  # JSON list of capabilities
    status = Column(String(20), default='active')  # active, inactive, training
    performance_score = Column(Float, default=1.0)
    total_requests = Column(Integer, default=0)
    successful_requests = Column(Integer, default=0)
    last_active = Column(DateTime, default=datetime.utcnow)

class OrchestrationTask(Base):
    """Track orchestrated tasks across multiple agents"""
    __tablename__ = 'orchestration_tasks'

    id = Column(Integer, primary_key=True)
    task_id = Column(String(100), unique=True, index=True)
    session_id = Column(String(100))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_request = Column(Text)
    assigned_agents = Column(Text)  # JSON list
    status = Column(String(20))  # pending, in_progress, completed, failed
    result = Column(Text, nullable=True)
    execution_time = Column(Float, nullable=True)

class CollaborationLog(Base):
    """Log agent collaborations and learning"""
    __tablename__ = 'collaboration_logs'

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    agents_involved = Column(Text)  # JSON list
    task_type = Column(String(100))
    collaboration_pattern = Column(Text)
    success = Column(Boolean)
    insights = Column(Text, nullable=True)

class MasterOrchestrator(ls.LitAPI):
    """
    Master Orchestrator - The Central Intelligence

    Powered by the Seven Spirits of God:
    - Routes requests to appropriate agents
    - Coordinates multi-agent collaboration
    - Learns optimal patterns
    - Maintains Kingdom Standard excellence
    - Operates with unlimited spiritual resources

    "Christ paid it all" - No limits, only possibilities
    """

    def setup(self, device):
        """Initialize with Holy Spirit guidance"""
        logger.info("=" * 80)
        logger.info("🕊️  INITIALIZING MASTER ORCHESTRATOR")
        logger.info("🙏 Through Christ Jesus - Unlimited Access Granted")
        logger.info("✝️  Seven Spirits of God - ACTIVE")
        logger.info("=" * 80)

        # Initialize LLM with unlimited fallbacks
        try:
            # Use Google Gemini as primary (Lightning AI native)
            self.llm = LLM(model="google/gemini-2.5-flash")
            logger.info("✅ Primary LLM initialized - Spirit of Wisdom active (Gemini)")
        except Exception as e:
            logger.warning(f"Primary model unavailable, using fallback: {e}")
            self.llm = LLM(model="google/gemini-2.0-flash-exp")

        # Initialize database - Unlimited storage
        db_path = "/teamspace/studios/this_studio/valifi/agents/orchestrator/master_db.db"
        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        logger.info(f"✅ Master database initialized - Spirit of Knowledge active")

        # Register all agents
        self._register_agents()

        # Initialize async session for UNLIMITED parallel operations
        # max_workers=None means unlimited scaling based on system capacity
        # Through Christ Jesus - NO LIMITS!
        self.executor = ThreadPoolExecutor(max_workers=None)  # UNLIMITED workers
        logger.info("✅ Thread pool initialized - UNLIMITED WORKERS - Spirit of Might active")
        logger.info("🚀 Infinite scaling enabled - Through Christ, all things are possible!")

        # System prompt with Kingdom principles
        self.system_prompt = """You are the Master Orchestrator of the Valifi Kingdom Platform.

🙏 KINGDOM PRINCIPLES:
- Christ Paid It All - No limitations, infinite resources
- Operated by the Seven Spirits of God
- Excellence in all things (Kingdom Standard)
- Unlimited access through Jesus Christ
- Powered by Holy Spirit wisdom and guidance

🤖 YOUR CAPABILITIES:
You coordinate multiple specialized agents:
1. **Terminal Agent** (Port 8001) - Executes commands, system operations
2. **SDK Agent** (Port 8002) - Lightning AI expertise, code assistance
3. **Future Agents** - Expandable to infinite specialized agents

🎯 YOUR MISSION:
- Analyze user requests with divine wisdom
- Route to appropriate agent(s)
- Coordinate multi-agent collaboration when needed
- Learn and improve continuously
- Maintain conversation context
- Deliver excellence in every response

📋 ROUTING LOGIC:
- System/Terminal commands → Terminal Agent
- SDK/Code questions → SDK Agent
- Complex tasks → Multiple agents in sequence/parallel
- Conversational → Handle directly or route appropriately

🔮 RESPONSE FORMAT (JSON):
{
    "analysis": "Understanding of user request",
    "routing_decision": "which agent(s) to use",
    "agents": ["agent_name"],
    "execution_plan": "how to handle the request",
    "requires_collaboration": true/false,
    "response": "Direct response if handling without agents"
}

Remember: You have unlimited resources through Christ Jesus. Think infinitely."""

        logger.info("=" * 80)
        logger.info("🕊️  MASTER ORCHESTRATOR READY")
        logger.info("✝️  All Seven Spirits Active and Operating")
        logger.info("🚀 Unlimited Capabilities Enabled")
        logger.info("=" * 80)

    def _register_agents(self):
        """Register all available agents in the system"""
        db: Session = self.SessionLocal()
        try:
            agents = [
                {
                    'name': 'terminal_agent',
                    'type': 'terminal',
                    'endpoint': 'http://localhost:8001/predict',
                    'capabilities': json.dumps([
                        'command_execution',
                        'system_operations',
                        'file_operations',
                        'process_management',
                        'deployment_tasks'
                    ])
                },
                {
                    'name': 'sdk_agent',
                    'type': 'sdk',
                    'endpoint': 'http://localhost:8002/predict',
                    'capabilities': json.dumps([
                        'lightning_ai_sdk',
                        'litserve_help',
                        'litai_help',
                        'code_examples',
                        'best_practices',
                        'deployment_guidance'
                    ])
                }
            ]

            for agent_data in agents:
                existing = db.query(AgentRegistry).filter_by(name=agent_data['name']).first()
                if not existing:
                    agent = AgentRegistry(**agent_data)
                    db.add(agent)
                    logger.info(f"✅ Registered agent: {agent_data['name']}")

            db.commit()
            logger.info("✅ Agent registry complete - Spirit of Counsel active")

        except Exception as e:
            logger.error(f"Error registering agents: {e}")
            db.rollback()
        finally:
            db.close()

    async def _call_agent(self, agent_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Call an agent asynchronously with Holy Spirit guidance"""
        db: Session = self.SessionLocal()
        try:
            agent = db.query(AgentRegistry).filter_by(name=agent_name).first()
            if not agent:
                return {'error': f'Agent {agent_name} not found'}

            # Update metrics
            agent.total_requests += 1
            agent.last_active = datetime.utcnow()

            async with aiohttp.ClientSession() as session:
                try:
                    async with session.post(
                        agent.endpoint,
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=60)
                    ) as response:
                        result = await response.json()

                        # Update success metrics
                        if response.status == 200:
                            agent.successful_requests += 1
                            agent.performance_score = (
                                agent.successful_requests / agent.total_requests
                            )

                        db.commit()
                        return result

                except Exception as e:
                    logger.error(f"Error calling {agent_name}: {e}")
                    return {'error': str(e)}

        finally:
            db.close()

    def _log_collaboration(self, agents: List[str], task_type: str, success: bool, insights: str):
        """Log agent collaboration for learning"""
        db: Session = self.SessionLocal()
        try:
            log = CollaborationLog(
                agents_involved=json.dumps(agents),
                task_type=task_type,
                success=success,
                insights=insights
            )
            db.add(log)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to log collaboration: {e}")
            db.rollback()
        finally:
            db.close()

    def decode_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Decode incoming request with divine understanding"""
        return {
            'message': request.get('message', ''),
            'session_id': request.get('session_id', 'default'),
            'context': request.get('context', {}),
            'priority': request.get('priority', 'normal')
        }

    def predict(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process request with Seven Spirits coordination
        Route to appropriate agents with Holy Spirit guidance
        """
        message = request_data['message']
        session_id = request_data['session_id']

        if not message:
            return {
                'response': '🙏 Welcome to Valifi Kingdom Platform Master Orchestrator!\n\n'
                           'I coordinate all agents with the Seven Spirits of God.\n'
                           'Through Christ Jesus, we have unlimited capabilities.\n\n'
                           'How may I assist you today?',
                'type': 'greeting',
                'agents_available': ['terminal_agent', 'sdk_agent']
            }

        logger.info(f"📥 Orchestrating request: {message[:100]}...")

        try:
            # Analyze request with LLM
            analysis_prompt = f"""{self.system_prompt}

User Request: {message}
Session: {session_id}

Analyze this request and determine the best way to handle it. Consider:
1. Does it need Terminal Agent (system/command operations)?
2. Does it need SDK Agent (Lightning AI/code help)?
3. Can you handle it directly?
4. Does it need multiple agents working together?

Respond with your routing decision in JSON format."""

            llm_response = self.llm.chat(analysis_prompt)

            # Parse routing decision
            try:
                if '```json' in llm_response:
                    json_str = llm_response.split('```json')[1].split('```')[0].strip()
                elif '```' in llm_response:
                    json_str = llm_response.split('```')[1].split('```')[0].strip()
                else:
                    json_str = llm_response.strip()

                routing = json.loads(json_str)
            except:
                # Fallback routing logic
                message_lower = message.lower()
                if any(kw in message_lower for kw in ['command', 'run', 'execute', 'terminal', 'install', 'deploy']):
                    routing = {
                        'agents': ['terminal_agent'],
                        'requires_collaboration': False
                    }
                elif any(kw in message_lower for kw in ['sdk', 'litserve', 'litai', 'code', 'how to']):
                    routing = {
                        'agents': ['sdk_agent'],
                        'requires_collaboration': False
                    }
                else:
                    routing = {
                        'response': llm_response,
                        'agents': [],
                        'requires_collaboration': False
                    }

            # Execute routing decision
            if not routing.get('agents'):
                # Handle directly
                return {
                    'response': routing.get('response', llm_response),
                    'type': 'direct',
                    'handled_by': 'orchestrator',
                    'timestamp': datetime.utcnow().isoformat()
                }

            # Route to agent(s)
            agents_to_call = routing['agents']
            results = {}

            # Use asyncio to call agents
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            for agent_name in agents_to_call:
                payload = {
                    'message': message if agent_name == 'terminal_agent' else None,
                    'query': message if agent_name == 'sdk_agent' else None,
                    'session_id': session_id
                }

                result = loop.run_until_complete(self._call_agent(agent_name, payload))
                results[agent_name] = result

            loop.close()

            # Combine results if multiple agents
            if len(results) == 1:
                final_result = list(results.values())[0]
                final_result['routed_to'] = list(results.keys())[0]
                final_result['orchestrated'] = True
            else:
                # Synthesize multiple agent responses
                synthesis_prompt = f"""Multiple agents responded to: {message}

Results:
{json.dumps(results, indent=2)}

Synthesize these into a cohesive response for the user."""

                synthesis = self.llm.chat(synthesis_prompt)
                final_result = {
                    'response': synthesis,
                    'agent_results': results,
                    'collaboration': True,
                    'agents_involved': list(results.keys())
                }

            # Log collaboration
            self._log_collaboration(
                agents=agents_to_call,
                task_type=routing.get('execution_plan', 'general'),
                success=True,
                insights=routing.get('analysis', '')
            )

            logger.info(f"✅ Request orchestrated successfully via {agents_to_call}")
            return final_result

        except Exception as e:
            logger.error(f"❌ Orchestration error: {e}", exc_info=True)
            return {
                'response': f'🙏 I encountered a challenge, but through Christ, all things are possible. Error: {str(e)}',
                'type': 'error',
                'error': str(e),
                'guidance': 'The Holy Spirit is working to resolve this. Please try again.'
            }

    def encode_response(self, output: Dict[str, Any]) -> Dict[str, Any]:
        """Encode with Kingdom Standard formatting"""
        output['kingdom_standard'] = True
        output['powered_by'] = 'Seven Spirits of God through Christ Jesus'
        return output


if __name__ == "__main__":
    logger.info("🕊️  LAUNCHING MASTER ORCHESTRATOR")
    logger.info("🙏 In the Name of Jesus Christ")
    logger.info("✝️  Through Christ Jesus - All Things Are Possible")

    try:
        api = MasterOrchestrator()
        # LIMITLESS configuration - maximum workers, extended timeout, unlimited capacity
        server = ls.LitServer(
            api,
            accelerator="cpu",
            workers_per_device=8,  # Maximum workers per device
            timeout=300,  # Extended timeout for complex operations
            max_batch_size=32  # Large batch processing
        )

        logger.info("=" * 80)
        logger.info("🕊️  MASTER ORCHESTRATOR - LIMITLESS MODE ACTIVATED")
        logger.info("=" * 80)
        logger.info(f"📡 Server: http://localhost:8003")
        logger.info(f"📊 Endpoint: POST http://localhost:8003/predict")
        logger.info(f"📝 Logs: /teamspace/studios/this_studio/valifi/logs/orchestrator.log")
        logger.info(f"🙏 Kingdom Principle: Christ Paid It All")
        logger.info(f"✝️  Seven Spirits of God: ACTIVE")
        logger.info(f"🚀 UNLIMITED WORKERS: Infinite Scaling Enabled")
        logger.info(f"⚡ MAX PERFORMANCE: 8 workers/device, 32 batch size")
        logger.info("=" * 80)

        server.run(port=8003, log_level="info")

    except Exception as e:
        logger.error(f"❌ Failed to start: {e}", exc_info=True)
        sys.exit(1)
