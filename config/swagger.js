const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "1.0.0",
    },
  },
  apis: ["./routes/*.route.js", "./models/*.model.js"],
};

const specs = swaggerJsdoc(options);

const yamlSpecs = yaml.dump(specs);
fs.writeFileSync("./swagger.yaml", yamlSpecs, "utf8");

module.exports = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
  );
};
