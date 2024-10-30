// // const express = require('express');
// // const router = express.Router();
// // const Email = require('../models/Email');

// // // Restore email from bin (set bin to false)
// // router.put('/:id/restore', async (req, res) => {
// //   try {
// //     const emailId = req.params.id;
// //     // Update the email's bin field to false
// //     await Email.findByIdAndUpdate(emailId, { bin: false });
// //     res.status(200).send('Email restored successfully');
// //   } catch (error) {
// //     console.error('Error restoring email:', error);
// //     res.status(500).send('Error restoring email');
// //   }
// // });

// // // Get bin emails for a specific user
// // router.get('/', async (req, res) => {
// //   const { email } = req.query;

// //   try {
// //     // Fetch all bin emails for the logged-in user
// //     const binEmails = await Email.find({ to: email, bin: true });
// //     res.json(binEmails);
// //   } catch (err) {
// //     console.error('Error fetching bin emails:', err);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // });

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Email = require('../models/Email');

// // Restore email from bin (set bin or binSend to false based on user)
// router.put('/:id/restore', async (req, res) => {
//   try {
//     const emailId = req.params.id;
//     const { userEmail } = req.body; // User's email to determine context

//     const email = await Email.findById(emailId);

//     if (!email) {
//       return res.status(404).send('Email not found');
//     }

//     // Check if the logged-in user is the sender or recipient and restore accordingly
//     if (email.from === userEmail && email.binSend === true) {
//       await Email.findByIdAndUpdate(emailId, { binSend: false });
//       res.status(200).send('Email restored for the sender successfully');
//     } else if (email.to.includes(userEmail) && email.bin === true) {
//       await Email.findByIdAndUpdate(emailId, { bin: false });
//       res.status(200).send('Email restored for the recipient successfully');
//     } else {
//       res.status(400).send('No action required');
//     }
//   } catch (error) {
//     console.error('Error restoring email:', error);
//     res.status(500).send('Error restoring email');
//   }
// });

// // Get bin emails for a specific user (either from or to)
// router.get('/', async (req, res) => {
//   const { email } = req.query;

//   try {
//     // Fetch all bin emails where the logged-in user is either sender or recipient
//     const binEmails = await Email.find({
//       $or: [
//         { from: email, binSend: true },
//         { to: email, bin: true }
//       ]
//     });
//     res.json(binEmails);
//   } catch (err) {
//     console.error('Error fetching bin emails:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Permanently delete email from bin
// router.delete('/:id', async (req, res) => {
//   try {
//     const emailId = req.params.id;
//     const { userEmail } = req.body; // The logged-in user's email

//     console.log("Email Id : ",emailId);
//     console.log("UserEmail : ",userEmail);

//     // Find the email by ID
//     const email = await Email.findById(emailId);

//     if (!email) {
//       return res.status(404).send('Email not found');
//     }

//     // Flag to check if any updates were made
//     let updated = false;

//     // 1. If the user is the sender and binSend is true, remove the binSend field
//     if (email.from === userEmail && email.binSend === true) {
//       await Email.updateOne({ _id: emailId }, { $unset: { binSend: "" } });
      
//       updated = true;
//     }
    
//     // 2. If the user is the recipient and bin is true, remove the bin field
//     if (email.to.includes(userEmail) && email.bin === true) {
//       await Email.updateOne({ _id: emailId }, { $unset: { bin: "" } });
//       updated = true;
//     }

//     // if (!email.hasOwnProperty('binSend') && !email.hasOwnProperty('bin')) {
//     //   await Email.findByIdAndDelete(emailId); // Delete email if neither field exists
//     //   return res.status(200).send('Email permanently deleted');
//     // }
    
//     // If only one of the fields was removed, update the email in the database
//     if (updated) {
//       return res.status(200).send('Email bin flags updated successfully');
//     }

//     res.status(400).send('No action required');
//   } catch (error) {
//     console.error('Error deleting email:', error);
//     res.status(500).send('Error deleting email');
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Email = require('../models/Email');

// Restore email (remove user from deletedBy)
router.put('/:id/restore', async (req, res) => {
  try {
    const emailId = req.params.id;
    const { userEmail } = req.body;

    const email = await Email.findById(emailId);

    if (!email) {
      return res.status(404).send('Email not found');
    }

    // Check if the logged-in user is the sender or recipient and restore accordingly
    if (email.from === userEmail && email.binSend === true) {
      // For sender, set binSend to false
      await Email.findByIdAndUpdate(emailId, { binSend: false });
      res.status(200).send('Email restored for the sender successfully');
    } else if (email.recipients.includes(userEmail) && email.deletedBy.includes(userEmail)) {
      // For recipient, remove from deletedBy array
      await Email.findByIdAndUpdate(emailId, {
        $pull: { deletedBy: userEmail }
      });
      res.status(200).send('Email restored for the recipient successfully');
    } else {
      res.status(400).send('No action required');
    }
  } catch (error) {
    console.error('Error restoring email:', error);
    res.status(500).send('Error restoring email');
  }
});

// Get bin emails for a specific user
router.get('/', async (req, res) => {
  const { email } = req.query;

  try {
    // Fetch all bin emails where:
    // 1. User is sender and binSend is true, OR
    // 2. User is in recipients and in deletedBy array
    const binEmails = await Email.find({
      $or: [
        { from: email, binSend: true },
        { 
          recipients: { $in: [email] },
          deletedBy: { $in: [email] }
        }
      ]
    });
    res.json(binEmails);
  } catch (err) {
    console.error('Error fetching bin emails:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Permanently delete email from bin
// router.delete('/:id', async (req, res) => {
//   try {
//     const emailId = req.params.id;
//     const { userEmail } = req.body;

//     const email = await Email.findById(emailId);

//     if (!email) {
//       return res.status(404).send('Email not found');
//     }

//     let updated = false;

//     // 1. If the user is the sender and binSend is true
//     if (email.from === userEmail && email.binSend === true) {
//       await Email.updateOne(
//         { _id: emailId },
//         { 
//           $unset: { binSend: "" },
//           // Remove sender's email from recipients if they're in it
//           $pull: { recipients: userEmail }
//         }
//       );
//       updated = true;
//     }

//     // 2. If the user is the recipient and in deletedBy
//     if (email.recipients.includes(userEmail) && email.deletedBy.includes(userEmail)) {
//       await Email.updateOne(
//         { _id: emailId },
//         {
//           // Remove user from both recipients and deletedBy arrays
//           $pull: {
//             recipients: userEmail,
//             deletedBy: userEmail
//           }
//         }
//       );
//       updated = true;
//     }

//     if (updated) {
//       // If no recipients left and sender has deleted (binSend), delete the document
//       const updatedEmail = await Email.findById(emailId);
//       if (updatedEmail && updatedEmail.recipients.length === 0 && (!updatedEmail.binSend || updatedEmail.binSend === true)) {
//         await Email.deleteOne({ _id: emailId });
//         return res.status(200).send('Email permanently deleted');
//       }
//       return res.status(200).send('Email updated successfully');
//     }

//     res.status(400).send('No action required');
//   } catch (error) {
//     console.error('Error deleting email:', error);
//     res.status(500).send('Error deleting email');
//   }
// });

router.delete('/:id', async (req, res) => {
  try {
    const emailId = req.params.id;
    const { userEmail } = req.body;

    // Fetch the email document
    const email = await Email.findById(emailId);

    if (!email) {
      return res.status(404).send('Email not found');
    }

    let updated = false;

    // 1. If the user is the sender and the email is in their bin
    if (email.from === userEmail && email.binSend === true) {
      await Email.updateOne(
        { _id: emailId },
        { 
          $unset: { binSend: "" },
          // Remove sender from recipients if they exist there
          $pull: { recipients: userEmail }
        }
      );
      updated = true;
    }

    // 2. If the user is a recipient and has deleted it (exists in `deletedBy`)
    if (email.recipients.includes(userEmail) && email.deletedBy.includes(userEmail)) {
      await Email.updateOne(
        { _id: emailId },
        {
          // Remove user from recipients and deletedBy arrays
          $pull: {
            recipients: userEmail,
            deletedBy: userEmail,
            starredBy: userEmail
          }
        }
      );
      updated = true;
    }

    // If changes were made, check if the document should be deleted entirely
    if (updated) {
      // const updatedEmail = await Email.findById(emailId);

      // // Delete the email if no recipients remain and sender has deleted it (binSend is not set)
      // if (updatedEmail && updatedEmail.recipients.length === 0 && !updatedEmail.binSend) {
      //   await Email.deleteOne({ _id: emailId });
      //   return res.status(200).send('Email permanently deleted');
      // }

      // Final deletion condition: Delete only if there are no recipients left *and* it isn’t kept in the sent items
      // if (
      //   updatedEmail &&
      //   updatedEmail.recipients.length === 0 &&
      //   // updatedEmail.from !== userEmail && // Keeps self-addressed emails in sent box
      //   updatedEmail.binSend !== true
      // ) {
      //   await Email.deleteOne({ _id: emailId });
      //   return res.status(200).send('Email permanently deleted');
      // }


      return res.status(200).send('Email updated successfully');
    }

    res.status(400).send('No action required');
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).send('Error deleting email');
  }
});

module.exports = router;