import express from "express";

export default (app) => {
  // parse JSON requests
  app.use(express.json());

  // parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // disable the 'X-powered-by' to improve security
  app.disable("x-powered-by");

  console.log("applied middlewares");
};
