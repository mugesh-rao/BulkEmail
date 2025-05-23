import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function BulkEmail() {
  const [contacts, setContacts] = useState([]); // [{ email, company, name }]
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleXLSX = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 0 });

      const extracted = jsonData
        .filter(row => row['Email'] && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['Email']))
        .map(row => ({
          email: row['Email'].trim(),
          company: row['Company Name']?.trim() || '',
          name: row['Name']?.trim() || ''
        }));

      setContacts(extracted);
      if (extracted.length === 0) {
        alert('No valid contacts with emails found.');
      } else {
        alert(`Loaded ${extracted.length} valid contacts`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const sendEmails = async () => {
    if (contacts.length === 0) return alert("Upload contact file first.");
    if (!subject.trim() || !body.trim()) return alert("Subject and body required");

    setLoading(true);
    try {
      const personalizedMessages = contacts.map(({ email, company, name }) => ({
        to: email,
        subject,
        body: body
          .replace(/{{name}}/gi, name || "there")
          .replace(/{{company}}/gi, company || "your company")
      }));

      const res = await axios.post('http://localhost:5000/send', {
        messages: personalizedMessages
      });

      alert(res.data.message);
    } catch (err) {
      console.error(err);
      // Display more specific error message
      if (err.response) {
        alert(`Error: ${err.response.data.message || 'Failed to send emails'}`);
      } else if (err.request) {
        alert("Error: Server did not respond. Please check if the server is running.");
      } else {
        alert(`Error: ${err.message}`);
      }
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
          <h2 className="text-lg font-semibold mb-2">Extracted Contacts ({contacts.length})</h2>
          <div className="max-h-40 overflow-y-auto">
            <ul className="list-disc pl-5">
              {contacts.map((contact, index) => (
                <li key={index} className="text-gray-700">{contact.email}</li>
              ))}
            </ul>
          </div>
        </div>
        <button 
          onClick={sendEmails} 
          disabled={loading || contacts.length === 0}
          className={`w-full py-3 px-6 rounded font-bold text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500
            ${loading || contacts.length === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          {loading 
            ? 'Sending...' 
            : contacts.length === 0 
              ? 'Upload Excel File First'
              : `Send ${contacts.length} Emails`}
        </button>
      </div>
      <footer className="mt-10 text-gray-600 text-sm text-center">
        <p>Reliable email delivery powered by our trusted service.</p>
      </footer>
    </div>
  );
}

export default BulkEmail;