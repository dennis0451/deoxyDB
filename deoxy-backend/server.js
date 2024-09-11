const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const pool = require('./db'); // PostgreSQL pool connection

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // To parse incoming JSON requests

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
app.post('/api/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const fileType = path.extname(req.file.originalname).toLowerCase();
  const userId = 1; // Hardcoded user ID

  // Insert media file information into the database
  const insertMediaFileQuery = `
    INSERT INTO mediafile (user_id, file_name, file_type, status)
    VALUES ($1, $2, $3, 'uploaded')
    RETURNING file_id;
  `;
  const mediaFileValues = [userId, req.file.originalname, fileType]; // Use the original filename here

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

//Get data to be displayed on table
app.get('/api/dnasequences', (req, res) => {
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
      mediafile.file_id = dnasequence.file_id;
  `;
  
  pool.query(query)
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




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});