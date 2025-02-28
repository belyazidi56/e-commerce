import React from 'react';
import { Drawer, Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Divider, Button, TextField } from '@mui/material';
import { Close, Delete, Add, Remove } from '@mui/icons-material';

function Cart({ open, onClose, items, onRemove, onUpdateQuantity }) {
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Shopping Cart ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {items.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Your cart is empty
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => onRemove(item.id)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={item.image} alt={item.name} variant="square" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <>
                          <Typography
                            component="div"
                            variant="body2"
                            color="text.primary"
                          >
                            ${item.price.toFixed(2)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                onUpdateQuantity(item.id, value);
                              }}
                              inputProps={{ min: 1, style: { textAlign: 'center' } }}
                              sx={{ width: '40px', mx: 1 }}
                            />
                            <IconButton 
                              size="small" 
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${totalPrice.toFixed(2)}</Typography>
              </Box>
              <Button variant="contained" color="primary" fullWidth>
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default Cart;