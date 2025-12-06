
import { paymentRepository } from '../data/repository';

export const paymentService = {
  getPaymentHistory: async () => {
    return new Promise<any[]>(async (resolve) => {
      const history = await paymentRepository.getHistory();
      setTimeout(() => resolve(history), 300);
    });
  }
};
