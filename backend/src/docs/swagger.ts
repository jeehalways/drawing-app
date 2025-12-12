import swaggerJsdoc from "swagger-jsdoc";
import { version } from "../../package.json";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Drawing App API",
      version,
      description: "API documentation for the Drawing App backend",
    },

    servers: [{ url: "http://localhost:3000" }],

    components: {
      securitySchemes: {
        FirebaseAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Firebase ID Token used for authenticated routes.",
        },
      },

      schemas: {
        // Manual Registration Input
        RegisterUserInput: {
          type: "object",
          required: ["name", "birthday"],
          properties: {
            name: {
              type: "string",
              example: "Alice",
            },
            birthday: {
              type: "string",
              format: "date",
              example: "2010-05-12",
            },
          },
        },

        // User Model
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "11111111-1111-1111-1111-111111111111",
            },
            name: {
              type: "string",
              example: "Alice",
            },
            email: {
              type: "string",
              nullable: true,
              example: "alice@example.com",
            },
            avatar: {
              type: "string",
              example: "https://api.dicebear.com/avatar.svg",
            },
            birthday: {
              type: "string",
              format: "date",
              nullable: true,
              example: "2010-05-12",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // Drawing Model
        Drawing: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            imageData: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

    
        // Drawing WITH User — used by admin GET /api/admin/drawings
        DrawingWithUser: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            imageData: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            userId: { type: "string", format: "uuid" },

            // Embeds the User object
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
      },
    },

    // Apply security globally (admin routes require Firebase)
    security: [{ FirebaseAuth: [] }],
  },

  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
