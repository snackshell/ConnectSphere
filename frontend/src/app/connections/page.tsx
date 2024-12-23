'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnections } from '@/hooks/useConnections';
import { FriendsList } from '@/components/connections/FriendsList';
import { PendingRequestsList } from '@/components/connections/PendingRequestsList';

export default function ConnectionsPage() {
  const [friendsPage, setFriendsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);

  const {
    friends,
    totalFriends,
    currentFriendsPage,
    totalFriendsPages,
    isLoadingFriends,
    pendingRequests,
    totalPendingRequests,
    currentPendingPage,
    totalPendingPages,
    isLoadingPendingRequests,
    respondToRequest,
    blockUser,
    isResponding,
    isBlocking,
  } = useConnections(undefined, friendsPage);

  const handleAcceptRequest = (requestId: string) => {
    respondToRequest({ requestId, action: 'accept' });
  };

  const handleRejectRequest = (requestId: string) => {
    respondToRequest({ requestId, action: 'reject' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold">Connections</h1>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            <TabsTrigger
              value="friends"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Friends ({totalFriends})
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Requests ({totalPendingRequests})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <FriendsList
              friends={friends}
              currentPage={currentFriendsPage}
              totalPages={totalFriendsPages}
              isLoading={isLoadingFriends}
              onPageChange={setFriendsPage}
              onBlock={blockUser}
              isBlocking={isBlocking}
              showBlockButton
            />
          </TabsContent>

          <TabsContent value="requests">
            <PendingRequestsList
              requests={pendingRequests}
              currentPage={currentPendingPage}
              totalPages={totalPendingPages}
              isLoading={isLoadingPendingRequests}
              onPageChange={setRequestsPage}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              isResponding={isResponding}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
