export default (sequlize, DataTypes) => {
  const Notification = sequlize.define(
    "notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        refrences: {
          model: "users",
          key: "id",
        },
      },
      sender: {
        type: DataTypes.ENUM(""),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("READ", "UNREAD"),
        defaultValue: "UNREAD",
      },
    },
    {
      timestamps: true,
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Notification;
};
