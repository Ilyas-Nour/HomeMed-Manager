import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

  // We now use the global dashboard query to avoid redundant requests
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard_data', profilActif?.id],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
    },
    enabled: !!profilActif?.id,
    staleTime: 60000,
  });

  // Sync state with query data
  useEffect(() => {
    if (dashboardData?.notifications) {
      const mapped = dashboardData.notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
        read: !!n.read_at,
        timestamp: n.created_at
      }));
      setNotifications(mapped);
      notificationsRef.current = mapped;
    }
  }, [dashboardData]);

  const fetchNotifications = useCallback(async () => {
    // This is now handled by the useQuery invalidate in refreshData
    return;
  }, []);

  const playSound = (type = 'reminder') => {
    try {
      const audio = new Audio(type === 'stock' ? '/notification-stock.mp3' : '/notification.mp3');
      audio.play().catch(e => console.log('Audio autoplay prevented:', e));
    } catch (error) {
      console.error('Audio play error', error);
    }
  };  const checkReminders = useCallback(async () => {
    if (!isAuthenticated || !profilActif) return;
    
    try {
      const res = await api.get('/planning/due');
      const dueItems = res.data || [];
      
      const now = new Date();

      for (const item of dueItems) {
        const key = `rem-${item.id}-${item.heure}-${now.toDateString()}`;

        if (!notifiedReminders.current.has(key)) {
            // Check in sync state to prevent duplicates
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

                    // On n'affiche le popup que si l'heure est très proche (ex: 10 minutes)
                    // Sinon, ça reste seulement dans le menu des notifications
                    const [h, m] = item.heure.split(':');
                    const scheduledTime = new Date();
                    scheduledTime.setHours(parseInt(h), parseInt(m), 0, 0);
                    const diffInMinutes = Math.abs(new Date() - scheduledTime) / (1000 * 60);

                    if (diffInMinutes <= 10) {
                        setActivePopup(item);
                        playSound('reminder');
                    }
                } catch (e) {
                    console.error('Fail to save notification', e);
                }
            } else {
                notifiedReminders.current.add(key);
            }
        }
      }
    } catch (err) {
      console.error('Erreur checkReminders:', err);
    }
  }, [isAuthenticated, profilActif]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated && profilActif) {
      // Integration temps réel via Echo
      import('../services/echo').then(({ default: echo }) => {
        const channelName = `App.Models.Profil.${profilActif.id}`;
        
        echo.private(channelName)
          .listen('DataChanged', (e) => {
            console.log('Real-time update received:', e);
            // On invalide les données globales du dashboard
            queryClient.invalidateQueries({ queryKey: ['dashboard_data', profilActif.id] });
          });

        return () => echo.leave(channelName);
      });

      // Polling très espacé en backup
      const delay = setTimeout(() => {
        checkReminders();
        intervalRef.current = setInterval(checkReminders, 300000); 
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
  }, [isAuthenticated, profilActif, checkReminders]);

  const [pendingIds, setPendingIds] = useState(new Set());

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      notificationsRef.current = notificationsRef.current.map(n => ({ ...n, read: true }));
      
      await api.patch('/notifications/read-all');
    } catch (err) {
      console.error(err);
      // Rollback would go here if we had a persistent state to revert to
    }
  };

  const markAsRead = async (id) => {
    if (pendingIds.has(id)) return;
    
    setPendingIds(prev => new Set(prev).add(id));
    
    // Optimistic UI change
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    notificationsRef.current = notificationsRef.current.map(n => n.id === id ? { ...n, read: true } : n);

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      // If 404, it might be already read or deleted, no need to rollback
      if (err.response?.status !== 404) {
        console.error(err);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
      }
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      notificationsRef.current = [];
      await api.delete('/notifications/clear-all');
    } catch (err) {
      console.error(err);
    }
  };

  const removeNotification = async (id) => {
    if (pendingIds.has(id)) return;
    setPendingIds(prev => new Set(prev).add(id));

    // Optimistic UI change
    const original = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));
    notificationsRef.current = notificationsRef.current.filter(n => n.id !== id);

    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(err);
        setNotifications(original);
      }
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
      pendingIds,
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
