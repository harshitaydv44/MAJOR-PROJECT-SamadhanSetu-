import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { getSocket } from '../../services/socket';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  FolderKanban,
  Briefcase,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [processingId, setProcessingId] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.getMyNotifications(filter);
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Failed to retrieve government state alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      const handleLiveNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
      };

      socket.on('notification', handleLiveNotification);
      socket.on('new_challenge_submitted', fetchNotifications);
      socket.on('ai_analysis_completed', fetchNotifications);
      socket.on('proposal_submitted', fetchNotifications);
      socket.on('project_status_updated', fetchNotifications);

      return () => {
        socket.off('notification', handleLiveNotification);
        socket.off('new_challenge_submitted', fetchNotifications);
        socket.off('ai_analysis_completed', fetchNotifications);
        socket.off('proposal_submitted', fetchNotifications);
        socket.off('project_status_updated', fetchNotifications);
      };
    }
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    setProcessingId(id);
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
    } catch (err) {
      alert(err.message || 'Failed to mark all notifications as read');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="space-y-6 font-serif">
      {/* Top Banner */}
      <div className="bg-white border border-gov-border rounded-sm p-6 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-serif text-gov-navy font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4 text-gov-maroon" />
            <span>State Nodal Dispatch & Real-Time Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gov-navy leading-tight">
            Administrative Notifications & Logs
          </h1>
          <p className="text-xs font-serif text-gov-text-secondary mt-1 max-w-3xl leading-relaxed">
            Live updates on citizen challenge submissions, AI intelligence completion, university proposals, and municipal milestone audits.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              icon={CheckCheck}
            >
              Mark All Read ({unreadCount})
            </Button>
          )}
          <Button variant="subtle" size="sm" onClick={fetchNotifications} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gov-border">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
            filter === 'all'
              ? 'border-gov-maroon text-gov-maroon'
              : 'border-transparent text-gov-text-muted hover:text-gov-navy'
          }`}
        >
          All Alerts ({notifications.length})
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
            filter === 'unread'
              ? 'border-gov-maroon text-gov-maroon'
              : 'border-transparent text-gov-text-muted hover:text-gov-navy'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notification Stream */}
      {loading ? (
        <LoadingState message="Loading administrative notification stream..." />
      ) : error ? (
        <ErrorState
          title="Notification Dispatch Unavailable"
          message={error}
          onRetry={fetchNotifications}
          retryLabel="Retry Dispatch Connection"
        />
      ) : notifications.length === 0 ? (
        <Card accent="none">
          <EmptyState
            title="No Notifications"
            description={
              filter === 'unread'
                ? 'All administrative alerts have been reviewed and marked as read.'
                : 'No alerts recorded in the municipal dispatch system.'
            }
          />
        </Card>
      ) : (
        <Card accent="navy" className="divide-y divide-gov-border p-0 overflow-hidden">
          {notifications.map((n) => {
            const isUnread = !n.isRead && !n.read;
            const targetLink =
              n.challenge || (n.relatedEntity === 'Challenge' && n.relatedEntityId)
                ? `/admin/challenges/${n.challenge?._id || n.challenge || n.relatedEntityId}`
                : n.project || (n.relatedEntity === 'Project' && n.relatedEntityId)
                ? `/admin/projects/${n.project?._id || n.project || n.relatedEntityId}`
                : null;

            return (
              <div
                key={n._id}
                className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                  isUnread ? 'bg-amber-50/50' : 'bg-white hover:bg-gov-sand-50/50'
                }`}
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1 flex-shrink-0">
                    {n.type?.includes('CHALLENGE') ? (
                      <FolderKanban className="w-4 h-4 text-gov-maroon" />
                    ) : n.type?.includes('PROJECT') ? (
                      <Briefcase className="w-4 h-4 text-gov-navy" />
                    ) : (
                      <Bell className="w-4 h-4 text-amber-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gov-navy text-xs">{n.title}</span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Unread"></span>
                      )}
                      <span className="text-[10px] text-gov-text-muted">
                        &bull; {formatDate(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gov-text-secondary leading-relaxed">{n.message}</p>

                    {targetLink && (
                      <div className="pt-1">
                        <Link
                          to={targetLink}
                          className="inline-flex items-center text-[11px] font-bold text-gov-maroon hover:underline"
                        >
                          <span>View Associated Record</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-start">
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={processingId === n._id}
                      onClick={() => handleMarkAsRead(n._id)}
                      className="text-[10px] text-gov-text-muted hover:text-gov-navy"
                    >
                      {processingId === n._id ? 'Saving...' : 'Mark Read'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
