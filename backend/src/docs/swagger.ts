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
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // where Swagger will look for documentation
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
