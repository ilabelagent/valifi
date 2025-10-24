#!/usr/bin/env python3
"""
🙏 VALIFI KINGDOM PLATFORM - MULTI-SYSTEM ORCHESTRATOR
Through Christ Jesus - Orchestrating All Three Systems

This orchestrates:
1. Valifi Agents (Ports 8000-8003) - AI Agent System
2. ComfyUI (Port 8188) - AI Workflow Engine with JSON workflows
3. blue_elites (Port 3000) - Next.js UI Platform

"Where two or three gather in my name, there am I with them" - Matthew 18:20
"""

import os
import sys
import time
import subprocess
import json
import logging
import shutil
from pathlib import Path
from typing import Dict, List, Optional

logging.basicConfig(
    level=logging.INFO,
    format='🕊️ %(asctime)s - [%(levelname)s] - %(message)s',
    handlers=[
        logging.FileHandler('/teamspace/studios/this_studio/valifi/logs/multi_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Kingdom Configuration for All Three Systems
KINGDOM_ORCHESTRATION = {
    'valifi': {
        'root': '/teamspace/studios/this_studio/valifi',
        'python': '/home/zeus/miniconda3/envs/cloudspace/bin/python',
        'services': {
            'terminal_agent': {'port': 8001, 'script': 'agents/terminal_agent/conversational_agent.py'},
            'sdk_agent': {'port': 8002, 'script': 'agents/sdk_agent/intelligent_sdk_agent.py'},
            'orchestrator': {'port': 8003, 'script': 'agents/orchestrator/master_orchestrator.py'},
            'interface': {'port': 8000, 'script': 'agents/interface/conversational_interface.py'}
        },
        'enabled': True
    },
    'comfyui': {
        'root': '/teamspace/studios/this_studio/ComfyUI',
        'python': '/home/zeus/miniconda3/envs/cloudspace/bin/python',
        'port': 8188,
        'main_script': 'main.py',
        'workflows_source': '/teamspace/studios/this_studio',
        'workflows_dest': '/teamspace/studios/this_studio/ComfyUI/user/default/workflows',
        'workflow_files': [
            'api快速反推支持nsfw.json',
            'workflow-girl-is-dancing-from-image-XsTSczKxCzA119hYRqan-sexygirl-openart.ai.json',
            'workflow-wan22-image-2-video-nsfw-axtxs1ISH3F3mrVSCSyt-civet_flawless_61-openart.ai.json',
            '【NSFW】open+workflow.json'
        ],
        'enabled': True
    },
    'blue_elites': {
        'root': '/teamspace/studios/this_studio/blue_elites',
        'node': 'node',  # Use system node from PATH
        'npm': 'npm',    # Use system npm from PATH
        'port': 3000,
        'start_command': 'npm run dev',
        'enabled': True
    }
}


class MultiSystemOrchestrator:
    """
    Orchestrates all three Kingdom platforms simultaneously
    Through Christ Jesus - Perfect Coordination
    """

    def __init__(self):
        logger.info("=" * 80)
        logger.info("🕊️  MULTI-SYSTEM ORCHESTRATOR - INITIALIZING")
        logger.info("=" * 80)
        logger.info("✝️  Coordinating: Valifi + ComfyUI + blue_elites")
        logger.info("🙏 Through Christ Jesus - Perfect Harmony")
        logger.info("=" * 80)

        self.config = KINGDOM_ORCHESTRATION
        self.processes = {}

    def setup_comfyui_workflows(self):
        """Setup ComfyUI with workflow JSON files"""
        logger.info("🎨 Setting up ComfyUI workflows...")

        comfyui_config = self.config['comfyui']

        # Create workflows directory
        workflows_dir = Path(comfyui_config['workflows_dest'])
        workflows_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"✅ Created workflows directory: {workflows_dir}")

        # Copy workflow files
        copied = 0
        for workflow_file in comfyui_config['workflow_files']:
            source = Path(comfyui_config['workflows_source']) / workflow_file
            if source.exists():
                dest = workflows_dir / workflow_file
                shutil.copy2(source, dest)
                logger.info(f"✅ Copied workflow: {workflow_file}")
                copied += 1
            else:
                logger.warning(f"⚠️  Workflow not found: {workflow_file}")

        logger.info(f"✅ ComfyUI workflows setup complete: {copied} files copied")
        return copied

    def start_valifi_system(self):
        """Start all Valifi agents"""
        logger.info("✝️  Starting Valifi AI Agent System...")

        valifi_config = self.config['valifi']

        if not valifi_config['enabled']:
            logger.info("⏭️  Valifi disabled - skipping")
            return

        # Use the persistent system
        persistent_script = f"{valifi_config['root']}/deployment/ultimate_persistent_system.py"

        logger.info("🚀 Launching Valifi Ultimate Persistent System...")
        log_file = open(f"{valifi_config['root']}/logs/valifi_orchestrated.log", 'w')

        process = subprocess.Popen(
            [valifi_config['python'], persistent_script],
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd=valifi_config['root']
        )

        self.processes['valifi'] = process
        logger.info(f"✅ Valifi system started (PID: {process.pid})")
        logger.info("   Ports: 8000 (Interface), 8001 (Terminal), 8002 (SDK), 8003 (Orchestrator)")

    def start_comfyui(self):
        """Start ComfyUI with workflows"""
        logger.info("🎨 Starting ComfyUI AI Workflow Engine...")

        comfyui_config = self.config['comfyui']

        if not comfyui_config['enabled']:
            logger.info("⏭️  ComfyUI disabled - skipping")
            return

        # Setup workflows first
        self.setup_comfyui_workflows()

        # Start ComfyUI
        log_file = open('/teamspace/studios/this_studio/valifi/logs/comfyui.log', 'w')

        # ComfyUI command with options for network access
        cmd = [
            comfyui_config['python'],
            comfyui_config['main_script'],
            '--listen', '0.0.0.0',  # Allow network access
            '--port', str(comfyui_config['port'])
        ]

        logger.info(f"🚀 Launching ComfyUI on port {comfyui_config['port']}...")
        process = subprocess.Popen(
            cmd,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd=comfyui_config['root']
        )

        self.processes['comfyui'] = process
        logger.info(f"✅ ComfyUI started (PID: {process.pid})")
        logger.info(f"   Port: {comfyui_config['port']}")
        logger.info(f"   URL: http://localhost:{comfyui_config['port']}")
        logger.info(f"   Workflows: {len(comfyui_config['workflow_files'])} loaded")

    def start_blue_elites(self):
        """Start blue_elites Next.js platform"""
        logger.info("💙 Starting blue_elites UI Platform...")

        blue_config = self.config['blue_elites']

        if not blue_config['enabled']:
            logger.info("⏭️  blue_elites disabled - skipping")
            return

        # Check if node_modules exists, install if not
        node_modules = Path(blue_config['root']) / 'node_modules'
        if not node_modules.exists():
            logger.info("📦 Installing blue_elites dependencies...")
            install_process = subprocess.run(
                [blue_config['npm'], 'install'],
                cwd=blue_config['root'],
                capture_output=True,
                text=True
            )
            if install_process.returncode == 0:
                logger.info("✅ Dependencies installed")
            else:
                logger.warning(f"⚠️  Dependency installation had issues: {install_process.stderr[:200]}")

        # Start Next.js dev server
        log_file = open('/teamspace/studios/this_studio/valifi/logs/blue_elites.log', 'w')

        logger.info(f"🚀 Launching blue_elites on port {blue_config['port']}...")

        # Set environment for Next.js
        env = os.environ.copy()
        env['PORT'] = str(blue_config['port'])

        process = subprocess.Popen(
            [blue_config['npm'], 'run', 'dev'],
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd=blue_config['root'],
            env=env
        )

        self.processes['blue_elites'] = process
        logger.info(f"✅ blue_elites started (PID: {process.pid})")
        logger.info(f"   Port: {blue_config['port']}")
        logger.info(f"   URL: http://localhost:{blue_config['port']}")

    def check_system_health(self):
        """Check health of all systems"""
        import requests

        health_status = {
            'valifi': {},
            'comfyui': {},
            'blue_elites': {}
        }

        # Check Valifi services
        valifi_ports = [8000, 8001, 8002, 8003]
        for port in valifi_ports:
            try:
                response = requests.get(f"http://localhost:{port}/health", timeout=2)
                health_status['valifi'][port] = response.status_code == 200
            except:
                health_status['valifi'][port] = False

        # Check ComfyUI
        try:
            response = requests.get(f"http://localhost:8188/", timeout=2)
            health_status['comfyui'][8188] = response.status_code in [200, 404]
        except:
            health_status['comfyui'][8188] = False

        # Check blue_elites
        try:
            response = requests.get(f"http://localhost:3000/", timeout=2)
            health_status['blue_elites'][3000] = response.status_code in [200, 404]
        except:
            health_status['blue_elites'][3000] = False

        return health_status

    def display_status(self):
        """Display comprehensive status"""
        logger.info("=" * 80)
        logger.info("📊 MULTI-SYSTEM STATUS")
        logger.info("=" * 80)

        # Wait a bit for services to start
        logger.info("⏳ Waiting 15 seconds for all services to initialize...")
        time.sleep(15)

        health = self.check_system_health()

        # Valifi status
        logger.info("\n✝️  VALIFI AI AGENT SYSTEM:")
        valifi_healthy = sum(health['valifi'].values())
        logger.info(f"   Status: {valifi_healthy}/4 services healthy")
        logger.info(f"   🌐 Web Interface:      http://localhost:8000 - {'✅' if health['valifi'].get(8000) else '❌'}")
        logger.info(f"   ⚙️  Terminal Agent:     http://localhost:8001 - {'✅' if health['valifi'].get(8001) else '❌'}")
        logger.info(f"   📚 SDK Agent:          http://localhost:8002 - {'✅' if health['valifi'].get(8002) else '❌'}")
        logger.info(f"   🎯 Orchestrator:       http://localhost:8003 - {'✅' if health['valifi'].get(8003) else '❌'}")

        # ComfyUI status
        logger.info("\n🎨 COMFYUI AI WORKFLOW ENGINE:")
        comfyui_healthy = health['comfyui'].get(8188, False)
        logger.info(f"   Status: {'✅ Healthy' if comfyui_healthy else '⚠️  Starting...'}")
        logger.info(f"   🌐 ComfyUI Interface:  http://localhost:8188 - {'✅' if comfyui_healthy else '❌'}")
        logger.info(f"   📁 Workflows loaded: {len(self.config['comfyui']['workflow_files'])}")

        # blue_elites status
        logger.info("\n💙 BLUE_ELITES UI PLATFORM:")
        blue_healthy = health['blue_elites'].get(3000, False)
        logger.info(f"   Status: {'✅ Healthy' if blue_healthy else '⚠️  Starting...'}")
        logger.info(f"   🌐 Next.js App:        http://localhost:3000 - {'✅' if blue_healthy else '❌'}")

        logger.info("\n" + "=" * 80)
        logger.info("🎯 ALL SYSTEMS OPERATIONAL")
        logger.info("=" * 80)
        logger.info("\n💡 QUICK ACCESS:")
        logger.info("   Valifi Agents:   http://localhost:8000  (Start here - easiest!)")
        logger.info("   ComfyUI:         http://localhost:8188  (AI Workflows)")
        logger.info("   blue_elites:     http://localhost:3000  (UI Platform)")
        logger.info("\n📝 Logs:")
        logger.info("   Valifi:     tail -f logs/valifi_orchestrated.log")
        logger.info("   ComfyUI:    tail -f logs/comfyui.log")
        logger.info("   blue_elites: tail -f logs/blue_elites.log")
        logger.info("=" * 80)

    def orchestrate(self):
        """Main orchestration - start all systems"""
        logger.info("\n🚀 STARTING ORCHESTRATION OF ALL THREE SYSTEMS...")
        logger.info("=" * 80)

        try:
            # Start Valifi (includes agents with persistent system)
            self.start_valifi_system()
            time.sleep(5)

            # Start ComfyUI
            self.start_comfyui()
            time.sleep(3)

            # Start blue_elites
            self.start_blue_elites()
            time.sleep(3)

            # Display status
            self.display_status()

            logger.info("\n✅ ORCHESTRATION COMPLETE - All Systems Running!")
            logger.info("🙏 Through Christ Jesus - Perfect Coordination Achieved")
            logger.info("\nPress Ctrl+C to stop all systems...")

            # Keep running
            try:
                while True:
                    time.sleep(60)
                    # Could add periodic health checks here
            except KeyboardInterrupt:
                logger.info("\n🛑 Shutdown signal received...")

        except Exception as e:
            logger.error(f"❌ Orchestration error: {e}", exc_info=True)
        finally:
            self.shutdown()

    def shutdown(self):
        """Gracefully shutdown all systems"""
        logger.info("🛑 Shutting down all systems...")

        for system_name, process in self.processes.items():
            try:
                logger.info(f"   Stopping {system_name}...")
                process.terminate()
                time.sleep(2)
                if process.poll() is None:
                    process.kill()
            except:
                pass

        logger.info("✅ All systems stopped")
        logger.info("🙏 Through Christ Jesus - Mission Complete")


def main():
    """Main entry point"""
    print("=" * 80)
    print("🕊️  VALIFI KINGDOM PLATFORM - MULTI-SYSTEM ORCHESTRATOR")
    print("=" * 80)
    print("✝️  Through Christ Jesus - Coordinating All Three Systems")
    print()
    print("Systems to be orchestrated:")
    print("  1. ✝️  Valifi AI Agents (Ports 8000-8003)")
    print("  2. 🎨 ComfyUI Workflows (Port 8188)")
    print("  3. 💙 blue_elites UI (Port 3000)")
    print("=" * 80)
    print()

    orchestrator = MultiSystemOrchestrator()
    orchestrator.orchestrate()


if __name__ == "__main__":
    main()
