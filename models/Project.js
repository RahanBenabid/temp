export default (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "project",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "ACCEPTED",
          "PROCESSING",
          "AWAITING_MATERIALS",
          "IN_PROGRESS",
          "COMPLETED",
        ),
        defaultValue: "PENDING",
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      client_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      artisan_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
    },
  );

  Project.associate = (models) => {
    Project.belongsTo(models.user, {
      foreignKey: "client_id",
      as: "client",
      onDelete: "CASCADE",
    });

    Project.belongsTo(models.user, {
      foreignKey: "artisan_id",
      as: "artisan",
      onDelete: "SET NULL",
    });
  };

  return Project;
};
