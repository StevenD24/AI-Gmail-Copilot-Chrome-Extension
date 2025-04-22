#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import time
import os
import platform
import datetime

PORT = 9201

class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/metrics':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            
            metrics = []
            
            # Collect disk metrics
            disk_metrics = self.get_disk_metrics()
            metrics.extend(disk_metrics)
            
            # Collect CPU metrics
            cpu_metrics = self.get_cpu_metrics()
            metrics.extend(cpu_metrics)
            
            # Collect memory metrics
            memory_metrics = self.get_memory_metrics()
            metrics.extend(memory_metrics)
            
            # Collect process metrics
            process_metrics = self.get_process_metrics()
            metrics.extend(process_metrics)
            
            # Collect uptime metrics
            uptime_metrics = self.get_uptime_metrics()
            metrics.extend(uptime_metrics)
            
            # Collect users logged in
            user_metrics = self.get_user_metrics()
            metrics.extend(user_metrics)
            
            # Collect network metrics
            network_metrics = self.get_network_metrics()
            metrics.extend(network_metrics)
            
            self.wfile.write('\n'.join(metrics).encode())
            return
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
    
    def get_disk_metrics(self):
        metrics = []
        
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
                
                metrics.extend([
                    "# HELP server_disk_total_bytes Total disk space in bytes",
                    "# TYPE server_disk_total_bytes gauge",
                    f"server_disk_total_bytes {total_kb * 1024}",
                    "# HELP server_disk_used_bytes Used disk space in bytes",
                    "# TYPE server_disk_used_bytes gauge",
                    f"server_disk_used_bytes {used_kb * 1024}",
                    "# HELP server_disk_avail_bytes Available disk space in bytes",
                    "# TYPE server_disk_avail_bytes gauge", 
                    f"server_disk_avail_bytes {avail_kb * 1024}",
                    "# HELP server_disk_used_percent Percentage of disk used",
                    "# TYPE server_disk_used_percent gauge",
                    f"server_disk_used_percent {use_percent}"
                ])
        
        return metrics
    
    def get_cpu_metrics(self):
        metrics = []
        
        # Get CPU load averages
        result = subprocess.run(['sysctl', '-n', 'vm.loadavg'], capture_output=True, text=True)
        if result.stdout:
            # Output format is like "{ 1.23 2.34 3.45 }" - we need to extract the three numbers
            parts = result.stdout.strip().replace('{', '').replace('}', '').split()
            if len(parts) >= 3:
                metrics.extend([
                    "# HELP server_load_1m System load average 1m",
                    "# TYPE server_load_1m gauge",
                    f"server_load_1m {parts[0]}",
                    "# HELP server_load_5m System load average 5m",
                    "# TYPE server_load_5m gauge",
                    f"server_load_5m {parts[1]}",
                    "# HELP server_load_15m System load average 15m",
                    "# TYPE server_load_15m gauge",
                    f"server_load_15m {parts[2]}"
                ])
        
        # Get CPU count
        result = subprocess.run(['sysctl', '-n', 'hw.ncpu'], capture_output=True, text=True)
        if result.stdout:
            metrics.extend([
                "# HELP server_cpu_count Number of CPUs",
                "# TYPE server_cpu_count gauge",
                f"server_cpu_count {result.stdout.strip()}"
            ])
            
        # Get CPU usage (top is not ideal but works for a simple demo)
        result = subprocess.run(['top', '-l', '1', '-n', '0'], capture_output=True, text=True)
        if result.stdout:
            for line in result.stdout.split('\n'):
                if "CPU usage" in line:
                    parts = line.split(':')[1].strip().split(',')
                    if len(parts) >= 3:
                        user = parts[0].replace('% user', '').strip()
                        sys = parts[1].replace('% sys', '').strip()
                        idle = parts[2].replace('% idle', '').strip()
                        
                        metrics.extend([
                            "# HELP server_cpu_user_percent CPU user percentage",
                            "# TYPE server_cpu_user_percent gauge",
                            f"server_cpu_user_percent {user}",
                            "# HELP server_cpu_system_percent CPU system percentage",
                            "# TYPE server_cpu_system_percent gauge",
                            f"server_cpu_system_percent {sys}",
                            "# HELP server_cpu_idle_percent CPU idle percentage",
                            "# TYPE server_cpu_idle_percent gauge",
                            f"server_cpu_idle_percent {idle}"
                        ])
                    break
        
        return metrics
    
    def get_memory_metrics(self):
        metrics = []
        
        # Get memory info
        result = subprocess.run(['vm_stat'], capture_output=True, text=True)
        if result.stdout:
            # macOS page size is 4096 bytes (4KB)
            page_size = 4096
            mem_stats = {}
            
            for line in result.stdout.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    value = value.strip().replace('.', '')
                    if value.isdigit():
                        mem_stats[key.strip()] = int(value) * page_size
            
            # Get total physical memory
            result_total = subprocess.run(['sysctl', '-n', 'hw.memsize'], capture_output=True, text=True)
            if result_total.stdout:
                total_memory = int(result_total.stdout.strip())
                mem_stats['total'] = total_memory
            
            # Calculate memory usage
            if 'total' in mem_stats:
                free_memory = mem_stats.get('Pages free', 0) + mem_stats.get('Pages inactive', 0)
                used_memory = mem_stats['total'] - free_memory
                
                metrics.extend([
                    "# HELP server_memory_total_bytes Total memory in bytes",
                    "# TYPE server_memory_total_bytes gauge",
                    f"server_memory_total_bytes {mem_stats['total']}",
                    "# HELP server_memory_used_bytes Used memory in bytes",
                    "# TYPE server_memory_used_bytes gauge",
                    f"server_memory_used_bytes {used_memory}",
                    "# HELP server_memory_free_bytes Free memory in bytes",
                    "# TYPE server_memory_free_bytes gauge",
                    f"server_memory_free_bytes {free_memory}",
                    "# HELP server_memory_used_percent Memory usage percentage",
                    "# TYPE server_memory_used_percent gauge",
                    f"server_memory_used_percent {round(used_memory / mem_stats['total'] * 100, 2)}"
                ])
        
        return metrics
    
    def get_process_metrics(self):
        metrics = []
        
        # Get process count
        result = subprocess.run(['ps', '-A'], capture_output=True, text=True)
        if result.stdout:
            process_count = len(result.stdout.strip().split('\n')) - 1  # Subtract header line
            metrics.extend([
                "# HELP server_process_count Total number of processes",
                "# TYPE server_process_count gauge",
                f"server_process_count {process_count}"
            ])
        
        # Get zombie process count
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        if result.stdout:
            zombie_count = 0
            for line in result.stdout.split('\n'):
                if 'Z' in line.split():
                    zombie_count += 1
            
            metrics.extend([
                "# HELP server_zombie_process_count Number of zombie processes",
                "# TYPE server_zombie_process_count gauge",
                f"server_zombie_process_count {zombie_count}"
            ])
        
        # Get thread count - fixing the subprocess call
        try:
            result = subprocess.run(['sysctl', '-n', 'vm.proces_display_threads'], capture_output=True, text=True)
            if result.returncode == 0 and result.stdout:
                thread_count = result.stdout.strip()
                metrics.extend([
                    "# HELP server_thread_count Total number of threads",
                    "# TYPE server_thread_count gauge",
                    f"server_thread_count {thread_count}"
                ])
        except:
            pass
        
        return metrics
    
    def get_uptime_metrics(self):
        metrics = []
        
        # Get system uptime
        boot_time_result = subprocess.run(['sysctl', '-n', 'kern.boottime'], capture_output=True, text=True)
        if boot_time_result.stdout:
            # Extract boot timestamp from output like "{ sec = 1717356019, usec = 0 } Tue Apr 22 14:26:59 2025"
            try:
                boot_timestamp_str = boot_time_result.stdout.split('=')[1].split(',')[0].strip()
                boot_timestamp = int(boot_timestamp_str)
                current_timestamp = int(time.time())
                uptime_seconds = current_timestamp - boot_timestamp
                
                metrics.extend([
                    "# HELP server_uptime_seconds System uptime in seconds",
                    "# TYPE server_uptime_seconds counter",
                    f"server_uptime_seconds {uptime_seconds}"
                ])
            except:
                pass
        
        return metrics
    
    def get_user_metrics(self):
        metrics = []
        
        # Get logged in users
        result = subprocess.run(['who'], capture_output=True, text=True)
        if result.stdout:
            user_lines = [line for line in result.stdout.strip().split('\n') if line.strip()]
            user_count = len(user_lines)
            
            metrics.extend([
                "# HELP server_logged_in_users Number of logged in users",
                "# TYPE server_logged_in_users gauge",
                f"server_logged_in_users {user_count}"
            ])
            
            # Get unique users
            unique_users = set()
            for line in user_lines:
                parts = line.split()
                if parts:
                    unique_users.add(parts[0])
            
            metrics.extend([
                "# HELP server_unique_users Number of unique logged in users",
                "# TYPE server_unique_users gauge",
                f"server_unique_users {len(unique_users)}"
            ])
        
        return metrics
    
    def get_network_metrics(self):
        metrics = []
        
        # Get network stats
        result = subprocess.run(['netstat', '-ib'], capture_output=True, text=True)
        if result.stdout:
            lines = result.stdout.strip().split('\n')
            
            # Skip the first two lines (headers)
            for line in lines[2:]:
                parts = line.split()
                if len(parts) >= 11 and parts[0] != 'lo0':  # Skip loopback
                    interface = parts[0]
                    bytes_in = parts[6]
                    bytes_out = parts[9]
                    
                    metrics.extend([
                        f"# HELP server_network_bytes_in_total Total bytes received on interface {interface}",
                        f"# TYPE server_network_bytes_in_total counter",
                        f"server_network_bytes_in_total{{interface=\"{interface}\"}} {bytes_in}",
                        f"# HELP server_network_bytes_out_total Total bytes sent on interface {interface}",
                        f"# TYPE server_network_bytes_out_total counter",
                        f"server_network_bytes_out_total{{interface=\"{interface}\"}} {bytes_out}"
                    ])
        
        return metrics

if __name__ == "__main__":
    httpd = HTTPServer(('', PORT), MetricsHandler)
    print(f"Starting server health exporter on port {PORT}")
    httpd.serve_forever() 