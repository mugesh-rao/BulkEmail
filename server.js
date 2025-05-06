const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "mugeshraoego@gmail.com",
  },
});

// Verify the transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('Error verifying email configuration:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

app.post('/send', async (req, res) => {
  // Check if the request contains messages array (new format)
  if (req.body.messages) {
    const { messages } = req.body;
    
    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages list is required and must not be empty' });
    }

    try {
      let successCount = 0;
      let failedEmails = [];

      for (const { to, subject, body } of messages) {
        try {
          await transporter.sendMail({
            from: '"Mugesh Rao" <mugeshraoego@gmail.com>',
            to,
            subject,
            text: body
          });
          successCount++;
          
          // Add a small delay between emails to prevent rate limiting
          await delay(100);
          console.log(`Email sent to ${to}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${to}:`, emailError);
          failedEmails.push({ email: to, error: emailError.message });
        }
      }

      // Prepare response message
      let message = `Successfully sent ${successCount} out of ${messages.length} emails.`;
      if (failedEmails.length > 0) {
        message += ` Failed to send to ${failedEmails.length} recipients.`;
      }

      return res.json({ 
        message,
        successCount,
        totalCount: messages.length,
        failedEmails
      });
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ 
        message: 'Failed to process email sending',
        error: err.message 
      });
    }
  } 
  // Handle old format
  else {
    const { recipients, subject, body } = req.body;

    // Input validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      console.log(recipients, "recipients");
      return res.status(400).json({ message: 'Recipients list is required and must not be empty' });
    }
    if (!subject || !subject.trim()) {
      console.log(subject, "subject");
      return res.status(400).json({ message: 'Subject is required' });
    }
    if (!body || !body.trim()) {
      console.log(body, "body");
      return res.status(400).json({ message: 'Email body is required' });
    }

    try {
      let successCount = 0;
      let failedEmails = [];

      for (const to of recipients) {
        try {
          await transporter.sendMail({
            from: '"Mugesh Rao" <mugeshraoego@gmail.com>',
            to,
            subject,
            text: body
          });
          successCount++;
          
          // Add a small delay between emails to prevent rate limiting
          await delay(100);
          console.log(`Email sent to ${to}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${to}:`, emailError);
          failedEmails.push({ email: to, error: emailError.message });
        }
      }

      // Prepare response message
      let message = `Successfully sent ${successCount} out of ${recipients.length} emails.`;
      if (failedEmails.length > 0) {
        message += ` Failed to send to ${failedEmails.length} recipients.`;
      }

      return res.json({ 
        message,
        successCount,
        totalCount: recipients.length,
        failedEmails
      });
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ 
        message: 'Failed to process email sending',
        error: err.message 
      });
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));