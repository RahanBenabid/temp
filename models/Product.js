export default (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDv4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      supplierProfileId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "supplierProfiles",
          key: "id",
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "light",
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.supplierProfile, {
      foreignKey: "supplierProfileId",
      as: "supplierProfile",
    });
  };

  return Product;
};
