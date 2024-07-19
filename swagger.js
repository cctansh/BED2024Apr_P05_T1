const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; // Output file for the spec
const routes = ["./app.js"]; // Path to your API route files

const doc = {
  info: {
    title: "OurFoodSG - Food Security API Documentation",
    description: "This API documentation contains API endpoints for account, post, reply, quiz question, and quiz answer for OurFoodSG.",
  },
  host: "localhost:3000", // Replace with your actual host if needed
};

swaggerAutogen(outputFile, routes, doc);