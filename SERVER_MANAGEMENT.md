# JSON2Video Server Management

## 🚀 Permanent Server Setup

Your JSON2Video servers are now configured to run permanently using PM2 (Process Manager 2). The servers will:

- ✅ **Auto-start** when the system boots
- ✅ **Auto-restart** if they crash
- ✅ **Stay running** 24/7
- ✅ **Monitor** performance and logs

## 📋 Quick Commands

Use the management script for easy control:

```bash
# Check server status
./manage.sh status

# View server logs
./manage.sh logs

# Restart servers
./manage.sh restart

# Health check
./manage.sh health

# Open monitoring interface
./manage.sh monitor
```

## 🔧 PM2 Commands

Direct PM2 commands:

```bash
# View all processes
pm2 status

# View logs
pm2 logs

# Restart specific service
pm2 restart json2video-server
pm2 restart json2video-client

# Stop services
pm2 stop json2video-server json2video-client

# Start services
pm2 start ecosystem.config.js
pm2 start "npm start" --name "json2video-client" --cwd client

# Save current configuration
pm2 save

# Monitor in real-time
pm2 monit
```

## 📊 Server Information

- **Backend Server**: `http://localhost:5000`
- **Frontend Server**: `http://localhost:3000`
- **Health Check**: `http://localhost:5000/api/health`

## 🛠️ Troubleshooting

### If servers stop running:

1. **Check status**: `./manage.sh status`
2. **View logs**: `./manage.sh logs`
3. **Restart**: `./manage.sh restart`
4. **Manual start**: `./manage.sh start`

### If PM2 is not working:

```bash
# Reinstall PM2
npm install -g pm2

# Restore saved processes
pm2 resurrect

# Re-enable startup
pm2 startup
pm2 save
```

### System reboot:

The servers will automatically start after system reboot. If they don't:

```bash
# Check if PM2 startup is enabled
systemctl status pm2-root

# Re-enable if needed
pm2 startup
pm2 save
```

## 📁 File Structure

```
json2video/
├── ecosystem.config.js    # PM2 configuration
├── manage.sh             # Management script
├── logs/                 # Server logs
├── server/               # Backend code
└── client/               # Frontend code
```

## 🔍 Monitoring

- **Real-time monitoring**: `pm2 monit`
- **Log files**: Located in `logs/` directory
- **PM2 logs**: `pm2 logs --lines 100`

## 🚨 Important Notes

- Servers are configured to auto-restart on crashes
- Memory limit: 1GB per process
- Logs are automatically rotated
- Configuration is saved and restored on reboot

## 📞 Support

If you encounter issues:

1. Check the logs: `./manage.sh logs`
2. Restart the services: `./manage.sh restart`
3. Check system resources: `pm2 monit`
4. Verify network connectivity: `./manage.sh health` 