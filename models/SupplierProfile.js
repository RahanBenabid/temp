export default (sequelize, DataTypes) => {
  const SupplierProfile = sequelize.define(
    "supplierProfile",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shopName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shopAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  /* ASSOCIATIONS */
  SupplierProfile.associate = (models) => {
    SupplierProfile.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return SupplierProfile;
};
