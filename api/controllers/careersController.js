/*
 * Careers Controller
 *
 * Handles job application submissions.  The endpoint accepts
 * multipart/form-data in a real system, but for this simplified
 * implementation we accept a JSON body containing applicant details.
 * Submitted applications are stored in the database.
 */
import crypto from 'crypto';
import { db } from '../lib/db.js';

// Submit a new job application.  The request should include name,
// email, area of expertise, coverLetter and optionally resumeFile
// information.  The response returns a 202 Accepted status with a
// confirmation message.
export async function submitApplication(req, res) {
  const { name, email, expertise, coverLetter } = req.body;
  // Basic validation of required fields
  if (!name || !email || !expertise || !coverLetter) {
    return res.status(400).json({ status: 'error', message: 'Missing application fields' });
  }
  
  const id = crypto.randomUUID();
  // Capture a minimal resume file name if present.  In the absence of
  // multipart parsing this will always be undefined.
  const resumeFileName = req.file ? req.file.originalname : undefined;
  
  try {
      await db.execute({
          sql: 'INSERT INTO career_applications (id, name, email, expertise, coverLetter, resumeFileName) VALUES (?, ?, ?, ?, ?, ?)',
          args: [id, name, email, expertise, coverLetter, resumeFileName]
      });
      return res.status(202).json({ status: 'success', message: 'Application received. We will be in touch.' });
  } catch (err) {
      console.error('Error submitting application:', err);
      return res.status(500).json({ status: 'error', message: 'Database error while submitting application.' });
  }
}
