import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, CalendarCheck, MessageSquareText } from "lucide-react";
import "./notifications.css";

const notificationsData = {
  bookings: [
    {
      id: 1,
      title: "Adobe Photoshop Booked",
      description: "You have successfully booked Adobe Photoshop for 3 days.",
      date: "July 10, 2025",
    },
    {
      id: 2,
      title: "Canva Pro Activated",
      description: "Your Canva Pro subscription is active for 7 days.",
      date: "July 8, 2025",
    },
  ],
  reminders: [
    {
      id: 1,
      title: "Photoshop Expiring Soon",
      description: "Your Adobe Photoshop subscription expires in 1 day.",
      date: "July 11, 2025",
    },
    {
      id: 2,
      title: "Renew Canva Pro?",
      description: "Your Canva Pro subscription expires tomorrow.",
      date: "July 9, 2025",
    },
  ],
  messages: [
    {
      id: 1,
      title: "Support Team",
      description: "Your refund request has been approved.",
      date: "July 10, 2025",
    },
    {
      id: 2,
      title: "System Message",
      description: "Your account has been verified successfully.",
      date: "July 7, 2025",
    },
  ],
};

export default function NotificationsPage() {
  return (
    <div className="notifications-container">
      <h1 className="notifications-heading">
        <Bell className="icon" /> Notifications
      </h1>

      <Tabs defaultValue="bookings" className="tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="bookings">
            <CalendarCheck className="icon-small" /> Bookings
          </TabsTrigger>
          <TabsTrigger value="reminders">
            <Bell className="icon-small" /> Reminders
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquareText className="icon-small" /> Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <div className="cards-grid">
            {notificationsData.bookings.map((item) => (
              <Card key={item.id}>
                <CardContent className="card-content">
                  <h2 className="card-title">{item.title}</h2>
                  <p className="card-description">{item.description}</p>
                  <span className="card-date">{item.date}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders">
          <div className="cards-grid">
            {notificationsData.reminders.map((item) => (
              <Card key={item.id}>
                <CardContent className="card-content">
                  <h2 className="card-title">{item.title}</h2>
                  <p className="card-description">{item.description}</p>
                  <span className="card-date">{item.date}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="cards-grid">
            {notificationsData.messages.map((item) => (
              <Card key={item.id}>
                <CardContent className="card-content">
                  <h2 className="card-title">{item.title}</h2>
                  <p className="card-description">{item.description}</p>
                  <span className="card-date">{item.date}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
