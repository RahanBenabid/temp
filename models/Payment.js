export default (sequelize, DataTypes) => {
  const Payment = sequelize.define("payment", {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("CASH", "CARD", "BANK_TRANSFER"),
      allowNull: false,
    },
    paymentData: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    receiptNumber: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });
  return Payment;
};
