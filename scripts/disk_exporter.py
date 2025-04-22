#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import time
import os

PORT = 9200

class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/metrics':
            # Run df command to get disk usage
            result = subprocess.run(['df', '-k', '/'], capture_output=True, text=True)
            lines = result.stdout.strip().split('\n')
            if len(lines) >= 2:
                parts = lines[1].split()
                if len(parts) >= 6:
                    total_kb = int(parts[1])
                    used_kb = int(parts[2])
                    avail_kb = int(parts[3])
                    use_percent = parts[4].replace('%', '')
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'text/plain')
                    self.end_headers()
                    
                    metrics = [
                        f"# HELP mac_disk_total_bytes Total disk space in bytes",
                        f"# TYPE mac_disk_total_bytes gauge",
                        f"mac_disk_total_bytes {total_kb * 1024}",
                        f"# HELP mac_disk_used_bytes Used disk space in bytes",
                        f"# TYPE mac_disk_used_bytes gauge",
                        f"mac_disk_used_bytes {used_kb * 1024}",
                        f"# HELP mac_disk_avail_bytes Available disk space in bytes",
                        f"# TYPE mac_disk_avail_bytes gauge", 
                        f"mac_disk_avail_bytes {avail_kb * 1024}",
                        f"# HELP mac_disk_used_percent Percentage of disk used",
                        f"# TYPE mac_disk_used_percent gauge",
                        f"mac_disk_used_percent {use_percent}"
                    ]
                    
                    self.wfile.write('\n'.join(metrics).encode())
                    return
            
            # Fallback if parsing failed
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b"Error collecting metrics")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")

if __name__ == "__main__":
    httpd = HTTPServer(('', PORT), MetricsHandler)
    print(f"Starting disk exporter on port {PORT}")
    httpd.serve_forever() 