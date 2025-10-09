"""
Governance and multi‑signature approval stubs.

This module defines simple classes to model multi‑signature approval
workflows for trades or donations.  It is a placeholder for
integrating real multi‑sig wallets.  In production, approvals would
require cryptographically signed messages from independent trustees.
"""

from __future__ import annotations

from typing import Dict, Set, List


class MultiSigApproval:
    """Require N of M approvals before an action is executed."""

    def __init__(self, approvers: List[str], threshold: int):
        if threshold > len(approvers):
            raise ValueError("Threshold cannot exceed number of approvers")
        self.approvers = set(approvers)
        self.threshold = threshold
        self.approved_by: Set[str] = set()

    def approve(self, approver: str) -> None:
        """Record approval from an approver."""
        if approver not in self.approvers:
            raise ValueError(f"Approver {approver} not recognised")
        self.approved_by.add(approver)

    def is_approved(self) -> bool:
        """Check whether the threshold has been met."""
        return len(self.approved_by) >= self.threshold

    def reset(self) -> None:
        self.approved_by.clear()