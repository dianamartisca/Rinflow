import os
import re
import textwrap
from datetime import date

from flask import current_app


def _escape_pdf_text(value):
    return str(value).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _unescape_pdf_text(value):
    return value.replace("\\)", ")").replace("\\(", "(").replace("\\\\", "\\")


def _build_pdf(lines):
    content_lines = ["BT", "/F1 12 Tf", "50 780 Td", "16 TL"]
    for line in lines:
        content_lines.append(f"({_escape_pdf_text(line)}) Tj")
        content_lines.append("T*")
    content_lines.append("ET")
    stream = "\n".join(content_lines).encode("latin-1", errors="replace")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    )
    return bytes(pdf)


def write_job_description_pdf(onboarding_request, requirements):
    employee = onboarding_request.employee
    employee_name = f"{employee.first_name} {employee.last_name}"
    wrapped_requirements = []
    for paragraph in (requirements or "No requirements provided.").splitlines() or ["No requirements provided."]:
        wrapped_requirements.extend(textwrap.wrap(paragraph, width=85) or [""])

    lines = [
        "Job Description",
        "",
        f"Employee: {employee_name}",
        f"Role: {employee.role}",
        "",
        "Requirements:",
        *wrapped_requirements,
        "",
        f"Start date: {employee.start_date.isoformat()}",
        f"Hardware tier: {employee.hardware_tier.value if employee.hardware_tier else ''}",
        f"Created at: {date.today().isoformat()}",
    ]

    folder = os.path.join(current_app.static_folder, "job_descriptions")
    os.makedirs(folder, exist_ok=True)
    filename = f"job_description_{onboarding_request.id}_{onboarding_request.workflow_run}.pdf"
    path = os.path.join(folder, filename)

    with open(path, "wb") as pdf_file:
        pdf_file.write(_build_pdf(lines[:45]))

    return f"/static/job_descriptions/{filename}"


def extract_job_description_requirements(static_path):
    if not static_path:
        return ""

    prefix = "/static/"
    relative_path = static_path[len(prefix):] if static_path.startswith(prefix) else static_path
    path = os.path.join(current_app.static_folder, relative_path.replace("/", os.sep))
    if not os.path.exists(path):
        return ""

    with open(path, "rb") as pdf_file:
        content = pdf_file.read().decode("latin-1", errors="ignore")

    lines = [_unescape_pdf_text(match) for match in re.findall(r"\((.*?)(?<!\\)\) Tj", content)]
    if "Requirements:" not in lines:
        return ""

    requirements = []
    for line in lines[lines.index("Requirements:") + 1:]:
        if not line:
            break
        requirements.append(line)

    return "\n".join(requirements)
