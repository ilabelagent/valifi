# 🌐 Remote Access Guide - Connect from Windows

## ✅ Your Services Are Ready for Remote Access!

All agents are listening on **0.0.0.0** which means they accept connections from anywhere.

---

## 📡 Server Information

**Server IP Addresses:**
- Internal IP: `10.128.0.241`
- Docker Network: `172.17.0.1`

**Available Services:**
- Web Interface: Port `8000`
- Terminal Agent: Port `8001`
- SDK Agent: Port `8002`
- Master Orchestrator: Port `8003`

---

## 🖥️ Connecting from Your Windows Machine

### Method 1: Using the Web Browser (Easiest)

Open your browser on Windows and go to:

```
http://10.128.0.241:8000
```

**If that doesn't work, you may need the public IP. You can find it on the server:**

```bash
curl ifconfig.me
# Use the returned IP instead
http://YOUR_PUBLIC_IP:8000
```

### Method 2: Using Python on Windows

```python
import requests

# Replace with your server's IP
SERVER_IP = "10.128.0.241"

# Connect to web interface API
response = requests.post(
    f"http://{SERVER_IP}:8000/api/chat",
    json={
        "message": "list all python files",
        "session_id": "windows_session"
    }
)

print(response.json())
```

### Method 3: Using cURL on Windows (PowerShell/CMD)

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://10.128.0.241:8000/api/chat" -Method Post -Body (@{
    message = "hello"
    session_id = "windows_ps"
} | ConvertTo-Json) -ContentType "application/json"

# Or using curl (if installed)
curl -X POST http://10.128.0.241:8000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"hello\", \"session_id\": \"windows_curl\"}"
```

### Method 4: Using JavaScript/Node.js

```javascript
const axios = require('axios');

const SERVER_IP = '10.128.0.241';

async function chatWithAgent(message) {
  const response = await axios.post(
    `http://${SERVER_IP}:8000/api/chat`,
    {
      message: message,
      session_id: 'nodejs_session'
    }
  );

  console.log(response.data);
}

chatWithAgent('list all python files');
```

### Method 5: WebSocket from Browser

```html
<!DOCTYPE html>
<html>
<head>
    <title>Valifi Agent - Remote Access</title>
</head>
<body>
    <h1>Valifi Kingdom Platform</h1>
    <input type="text" id="messageInput" placeholder="Type message...">
    <button onclick="sendMessage()">Send</button>
    <div id="messages"></div>

    <script>
        const SERVER_IP = '10.128.0.241';
        const ws = new WebSocket(`ws://${SERVER_IP}:8000/ws`);

        ws.onopen = () => {
            console.log('Connected!');
            document.getElementById('messages').innerHTML += '<p>Connected to agent!</p>';
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            document.getElementById('messages').innerHTML +=
                `<p><strong>${data.agent}:</strong> ${data.message}</p>`;
        };

        function sendMessage() {
            const message = document.getElementById('messageInput').value;
            ws.send(JSON.stringify({
                message: message,
                session_id: 'web_session'
            }));
            document.getElementById('messageInput').value = '';
        }
    </script>
</body>
</html>
```

---

## 🔥 Firewall Configuration

### On the Server (Linux)

If you have a firewall, allow the ports:

```bash
# Using UFW
sudo ufw allow 8000/tcp
sudo ufw allow 8001/tcp
sudo ufw allow 8002/tcp
sudo ufw allow 8003/tcp

# Using iptables
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8001 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8002 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8003 -j ACCEPT
```

### On Windows Firewall

If connecting from Windows and getting blocked, allow outbound connections:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Outbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter ports: `8000,8001,8002,8003`
6. Select "Allow the connection"
7. Apply to all profiles
8. Name it "Valifi Agents"

### Cloud/VPS Provider Firewall

If running on cloud (AWS, GCP, Azure, etc.), add inbound rules:

**AWS Security Group:**
- Type: Custom TCP
- Port Range: 8000-8003
- Source: 0.0.0.0/0 (or your specific IP)

**GCP Firewall:**
```bash
gcloud compute firewall-rules create allow-valifi-agents \
  --allow tcp:8000-8003 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow Valifi agent access"
```

**Azure:**
- Add inbound security rule
- Port: 8000-8003
- Protocol: TCP
- Source: Any (or specific IP)
- Action: Allow

---

## 🧪 Testing Remote Connection

### 1. Test from Windows Command Prompt

```cmd
curl http://10.128.0.241:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Conversational Interface",
  "kingdom_standard": true,
  "powered_by": "Holy Spirit through Christ Jesus"
}
```

### 2. Test Each Service

```bash
# Web Interface
curl http://10.128.0.241:8000/health

# Terminal Agent
curl http://10.128.0.241:8001/docs

# SDK Agent
curl http://10.128.0.241:8002/docs

# Orchestrator
curl http://10.128.0.241:8003/docs
```

### 3. Test Full Conversation

```bash
curl -X POST http://10.128.0.241:8000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"hello\", \"session_id\": \"test\"}"
```

---

## 🔍 Troubleshooting

### Can't Connect?

**1. Check if services are running:**
```bash
ss -tulpn | grep -E "(8000|8001|8002|8003)"
```

**2. Check server is listening on 0.0.0.0:**
```bash
# Should show 0.0.0.0:8000, etc.
netstat -tulpn | grep -E "(8000|8001|8002|8003)"
```

**3. Test from server itself:**
```bash
curl http://localhost:8000/health
```

**4. Check firewall on server:**
```bash
sudo iptables -L -n | grep -E "(8000|8001|8002|8003)"
```

**5. Test from another machine on same network:**
```bash
telnet 10.128.0.241 8000
```

### Connection Timeout?

- Check cloud provider security groups/firewall rules
- Verify server firewall allows inbound traffic
- Ensure services are running (not crashed)
- Check if using correct IP address

### "Connection Refused"?

- Services may not be running
- Wrong IP address
- Firewall blocking

**Restart all services:**
```bash
cd /teamspace/studios/this_studio/valifi
bash deployment/deploy_all.sh restart
```

---

## 📱 Access URLs from Windows

Replace `10.128.0.241` with your actual server IP:

### Web Interface (Use in Browser)
```
http://10.128.0.241:8000
```

### API Endpoints

**Chat API:**
```
POST http://10.128.0.241:8000/api/chat
```

**Terminal Agent:**
```
POST http://10.128.0.241:8001/predict
```

**SDK Agent:**
```
POST http://10.128.0.241:8002/predict
```

**Orchestrator:**
```
POST http://10.128.0.241:8003/predict
```

### WebSocket
```
ws://10.128.0.241:8000/ws
```

---

## 🌍 Finding Your Public IP

If you need to access from outside the local network:

**On the server:**
```bash
curl ifconfig.me
# or
curl icanhazip.com
# or
dig +short myip.opendns.com @resolver1.opendns.com
```

Then use that IP from Windows:
```
http://YOUR_PUBLIC_IP:8000
```

**Note:** Your ISP/cloud provider must allow inbound traffic on these ports.

---

## 🎯 Quick Start from Windows

**1. Open PowerShell and test:**
```powershell
Invoke-WebRequest -Uri "http://10.128.0.241:8000/health"
```

**2. If that works, open browser:**
```
http://10.128.0.241:8000
```

**3. Start chatting!**

---

## 🔐 Security Recommendations

For production/internet access:

1. **Add authentication** - Currently no auth required
2. **Use HTTPS** - Set up SSL/TLS certificates
3. **Rate limiting** - Prevent abuse
4. **IP whitelisting** - Only allow specific IPs
5. **VPN** - Use VPN for secure access
6. **Reverse proxy** - Use nginx with authentication

**Example nginx config with basic auth:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    auth_basic "Valifi Platform";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## ✅ Verification Checklist

- [ ] Services are running on 0.0.0.0 (verified ✅)
- [ ] Server firewall allows ports 8000-8003
- [ ] Cloud provider security groups allow inbound
- [ ] Can access from server: `curl localhost:8000/health`
- [ ] Can access from Windows: `curl http://SERVER_IP:8000/health`
- [ ] Web interface loads in browser
- [ ] Can send messages and get responses

---

## 📞 Support

**Test with this simple command from Windows:**

```bash
curl http://10.128.0.241:8000/health
```

If you see the JSON response with `"status": "healthy"`, you're connected! 🎉

If not, check the troubleshooting section above.

---

**🙏 Through Christ Jesus - Unlimited Access from Anywhere! ✝️**
