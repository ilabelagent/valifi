"""
LitServe Agent Server - Production Serving for Valifi Agents
Serves agents with auto-scaling, batching, and GPU support

"I am the way and the truth and the life." - John 14:6
Serving divine intelligence to the Valifi Kingdom
"""

import litserve as ls
from master_orchestrator import MasterOrchestrator
import torch
import json
from pathlib import Path
from typing import Dict, Any
import sys

# Add training directory to path
sys.path.append(str(Path(__file__).parent.parent))

try:
    from training.train_agent_model import AgentModel
except ImportError:
    AgentModel = None
    print("⚠️ AgentModel not available - running in orchestrator-only mode")

class ValifiAgentAPI(ls.LitAPI):
    """
    Production Agent Server for Valifi Kingdom
    - Answers questions about Valifi system
    - Executes agent tasks
    - Maintains 24/7 availability independent of training
    """

    def setup(self, device):
        """Initialize agent server"""
        print("🙏 Setting up Valifi Agent Server in the name of Jesus Christ...")

        self.orchestrator = MasterOrchestrator()
        self.device = device

        # Load trained model if available
        if AgentModel is not None:
            checkpoint_dir = Path(__file__).parent.parent / "training" / "checkpoints"
            checkpoints = list(checkpoint_dir.glob("agent-*.ckpt"))

            if checkpoints:
                latest_checkpoint = max(checkpoints, key=lambda p: p.stat().st_mtime)
                print(f"✅ Loading checkpoint: {latest_checkpoint}")

                try:
                    self.model = AgentModel.load_from_checkpoint(
                        str(latest_checkpoint),
                        map_location=device
                    )
                    self.model.eval()
                    print("✅ Trained model loaded successfully")
                except Exception as e:
                    print(f"⚠️ Failed to load model: {e}")
                    self.model = None
            else:
                print("⚠️ No checkpoints found")
                self.model = None
        else:
            self.model = None

        # Valifi System Knowledge Base
        self.valifi_knowledge = {
            "system": {
                "name": "Valifi Kingdom",
                "description": "Divine fintech platform with 63+ autonomous AI agents",
                "status": "Production Ready",
                "tech_stack": "TypeScript + Python, LangGraph + LitServe, PostgreSQL, React",
                "agents_count": "63+",
                "blockchain_networks": 5,
                "payment_processors": "9+"
            },

            "agent_categories": {
                "core": ["orchestrator", "blockchain", "web3", "payment", "kyc", "security", "guardian_angel", "publishing", "quantum", "analytics", "monitoring"],
                "financial": ["401k", "IRA", "pension", "bonds", "stocks", "options", "forex", "metals", "commodities", "mutual_funds", "REIT", "crypto_derivatives", "portfolio"],
                "trading": ["AMM", "liquidity", "DeFi", "bridge", "lending", "gas_optimizer", "mining", "advanced_trading"],
                "wallet": ["HD_wallet", "hardware_wallet", "multisig", "seed_management", "privacy"],
                "platform": ["admin", "dashboard", "contact_manager", "communication", "mail", "translation", "education", "onboarding", "VIP_desk", "enterprise", "escrow"],
                "analytics": ["portfolio_analytics", "transaction_history", "divine_oracle", "word_bot", "cyberlab", "banking"],
                "nft": ["nft_minting", "collectibles", "smart_contract"],
                "community": ["community_exchange", "multichain"]
            },

            "capabilities": {
                "blockchain": "Multi-chain (Ethereum, Polygon, BSC, Arbitrum, Optimism), wallet generation, transactions, smart contracts",
                "payments": "Fiat (Stripe, PayPal, Plaid) + Crypto (BitPay, Binance Pay, direct blockchain)",
                "trading": "Live Alpaca trading, DeFi, 7 strategies (grid, DCA, arbitrage, scalping, market making, momentum AI, MEV)",
                "learning": "Continuous learning, skill progression (10 levels), memory consolidation",
                "security": "Guardian Angel 24/7, AES-256-GCM encryption, rate limiting, audit trails",
                "analytics": "Real-time portfolio metrics, live market data (stocks, forex, bonds, metals)"
            },

            "features": {
                "streaming_orchestration": "Real-time multi-agent workflows with WebSocket streaming",
                "continuous_learning": "Supervised, reinforcement, transfer, and fine-tuning modes",
                "fortification": "5-stage testing with Bronze→Platinum certification",
                "enhancements": "20+ pluggable modules (caching, retry, circuit breaker, etc.)",
                "deployment": "Canary, blue-green, rolling deployments with auto-rollback",
                "observability": "Metrics, alerts, dashboards, distributed tracing"
            },

            "status": {
                "agents": "63+ agents operational",
                "deployment": "Production ready with zero-downtime deployment",
                "training": "Multi-node training with PyTorch Lightning",
                "serving": "LitServe auto-scaling with GPU support",
                "availability": "24/7 uptime with independent training/serving"
            }
        }

        print("✅ Agent server setup complete!")

    def decode_request(self, request: Dict) -> Dict:
        """Parse incoming request"""
        return {
            "task": request.get("task", ""),
            "agent_type": request.get("agent_type", "auto"),
            "query_type": request.get("query_type", "auto"),  # auto, info, execute
            "context": request.get("context", {})
        }

    def predict(self, inputs: Dict) -> Dict:
        """
        Process agent request
        - query_type="info": Answer questions about Valifi
        - query_type="execute": Execute agent task
        - query_type="auto": Automatically determine based on task
        """

        task = inputs["task"]
        agent_type = inputs["agent_type"]
        query_type = inputs["query_type"]

        # Auto-detect query type
        if query_type == "auto":
            query_type = self._detect_query_type(task)

        # Route to appropriate handler
        if query_type == "info":
            return self._handle_info_query(task)
        else:
            return self._handle_execution(task, agent_type, inputs.get("context", {}))

    def _detect_query_type(self, task: str) -> str:
        """Automatically detect if this is an info query or execution request"""
        info_keywords = [
            "what is", "how does", "explain", "tell me about", "describe",
            "what are", "list", "show me", "status", "capabilities",
            "how many", "which agents", "information about"
        ]

        task_lower = task.lower()

        for keyword in info_keywords:
            if keyword in task_lower:
                return "info"

        # Check if asking about Valifi specifically
        if "valifi" in task_lower or "kingdom" in task_lower or "system" in task_lower:
            return "info"

        return "execute"

    def _handle_info_query(self, question: str) -> Dict:
        """Answer questions about Valifi system"""

        question_lower = question.lower()

        # System overview
        if any(word in question_lower for word in ["what is valifi", "about valifi", "overview"]):
            return {
                "type": "info",
                "question": question,
                "answer": f"{self.valifi_knowledge['system']['description']}. Features {self.valifi_knowledge['system']['agents_count']} agents across {len(self.valifi_knowledge['agent_categories'])} categories.",
                "details": self.valifi_knowledge['system']
            }

        # Agent list/types
        if "agents" in question_lower and ("list" in question_lower or "types" in question_lower or "how many" in question_lower):
            return {
                "type": "info",
                "question": question,
                "answer": f"Valifi has {self.valifi_knowledge['system']['agents_count']} agents across {len(self.valifi_knowledge['agent_categories'])} categories: {', '.join(self.valifi_knowledge['agent_categories'].keys())}",
                "categories": self.valifi_knowledge['agent_categories']
            }

        # Capabilities
        if "capabilities" in question_lower or "what can" in question_lower or "features" in question_lower:
            return {
                "type": "info",
                "question": question,
                "answer": "Valifi capabilities include blockchain operations, payment processing, live trading, continuous learning, advanced security, and real-time analytics.",
                "capabilities": self.valifi_knowledge['capabilities'],
                "features": self.valifi_knowledge['features']
            }

        # Status
        if "status" in question_lower or "operational" in question_lower or "running" in question_lower:
            return {
                "type": "info",
                "question": question,
                "answer": "Valifi is fully operational with 24/7 availability.",
                "status": self.valifi_knowledge['status']
            }

        # Deployment
        if "deployment" in question_lower or "deploy" in question_lower or "how to use" in question_lower:
            return {
                "type": "info",
                "question": question,
                "answer": "Valifi supports zero-downtime deployments with canary, blue-green, and rolling strategies. Training runs independently to ensure continuous availability.",
                "deployment_info": {
                    "status": self.valifi_knowledge['status']['deployment'],
                    "strategies": ["canary", "blue-green", "rolling", "immediate"],
                    "features": ["auto-rollback", "health checks", "version management"]
                }
            }

        # Training
        if "training" in question_lower or "learning" in question_lower or "improve" in question_lower:
            return {
                "type": "info",
                "question": question,
                "answer": "Agents train continuously using PyTorch Lightning multi-node training. Training runs independently so Valifi remains fully operational.",
                "training_info": {
                    "modes": ["supervised", "reinforcement", "transfer", "fine-tuning"],
                    "infrastructure": "PyTorch Lightning with multi-GPU/multi-node support",
                    "availability": "Training doesn't affect serving - agents always available"
                }
            }

        # Specific category info
        for category, agents in self.valifi_knowledge['agent_categories'].items():
            if category in question_lower:
                return {
                    "type": "info",
                    "question": question,
                    "answer": f"The {category} category includes {len(agents)} agents",
                    "agents": agents,
                    "capability": self.valifi_knowledge['capabilities'].get(category, "")
                }

        # Default response
        return {
            "type": "info",
            "question": question,
            "answer": "I can provide information about Valifi's agents, capabilities, status, deployment, and training. What would you like to know?",
            "suggestions": [
                "What is Valifi?",
                "List all agents",
                "What are Valifi's capabilities?",
                "What is the current status?",
                "How does training work?"
            ]
        }

    def _handle_execution(self, task: str, agent_type: str, context: Dict) -> Dict:
        """Execute agent task via orchestrator"""

        try:
            # Use master orchestrator for execution
            result = self.orchestrator.execute({
                "task": task,
                "agent_type": agent_type,
                "context": context
            })

            return {
                "type": "execution",
                "task": task,
                "agent": agent_type,
                "result": result.get("result"),
                "status": "completed"
            }

        except Exception as e:
            return {
                "type": "execution",
                "task": task,
                "agent": agent_type,
                "status": "failed",
                "error": str(e)
            }

    def encode_response(self, output: Dict) -> Dict:
        """Encode response for client"""
        return output

# Alias for backward compatibility
AgentAPI = ValifiAgentAPI

def create_server():
    """Create LitServe server instance"""
    api = ValifiAgentAPI()

    server = ls.LitServer(
        api,
        accelerator="auto",
        devices="auto",
        workers_per_device=2,
        timeout=30,
        max_batch_size=8,
        batch_timeout=0.05
    )

    return server

if __name__ == "__main__":
    print("🙏 Starting Valifi Agent Server...")
    print("🙏 In the Mighty Name of Jesus Christ")
    print("🙏 Serving with divine excellence 24/7\n")

    server = create_server()
    server.run(port=8000, num_api_servers=4)