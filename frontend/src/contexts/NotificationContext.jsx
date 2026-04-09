import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { isAuthenticated, profilActif } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  
  // Cache pour éviter de notifier plusieurs fois le même rappel dans la session
  const notifiedReminders = useRef(new Set());
  const intervalRef = useRef(null);
  const notificationsRef = useRef([]); // Ref pour accès synchrone dans checkReminders

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !profilActif) return;
    try {
      const res = await api.get('/notifications');
      const mapped = res.data.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        read: !!n.read_at,
        timestamp: n.created_at
      }));
      setNotifications(mapped);
      notificationsRef.current = mapped;
    } catch (err) {
      console.error('Err fetch notifications:', err);
    }
  }, [isAuthenticated, profilActif]);

  const playSound = (type = 'reminder') => {
    try {
      const audio = new Audio(type === 'stock' ? '/notification-stock.mp3' : '/notification.mp3');
      audio.play().catch(e => console.log('Audio autoplay prevented:', e));
    } catch (error) {
      console.error('Audio play error', error);
    }
  };

  const checkReminders = useCallback(async () => {
    if (!isAuthenticated || !profilActif) return;
    
    try {
      const res = await api.get('/dashboard/summary');
      const schedule = res.data?.planning?.schedule || {};
      
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      // Utilisation d'une boucle for...of pour gérer l'asynchronisme séquentiellement
      const moments = Object.keys(schedule);
      for (const moment of moments) {
        const items = schedule[moment];
        for (const item of items) {
          if (!item.pris && item.heure) {
            const timeParts = item.heure.split(':');
            if (timeParts.length < 2) continue;
            
            const h = parseInt(timeParts[0]);
            const m = parseInt(timeParts[1]);
            
            const isDue = (h < currentH) || (h === currentH && m <= currentM);
            const key = `rem-${item.id}-${h}:${m}-${now.toDateString()}`;

            if (isDue && !notifiedReminders.current.has(key)) {
              // On vérifie dans la Ref (état synchrone) pour éviter les doublons instantanés
              const alreadyNotified = notificationsRef.current.some(n => 
                n.type === 'reminder' && 
                n.data?.id === item.id && 
                new Date(n.timestamp).toDateString() === now.toDateString() &&
                n.data?.heure.substring(0, 5) === item.heure.substring(0, 5)
              );

              if (!alreadyNotified) {
                notifiedReminders.current.add(key);
                
                try {
                  const notifRes = await api.post('/notifications', {
                    profil_id: profilActif.id,
                    type: 'reminder',
                    title: "Heure de prise",
                    message: `Il est l'heure de prendre ${item.medicament} (${item.heure.substring(0,5)})`,
                    data: item
                  });

                  const newNotif = {
                    id: notifRes.data.id,
                    type: 'reminder',
                    title: "Heure de prise",
                    message: `Il est l'heure de prendre ${item.medicament} (${item.heure.substring(0,5)})`,
                    data: item,
                    read: false,
                    timestamp: new Date().toISOString()
                  };

                  setNotifications(prev => {
                    const next = [newNotif, ...prev];
                    notificationsRef.current = next;
                    return next;
                  });
                  setActivePopup(item);
                  playSound('reminder');
                } catch (e) {
                  console.error('Fail to save notification', e);
                }
              } else {
                notifiedReminders.current.add(key);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Erreur checkReminders:', err);
    }
  }, [isAuthenticated, profilActif]); // Ne dépend plus de 'notifications' -> Intervalle STABLE

  useEffect(() => {
    if (isAuthenticated && profilActif) {
      fetchNotifications();
      
      // Démarrage de l'intervalle fixe (ne change jamais tant que profilActif est là)
      const delay = setTimeout(() => {
        checkReminders();
        intervalRef.current = setInterval(checkReminders, 30000); 
      }, 2000);

      return () => {
        clearTimeout(delay);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      setNotifications([]);
      notificationsRef.current = [];
      notifiedReminders.current.clear();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isAuthenticated, profilActif, checkReminders, fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      notificationsRef.current = notificationsRef.current.map(n => ({ ...n, read: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      notificationsRef.current = notificationsRef.current.map(n => n.id === id ? { ...n, read: true } : n);
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      notificationsRef.current = [];
    } catch (err) {
      console.error(err);
    }
  };

  const removeNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const next = notificationsRef.current.filter(n => n.id !== id);
      setNotifications(next);
      notificationsRef.current = next;
    } catch (err) {
      console.error(err);
    }
  };
  
  const dismissPopup = () => {
    setActivePopup(null);
  };
  
  const markPris = async (item) => {
    try {
      await api.post('/prises/toggle', {
        rappel_id: item.id,
        date_prise: new Date().toISOString().split('T')[0],
        pris: true
      });
      dismissPopup();
      fetchNotifications();
    } catch (err) {
      console.error('Error recording prise', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      activePopup,
      markAllAsRead,
      markAsRead,
      clearAll,
      removeNotification,
      dismissPopup,
      markPris,
      playSound,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
