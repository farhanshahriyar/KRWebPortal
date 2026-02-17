
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { Bell } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge";
// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";

// interface Notification {
//   id: number;
//   title: string;
//   message: string;
//   time: string;
//   read: boolean;
//   type: 'noc' | 'attendance' | 'leave' | 'update' | 'system';
// }

// export function NotificationsButton() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Function to mark a notification as read
//   const markAsRead = (id: number) => {
//     setNotifications(prevNotifications => 
//       prevNotifications.map(notification => 
//         notification.id === id ? { ...notification, read: true } : notification
//       )
//     );
//   };

//   // Function to mark all notifications as read
//   const markAllAsRead = () => {
//     setNotifications(prevNotifications => 
//       prevNotifications.map(notification => ({ ...notification, read: true }))
//     );
//   };

//   // Add a new notification
//   const addNotification = (notification: Omit<Notification, 'id'>) => {
//     setNotifications(prevNotifications => [
//       { 
//         ...notification, 
//         id: prevNotifications.length ? Math.max(...prevNotifications.map(n => n.id)) + 1 : 1 
//       },
//       ...prevNotifications
//     ]);
//   };

//   // Setup real-time listeners for notifications
//   useEffect(() => {
//     // Initial notifications (simulating fetched data)
//     setTimeout(() => {
//       setNotifications([
//         {
//           id: 1,
//           title: "New NOC Request",
//           message: "John Doe has submitted a new NOC request",
//           time: "2 hours ago",
//           read: false,
//           type: 'noc'
//         },
//         {
//           id: 2,
//           title: "Update Log Added",
//           message: "A new update log has been added to the system",
//           time: "5 hours ago",
//           read: true,
//           type: 'update'
//         },
//       ]);
//       setLoading(false);
//     }, 1000);

//     // Setup attendance notification channel
//     const attendanceChannel = supabase
//       .channel('attendance-notifications')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'attendance'
//         },
//         async (payload) => {
//           // Get user details
//           const { data: userProfile } = await supabase
//             .from('profiles')
//             .select('full_name')
//             .eq('id', payload.new.user_id)
//             .single();

//           const userName = userProfile?.full_name || 'A team member';
//           const status = payload.new.status;

//           addNotification({
//             title: "New Attendance",
//             message: `${userName} has marked attendance as ${status}`,
//             time: "Just now",
//             read: false,
//             type: 'attendance'
//           });
//         }
//       )
//       .subscribe();

//     // Setup NOC requests notification channel
//     const nocChannel = supabase
//       .channel('noc-notifications')
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'noc_requests'
//         },
//         async (payload) => {
//           if (payload.old.status !== payload.new.status) {
//             // Get user details
//             const { data: userProfile } = await supabase
//               .from('profiles')
//               .select('full_name')
//               .eq('id', payload.new.user_id)
//               .single();

//             const userName = userProfile?.full_name || 'A team member';
//             const status = payload.new.status;

//             addNotification({
//               title: `NOC Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
//               message: `${userName}'s NOC request has been ${status}`,
//               time: "Just now",
//               read: false,
//               type: 'noc'
//             });
//           }
//         }
//       )
//       .subscribe();

//     // Setup leave requests notification channel
//     const leaveChannel = supabase
//       .channel('leave-notifications')
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'leave_requests'
//         },
//         async (payload) => {
//           if (payload.old.status !== payload.new.status) {
//             // Get user details
//             const { data: userProfile } = await supabase
//               .from('profiles')
//               .select('full_name')
//               .eq('id', payload.new.user_id)
//               .single();

//             const userName = userProfile?.full_name || 'A team member';
//             const status = payload.new.status;
//             const days = payload.new.requested_days.length;

//             addNotification({
//               title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
//               message: `${userName}'s leave request for ${days} day(s) has been ${status}`,
//               time: "Just now",
//               read: false,
//               type: 'leave'
//             });
//           }
//         }
//       )
//       .subscribe();

//     // Setup update logs notification channel
//     const updateLogsChannel = supabase
//       .channel('update-logs-notifications')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'update_logs'
//         },
//         async (payload) => {
//           addNotification({
//             title: "New Update Log",
//             message: `A new update log has been added: ${payload.new.title || 'Update'}`,
//             time: "Just now",
//             read: false,
//             type: 'update'
//           });
//         }
//       )
//       .subscribe();

//     // Clean up all listeners
//     return () => {
//       supabase.removeChannel(attendanceChannel);
//       supabase.removeChannel(nocChannel);
//       supabase.removeChannel(leaveChannel);
//       supabase.removeChannel(updateLogsChannel);
//     };
//   }, []);

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   // Helper function to get notification icon color based on type
//   const getNotificationClass = (type: Notification['type']) => {
//     switch (type) {
//       case 'noc':
//         return 'border-blue-300 bg-blue-50';
//       case 'attendance':
//         return 'border-green-300 bg-green-50';
//       case 'leave':
//         return 'border-purple-300 bg-purple-50';
//       case 'update':
//         return 'border-amber-300 bg-amber-50';
//       default:
//         return 'border-gray-300 bg-gray-50';
//     }
//   };

//   return (
//     <Sheet>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <SheetTrigger asChild>
//             <Button variant="ghost" size="icon" className="relative">
//               <Bell className="h-5 w-5" />
//               {unreadCount > 0 && (
//                 <Badge 
//                   variant="destructive" 
//                   className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
//                 >
//                   {unreadCount}
//                 </Badge>
//               )}
//             </Button>
//           </SheetTrigger>
//         </TooltipTrigger>
//         <TooltipContent>
//           <p>View notifications</p>
//         </TooltipContent>
//       </Tooltip>
//       <SheetContent>
//         <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b">
//           <SheetTitle>Notifications</SheetTitle>
//           {unreadCount > 0 && (
//             <Button variant="ghost" size="sm" onClick={markAllAsRead}>
//               Mark all as read
//             </Button>
//           )}
//         </SheetHeader>
//         <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
//           {loading ? (
//             <div className="flex items-center justify-center h-40">
//               <p className="text-sm text-muted-foreground">Loading notifications...</p>
//             </div>
//           ) : notifications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-40">
//               <p className="text-sm text-muted-foreground">No notifications yet</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`p-4 rounded-lg border ${
//                     notification.read ? "bg-background" : getNotificationClass(notification.type)
//                   }`}
//                   onClick={() => markAsRead(notification.id)}
//                 >
//                   <h4 className="font-semibold">{notification.title}</h4>
//                   <p className="text-sm text-muted-foreground">
//                     {notification.message}
//                   </p>
//                   <div className="flex justify-between items-center mt-2">
//                     <span className="text-xs text-muted-foreground">
//                       {notification.time}
//                     </span>
//                     {!notification.read && (
//                       <Badge variant="secondary" className="text-xs">New</Badge>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ScrollArea>
//       </SheetContent>
//     </Sheet>
//   );
// }

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'noc' | 'attendance' | 'leave' | 'update' | 'system';
}

export function NotificationsButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    setNotifications(prevNotifications => [
      {
        ...notification,
        id: prevNotifications.length ? Math.max(...prevNotifications.map(n => n.id)) + 1 : 1
      },
      ...prevNotifications
    ]);
  };

  // Setup real-time listeners for notifications
  useEffect(() => {
    let attendanceChannel: ReturnType<typeof supabase.channel>;
    let nocChannel: ReturnType<typeof supabase.channel>;
    let leaveChannel: ReturnType<typeof supabase.channel>;
    let updateLogsChannel: ReturnType<typeof supabase.channel>;

    const setupChannels = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentUserId = user.id;

      // Setup attendance notification channel - only for current user
      attendanceChannel = supabase
        .channel('attendance-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'attendance',
            filter: `user_id=eq.${currentUserId}`,
          },
          async (payload) => {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.user_id)
              .single();

            const userName = userProfile?.full_name || 'You';
            const status = payload.new.status;

            addNotification({
              title: "New Attendance",
              message: `${userName} has marked attendance as ${status}`,
              time: "Just now",
              read: false,
              type: 'attendance'
            });
          }
        )
        .subscribe();

      // Setup NOC requests notification channel - only for current user's requests
      nocChannel = supabase
        .channel('noc-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'noc_requests',
            filter: `user_id=eq.${currentUserId}`,
          },
          async (payload) => {
            if (payload.old.status !== payload.new.status) {
              const status = payload.new.status;

              addNotification({
                title: `NOC Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Your NOC request has been ${status}`,
                time: "Just now",
                read: false,
                type: 'noc'
              });
            }
          }
        )
        .subscribe();

      // Setup leave requests notification channel - only for current user's requests
      leaveChannel = supabase
        .channel('leave-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'leave_requests',
            filter: `user_id=eq.${currentUserId}`,
          },
          async (payload) => {
            if (payload.old.status !== payload.new.status) {
              const status = payload.new.status;
              const days = payload.new.requested_days.length;

              addNotification({
                title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Your leave request for ${days} day(s) has been ${status}`,
                time: "Just now",
                read: false,
                type: 'leave'
              });
            }
          }
        )
        .subscribe();

      // Setup update logs notification channel - global (relevant to all users)
      updateLogsChannel = supabase
        .channel('update-logs-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'update_logs',
          },
          async (payload) => {
            addNotification({
              title: "New Update Log",
              message: `A new update log has been added: ${payload.new.title || 'Update'}`,
              time: "Just now",
              read: false,
              type: 'update'
            });
          }
        )
        .subscribe();
    };

    setupChannels();

    // Clean up all listeners when the component unmounts
    return () => {
      if (attendanceChannel) supabase.removeChannel(attendanceChannel);
      if (nocChannel) supabase.removeChannel(nocChannel);
      if (leaveChannel) supabase.removeChannel(leaveChannel);
      if (updateLogsChannel) supabase.removeChannel(updateLogsChannel);
    };
  }, []); // Empty dependency array to run only once when the component mounts

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Helper function to get notification icon color based on type
  const getNotificationClass = (type: Notification['type']) => {
    switch (type) {
      case 'noc':
        return 'border-blue-300 bg-blue-50';
      case 'attendance':
        return 'border-green-300 bg-green-50';
      case 'leave':
        return 'border-purple-300 bg-purple-50';
      case 'update':
        return 'border-amber-300 bg-amber-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>View notifications</p>
        </TooltipContent>
      </Tooltip>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${notification.read ? "bg-background" : getNotificationClass(notification.type)
                    }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <h4 className="font-semibold">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
