from enum import Enum


class UserRole(str, Enum):
    HR = "HR"
    MANAGER = "MANAGER"
    FINANCE = "FINANCE"
    IT = "IT"
    ADMIN = "ADMIN"