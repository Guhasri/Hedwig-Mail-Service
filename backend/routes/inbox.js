// const express = require('express');
// const Email = require('../models/Email'); 

// const router = express.Router();

// router.get('/', async (req, res) => {
//   const { email } = req.query; 

//   try {
//     // Fetch emails where the 'to' field contains the user's email
//     const emails = await Email.find({ 
//       bin: false, // Ensure we're not fetching emails marked as deleted
//       // to: email  // Check if the 'to' field includes the user's email
//       to: { $in: [email] } 
//     });

//     res.json(emails);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.put('/:id/delete', async (req, res) => {
//   const { id } = req.params;
//   const { bin } = req.body;

//   try {
//     const updatedEmail = await Email.findByIdAndUpdate(
//       id,
//       { bin },
//       { new: true }
//     );
//     if (!updatedEmail) {
//       return res.status(404).json({ message: 'Email not found' });
//     }
//     res.status(200).json(updatedEmail);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error updating email', error });
//   }
// });

// router.put('/:id/star', async (req, res) => {
//   const { id } = req.params;
//   const { starred } = req.body;

//   try {
//     const updatedEmail = await Email.findByIdAndUpdate(
//       id,
//       { starred },
//       { new: true }
//     );
//     if (!updatedEmail) {
//       return res.status(404).json({ message: 'Email not found' });
//     }
//     res.status(200).json(updatedEmail);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error updating starred status', error });
//   }
// });

// // New route for forwarding an email
// router.post('/', async (req, res) => {
//   const { from, to, subject, body, attachments, date } = req.body;

//   const newEmail = new Email({
//     from,
//     to,
//     subject,
//     body,
//     attachments,
//     date,
//     bin: false, // Ensure the forwarded email is not marked as deleted
//   });

//   try {
//     const savedEmail = await newEmail.save();
//     res.status(201).json(savedEmail);
//   } catch (error) {
//     console.error('Error forwarding email:', error);
//     res.status(500).json({ message: 'Error creating forwarded email', error });
//   }
// });

// module.exports = router;

// const express = require('express');
// const Email = require('../models/Email'); 

// const router = express.Router();

// router.get('/', async (req, res) => {
//   const { email } = req.query; 

//   try {
//     // Fetch emails where:
//     // 1. User's email is in recipients array
//     // 2. User's email is NOT in deletedBy array
//     const emails = await Email.find({ 
//       recipients: { $in: [email] },
//       deletedBy: { $nin: [email] }
//     });

//     res.json(emails);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.put('/:id/delete', async (req, res) => {
//   const { id } = req.params;
//   const { email } = req.body; // User's email who is deleting

//   try {
//     // Add user's email to deletedBy array if not already present
//     const updatedEmail = await Email.findByIdAndUpdate(
//       id,
//       { 
//         $addToSet: { deletedBy: email } // $addToSet prevents duplicate entries
//       },
//       { new: true }
//     );

//     if (!updatedEmail) {
//       return res.status(404).json({ message: 'Email not found' });
//     }
//     res.status(200).json(updatedEmail);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error updating email', error });
//   }
// });

// router.put('/:id/star', async (req, res) => {
//   const { id } = req.params;
//   const { starred } = req.body;

//   try {
//     const updatedEmail = await Email.findByIdAndUpdate(
//       id,
//       { starred },
//       { new: true }
//     );
//     if (!updatedEmail) {
//       return res.status(404).json({ message: 'Email not found' });
//     }
//     res.status(200).json(updatedEmail);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error updating starred status', error });
//   }
// });

// // New route for forwarding an email
// router.post('/', async (req, res) => {
//   const { from, to, subject, body, attachments, date } = req.body;

//   // Ensure 'to' is an array of emails
//   const recipients = Array.isArray(to) ? to : [to];

//   const newEmail = new Email({
//     from,
//     to: recipients,
//     recipients: recipients, // Set recipients same as to field
//     subject,
//     body,
//     attachments,
//     date,
//     deletedBy: [], // Initialize empty deletedBy array
//   });

//   try {
//     const savedEmail = await newEmail.save();
//     res.status(201).json(savedEmail);
//   } catch (error) {
//     console.error('Error forwarding email:', error);
//     res.status(500).json({ message: 'Error creating forwarded email', error });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Email = require('../models/Email'); 

router.get('/', async (req, res) => {
  const { email } = req.query; 

  try {
    // Fetch emails where:
    // 1. User's email is in recipients array
    // 2. User's email is NOT in deletedBy array
    const emails = await Email.find({ 
      recipients: { $in: [email] },
      deletedBy: { $nin: [email] }
    });

    res.json(emails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update this route to handle moving email to bin
router.put('/:id/bin', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body; // User's email who is moving to bin

  try {
    const updatedEmail = await Email.findByIdAndUpdate(
      id,
      { 
        $addToSet: { deletedBy: email } // Add user's email to deletedBy array
      },
      { new: true }
    );

    if (!updatedEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating email', error });
  }
});

router.put('/:id/star', async (req, res) => {
  const { id } = req.params;
  const { email: userEmail } = req.body;

  try {
    const emailDoc = await Email.findById(id);
    
    if (!emailDoc) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user is authorized to star this email
    if (!emailDoc.recipients.includes(userEmail)) {
      return res.status(403).json({ message: 'Not authorized to star this email' });
    }

    // Check if email is already starred by user
    const isStarred = emailDoc.starredBy?.includes(userEmail);
    
    const updatedEmail = await Email.findByIdAndUpdate(
      id,
      {
        [isStarred ? '$pull' : '$addToSet']: { starredBy: userEmail }
      },
      { new: true }
    );

    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error('Star toggle error:', error);
    res.status(500).json({ message: 'Error updating starred status', error });
  }
});

// POST route to forward an email
router.post('/', async (req, res) => {
  const { from, to, subject, body, attachments, date } = req.body;

  // Ensure 'to' is an array of emails
  const recipients = Array.isArray(to) ? to : [to];

  // Create a new email entry for the forwarded email
  const forwardedEmail = new Email({
      from,
      to: recipients,
      recipients: recipients, // Set recipients same as to field
      subject: `${subject} (Forwarded)`,
      body,
      attachments: attachments || [],
      date: new Date(),
      binSend: false,    // Use binSend flag for sent emails
      deletedBy: [],     // Initialize empty deletedBy array for recipients
      type: 'sent'
  });

  try {
      const savedEmail = await forwardedEmail.save();
      res.status(201).json(savedEmail);
  } catch (error) {
      console.error('Error forwarding email:', error);
      res.status(500).json({ message: 'Error creating forwarded email', error });
  }
});

module.exports = router;