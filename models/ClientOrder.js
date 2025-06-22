export default (sequelize, DataTypes) => {
  const ClientOrder = sequelize.define(
    "clientOrder",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      status: {
        type: DataTypes.ENUM("PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"),
        defaultValue: "PENDING",
      },
      artisanId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      paymentStatus: {
        type: DataTypes.ENUM("PENDING", "PARTIAL", "COMPLETED"),
        defaultValue: "PENDING",
      },
    },
    {
      timestamps: true,
    }
  );

  ClientOrder.associate = (models) => {
    ClientOrder.belongsTo(models.user, {
      foreignKey: "clientId",
      as: "client",
    });

    ClientOrder.belongsTo(models.user, {
      foreignKey: "artisanId",
      as: "artisan",
    });

    ClientOrder.hasMany(models.orderStatusHistory, {
      foreignKey: "orderId",
      as: "orderStatusHistory",
    });

    // ClientOrder.hasMany(models.payment, { foreignKey: "orderId" });
  };

  return ClientOrder;
};
