from datetime import date, datetime


def parse_date(value, field_name):
    try:
        return date.fromisoformat(value)
    except Exception as exc:
        raise ValueError(f"Invalid {field_name}. Use YYYY-MM-DD.") from exc


def parse_future_workday(value, field_name):
    parsed_date = parse_date(value, field_name)

    if parsed_date <= date.today():
        raise ValueError(f"{field_name} must be in the future")
    if parsed_date.weekday() >= 5:
        raise ValueError(f"{field_name} must be a working day, Monday-Friday")

    return parsed_date


def parse_datetime(value, field_name):
    try:
        return datetime.fromisoformat(value)
    except Exception as exc:
        raise ValueError(f"Invalid {field_name}. Use ISO format.") from exc
