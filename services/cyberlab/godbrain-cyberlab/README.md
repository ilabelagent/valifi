# GodBrain CyberLab Professional - CEH v10 Training Environment

## 🎯 Professional Cybersecurity Training Platform

A comprehensive, professional-grade cybersecurity training environment designed for CEH v10 certification, penetration testing education, and security awareness training. Features a modern GUI launcher and advanced training modules.

![GodBrain CyberLab](https://img.shields.io/badge/GodBrain-CyberLab-blue?style=for-the-badge&logo=security)
![CEH v10](https://img.shields.io/badge/CEH-v10%20Compatible-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## ✨ Features

### 🖥️ Professional GUI Application
- **Modern Electron-based interface** with dark theme
- **Real-time monitoring** and statistics
- **Integrated tools** for all training modules
- **Professional dashboard** with analytics
- **Network tools** and payload generators
- **Activity logging** and export capabilities

### 🎣 Advanced Phishing Laboratory
- **Interactive phishing scenarios** (Email, SMS, Social Engineering)
- **Real-time analytics** and effectiveness tracking
- **Educational alerts** and security best practices
- **Comprehensive logging** (no sensitive data stored)
- **Multiple attack vectors** for comprehensive training

### 🔧 Complete Training Module Suite
- **SQL Injection** simulation and prevention
- **XSS (Cross-Site Scripting)** playground
- **MITM (Man-in-the-Middle)** attack scenarios
- **DDoS simulation** and mitigation techniques
- **Keylogger detection** and prevention
- **Cookie analysis** and session management
- **Proxy tools** and traffic interception

### 🛡️ Security & Compliance
- **Local-only operation** for security
- **No credential collection** (educational only)
- **Comprehensive audit logs**
- **CEH ethical guidelines** compliance
- **Professional deployment** ready

## 🚀 Quick Start

### Windows
```bash
# Simply double-click the launcher
launch-cyberlab.bat
```

### Linux/macOS
```bash
# Make executable and run
chmod +x launch-cyberlab.sh
./launch-cyberlab.sh
```

### Manual Installation
```bash
# Install dependencies
npm install

# Install GUI dependencies
cd gui && npm install && cd ..

# Start the professional launcher
cd gui && npm start
```

## 🎯 Training Modes

### 1. Full GUI Application (Recommended)
- Complete professional interface
- All tools integrated
- Real-time monitoring
- Advanced analytics

### 2. Server Only (CLI)
- Command-line operation
- Web interface access
- Lightweight deployment
- Scriptable automation

### 3. Development Mode
- Hot reload capabilities
- Advanced debugging
- Module development
- Custom modifications

## 📊 Dashboard Features

### Real-time Monitoring
- **Live statistics** for all training activities
- **Connection monitoring** and session tracking
- **Incident logging** with detailed analytics
- **Performance metrics** and uptime tracking

### Training Analytics
- **Phishing awareness** effectiveness tracking
- **User behavior** analysis and patterns
- **Security improvement** metrics
- **Comprehensive reporting** and data export

### Professional Tools
- **Payload generator** for various platforms
- **Network scanner** with multiple scan types
- **SSL certificate** generation for HTTPS training
- **Activity logs** with export capabilities

## 🎓 Educational Modules

### Phishing Awareness Training
- **Email phishing** simulation with realistic scenarios
- **SMS/OTP attacks** and SIM swapping demonstrations
- **Social engineering** techniques and defense strategies
- **Legitimate login** comparison for security awareness

### Web Application Security
- **SQL injection** with hands-on exploitation
- **XSS attacks** and prevention techniques
- **Cookie security** and session management
- **CSRF protection** and secure coding practices

### Network Security
- **MITM attacks** and detection methods
- **DDoS simulation** and mitigation strategies
- **Network scanning** and reconnaissance
- **Traffic analysis** and packet inspection

## 🔒 Security & Ethics

### Ethical Guidelines
- ✅ **Educational purposes only**
- ✅ **Authorized environments only**
- ✅ **No real credential collection**
- ✅ **CEH code of ethics compliance**
- ✅ **Responsible disclosure principles**

### Technical Security
- 🔐 **Local-only deployment**
- 🔐 **Network request blocking**
- 🔐 **Comprehensive audit logging**
- 🔐 **Session management**
- 🔐 **Data sanitization**

## 📁 Project Structure

```
godbrain-cyberlab/
├── gui/                    # Professional Electron GUI
│   ├── main.js            # Main Electron process
│   ├── index.html         # GUI interface
│   ├── renderer.js        # UI logic and interactions
│   └── package.json       # GUI dependencies
├── modules/               # Training modules
│   ├── phishing-demo.js   # Enhanced phishing lab
│   ├── sqli-demo.js       # SQL injection training
│   ├── xss-demo.js        # XSS playground
│   ├── mitm-simulation.js # MITM attack scenarios
│   └── ...                # Additional modules
├── public/                # Web interface assets
├── assets/                # Icons and resources
├── certs/                 # SSL certificates
├── logs/                  # Training activity logs
├── server.js              # Main Express server
├── package.json           # Project dependencies
├── launch-cyberlab.bat    # Windows launcher
├── launch-cyberlab.sh     # Linux/macOS launcher
└── README.md              # This documentation
```

## 🛠️ Advanced Configuration

### Server Settings
```bash
# Custom ports
PORT=5000 HTTPS_PORT=5443 npm start

# Development mode
NODE_ENV=development npm run dev

# Production deployment
NODE_ENV=production npm start
```

### GUI Settings
- **Auto-start server** on application launch
- **Custom port configuration**
- **Theme selection** (dark/light)
- **Network logging** toggle
- **SSL certificate** management

## 📚 CEH v10 Compliance

This training environment is specifically designed to support CEH v10 certification objectives:

- **Footprinting and Reconnaissance**
- **Scanning and Enumeration**
- **System Hacking**
- **Web Application Penetration Testing**
- **Social Engineering**
- **Denial of Service**
- **Session Hijacking**
- **Hacking Wireless Networks**

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/macOS

# Use different ports
PORT=5001 npm start
```

**GUI won't start:**
```bash
# Reinstall GUI dependencies
cd gui
rm -rf node_modules
npm install
npm start
```

**SSL certificate errors:**
```bash
# Regenerate certificates
rm -rf certs/*
# Use GUI SSL generator or manual OpenSSL
```

### Support & Documentation

- 📖 **Built-in help** system in GUI
- 🔗 **Interactive tutorials** for each module
- 📊 **Comprehensive logging** for troubleshooting
- 🎯 **Professional support** for enterprise deployments

## 🤝 Contributing

This is a professional educational tool. Contributions should:
- ✅ Maintain ethical standards
- ✅ Enhance learning objectives
- ✅ Follow security best practices
- ✅ Include proper documentation
- ✅ Support CEH curriculum alignment

## 📜 License

MIT License - Educational and authorized testing use only.

**Important**: This tool is for educational purposes and authorized penetration testing only. Users must comply with all applicable laws, regulations, and ethical guidelines.

---

## 🎉 Getting Started

1. **Download** or clone this repository
2. **Run** the appropriate launcher for your system
3. **Choose** GUI mode for the full professional experience
4. **Start training** with the comprehensive phishing lab
5. **Explore** all training modules and security tools
6. **Monitor** progress with real-time analytics
7. **Export** data for training records and compliance

**Ready to enhance your cybersecurity skills? Launch GodBrain CyberLab now!**

---

*GodBrain CyberLab Professional - Empowering the next generation of ethical hackers and cybersecurity professionals.*
