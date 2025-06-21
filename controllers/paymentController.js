import db from "./../models/index.js";
import sequelize from "sequelize";

const Payment = db.payment;
const ClientOrder = db.clientOrder;

class PaymentController {
  async recordPayment(req, res, next) {
    const transaction = await db.sequelize.transaction();

    try {
      const { orderId } = req.params;
      const { amount, paymentMethod, notes } = req.body;

      const order = await ClientOrder.findByPk(orderId, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: "order not found" });
      }

      const receiptNumber = `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const payment = await Payment.create(
        {
          orderId,
          amount,
          paymentMethod,
          notes,
          receiptNumber,
        },
        { transaction },
      );

      const payments = await Payment.findAll({
        where: { orderId },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "totalPaid"],
        ],
        raw: true,
        transaction,
      });

      const totalPaid = parseFloat(payments[0].totalPaid);
      const paymentStatus =
        totalPaid >= order.totalAmount
          ? "COMPLETED"
          : totalPaid > 0
            ? "PARTIAL"
            : "PENDING";

      await order.update({ paymentStatus }, { transaction });

      await transaction.commit();

      return res.status(201).json({
        message: "Payment recorded successfully",
        payment,
        paymentStatus,
        totalPaid,
        remainingBalance: order.totalAmount - totalPaid,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Error recording payment:", err);
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }
}

export default new PaymentController();
