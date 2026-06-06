def parse_enum(enum_cls, value, field_name):
    if value is None:
        return None

    try:
        return enum_cls(value)
    except ValueError:
        try:
            return enum_cls[value]
        except KeyError as exc:
            allowed = ", ".join(item.value for item in enum_cls)
            raise ValueError(f"Invalid {field_name}. Allowed values: {allowed}") from exc
