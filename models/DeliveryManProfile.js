export default (sequelize, DataTypes) => {
  const DeliveryManProfile = sequelize.define(
    "deliveryManProfile",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nationalCardNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        /*
         * TODO: add regex validation
         */
      },
      vehicle: {
        type: DataTypes.ENUM("CAR", "MOTORCYCLE"),
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );

  /* ASSOCIATIONS */
  DeliveryManProfile.associate = (models) => {
    DeliveryManProfile.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return DeliveryManProfile;
};
