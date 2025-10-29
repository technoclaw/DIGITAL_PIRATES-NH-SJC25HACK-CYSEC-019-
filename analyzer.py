import time
import re
import json
import requests
from datetime import datetime, timedelta
from collections import defaultdict
import os

class LogAnalyzer:
    def __init__(self):
        self.log_dir = "/app/logs"
        self.output_file = "n8n-workflow.json"
        self.n8n_webhook_url = "https://digital-pirates.app.n8n.cloud/webhook-test/log-analysis"
        self.analysis_interval = int(os.getenv('ANALYSIS_INTERVAL', '10'))
        
        # Track patterns for detection
        self.failed_ssh_attempts = defaultdict(list)
        self.failed_web_logins = defaultdict(list)
        self.suspicious_queries = defaultdict(list)
        
        # Detection thresholds
        self.thresholds = {
            'ssh_brute_force': {'count': 3, 'window': 60},
            'web_brute_force': {'count': 5, 'window': 120},
            'suspicious_db_query': {'count': 2, 'window': 300}
        }
        
        self.processed_files = set()
        self.incidents_buffer = []
        
        # Initialize or load existing JSON file
        self.initialize_output_file()
    
    def initialize_output_file(self):
        """Initialize the JSON output file with proper structure"""
        if not os.path.exists(self.output_file):
            initial_data = {
                "workflow_name": "Log Analysis Incident Workflow",
                "created_at": datetime.now().isoformat(),
                "incidents": []
            }
            with open(self.output_file, 'w') as f:
                json.dump(initial_data, f, indent=2)
            print(f"✅ Created new output file: {self.output_file}")
    
    def send_incident_to_webhook(self, incident_data):
        """Send incident data to n8n webhook"""
        try:
            response = requests.post(
                self.n8n_webhook_url,
                json=incident_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code in [200, 201, 202]:
                print(f"✅ Incident sent to webhook: {incident_data['incident_id']} - Status: {response.status_code}")
                return True
            else:
                print(f"❌ Failed to send incident to webhook: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending to webhook: {e}")
            return False
    
    def write_incident_to_file(self, incident_data):
        """Write detected incident to n8n-workflow.json file"""
        try:
            # Read existing data
            if os.path.exists(self.output_file):
                with open(self.output_file, 'r') as f:
                    data = json.load(f)
            else:
                data = {
                    "workflow_name": "Log Analysis Incident Workflow",
                    "created_at": datetime.now().isoformat(),
                    "incidents": []
                }
            
            # Add new incident
            data["incidents"].append(incident_data)
            data["last_updated"] = datetime.now().isoformat()
            
            # Write back to file
            with open(self.output_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"✅ Incident written to {self.output_file}: {incident_data['incident_id']}")
            return True
            
        except Exception as e:
            print(f"❌ Error writing to {self.output_file}: {e}")
            return False
    
    def process_incident(self, incident_data):
        """Process incident by sending to webhook and saving to file"""
        # Send to webhook
        webhook_success = self.send_incident_to_webhook(incident_data)
        
        # Save to file
        file_success = self.write_incident_to_file(incident_data)
        
        return webhook_success and file_success
    
    def analyze_ssh_log(self, line):
        """Analyze SSH log lines for brute force attacks"""
        # Failed password pattern
        failed_pattern = r'Failed password for (\w+) from (\d+\.\d+\.\d+\.\d+)'
        match = re.search(failed_pattern, line)
        
        if match:
            username = match.group(1)
            ip_address = match.group(2)
            timestamp = datetime.now()
            
            # Track failed attempts
            self.failed_ssh_attempts[ip_address].append(timestamp)
            
            # Check for brute force
            window_start = timestamp - timedelta(seconds=self.thresholds['ssh_brute_force']['window'])
            recent_attempts = [t for t in self.failed_ssh_attempts[ip_address] if t > window_start]
            
            if len(recent_attempts) >= self.thresholds['ssh_brute_force']['count']:
                # Brute force detected!
                incident = {
                    "incident_id": f"SSH-BF-{int(time.time())}",
                    "timestamp": timestamp.isoformat(),
                    "severity": "HIGH",
                    "source_ip": ip_address,
                    "event_type": "ssh_brute_force",
                    "description": f"SSH brute force attack detected from {ip_address}",
                    "attempt_count": len(recent_attempts),
                    "time_window": f"{self.thresholds['ssh_brute_force']['window']} seconds",
                    "target_user": username,
                    "log_source": "ssh.log",
                    "detection_rule": "failed_ssh_threshold",
                    "action_taken": "ip_block_recommended",
                    "confidence_score": 0.95,
                    "raw_logs": line.strip(),
                    "webhook_destination": self.n8n_webhook_url
                }
                
                self.process_incident(incident)
                # Clear attempts after detection
                self.failed_ssh_attempts[ip_address] = []
                
                return True
        
        return False
    
    def analyze_web_log(self, line):
        """Analyze web log lines for attacks"""
        # SQL injection pattern
        sql_injection_patterns = [
            r"'.*OR.*'1'='1",
            r"UNION.*SELECT",
            r"DROP.*TABLE",
            r"INSERT.*INTO",
            r"1';.*--"
        ]
        
        # XSS patterns
        xss_patterns = [
            r"<script>",
            r"javascript:",
            r"onload=",
            r"alert\("
        ]
        
        # Failed login pattern (401 status)
        if "401" in line or "403" in line:
            ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
            if ip_match:
                ip_address = ip_match.group(1)
                timestamp = datetime.now()
                
                self.failed_web_logins[ip_address].append(timestamp)
                
                # Check for web brute force
                window_start = timestamp - timedelta(seconds=self.thresholds['web_brute_force']['window'])
                recent_attempts = [t for t in self.failed_web_logins[ip_address] if t > window_start]
                
                if len(recent_attempts) >= self.thresholds['web_brute_force']['count']:
                    incident = {
                        "incident_id": f"WEB-BF-{int(time.time())}",
                        "timestamp": timestamp.isoformat(),
                        "severity": "MEDIUM",
                        "source_ip": ip_address,
                        "event_type": "web_brute_force",
                        "description": f"Web application brute force attack from {ip_address}",
                        "attempt_count": len(recent_attempts),
                        "time_window": f"{self.thresholds['web_brute_force']['window']} seconds",
                        "log_source": "web.log",
                        "detection_rule": "failed_web_login_threshold",
                        "action_taken": "rate_limit_recommended",
                        "confidence_score": 0.85,
                        "raw_logs": line.strip(),
                        "webhook_destination": self.n8n_webhook_url
                    }
                    
                    self.process_incident(incident)
                    self.failed_web_logins[ip_address] = []
                    return True
        
        # Check for SQL injection
        for pattern in sql_injection_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
                ip_address = ip_match.group(1) if ip_match else "Unknown"
                
                incident = {
                    "incident_id": f"SQLI-{int(time.time())}",
                    "timestamp": datetime.now().isoformat(),
                    "severity": "HIGH",
                    "source_ip": ip_address,
                    "event_type": "sql_injection",
                    "description": f"SQL injection attempt detected from {ip_address}",
                    "log_source": "web.log",
                    "detection_rule": "sql_injection_pattern",
                    "action_taken": "block_request",
                    "confidence_score": 0.90,
                    "raw_logs": line.strip(),
                    "webhook_destination": self.n8n_webhook_url
                }
                
                self.process_incident(incident)
                return True
        
        # Check for XSS
        for pattern in xss_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
                ip_address = ip_match.group(1) if ip_match else "Unknown"
                
                incident = {
                    "incident_id": f"XSS-{int(time.time())}",
                    "timestamp": datetime.now().isoformat(),
                    "severity": "MEDIUM",
                    "source_ip": ip_address,
                    "event_type": "xss_attempt",
                    "description": f"Cross-site scripting attempt from {ip_address}",
                    "log_source": "web.log",
                    "detection_rule": "xss_pattern",
                    "action_taken": "sanitize_input",
                    "confidence_score": 0.80,
                    "raw_logs": line.strip(),
                    "webhook_destination": self.n8n_webhook_url
                }
                
                self.process_incident(incident)
                return True
        
        return False
    
    def analyze_db_log(self, line):
        """Analyze database log lines for suspicious activity"""
        suspicious_patterns = [
            r"SELECT \* FROM users",
            r"DROP TABLE",
            r"UPDATE.*SET.*password",
            r"DELETE FROM.*where.*1=1"
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                user_match = re.search(r'user[:\s]*(\w+)', line)
                username = user_match.group(1) if user_match else "Unknown"
                
                timestamp = datetime.now()
                self.suspicious_queries[username].append(timestamp)
                
                # Check threshold
                window_start = timestamp - timedelta(seconds=self.thresholds['suspicious_db_query']['window'])
                recent_queries = [t for t in self.suspicious_queries[username] if t > window_start]
                
                if len(recent_queries) >= self.thresholds['suspicious_db_query']['count']:
                    incident = {
                        "incident_id": f"DB-ABUSE-{int(time.time())}",
                        "timestamp": timestamp.isoformat(),
                        "severity": "HIGH",
                        "source_user": username,
                        "event_type": "database_abuse",
                        "description": f"Suspicious database activity by user {username}",
                        "query_count": len(recent_queries),
                        "log_source": "database.log",
                        "detection_rule": "suspicious_query_pattern",
                        "action_taken": "review_privileges",
                        "confidence_score": 0.75,
                        "raw_logs": line.strip(),
                        "webhook_destination": self.n8n_webhook_url
                    }
                    
                    self.process_incident(incident)
                    self.suspicious_queries[username] = []
                    return True
        
        return False
    
    def analyze_log_file(self, filepath, log_type):
        """Analyze a specific log file"""
        try:
            if not os.path.exists(filepath):
                print(f"⚠️ Log file not found: {filepath}")
                return
            
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                lines = file.readlines()
                
                for line in lines:
                    if not line.strip():
                        continue
                    
                    incident_detected = False
                    
                    if log_type == 'ssh':
                        incident_detected = self.analyze_ssh_log(line)
                    elif log_type == 'web':
                        incident_detected = self.analyze_web_log(line)
                    elif log_type == 'database':
                        incident_detected = self.analyze_db_log(line)
                    elif log_type == 'application':
                        # Basic application log analysis
                        if 'error' in line.lower() or 'failed' in line.lower():
                            incident = {
                                "incident_id": f"APP-ERR-{int(time.time())}",
                                "timestamp": datetime.now().isoformat(),
                                "severity": "LOW",
                                "event_type": "application_error",
                                "description": f"Application error detected: {line.strip()[:100]}",
                                "log_source": "application.log",
                                "detection_rule": "error_pattern",
                                "action_taken": "investigate",
                                "confidence_score": 0.60,
                                "raw_logs": line.strip(),
                                "webhook_destination": self.n8n_webhook_url
                            }
                            self.process_incident(incident)
                            incident_detected = True
                    
                    if incident_detected:
                        print(f"🚨 Incident detected in {log_type}.log!")
                        
        except Exception as e:
            print(f"❌ Error analyzing {filepath}: {e}")
    
    def run_analysis(self):
        """Main analysis loop"""
        print("🔍 Starting Log Analysis Engine...")
        print(f"📊 Analysis interval: {self.analysis_interval} seconds")
        print(f"📁 Output file: {self.output_file}")
        print(f"🌐 Webhook URL: {self.n8n_webhook_url}")
        print("🎯 Monitoring for: SSH brute force, SQL injection, XSS, suspicious queries")
        
        log_files = {
            'web': f'{self.log_dir}/web.log',
            'ssh': f'{self.log_dir}/ssh.log', 
            'database': f'{self.log_dir}/database.log',
            'application': f'{self.log_dir}/application.log'
        }
        
        try:
            while True:
                print(f"\n⏰ Running analysis at {datetime.now().strftime('%H:%M:%S')}")
                
                for log_type, filepath in log_files.items():
                    self.analyze_log_file(filepath, log_type)
                
                # Cleanup old entries to prevent memory leaks
                self.cleanup_old_entries()
                
                time.sleep(self.analysis_interval)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping log analyzer...")
    
    def cleanup_old_entries(self):
        """Remove old entries from tracking dictionaries"""
        now = datetime.now()
        cleanup_time = now - timedelta(hours=1)
        
        for ip in list(self.failed_ssh_attempts.keys()):
            self.failed_ssh_attempts[ip] = [t for t in self.failed_ssh_attempts[ip] if t > cleanup_time]
            if not self.failed_ssh_attempts[ip]:
                del self.failed_ssh_attempts[ip]
        
        for ip in list(self.failed_web_logins.keys()):
            self.failed_web_logins[ip] = [t for t in self.failed_web_logins[ip] if t > cleanup_time]
            if not self.failed_web_logins[ip]:
                del self.failed_web_logins[ip]

def main():
    analyzer = LogAnalyzer()
    analyzer.run_analysis()

if __name__ == "__main__":
    main()