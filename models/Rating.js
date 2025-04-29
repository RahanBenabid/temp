export default (sequelize, DataTypes) => {
  const Rating = sequelize.define(
    "rating",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      raterType: {
        type: DataTypes.ENUM(
          "CLIENT",
          "ARTISAN",
          "SUPPLIER",
          "DELIVERY_MAN",
          "ADMIN",
        ),
        allowNull: false,
      },
      rateeType: {
        type: DataTypes.ENUM("CLIENT", "ARTISAN", "SUPPLIER", "DELIVERY_MAN"),
        allowNull: false,
      },
      raterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      rateeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      orderType: {
        type: DataTypes.ENUM("CLIENT_ORDER", "ARTISAN_ORDER"),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    },
  );

  Rating.associate = (models) => {
    Rating.belongsTo(models.user, {
      foreignKey: "raterId",
      as: "rater",
    });
    Rating.belongsTo(models.user, {
      foreignKey: "rateeId",
      as: "ratee",
    });
  };

  return Rating;
};
