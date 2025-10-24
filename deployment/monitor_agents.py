#!/usr/bin/env python3
"""
Enhanced Agent Monitoring System
Monitors agent health, performance, and logs issues automatically
"""

import requests
import time
import json
import os
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/agent_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('AgentMonitor')

class AgentMonitor:
    def __init__(self):
        self.agents = {
            'Terminal Agent': {
                'url': 'http://localhost:8001',
                'test_payload': {'command': 'echo "health check"'},
                'status': 'unknown',
                'last_check': None,
                'failures': 0
            },
            'SDK Agent': {
                'url': 'http://localhost:8002',
                'test_payload': {'query': 'health check', 'context': {}},
                'status': 'unknown',
                'last_check': None,
                'failures': 0
            }
        }
        self.check_interval = 30  # seconds
        self.max_failures = 3

    def check_agent_health(self, agent_name, agent_config):
        """Check if an agent is responding correctly"""
        try:
            response = requests.post(
                f"{agent_config['url']}/predict",
                json=agent_config['test_payload'],
                timeout=10
            )

            if response.status_code == 200:
                agent_config['status'] = 'healthy'
                agent_config['failures'] = 0
                agent_config['last_check'] = datetime.now()
                logger.info(f"✓ {agent_name} is healthy")
                return True
            else:
                agent_config['failures'] += 1
                agent_config['status'] = 'degraded'
                logger.warning(f"⚠ {agent_name} returned status {response.status_code}")
                return False

        except requests.exceptions.Timeout:
            agent_config['failures'] += 1
            agent_config['status'] = 'timeout'
            logger.error(f"✗ {agent_name} timed out")
            return False

        except requests.exceptions.ConnectionError:
            agent_config['failures'] += 1
            agent_config['status'] = 'down'
            logger.error(f"✗ {agent_name} is not responding (connection error)")
            return False

        except Exception as e:
            agent_config['failures'] += 1
            agent_config['status'] = 'error'
            logger.error(f"✗ {agent_name} error: {str(e)}")
            return False

    def get_status_summary(self):
        """Generate a status summary of all agents"""
        summary = {
            'timestamp': datetime.now().isoformat(),
            'agents': {}
        }

        for agent_name, config in self.agents.items():
            summary['agents'][agent_name] = {
                'status': config['status'],
                'last_check': config['last_check'].isoformat() if config['last_check'] else None,
                'failures': config['failures'],
                'url': config['url']
            }

        return summary

    def save_status(self):
        """Save current status to file"""
        os.makedirs('logs', exist_ok=True)
        status_file = 'logs/agent_status.json'

        with open(status_file, 'w') as f:
            json.dump(self.get_status_summary(), f, indent=2)

    def monitor_loop(self, duration=None):
        """Run continuous monitoring loop"""
        logger.info("Starting agent monitoring system...")
        start_time = time.time()

        try:
            while True:
                logger.info("\n--- Health Check Cycle ---")

                # Check each agent
                for agent_name, config in self.agents.items():
                    self.check_agent_health(agent_name, config)

                    # Alert if too many failures
                    if config['failures'] >= self.max_failures:
                        logger.critical(f"🚨 ALERT: {agent_name} has failed {config['failures']} times!")

                # Save status
                self.save_status()

                # Print summary
                summary = self.get_status_summary()
                logger.info(f"\nStatus Summary: {json.dumps(summary, indent=2)}")

                # Check if we should stop (if duration specified)
                if duration and (time.time() - start_time) >= duration:
                    logger.info("Monitoring duration completed")
                    break

                # Wait for next check
                logger.info(f"\nNext check in {self.check_interval} seconds...\n")
                time.sleep(self.check_interval)

        except KeyboardInterrupt:
            logger.info("\nMonitoring stopped by user")

    def run_single_check(self):
        """Run a single health check on all agents"""
        logger.info("Running single health check...")

        results = {}
        for agent_name, config in self.agents.items():
            results[agent_name] = self.check_agent_health(agent_name, config)

        self.save_status()
        return results

if __name__ == "__main__":
    import sys

    monitor = AgentMonitor()

    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == 'once':
            # Run single check
            results = monitor.run_single_check()
            print("\nHealth Check Results:")
            for agent, healthy in results.items():
                status = "✓ HEALTHY" if healthy else "✗ UNHEALTHY"
                print(f"{agent}: {status}")
        elif sys.argv[1] == 'continuous':
            # Run continuous monitoring
            monitor.monitor_loop()
        else:
            print("Usage: python monitor_agents.py [once|continuous]")
    else:
        # Default: run single check
        results = monitor.run_single_check()
        print("\nHealth Check Results:")
        for agent, healthy in results.items():
            status = "✓ HEALTHY" if healthy else "✗ UNHEALTHY"
            print(f"{agent}: {status}")
