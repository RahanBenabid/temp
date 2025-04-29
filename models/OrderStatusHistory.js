export default (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define("orderStatusHistory", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "clientOrder",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return OrderStatusHistory;
};
