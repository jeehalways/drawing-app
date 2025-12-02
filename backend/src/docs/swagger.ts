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
          description:
            "Firebase ID Token (JWT) returned after a user/admin logs in.",
        },
      },
    },
    security: [
      {
        FirebaseAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
