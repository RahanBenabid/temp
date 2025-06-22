import bcrypt from "bcrypt";

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        validate: {
          isValidPhone(num) {
            const phoneValidationRegex = /^(0|\+213)[5-7]\d{8}$/;
            if (!phoneValidationRegex.test(num)) {
              throw new Error("Invalid phone number format");
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
          isLowercase: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          "ADMIN",
          "CLIENT",
          "ARTISAN",
          "SUPPLIER",
          "DELIVERY_MAN",
        ),
        defaultValue: "CLIENT",
        allowNull: false,
      },
      averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
    },
    {
      timestamps: true,
    },
  );

  /* HELPER FUNCTIONS */

  // hash password on creation
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  // hash password on update
  User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Verify password
  User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  /* ASSOCIATIONS */
  User.associate = (models) => {
    /* relationships with other models */
    User.hasOne(models.clientProfile, {
      foreignKey: "user_id",
      as: "clientProfile",
    });
    User.hasOne(models.artisanProfile, {
      foreignKey: "user_id",
      as: "artisanProfile",
    });
    User.hasOne(models.supplierProfile, {
      foreignKey: "user_id",
      as: "supplierProfile",
    });
    User.hasOne(models.deliveryManProfile, {
      foreignKey: "user_id",
      as: "deliveryManProfile",
    });
    // No profile for ADMIN, assuming it doesn’t need one

    /* order related relationships */
    User.hasMany(models.clientOrder, {
      foreignKey: "clientId",
      as: "clientOrders",
    });
    User.hasMany(models.artisanOrder, {
      foreignKey: "artisanId",
      as: "artisanOrders",
    });
    User.hasMany(models.artisanOrder, {
      foreignKey: "supplierId",
      as: "supplierOrders",
    });
    User.hasMany(models.artisanOrder, {
      foreignKey: "deliveryManId",
      as: "deliveryOrders",
    });

    /** Product related relationship */
    User.hasMany(models.product, {
      foreignKey: "supplier_id",
      as: "products",
    });

    /** Project related relationships */
    User.hasMany(models.project, {
      foreignKey: "client_id",
      as: "clientProjects",
    });
    User.hasMany(models.project, {
      foreignKey: "artisan_id",
      as: "artisanProjects",
    });
  };

  return User;
};
