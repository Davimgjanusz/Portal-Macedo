<<<<<<< HEAD
import { MercadoPagoConfig, Payment } from 'mercadopago';
=======
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
>>>>>>> master

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export const payment = new Payment(client);
<<<<<<< HEAD
export { client };
=======
export const preference = new Preference(client);
>>>>>>> master
