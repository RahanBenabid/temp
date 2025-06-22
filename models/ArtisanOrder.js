export default (sequelize, DataTypes) => {
  const ArtisanOrder = sequelize.define(
    "artisanOrder",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      artisanId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      deliveryManId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      status: {
        type: DataTypes.ENUM("PENDING", "SHIPPED", "DELIVERED", "CANCELLED"),
        defaultValue: "PENDING",
      },
      materialDetails: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      // this one should probably be removed, since the JSON will contain all the details we need
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  ArtisanOrder.associate = (models) => {
    ArtisanOrder.belongsTo(models.user, {
      foreignKey: "artisanId",
      as: "artisan",
    });
    ArtisanOrder.belongsTo(models.user, {
      foreignKey: "supplierId",
      as: "supplier",
    });
    ArtisanOrder.belongsTo(models.user, {
      foreignKey: "deliveryManId",
      as: "deliveryMan",
    });
  };

  return ArtisanOrder;
};
