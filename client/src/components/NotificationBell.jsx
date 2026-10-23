import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, AlertTriangle, Package, Info, AlertCircle } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // Polling every 25s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
      case 'REORDER_REQUIRED':
        return <AlertTriangle size={16} color="#d97706" />;
      case 'OUT_OF_STOCK':
        return <AlertCircle size={16} color="#dc2626" />;
      case 'ORDER_PLACED':
      case 'ORDER_STATUS':
        return <Package size={16} color="#2563eb" />;
      default:
        return <Info size={16} color="#475569" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          borderRadius: '8px',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '45px',
            width: '340px',
            maxHeight: '420px',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              Notifications ({unreadCount} new)
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => !item.isRead && markAsRead(item._id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: item.isRead ? '#ffffff' : '#f0f9ff',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getNotificationIcon(item.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: item.isRead ? 500 : 700,
                        color: 'var(--text-main)',
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
