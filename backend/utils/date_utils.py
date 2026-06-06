from datetime import date, datetime


def parse_date(value, field_name):
    try:
        return date.fromisoformat(value)
    except Exception as exc:
        raise ValueError(f"Invalid {field_name}. Use YYYY-MM-DD.") from exc


def parse_datetime(value, field_name):
    try:
        return datetime.fromisoformat(value)
    except Exception as exc:
        raise ValueError(f"Invalid {field_name}. Use ISO format.") from exc
