import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alten E-commerce API',
      version: '1.0.0',
      description: 'API documentation for Alten E-commerce platform',
      contact: {
        name: 'API Support',
        email: 'youssefbelyazidi1@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: [
            'code',
            'name',
            'description',
            'image',
            'category',
            'price',
            'quantity',
            'internalReference',
            'shellId',
            'inventoryStatus',
            'rating'
          ],
          properties: {
            id: {
              type: 'string',
              description: 'Product ID'
            },
            code: {
              type: 'string',
              description: 'Product code'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            image: {
              type: 'string',
              description: 'Product image URL'
            },
            category: {
              type: 'string',
              description: 'Product category'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            quantity: {
              type: 'integer',
              description: 'Available quantity'
            },
            internalReference: {
              type: 'string',
              description: 'Internal reference code'
            },
            shellId: {
              type: 'integer',
              description: 'Shell ID'
            },
            inventoryStatus: {
              type: 'string',
              enum: ['INSTOCK', 'LOWSTOCK', 'OUTOFSTOCK'],
              description: 'Inventory status'
            },
            rating: {
              type: 'number',
              description: 'Product rating (0-5)'
            },
            createdAt: {
              type: 'integer',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'integer',
              description: 'Last update timestamp'
            }
          }
        },
        User: {
          type: 'object',
          required: ['username', 'firstname', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            firstname: {
              type: 'string',
              description: 'First name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Password'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Admin status'
            }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            product: {
              type: 'string',
              description: 'Product ID'
            },
            quantity: {
              type: 'integer',
              description: 'Quantity'
            }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            user: {
              type: 'string',
              description: 'User ID'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem'
              }
            }
          }
        },
        Wishlist: {
          type: 'object',
          properties: {
            user: {
              type: 'string',
              description: 'User ID'
            },
            products: {
              type: 'array',
              items: {
                type: 'string',
                description: 'Product ID'
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API routes files
};

const specs = swaggerJsdoc(options);

export default (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
  
  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};