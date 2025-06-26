import database from "./../models/index.js";
// import notificationTypes from "./../socket/notificationTypes.js";

const Notification = database.notification;
const Subscription = database.subscription;
const User = database.user;

class NotificationService {
  async saveSubscription(subscriptionData) {
    const vapidSubscription = await Subscription.create(subscriptionData);
    return vapidSubscription;
  }

  // send to a specific user
  async emitToUser(userId, notificationData, io, eventName) {
    // create notification
    const notification = await Notification.create(notificationData, {
      include: [{ model: User, as: "user" }],
    });

    try {
      // emit real-time event using socket.io
      io.to(`user_${notificationData.userId}`).emit(eventName, notification);
    } catch (error) {
      throw new Error(`Error emmitting the user notification: ${error}`);
    }
    return notification;
  }

  // send to multiple users
  async emitToUsers(userIds, notificationData, io, eventName) {
    for (const userId in userIds) {
      this.emitToUser(userId, notificationData, io, eventName);
    }
  }

  // send to user by role
  async emitToRole(role, notificationData, io, eventName) {
    const notification = await Notification.create(notificationData, {
      include: [{ model: User, as: "user" }],
    });
    try {
      io.to(`user_${role}`).emit(eventName, notification);
    } catch (error) {
      throw new Error(`Error emmiting role notification ${error}`);
    }

    return notification;
  }

  async broadCast(notificationData, io, eventName) {
    const notification = await Notification.create(notificationData);
    io.emit(notification, eventName);
    return notification;
  }

  async pushNotification() {}
}

export default new NotificationService();
