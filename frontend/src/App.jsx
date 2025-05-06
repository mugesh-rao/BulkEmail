import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function App() {
  const [emails, setEmails] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleXLSX = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Filter out empty rows and invalid emails
          const validEmails = jsonData
            .flat() // Flatten the array to handle multiple columns
            .filter(email => 
              email && 
              typeof email === 'string' && 
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            )
            .map(email => email.trim());

          setEmails(validEmails);
          if (validEmails.length === 0) {
            alert('No valid email addresses found in the file');
          } else {
            alert(`Successfully loaded ${validEmails.length} email addresses`);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Error processing the Excel file. Please check the format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading the file. Please try again.');
    }
  };

  const sendEmails = async () => {
    if (emails.length === 0) {
      alert('Please upload a file with valid email addresses first');
      return;
    }
    if (!subject.trim()) {
      alert('Please enter an email subject');
      return;
    }
    if (!body.trim()) {
      alert('Please enter an email body');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/send', {
        recipients: emails,
        subject: subject.trim(),
        body: body.trim()
      });
      alert(res.data.message);
    } catch (err) {
      console.error('Error sending emails:', err);
      alert(err.response?.data?.message || "Failed to send emails. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-10 w-full">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Email Outreach Tool</h1>
        <p className="text-md text-gray-600">Easily upload your contacts and send personalized emails efficiently.</p>
      </header>
      <div className="bg-gray-50 shadow-md rounded-lg p-10 w-full max-w-xl">
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Upload XLSX</label>
          <input 
            type="file" 
            accept=".xlsx" 
            onChange={handleXLSX} 
            className="border border-gray-300 rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Email Subject</label>
          <input
            type="text"
            placeholder="Enter Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="border border-gray-300 rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Email Body</label>
          <textarea
            placeholder="Compose your message here..."
            rows={6}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="border border-gray-300 rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Extracted Emails ({emails.length})</h2>
          <div className="max-h-40 overflow-y-auto">
            <ul className="list-disc pl-5">
              {emails.map((email, index) => (
                <li key={index} className="text-gray-700">{email}</li>
              ))}
            </ul>
          </div>
        </div>
        <button 
          onClick={sendEmails} 
          disabled={loading || emails.length === 0}
          className={`w-full py-3 px-6 rounded font-bold text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500
            ${loading || emails.length === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          {loading 
            ? 'Sending...' 
            : emails.length === 0 
              ? 'Upload Excel File First'
              : `Send ${emails.length} Emails`}
        </button>
      </div>
      <footer className="mt-10 text-gray-600 text-sm text-center">
        <p>Reliable email delivery powered by our trusted service.</p>
      </footer>
    </div>
  );
}

export default App;