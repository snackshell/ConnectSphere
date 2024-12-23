'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationsList } from '@/components/notifications/NotificationsList';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const {
    notifications,
    total,
    currentPage,
    totalPages,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(page);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold">Notifications</h1>
        </div>

        <NotificationsList
          notifications={notifications}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
        />
      </div>
    </div>
  );
}
