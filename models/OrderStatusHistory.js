export default (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    "orderStatusHistory",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "clientOrders",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "ACCEPTED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED"
        ),
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );

  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.clientOrder, {
      foreignKey: "orderId",
      as: "order",
    });
  };

  return OrderStatusHistory;
};
