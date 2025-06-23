import database from "./../models/index.js";
import sequelize from "sequelize";

const Payment = database.payment;
const ClientOrder = database.clientOrder;

class PaymentController {
  async recordPayment(request, response) {
    const transaction = await database.sequelize.transaction();

    try {
      const { orderId } = request.params;
      const { amount, paymentMethod, notes } = request.body;

      const order = await ClientOrder.findByPk(orderId, { transaction });
      if (!order) {
        await transaction.rollback();
        return response.status(404).json({ message: "order not found" });
      }

      const receiptNumber = `RCPT-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const payment = await Payment.create(
        {
          orderId,
          amount,
          paymentMethod,
          notes,
          receiptNumber,
        },
        { transaction }
      );

      const payments = await Payment.findAll({
        where: { orderId },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "totalPaid"],
        ],
        raw: true,
        transaction,
      });

      const totalPaid = Number.parseFloat(payments[0].totalPaid);
      const paymentStatus =
        totalPaid >= order.totalAmount
          ? "COMPLETED"
          : totalPaid > 0
          ? "PARTIAL"
          : "PENDING";

      await order.update({ paymentStatus }, { transaction });

      await transaction.commit();

      return response.status(201).json({
        message: "Payment recorded successfully",
        payment,
        paymentStatus,
        totalPaid,
        remainingBalance: order.totalAmount - totalPaid,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error recording payment:", error);
      return response
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
}

export default new PaymentController();
