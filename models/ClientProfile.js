export default (sequelize, DataTypes) => {
  const ClientProfile = sequelize.define(
    "clientProfile",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      address: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    },
  );

  /* ASSOCIATION */
  ClientProfile.associate = (models) => {
    ClientProfile.belongsTo(models.user, { foreignKey: "user_id", as: "user" });
  };

  return ClientProfile;
};
