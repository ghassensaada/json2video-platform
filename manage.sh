#!/bin/bash

# JSON2Video Server Management Script
# Usage: ./manage.sh [start|stop|restart|status|logs|monitor]

case "$1" in
    start)
        echo "🚀 Starting JSON2Video server..."
        pm2 start ecosystem.config.js
        pm2 save
        echo "✅ Server started successfully!"
        echo "📝 Note: Frontend is served via Nginx static files"
        ;;
    stop)
        echo "🛑 Stopping JSON2Video server..."
        pm2 stop json2video-server
        echo "✅ Server stopped!"
        ;;
    restart)
        echo "🔄 Restarting JSON2Video server..."
        pm2 restart json2video-server
        echo "✅ Server restarted!"
        ;;
    status)
        echo "📊 Server Status:"
        pm2 status
        ;;
    logs)
        echo "📝 Server Logs:"
        pm2 logs --lines 50
        ;;
    monitor)
        echo "📈 Opening PM2 Monitor..."
        pm2 monit
        ;;
    health)
        echo "🏥 Health Check:"
        echo "Backend: $(curl -s http://localhost:5000/api/health | head -1)"
        echo "Frontend: $(curl -s http://31.97.15.216/json2video/ | head -1)"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|monitor|health}"
        echo ""
        echo "Commands:"
        echo "  start   - Start backend server (frontend served via Nginx)"
        echo "  stop    - Stop backend server"
        echo "  restart - Restart backend server"
        echo "  status  - Show server status"
        echo "  logs    - Show recent logs"
        echo "  monitor - Open PM2 monitoring interface"
        echo "  health  - Check server health"
        exit 1
        ;;
esac 