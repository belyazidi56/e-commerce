import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Snackbar, Alert } from '@mui/material';

function Contact() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError(false);
    setMessageError(false);
    
    // Validate inputs
    let isValid = true;
    
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      isValid = false;
    }
    
    if (!message) {
      setMessageError(true);
      isValid = false;
    } else if (message.length > 300) {
      setMessageError(true);
      isValid = false;
    }
    
    if (isValid) {
      // In a real application, we would send the data to a server here
      console.log('Form submitted:', { email, message });
      
      // Show success message
      setSuccessOpen(true);
      
      // Reset form
      setEmail('');
      setMessage('');
    }
  };
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessOpen(false);
  };
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Have a question or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            helperText={emailError ? 'Please enter a valid email address' : ''}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="message"
            label="Message"
            id="message"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={messageError}
            helperText={messageError ? 'Message is required and must be less than 300 characters' : `${message.length}/300 characters`}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send
          </Button>
        </Box>
      </Paper>
      
      <Snackbar open={successOpen} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Demande de contact envoyée avec succès
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Contact;