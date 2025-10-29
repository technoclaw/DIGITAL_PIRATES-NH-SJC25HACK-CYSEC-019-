import logging
import random
import time
import json
from datetime import datetime
import os

# Configure logging to file
log_dir = "/app/logs"
os.makedirs(log_dir, exist_ok=True)

# Set up different loggers for different services
def setup_logger(name, log_file, level=logging.INFO):
    handler = logging.FileHandler(log_file)
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.addHandler(handler)
    
    return logger

# Create loggers for different services
web_logger = setup_logger('web_server', f'{log_dir}/web.log')
ssh_logger = setup_logger('ssh_server', f'{log_dir}/ssh.log')
db_logger = setup_logger('database', f'{log_dir}/database.log')
app_logger = setup_logger('application', f'{log_dir}/application.log')

# Sample data for realistic log generation
users = ['admin', 'john', 'alice', 'bob', 'root', 'www-data']
ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45', '198.51.100.23']
endpoints = ['/api/login', '/admin', '/wp-login.php', '/api/users', '/database', '/ssh']
events = ['login_success', 'login_failed', 'file_access', 'config_change', 'error']

def generate_web_log():
    ip = random.choice(ips)
    user = random.choice(users)
    endpoint = random.choice(endpoints)
    status = random.choice([200, 404, 500, 403])
    
    if random.random() < 0.1:  # 10% chance of suspicious activity
        # Generate attack patterns
        attack_type = random.choice(['sql_injection', 'xss', 'brute_force', 'dir_traversal'])
        if attack_type == 'sql_injection':
            message = f"{ip} - {user} [15/Jan/2024:10:30:45 +0000] \"GET {endpoint}?id=1' OR '1'='1 HTTP/1.1\" {status} 1234"
        elif attack_type == 'brute_force':
            message = f"{ip} - {user} [15/Jan/2024:10:30:45 +0000] \"POST /api/login HTTP/1.1\" 401 567"
        else:
            message = f"{ip} - {user} [15/Jan/2024:10:30:45 +0000] \"GET {endpoint} HTTP/1.1\" {status} 1234"
    else:
        # Normal traffic
        message = f"{ip} - {user} [15/Jan/2024:10:30:45 +0000] \"GET {endpoint} HTTP/1.1\" {status} 1234"
    
    web_logger.info(message)
    return message

def generate_ssh_log():
    ip = random.choice(ips)
    user = random.choice(users)
    
    if random.random() < 0.15:  # 15% chance of failed login
        message = f"Failed password for {user} from {ip} port 22 ssh2"
        ssh_logger.warning(message)
    else:
        message = f"Accepted password for {user} from {ip} port 22 ssh2"
        ssh_logger.info(message)
    
    return message

def generate_db_log():
    user = random.choice(users)
    operation = random.choice(['SELECT', 'INSERT', 'UPDATE', 'DELETE'])
    table = random.choice(['users', 'products', 'orders', 'config'])
    
    if random.random() < 0.08:  # 8% chance of suspicious query
        if operation == 'SELECT' and table == 'users':
            message = f"Suspicious query: {user} executed '{operation} * FROM {table}'"
            db_logger.warning(message)
        else:
            message = f"Query executed: {user} - {operation} on {table}"
            db_logger.info(message)
    else:
        message = f"Query executed: {user} - {operation} on {table}"
        db_logger.info(message)
    
    return message

def generate_app_log():
    user = random.choice(users)
    event = random.choice(events)
    
    if event == 'login_failed' and random.random() < 0.3:
        message = f"Security alert: Multiple failed login attempts for user {user}"
        app_logger.warning(message)
    elif event == 'error':
        message = f"Application error: Database connection failed for user {user}"
        app_logger.error(message)
    else:
        message = f"User {user} performed {event}"
        app_logger.info(message)
    
    return message

def main():
    print("🚀 Starting Log Generator...")
    print("📝 Generating realistic log data every 5 seconds")
    print("🔍 Some logs will contain simulated attack patterns")
    
    log_functions = [generate_web_log, generate_ssh_log, generate_db_log, generate_app_log]
    
    try:
        while True:
            # Generate logs from random services
            for _ in range(random.randint(1, 3)):
                log_func = random.choice(log_functions)
                log_message = log_func()
                print(f"📄 Generated: {log_message[:80]}...")
            
            time.sleep(5)  # Wait 5 seconds
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping log generator...")

if __name__ == "__main__":
    main()