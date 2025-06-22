export default (sequelize, DataTypes) => {
  const ArtisanProfile = sequelize.define(
    "artisanProfile",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      profession: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );

  /* ASSOCIATION */
  ArtisanProfile.associate = (models) => {
    ArtisanProfile.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return ArtisanProfile;
};
