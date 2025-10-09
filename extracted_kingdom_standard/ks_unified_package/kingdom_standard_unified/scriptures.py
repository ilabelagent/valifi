"""
Scripture verses for prayer integration.

This module contains a small collection of Bible verses and a helper
function to select one at random.  Additional verses can be added as
needed to enrich the spiritual aspect of the system.
"""

import random

VERSES = [
    (
        "Proverbs 3:5-6",
        "Trust in the Lord with all your heart and lean not on your own understanding;"
        " in all your ways submit to him, and he will make your paths straight."
    ),
    (
        "Philippians 4:6-7",
        "Do not be anxious about anything, but in every situation, by prayer and petition,"
        " with thanksgiving, present your requests to God. And the peace of God, which transcends all"
        " understanding, will guard your hearts and your minds in Christ Jesus."
    ),
    (
        "James 1:5",
        "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault,"
        " and it will be given to you."
    ),
    (
        "Psalm 37:23-24",
        "The Lord makes firm the steps of the one who delights in him; though he may stumble, he will not fall,"
        " for the Lord upholds him with his hand."
    ),
]


def random_scripture() -> str:
    """Return a randomly selected scripture verse as a formatted string."""
    ref, text = random.choice(VERSES)
    return f"{ref}: {text}"