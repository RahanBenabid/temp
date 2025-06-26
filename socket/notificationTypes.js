const NOTIFICATION_TYPES = {
  // Order events
  ORDER_CREATED: "order_created",
  ORDER_STATUS_CHANGED: "order_status_changed",
  ORDER_UPDATED: "order_updated",
  ORDER_CANCELED: "order_canceled",

  // Payment events
  PAYMENT_RECORDED: "payment_recorded",
  PAYMENT_COMPLETED: "payment_completed",
  PAYMENT_FAILED: "payment_failed",

  // Rating events
  RATING_RECEIVED: "rating_received",
  RATING_UPDATED: "rating_updated",

  // Project events
  PROJECT_CREATED: "project_created",
};

export default NOTIFICATION_TYPES;
