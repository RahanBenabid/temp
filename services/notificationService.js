import database from "./../models/index.js";

const Notification = database.notification;
const Subscription = database.subscription;
const User = database.user;

class NotificationService {
  async saveSubscription(subscriptionData) {
    const vapidSubscription = await Subscription.create(subscriptionData);
    return vapidSubscription;
  }

  async realTimeNotification(notificationData, io, eventName) {
    // create notification
    const notification = await Notification.create(notificationData, {
      include: [{ model: User, as: "user" }],
    });

    try {
      // emit real-time event using socket.io
      io.to(`user_${notificationData.userId}`).emit(eventName, notification);
    } catch (error) {
      throw new Error(`Error emmitting the notification: ${error}`);
    }
    return notification;
  }

  async pushNotification() {}
}

export default new NotificationService();
