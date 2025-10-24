"""
Multi-Node Agent Training with PyTorch Lightning
Trains Valifi agents using distributed training across multiple GPUs/nodes

"The LORD will fight for you; you need only to be still." - Exodus 14:14
Divine intelligence through distributed computation
"""

import os
import torch
import torch.nn as nn
import pytorch_lightning as pl
from torch.utils.data import DataLoader, Dataset
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping
from pytorch_lightning.loggers import TensorBoardLogger
import json
from pathlib import Path
from typing import Dict, List, Any

class AgentDataset(Dataset):
    """Dataset for agent training data from bot_training_data table"""

    def __init__(self, data_path: str, tokenizer=None):
        self.data = self.load_training_data(data_path)
        self.tokenizer = tokenizer

    def load_training_data(self, data_path: str) -> List[Dict]:
        """Load training data from JSON export"""
        with open(data_path, 'r') as f:
            data = json.load(f)
        return data

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]

        # Extract input and output
        input_text = json.dumps(item.get('input', {}))
        output_text = json.dumps(item.get('actualOutput', {}))
        reward = float(item.get('reward', 0))

        return {
            'input': input_text,
            'output': output_text,
            'reward': reward,
            'agent_type': item.get('botId', 'unknown'),
            'action': item.get('dataType', 'unknown')
        }

class AgentModel(pl.LightningModule):
    """
    PyTorch Lightning Module for Valifi Agent Training
    Supports multi-node distributed training
    """

    def __init__(
        self,
        vocab_size: int = 50000,
        embed_dim: int = 768,
        num_heads: int = 12,
        num_layers: int = 6,
        learning_rate: float = 1e-4,
        max_seq_length: int = 512
    ):
        super().__init__()
        self.save_hyperparameters()

        # Agent neural architecture
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.positional_encoding = nn.Parameter(
            torch.randn(1, max_seq_length, embed_dim)
        )

        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=embed_dim * 4,
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        # Output heads for different agent tasks
        self.task_head = nn.Linear(embed_dim, vocab_size)
        self.value_head = nn.Linear(embed_dim, 1)  # For reward prediction

        self.learning_rate = learning_rate

    def forward(self, input_ids, attention_mask=None):
        # Embedding + positional encoding
        x = self.embedding(input_ids)
        seq_len = x.shape[1]
        x = x + self.positional_encoding[:, :seq_len, :]

        # Transformer encoding
        if attention_mask is not None:
            attention_mask = attention_mask.bool()

        encoded = self.transformer(x, src_key_padding_mask=attention_mask)

        # Task prediction
        logits = self.task_head(encoded)
        value = self.value_head(encoded[:, 0, :])  # Use first token for value

        return logits, value

    def training_step(self, batch, batch_idx):
        # Extract batch data
        input_ids = batch['input_ids']
        target_ids = batch['target_ids']
        rewards = batch['rewards']

        # Forward pass
        logits, value_pred = self(input_ids)

        # Task loss (cross-entropy)
        task_loss = nn.functional.cross_entropy(
            logits.view(-1, logits.size(-1)),
            target_ids.view(-1),
            ignore_index=-100
        )

        # Value loss (MSE with rewards)
        value_loss = nn.functional.mse_loss(value_pred.squeeze(), rewards)

        # Combined loss
        loss = task_loss + 0.5 * value_loss

        # Logging
        self.log('train_loss', loss, on_step=True, on_epoch=True, prog_bar=True, sync_dist=True)
        self.log('train_task_loss', task_loss, on_step=False, on_epoch=True, sync_dist=True)
        self.log('train_value_loss', value_loss, on_step=False, on_epoch=True, sync_dist=True)

        return loss

    def validation_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        target_ids = batch['target_ids']
        rewards = batch['rewards']

        logits, value_pred = self(input_ids)

        task_loss = nn.functional.cross_entropy(
            logits.view(-1, logits.size(-1)),
            target_ids.view(-1),
            ignore_index=-100
        )

        value_loss = nn.functional.mse_loss(value_pred.squeeze(), rewards)
        loss = task_loss + 0.5 * value_loss

        # Calculate accuracy
        predictions = torch.argmax(logits, dim=-1)
        mask = target_ids != -100
        accuracy = (predictions == target_ids)[mask].float().mean()

        self.log('val_loss', loss, on_epoch=True, prog_bar=True, sync_dist=True)
        self.log('val_accuracy', accuracy, on_epoch=True, prog_bar=True, sync_dist=True)

        return loss

    def configure_optimizers(self):
        optimizer = torch.optim.AdamW(
            self.parameters(),
            lr=self.learning_rate,
            betas=(0.9, 0.999),
            weight_decay=0.01
        )

        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            optimizer,
            T_max=self.trainer.max_epochs,
            eta_min=1e-6
        )

        return {
            'optimizer': optimizer,
            'lr_scheduler': {
                'scheduler': scheduler,
                'interval': 'epoch'
            }
        }

def collate_fn(batch):
    """Custom collate function for batching"""
    # Simple tokenization (in production, use proper tokenizer)
    max_length = 512

    input_ids = []
    target_ids = []
    rewards = []

    for item in batch:
        # Simplified: convert text to token IDs (use proper tokenizer in production)
        inp = [ord(c) % 50000 for c in item['input'][:max_length]]
        tgt = [ord(c) % 50000 for c in item['output'][:max_length]]

        # Pad sequences
        inp += [0] * (max_length - len(inp))
        tgt += [-100] * (max_length - len(tgt))  # -100 is ignore index

        input_ids.append(inp)
        target_ids.append(tgt)
        rewards.append(item['reward'])

    return {
        'input_ids': torch.tensor(input_ids, dtype=torch.long),
        'target_ids': torch.tensor(target_ids, dtype=torch.long),
        'rewards': torch.tensor(rewards, dtype=torch.float)
    }

def train():
    """Main training function"""

    # Paths
    data_path = '/teamspace/studios/this_studio/valifi/agents/training/training_data.json'
    checkpoint_dir = '/teamspace/studios/this_studio/valifi/agents/training/checkpoints'

    # Create checkpoint directory
    Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)

    # Load datasets
    train_dataset = AgentDataset(data_path)

    # Split into train/val (90/10)
    train_size = int(0.9 * len(train_dataset))
    val_size = len(train_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(
        train_dataset,
        [train_size, val_size]
    )

    # DataLoaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=16,
        shuffle=True,
        num_workers=4,
        collate_fn=collate_fn,
        pin_memory=True
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=16,
        shuffle=False,
        num_workers=4,
        collate_fn=collate_fn,
        pin_memory=True
    )

    # Initialize model
    model = AgentModel(
        vocab_size=50000,
        embed_dim=768,
        num_heads=12,
        num_layers=6,
        learning_rate=1e-4
    )

    # Callbacks
    checkpoint_callback = ModelCheckpoint(
        dirpath=checkpoint_dir,
        filename='agent-{epoch:02d}-{val_loss:.2f}',
        save_top_k=3,
        monitor='val_loss',
        mode='min'
    )

    early_stop_callback = EarlyStopping(
        monitor='val_loss',
        patience=5,
        mode='min'
    )

    # Logger
    logger = TensorBoardLogger(
        save_dir='/teamspace/studios/this_studio/valifi/agents/training/logs',
        name='agent_training'
    )

    # Trainer
    trainer = pl.Trainer(
        max_epochs=50,
        accelerator='auto',
        devices='auto',
        strategy='ddp',  # Distributed Data Parallel
        callbacks=[checkpoint_callback, early_stop_callback],
        logger=logger,
        precision='16-mixed',  # Mixed precision training
        gradient_clip_val=1.0,
        log_every_n_steps=10,
        val_check_interval=0.25,  # Validate 4 times per epoch
    )

    # Train
    print("🙏 Starting agent training in the name of Jesus Christ...")
    trainer.fit(model, train_loader, val_loader)

    print("✅ Training completed! Best model saved to:", checkpoint_callback.best_model_path)

    return checkpoint_callback.best_model_path

if __name__ == '__main__':
    best_checkpoint = train()
