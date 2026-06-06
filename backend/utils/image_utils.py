import os
import time

from flask import current_app
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

ALLOWED_PICTURE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed_picture(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_PICTURE_EXTENSIONS


def _check_image_magic_number(picture):
    header = picture.read(12)
    picture.seek(0)
    if header[:8] == b"\x89PNG\r\n\x1a\n":
        return
    if header[:3] == b"\xff\xd8\xff":
        return
    if header[:6] in (b"GIF87a", b"GIF89a"):
        return
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return
    raise ValueError("File content does not match a supported image format")


def _save_profile_picture(picture):
    if not isinstance(picture, FileStorage):
        raise ValueError("Invalid profile picture upload")
    if picture.filename == "":
        raise ValueError("No selected profile picture")
    if not _allowed_picture(picture.filename):
        raise ValueError("Invalid profile picture format")
    _check_image_magic_number(picture)

    filename = secure_filename(picture.filename)
    filename = f"{int(time.time())}_{filename}"
    upload_folder = os.path.join(current_app.static_folder, "profile-pictures")
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    picture.save(filepath)

    return f"/static/profile-pictures/{filename}"
