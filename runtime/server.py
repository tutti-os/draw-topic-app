import json
import mimetypes
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


HOST = os.environ.get("TUTTI_APP_HOST", "127.0.0.1")
PORT = int(os.environ["TUTTI_APP_PORT"])
PACKAGE_DIR = Path(os.environ["TUTTI_APP_PACKAGE_DIR"]).resolve()
STATIC_DIR = PACKAGE_DIR / "static"
sys.path.insert(0, str(PACKAGE_DIR))

from card_agent import generate_cards  # noqa: E402


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        route = urlparse(self.path).path
        if route == "/healthz":
            self.write_json({"ok": True})
            return
        if route == "/":
            self.serve_file(STATIC_DIR / "index.html")
            return
        if route in {"/app.js", "/styles.css"}:
            self.serve_file(STATIC_DIR / route.lstrip("/"))
            return
        self.serve_file(PACKAGE_DIR / unquote(route.lstrip("/")))

    def do_POST(self):
        route = urlparse(self.path).path
        if route == "/api/draw":
            body = self.read_json_body()
            question = str(body.get("question") or "").strip()
            locale = str(body.get("locale") or "zh-CN")
            if not question:
                self.write_json({"ok": False, "error": "question_required"}, status=400)
                return
            self.write_json(generate_cards(question, locale))
            return
        self.send_error(404)

    def serve_file(self, path):
        resolved = path.resolve()
        if not self.is_package_path(resolved) or not resolved.is_file():
            self.send_error(404)
            return

        content_type = mimetypes.guess_type(str(resolved))[0] or "application/octet-stream"
        if resolved.suffix == ".js":
            content_type = "text/javascript"
        data = resolved.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def is_package_path(self, path):
        try:
            path.relative_to(PACKAGE_DIR)
            return True
        except ValueError:
            return False

    def write_json(self, payload, status=200):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            length = 0
        if length <= 0:
            return {}
        data = self.rfile.read(min(length, 65536))
        try:
            parsed = json.loads(data.decode("utf-8"))
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}

    def log_message(self, format, *args):
        return


ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
