from enum import Enum


class HardwareTier(str, Enum):
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"