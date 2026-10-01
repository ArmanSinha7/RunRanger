"""Runtime configuration. Every setting has a free, local default.

There are deliberately NO API-key settings: RunRanger has no paid or keyed
dependencies. Override values with environment variables if you need to.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

