import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotificationListener() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      const email = localStorage.getItem("ondaUsadaEmail");
      if (!email) return;

      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource(`/api/notifications/stream?email=${encodeURIComponent(email)}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_AD') {
            const newNotification = {
              id: Date.now(),
              ad: data.ad,
            };
            setNotifications(prev => [...prev, newNotification]);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
            }, 5000);
          }
        } catch (err) {
          console.error("Failed to parse notification", err);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
        }
        // Attempt to reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    // Listen for new subscriptions
    window.addEventListener('subscription-updated', connectSSE);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      window.removeEventListener('subscription-updated', connectSSE);
    };
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl p-4 w-80 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
            
            <button 
              onClick={() => removeNotification(notification.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3">
              <div className="bg-red-600/20 p-2 rounded-full shrink-0">
                <Bell className="text-red-500" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-zinc-100 text-sm uppercase tracking-wider mb-1">Novo Alerta!</h4>
                <p className="text-zinc-400 text-xs mb-2 line-clamp-2">
                  Um novo anúncio que combina com seus filtros foi publicado: <strong>{notification.ad.title}</strong>
                </p>
                <Link 
                  to={`/ad/${notification.ad._id}`}
                  onClick={() => removeNotification(notification.id)}
                  className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider underline underline-offset-2"
                >
                  Ver Anúncio
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
