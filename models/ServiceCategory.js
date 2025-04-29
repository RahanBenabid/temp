export default (sequelize, DataTypes) => {
  const ServiceCategory = sequelize.define("serviceCategory", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon: {
      type: DataTypes.STRING,
    },
  });
  
  return ServiceCategory;
};
