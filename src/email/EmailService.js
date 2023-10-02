const nodemailer = require('nodemailer');
// Nodemailer-stub comes with a stub transport for Nodemailer.
// The Stub stores the messages in memory but mimics real mail behavior.
const nodemailerStub = require('nodemailer-stub');

// Create a transporter, a service to send an email
const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);

const sendAccountActivationEmail = async (email, token) => {
  await transporter.sendMail({
    from: 'My App <info@my-app.com>',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${token}`,
  });
};

module.exports = { sendAccountActivationEmail };
