const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "mugeshraoego@gmail.com",
  },
});

// Agent definitions
const agents = {
  english: {
    name: "English Assistant",
    instructions: "You are a helpful assistant that communicates in English. Keep responses professional and concise.",
    async process(message) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.instructions },
          { role: "user", content: message }
        ],
      });
      return completion.choices[0].message.content;
    }
  },

  spanish: {
    name: "Spanish Assistant",
    instructions: "Eres un asistente útil que se comunica en español. Mantén las respuestas profesionales y concisas.",
    async process(message) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.instructions },
          { role: "user", content: message }
        ],
      });
      return completion.choices[0].message.content;
    }
  },

  triage: {
    name: "Triage Assistant",
    instructions: "You are a language detection and routing assistant. Determine if the input is in English or Spanish and route accordingly.",
    async process(message) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "Detect the language of the input and respond with either 'english' or 'spanish'. Only respond with one word." 
          },
          { role: "user", content: message }
        ],
      });
      return completion.choices[0].message.content.toLowerCase();
    }
  }
};

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

app.post('/ask', async (req, res) => {
  const { message } = req.body;
  
  try {
    // First, detect the language using triage agent
    const language = await agents.triage.process(message);
    
    // Route to appropriate agent
    let response;
    if (language === 'spanish') {
      response = await agents.spanish.process(message);
    } else {
      response = await agents.english.process(message);
    }

    res.json({ 
      output: response,
      language: language 
    });
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: err.message 
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));