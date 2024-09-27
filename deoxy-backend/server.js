const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const pool = require('./db'); // PostgreSQL pool connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

// const cors = require('cors');

// server.js or app.js
app.use(cors({
  origin: 'http://localhost:4200', // Your Angular app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // To parse incoming JSON requests

// Secret key for signing JWTs
const secretKey = 'your-secret-key'; // Replace with your own secret key

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email',
      [username, email, hashedPassword]
    );

    // Create JWT Token
    const token = jwt.sign({ userId: newUser.rows[0].user_id }, 'your_jwt_secret_key', {
      expiresIn: '1h',
    });

    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists
  const query = 'SELECT * FROM users WHERE username = $1';
  pool.query(query, [username])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const user = result.rows[0];

      // Compare the hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          // Generate JWT token
          // Example in login endpoint
        const token = jwt.sign(
  { user_id: user.user_id, username: user.username, email: user.email },
  secretKey,
  { expiresIn: '1h' }
);


          // Return the token along with the user object
          res.json({
            token,
            user: {
              user_id: user.user_id,
              username: user.username,
              email: user.email,
            },
          });
        } else {
          res.status(401).json({ message: 'Invalid username or password' });
        }
      });
    })
    .catch(error => {
      res.status(500).json({ message: 'Server error' });
    });
});


// Middleware to protect routes and extract user info
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   console.log('Authorization Header:', authHeader);

//   if (!authHeader) return res.status(401).json({ message: 'Access Denied' });

//   const token = authHeader.split(' ')[1];  // Extract the token part
//   console.log('Extracted Token:', token);

//   if (!token) return res.status(401).json({ message: 'Access Denied' });

//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) {
//       console.log('Token verification error:', err);
//       return res.status(403).json({ message: 'Invalid Token' });
//     }
//     req.user = user;
//     next(); // Proceed to the next middleware
//   });
// }

// server.js or app.js

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader)
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Invalid Token' });

    req.user = user; // Attach user info to req.user
    next();
  });
}


// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});


//Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Save the file with its original name
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage });

//file upload and processig

// Handle file upload and processing
// app.post('/api/upload', upload.single('file'), (req, res) => {
//   const filePath = req.file.path;
//   const fileType = path.extname(req.file.originalname).toLowerCase();
  
//   // Get the userId from formData
//   const userId = req.body.userId;  // Extract userId from form data
//   console.log('userId:', userId);
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const fileType = path.extname(req.file.originalname).toLowerCase();

  // Get the userId from req.user
  const userId = req.user.user_id; // Extract userId from token
  console.log('userId:', userId);
  // Insert media file information into the database
  const insertMediaFileQuery = `
    INSERT INTO mediafile (user_id, file_name, file_type, status)
    VALUES ($1, $2, $3, 'uploaded')
    RETURNING file_id;
  `;
  const mediaFileValues = [userId, req.file.originalname, fileType];

  pool.query(insertMediaFileQuery, mediaFileValues)
    .then((result) => {
      const fileId = result.rows[0].file_id;
      console.log(`Inserted media file with file_id: ${fileId}`);

      // Process image files (jpg, png)
      if (fileType === '.jpg' || fileType === '.png' || fileType === '.jpeg') {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
          }

          const dnaSequence = binaryToDna(data);
          console.log(`Generated DNA sequence: ${dnaSequence.slice(0, 64)}...`);
          saveDnaSequenceToDb(fileId, dnaSequence, res);

          // Delete the file after processing
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log(`File deleted: ${filePath}`);
            }
          });
        });
      }
      // Process video files (mp4, mov)
      else if (fileType === '.mp4' || fileType === '.mov') {
        const outputBinaryPath = filePath + '.bin';
        exec(`ffmpeg -i ${filePath} -f u8 -c:v rawvideo ${outputBinaryPath}`, (error) => {
          if (error) {
            console.error('Error processing video file:', error);
            return res.status(500).send(`Error processing video file: ${error.message}`);
          }

          fs.readFile(outputBinaryPath, (err, data) => {
            if (err) {
              console.error('Error reading binary file:', err);
              return res.status(500).send('Error reading binary file');
            }

            const dnaSequence = binaryToDna(data);
            console.log(`Generated DNA sequence: ${dnaSequence.slice(0, 64)}...`);
            saveDnaSequenceToDb(fileId, dnaSequence, res);

            // Delete the original video and binary file after processing
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting original file:', err);
              } else {
                console.log(`Original file deleted: ${filePath}`);
              }
            });
            fs.unlink(outputBinaryPath, (err) => {
              if (err) {
                console.error('Error deleting binary file:', err);
              } else {
                console.log(`Binary file deleted: ${outputBinaryPath}`);
              }
            });
          });
        });
      } else {
        res.status(400).send('Unsupported file type');
      }
    })
    .catch((error) => {
      console.error('Error saving media file to database:', error);
      res.status(500).send('Error saving media file to database');
    });
});



//Download DNA sequence as image
app.get('/api/download/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  
  const query = `
  SELECT dnasequence.dna_sequence, mediafile.file_name 
  FROM dnasequence 
  INNER JOIN mediafile 
  ON dnasequence.file_id = mediafile.file_id 
  WHERE dnasequence.file_id = $1;
`;

pool.query(query, [fileId])
    .then(result => {
      if (result.rows.length > 0) {
        const dnaSequence = result.rows[0].dna_sequence;
        const originalFileName = result.rows[0].file_name;
        const binaryData = dnaToBinary(dnaSequence);

        // Verify the length of the binary data
        console.log(`Binary data length: ${binaryData.length} bytes`);

        // Define the file path with the correct image extension (e.g., .jpg, .png)
        const filePath = `uploads/${fileId}.jpg`;

        // Write the binary data back to an image file
        fs.writeFile(filePath, binaryData, (err) => {
          if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Error writing file');
          }

          // Verify the written file size
          const stats = fs.statSync(filePath);
          console.log(`File size after writing: ${stats.size} bytes`);

          // Use command-line `file` command to verify file type
          exec(`file ${filePath}`, (error, stdout, stderr) => {
            if (error) {
              console.error('Error verifying file type:', stderr);
            } else {
              console.log(`File type verification: ${stdout}`);
            }

            // Use the original filename for the download
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Disposition', `attachment; filename=${originalFileName}`);

            res.sendFile(path.resolve(filePath), (downloadErr) => {
              if (downloadErr) {
                console.error('Error sending file:', downloadErr);
              }

              // Delete the file after sending to avoid clutter
              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting file:', unlinkErr);
                }
              });
            });
          });
        });
      } else {
        res.status(404).send('File not found');
      }
    })
    .catch((error) => {
      console.error('Error retrieving DNA sequence:', error);
      res.status(500).send('Error retrieving DNA sequence');
    });
});

//insert DNA sequence into database
function saveDnaSequenceToDb(fileId, dnaSequence, res) {
  const insertDnaSequenceQuery = `
    INSERT INTO dnasequence (file_id, dna_sequence, length, creation_date)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;

  const dnaLength = dnaSequence ? dnaSequence.length : 0;

  console.log(`Inserting DNA sequence into database with file_id: ${fileId}, length: ${dnaLength}`);

  if (dnaLength === 0) {
    console.error('DNA sequence length is zero, skipping insertion.');
    return res.status(400).send('DNA sequence is empty, cannot insert.');
  }

  const values = [fileId, dnaSequence, dnaLength];

  pool.query(insertDnaSequenceQuery, values)
    .then((result) => {
      console.log('DNA sequence inserted successfully:', result.rows[0]);
      res.json({ dnaSequence: result.rows[0] });
    })
    .catch((error) => {
      console.error('Error saving DNA sequence to database:', error);
      res.status(500).send('Error saving DNA sequence to database');
    });
}

function binaryToDna(binaryData) {
  const dnaMap = {
    '00': 'A',
    '01': 'C',
    '10': 'G',
    '11': 'T',
  };

  let dnaSequence = '';
  for (let i = 0; i < binaryData.length; i++) {
    const binaryChar = binaryData[i].toString(2).padStart(8, '0');
    for (let j = 0; j < binaryChar.length; j += 2) {
      dnaSequence += dnaMap[binaryChar.slice(j, j + 2)];
    }
  }

  return dnaSequence;
}

function dnaToBinary(dnaSequence) {
  const dnaMapReverse = {
    'A': '00',
    'C': '01',
    'G': '10',
    'T': '11',
  };

  let binaryData = '';

  for (let i = 0; i < dnaSequence.length; i++) {
    binaryData += dnaMapReverse[dnaSequence[i]];
  }

  // binary string to a buffer
  const buffer = Buffer.alloc(binaryData.length / 8);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = parseInt(binaryData.slice(i * 8, i * 8 + 8), 2);
  }

  return buffer;
}
 


// Using userId from query parameters
app.get('/api/dnasequences', authenticateToken, (req, res) => {
  const userId = req.user.user_id;  // Extract the userId from the decoded token

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const query = `
    SELECT 
      mediafile.file_id, 
      mediafile.file_name, 
      dnasequence.sequence_id, 
      SUBSTRING(dnasequence.dna_sequence, 1, 32) AS dna_sequence 
    FROM 
      mediafile 
    INNER JOIN 
      dnasequence 
    ON 
      mediafile.file_id = dnasequence.file_id
    WHERE mediafile.user_id = $1;
  `;
  
  pool.query(query, [userId])
    .then((result) => {
      res.json(result.rows);
    })
    .catch((error) => {
      console.error('Error fetching DNA sequences from database:', error);
      res.status(500).send('Error fetching DNA sequences from database');
    });
});

//edit row
app.put('/api/update/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const { file_name } = req.body;

  const query = `
    UPDATE mediafile 
    SET file_name = $1 
    WHERE file_id = $2;
  `;

  const values = [file_name, fileId];

  pool.query(query, values)
    .then(() => {
      res.json({ message: 'File name updated successfully' });
    })
    .catch((error) => {
      console.error('Error updating database:', error);
      res.status(500).json({ error: 'Failed to update file' });
    });
});

app.get('/api/preview/:fileId', (req, res) => {
  const fileId = req.params.fileId;

  // Step 1: Query the database to get the DNA sequence and file name
  const query = 'SELECT file_name, dna_sequence FROM dnasequence INNER JOIN mediafile ON dnasequence.file_id = mediafile.file_id WHERE dnasequence.file_id = $1';

  pool.query(query, [fileId])
    .then(result => {
      if (result.rows.length > 0) {
        const fileName = result.rows[0].file_name;
        const dnaSequence = result.rows[0].dna_sequence;
        const filePath = path.join(__dirname, 'uploads', fileName); // Path to the regenerated file

        // Step 2: Convert DNA sequence back to binary
        const binaryData = dnaToBinary(dnaSequence);

        // Step 3: Write the binary data back to an image file
        fs.writeFile(filePath, binaryData, (err) => {
          if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Error writing file');
          }

          console.log(`File regenerated: ${filePath}`);

          // Step 4: Serve the file
          res.sendFile(filePath, (err) => {
            if (err) {
              console.error('Error sending file:', err);
              return res.status(500).send('Error sending file');
            }

            // Step 5: Delete the file after it's served to the client
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting file:', err);
              } else {
                console.log(`File deleted: ${filePath}`);
              }
            });
          });
        });
      } else {
        console.error(`File ID not found in database: ${fileId}`);
        res.status(404).send('File ID not found in database');
      }
    })
    .catch(error => {
      console.error('Error retrieving DNA sequence:', error);
      res.status(500).send('Error retrieving DNA sequence');
    });
});

app.get('/api/download-all', authenticateToken, (req, res) => {
  const userId = req.user.user_id;  // Extract userId from the token

  // Query the database for all DNA sequences belonging to the user
  const query = `
    SELECT mediafile.file_name, dnasequence.dna_sequence
    FROM mediafile
    INNER JOIN dnasequence ON mediafile.file_id = dnasequence.file_id
    WHERE mediafile.user_id = $1;
  `;

  pool.query(query, [userId])
    .then(result => {
      if (result.rows.length > 0) {
        // Generate FASTA content
        let fastaContent = '';
        result.rows.forEach(row => {
          fastaContent += `>${row.file_name}\n${row.dna_sequence.match(/.{1,80}/g).join('\n')}\n`;
        });

        // Create a temporary file to write the FASTA content to
        const filePath = path.join(__dirname, 'temp', `sequences_${userId}.fasta`);
        fs.writeFileSync(filePath, fastaContent);

        // Send the file back as a response
        res.download(filePath, 'sequences.fasta', (err) => {
          if (err) {
            console.error('Error downloading the file:', err);
            return res.status(500).send('File download error');
          }

          // Clean up the temporary file
          fs.unlinkSync(filePath);
        });
      } else {
        res.status(404).send('No DNA sequences found for the user');
      }
    })
    .catch(error => {
      console.error('Error fetching DNA sequences:', error);
      res.status(500).send('Error fetching DNA sequences');
    });
});

app.delete('/api/delete/:fileId', async (req, res) => {
  const fileId = req.params.fileId;

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Delete from the dnasequence table
    await pool.query('DELETE FROM dnasequence WHERE file_id = $1', [fileId]);

    // Delete from the mediafile table
    await pool.query('DELETE FROM mediafile WHERE file_id = $1', [fileId]);

    // Commit the transaction
    await pool.query('COMMIT');

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error deleting file from database:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
