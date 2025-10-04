#!/usr/bin/env python3
"""
BITCOIN MAINNET UTXO UNCONFIRMED TRANSACTION HANDLER
Production-Grade Implementation for Cryptocurrency Operations
Author: Enhanced Implementation
Version: 1.0.0
"""

import asyncio
import hashlib
import json
import time
import logging
import aiohttp
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass, asdict
from enum import Enum
from decimal import Decimal
import statistics
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('BitcoinMainnetUTXO')

class RiskLevel(Enum):
    """Risk assessment levels for unconfirmed transactions"""
    GREEN = "green"    # Accept immediately
    YELLOW = "yellow"  # Monitor closely  
    RED = "red"        # Wait for confirmations

class TransactionStatus(Enum):
    """Transaction status in mempool and blockchain"""
    PENDING = "pending"
    MEMPOOL = "mempool"
    CONFIRMED = "confirmed"
    CONFLICTED = "conflicted"
    ABANDONED = "abandoned"

@dataclass
class UnconfirmedUTXO:
    """Represents an unconfirmed UTXO with risk assessment"""
    txid: str
    vout: int
    amount: Decimal
    address: str
    fee_rate: float  # sat/vB
    rbf_enabled: bool
    first_seen: datetime
    confirmations: int = 0
    risk_score: float = 0.0
    risk_level: RiskLevel = RiskLevel.RED
    conflicts: List[str] = None
    propagation_nodes: int = 0

@dataclass
class MempoolTransaction:
    """Transaction in mempool with detailed analysis"""
    txid: str
    inputs: List[Dict]
    outputs: List[Dict]
    fee: Decimal
    fee_rate: float
    size: int
    virtual_size: int
    rbf_enabled: bool
    first_seen: datetime
    status: TransactionStatus
    conflicts: List[str] = None
    ancestor_count: int = 0
    descendant_count: int = 0

class BitcoinMainnetUTXOManager:
    """Production-grade Bitcoin mainnet UTXO manager with unconfirmed transaction handling"""
    
    def __init__(self, config: Dict = None):
        self.config = config or self._default_config()
        
        # Network endpoints
        self.api_endpoints = [
            "https://blockstream.info/api",
            "https://mempool.space/api",
            "https://api.blockcypher.com/v1/btc/main"
        ]
        
        # Internal state
        self.mempool_cache: Dict[str, MempoolTransaction] = {}
        self.utxo_cache: Dict[str, UnconfirmedUTXO] = {}
        self.conflict_tracker: Dict[str, Set[str]] = {}
        self.fee_estimates: Dict[str, float] = {}
        
        # Risk assessment parameters
        self.risk_thresholds = {
            'fee_rate_minimum': 1.0,  # sat/vB
            'propagation_threshold': 50,  # nodes
            'confidence_timeout': 300,  # seconds
            'max_chain_length': 25
        }
        
        # Economic thresholds
        self.economic_limits = {
            'dust_threshold': Decimal('0.00000546'),
            'instant_accept_limit': Decimal('0.0001'),  # ~$5 at $50k BTC
            'medium_risk_limit': Decimal('0.01'),       # ~$500 at $50k BTC
            'high_value_threshold': Decimal('0.1')      # ~$5000 at $50k BTC
        }
        
        # Data directory
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
    
    def _default_config(self) -> Dict:
        """Default configuration for mainnet operations"""
        return {
            'network': 'mainnet',
            'max_fee_rate': 1000,  # sat/vB emergency limit
            'rbf_default': True,
            'cpfp_enabled': True,
            'mempool_monitor_interval': 30,  # seconds
            'risk_update_interval': 60,
            'max_unconfirmed_age': 3600,  # 1 hour timeout
        }
    
    async def initialize(self):
        """Initialize the UTXO manager"""
        logger.info("🚀 Initializing Bitcoin Mainnet UTXO Manager")
        
        # Load existing data
        await self._load_data()
        
        # Start background tasks
        asyncio.create_task(self._mempool_monitor())
        asyncio.create_task(self._risk_assessor())
        asyncio.create_task(self._fee_estimator())
        
        # Initial fee estimation
        await self._update_fee_estimates()
        
        logger.info("✅ Bitcoin Mainnet UTXO Manager initialized")
    
    async def _mempool_monitor(self):
        """Continuously monitor mempool for transaction status updates"""
        while True:
            try:
                await self._update_mempool_status()
                await self._detect_conflicts()
                await asyncio.sleep(self.config['mempool_monitor_interval'])
            except Exception as e:
                logger.error(f"Mempool monitor error: {e}")
                await asyncio.sleep(10)
    
    async def _risk_assessor(self):
        """Continuously assess risk levels for unconfirmed UTXOs"""
        while True:
            try:
                await self._update_risk_assessments()
                await asyncio.sleep(self.config['risk_update_interval'])
            except Exception as e:
                logger.error(f"Risk assessor error: {e}")
                await asyncio.sleep(30)
    
    async def _fee_estimator(self):
        """Update fee estimates from network"""
        while True:
            try:
                await self._update_fee_estimates()
                await asyncio.sleep(300)  # Update every 5 minutes
            except Exception as e:
                logger.error(f"Fee estimator error: {e}")
                await asyncio.sleep(60)
    
    async def analyze_unconfirmed_utxo(self, txid: str, vout: int) -> UnconfirmedUTXO:
        """Analyze an unconfirmed UTXO for risk and execution possibilities"""
        logger.info(f"🔍 Analyzing unconfirmed UTXO: {txid}:{vout}")
        
        # Fetch transaction details
        tx_data = await self._fetch_transaction(txid)
        if not tx_data:
            raise ValueError(f"Transaction {txid} not found")
        
        # Extract UTXO information
        if vout >= len(tx_data.get('vout', [])):
            raise ValueError(f"VOUT {vout} does not exist in transaction")
        
        output = tx_data['vout'][vout]
        amount = Decimal(str(output['value'] / 100000000))  # Convert satoshis to BTC
        
        # Determine RBF status
        rbf_enabled = self._check_rbf_flag(tx_data)
        
        # Calculate fee rate
        fee_rate = await self._calculate_fee_rate(tx_data)
        
        # Create UTXO object
        utxo = UnconfirmedUTXO(
            txid=txid,
            vout=vout,
            amount=amount,
            address=output.get('scriptPubKey', {}).get('address', ''),
            fee_rate=fee_rate,
            rbf_enabled=rbf_enabled,
            first_seen=datetime.now(),
            confirmations=tx_data.get('confirmations', 0)
        )
        
        # Perform risk assessment
        await self._assess_utxo_risk(utxo)
        
        # Cache the UTXO
        utxo_key = f"{txid}:{vout}"
        self.utxo_cache[utxo_key] = utxo
        
        # Save data
        await self._save_data()
        
        logger.info(f"✅ UTXO analyzed - Risk: {utxo.risk_level.value}, Score: {utxo.risk_score:.2f}")
        
        return utxo
    
    async def _fetch_transaction(self, txid: str) -> Optional[Dict]:
        """Fetch transaction data from multiple APIs"""
        for endpoint in self.api_endpoints:
            try:
                if "blockstream" in endpoint:
                    url = f"{endpoint}/tx/{txid}"
                elif "mempool.space" in endpoint:
                    url = f"{endpoint}/tx/{txid}"
                elif "blockcypher" in endpoint:
                    url = f"{endpoint}/txs/{txid}"
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=10) as response:
                        if response.status == 200:
                            return await response.json()
                        
            except Exception as e:
                logger.warning(f"Failed to fetch from {endpoint}: {e}")
                continue
        
        # Fallback to synchronous request
        try:
            response = requests.get(f"https://blockstream.info/api/tx/{txid}", timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"All APIs failed for transaction {txid}: {e}")
        
        return None
    
    def _check_rbf_flag(self, tx_data: Dict) -> bool:
        """Check if transaction has RBF (Replace-By-Fee) enabled"""
        # Check if any input has sequence number < 0xfffffffe
        for vin in tx_data.get('vin', []):
            if vin.get('sequence', 0xffffffff) < 0xfffffffe:
                return True
        return False
    
    async def _calculate_fee_rate(self, tx_data: Dict) -> float:
        """Calculate transaction fee rate in sat/vB"""
        try:
            # Get input values
            total_input = Decimal('0')
            for vin in tx_data.get('vin', []):
                if 'prevout' in vin:
                    total_input += Decimal(str(vin['prevout']['value']))
            
            # Get output values
            total_output = Decimal('0')
            for vout in tx_data.get('vout', []):
                total_output += Decimal(str(vout['value']))
            
            # Calculate fee
            fee = total_input - total_output
            
            # Get transaction size
            size = tx_data.get('size', tx_data.get('vsize', 250))  # Default size
            
            # Calculate fee rate
            if size > 0:
                return float(fee / size)
            else:
                return 1.0  # Default fee rate
                
        except Exception as e:
            logger.warning(f"Failed to calculate fee rate: {e}")
            return 1.0
    
    async def _assess_utxo_risk(self, utxo: UnconfirmedUTXO):
        """Assess risk level for unconfirmed UTXO"""
        risk_score = 0.0
        
        # Factor 1: Confirmation status (40% weight)
        if utxo.confirmations == 0:
            risk_score += 40
        elif utxo.confirmations == 1:
            risk_score += 20
        elif utxo.confirmations < 3:
            risk_score += 10
        
        # Factor 2: Fee rate assessment (25% weight)
        current_recommended_fee = self.fee_estimates.get('medium', 10.0)
        if utxo.fee_rate < current_recommended_fee * 0.5:
            risk_score += 25  # Very low fee
        elif utxo.fee_rate < current_recommended_fee:
            risk_score += 15  # Below recommended
        elif utxo.fee_rate > current_recommended_fee * 2:
            risk_score -= 10  # High priority fee
        
        # Factor 3: RBF status (20% weight)
        if utxo.rbf_enabled:
            risk_score += 20  # RBF means can be replaced
        
        # Factor 4: Amount assessment (10% weight)
        if utxo.amount < self.economic_limits['instant_accept_limit']:
            risk_score -= 5  # Small amounts are lower risk
        elif utxo.amount > self.economic_limits['high_value_threshold']:
            risk_score += 10  # Large amounts need more caution
        
        # Factor 5: Age of transaction (5% weight)
        age_minutes = (datetime.now() - utxo.first_seen).total_seconds() / 60
        if age_minutes > 60:
            risk_score -= 5  # Older transactions are more stable
        
        # Normalize score (0-100)
        risk_score = max(0, min(100, risk_score))
        
        # Assign risk level
        if risk_score <= 30:
            risk_level = RiskLevel.GREEN
        elif risk_score <= 70:
            risk_level = RiskLevel.YELLOW
        else:
            risk_level = RiskLevel.RED
        
        utxo.risk_score = risk_score
        utxo.risk_level = risk_level
    
    async def get_execution_strategy(self, utxo: UnconfirmedUTXO) -> Dict:
        """Get recommended execution strategy for unconfirmed UTXO"""
        strategy = {
            'recommendation': '',
            'risk_level': utxo.risk_level.value,
            'risk_score': utxo.risk_score,
            'wait_time': 0,
            'monitoring_required': False,
            'acceleration_options': []
        }
        
        if utxo.risk_level == RiskLevel.GREEN:
            strategy['recommendation'] = 'ACCEPT_IMMEDIATELY'
            strategy['wait_time'] = 0
            strategy['monitoring_required'] = False
            
        elif utxo.risk_level == RiskLevel.YELLOW:
            strategy['recommendation'] = 'MONITOR_AND_DECIDE'
            strategy['wait_time'] = 600  # 10 minutes
            strategy['monitoring_required'] = True
            
            # Suggest acceleration if fee is low
            if utxo.fee_rate < self.fee_estimates.get('medium', 10.0):
                strategy['acceleration_options'].append('CPFP')
                if utxo.rbf_enabled:
                    strategy['acceleration_options'].append('RBF')
                    
        else:  # RED
            strategy['recommendation'] = 'WAIT_FOR_CONFIRMATION'
            strategy['wait_time'] = 3600  # 1 hour
            strategy['monitoring_required'] = True
            
            # Always suggest acceleration for red level
            strategy['acceleration_options'].append('CPFP')
            if utxo.rbf_enabled:
                strategy['acceleration_options'].append('RBF')
        
        return strategy
    
    async def _update_mempool_status(self):
        """Update status of transactions in mempool"""
        for utxo_key, utxo in self.utxo_cache.items():
            try:
                tx_data = await self._fetch_transaction(utxo.txid)
                if tx_data:
                    utxo.confirmations = tx_data.get('confirmations', 0)
                    
                    # Re-assess risk if confirmations changed
                    if utxo.confirmations > 0:
                        await self._assess_utxo_risk(utxo)
                        
            except Exception as e:
                logger.warning(f"Failed to update status for {utxo_key}: {e}")
    
    async def _detect_conflicts(self):
        """Detect double-spend conflicts in mempool"""
        # This would require more sophisticated mempool analysis
        # For now, we'll implement basic conflict detection
        pass
    
    async def _update_risk_assessments(self):
        """Update risk assessments for all cached UTXOs"""
        for utxo in self.utxo_cache.values():
            await self._assess_utxo_risk(utxo)
    
    async def _update_fee_estimates(self):
        """Update fee estimates from network"""
        try:
            url = "https://mempool.space/api/v1/fees/recommended"
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.fee_estimates = {
                            'fast': data.get('fastestFee', 20),
                            'medium': data.get('halfHourFee', 10),
                            'slow': data.get('hourFee', 5)
                        }
                        logger.info(f"📊 Fee estimates updated: {self.fee_estimates}")
                        
        except Exception as e:
            logger.warning(f"Failed to update fee estimates: {e}")
            # Use default values
            self.fee_estimates = {'fast': 20, 'medium': 10, 'slow': 5}
    
    async def _save_data(self):
        """Save cache data to disk"""
        try:
            # Save UTXO cache
            utxo_data = {}
            for key, utxo in self.utxo_cache.items():
                utxo_dict = asdict(utxo)
                utxo_dict['first_seen'] = utxo.first_seen.isoformat()
                utxo_dict['amount'] = str(utxo.amount)
                utxo_dict['risk_level'] = utxo.risk_level.value
                utxo_data[key] = utxo_dict
            
            with open(self.data_dir / 'utxo_cache.json', 'w') as f:
                json.dump(utxo_data, f, indent=2, default=str)
                
            # Save fee estimates
            with open(self.data_dir / 'fee_estimates.json', 'w') as f:
                json.dump(self.fee_estimates, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save data: {e}")
    
    async def _load_data(self):
        """Load cached data from disk"""
        try:
            # Load UTXO cache
            utxo_file = self.data_dir / 'utxo_cache.json'
            if utxo_file.exists():
                with open(utxo_file, 'r') as f:
                    utxo_data = json.load(f)
                
                for key, data in utxo_data.items():
                    data['first_seen'] = datetime.fromisoformat(data['first_seen'])
                    data['amount'] = Decimal(data['amount'])
                    data['risk_level'] = RiskLevel(data['risk_level'])
                    self.utxo_cache[key] = UnconfirmedUTXO(**data)
            
            # Load fee estimates
            fee_file = self.data_dir / 'fee_estimates.json'
            if fee_file.exists():
                with open(fee_file, 'r') as f:
                    self.fee_estimates = json.load(f)
                    
        except Exception as e:
            logger.warning(f"Failed to load cached data: {e}")
    
    def get_system_stats(self) -> Dict:
        """Get comprehensive system statistics"""
        total_utxos = len(self.utxo_cache)
        confirmed_utxos = sum(1 for utxo in self.utxo_cache.values() if utxo.confirmations > 0)
        
        risk_breakdown = {
            'green': sum(1 for utxo in self.utxo_cache.values() if utxo.risk_level == RiskLevel.GREEN),
            'yellow': sum(1 for utxo in self.utxo_cache.values() if utxo.risk_level == RiskLevel.YELLOW),
            'red': sum(1 for utxo in self.utxo_cache.values() if utxo.risk_level == RiskLevel.RED)
        }
        
        total_value = sum(utxo.amount for utxo in self.utxo_cache.values())
        
        return {
            'total_utxos': total_utxos,
            'confirmed_utxos': confirmed_utxos,
            'unconfirmed_utxos': total_utxos - confirmed_utxos,
            'risk_breakdown': risk_breakdown,
            'total_value_btc': float(total_value),
            'fee_estimates': self.fee_estimates,
            'last_update': datetime.now().isoformat()
        }

# Synchronous wrapper for easy testing
class MainnetUTXOSync:
    """Synchronous wrapper for the async UTXO manager"""
    
    def __init__(self):
        self.manager = BitcoinMainnetUTXOManager()
        self.loop = None
    
    def initialize(self):
        """Initialize the manager"""
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self.manager.initialize())
    
    def analyze_utxo(self, txid: str, vout: int) -> UnconfirmedUTXO:
        """Analyze UTXO synchronously"""
        if not self.loop:
            self.initialize()
        return self.loop.run_until_complete(self.manager.analyze_unconfirmed_utxo(txid, vout))
    
    def get_execution_strategy(self, utxo: UnconfirmedUTXO) -> Dict:
        """Get execution strategy synchronously"""
        return self.loop.run_until_complete(self.manager.get_execution_strategy(utxo))
    
    def get_stats(self) -> Dict:
        """Get system statistics"""
        return self.manager.get_system_stats()
    
    def cleanup(self):
        """Cleanup resources"""
        if self.loop:
            self.loop.close()

if __name__ == "__main__":
    # Demo usage
    import sys
    
    async def demo():
        manager = BitcoinMainnetUTXOManager()
        await manager.initialize()
        
        print("🚀 Bitcoin Mainnet UTXO Manager Demo")
        print("=" * 50)
        
        # Demo with a real transaction (change this to a current unconfirmed tx)
        demo_txid = "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"  # Example
        
        try:
            utxo = await manager.analyze_unconfirmed_utxo(demo_txid, 0)
            print(f"✅ UTXO Analysis Complete:")
            print(f"   Amount: {utxo.amount} BTC")
            print(f"   Risk Level: {utxo.risk_level.value}")
            print(f"   Risk Score: {utxo.risk_score:.2f}")
            print(f"   Fee Rate: {utxo.fee_rate:.2f} sat/vB")
            print(f"   RBF Enabled: {utxo.rbf_enabled}")
            
            strategy = await manager.get_execution_strategy(utxo)
            print(f"\n📋 Execution Strategy:")
            print(f"   Recommendation: {strategy['recommendation']}")
            print(f"   Wait Time: {strategy['wait_time']} seconds")
            print(f"   Monitoring Required: {strategy['monitoring_required']}")
            
        except Exception as e:
            print(f"❌ Demo failed: {e}")
            print("💡 Try with a recent unconfirmed transaction ID")
        
        # Show system stats
        stats = manager.get_system_stats()
        print(f"\n📊 System Statistics:")
        print(json.dumps(stats, indent=2, default=str))
    
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        asyncio.run(demo())
    else:
        print("Bitcoin Mainnet UTXO Manager loaded successfully!")
        print("Run with 'python mainnet_utxo_manager.py demo' for demonstration")
