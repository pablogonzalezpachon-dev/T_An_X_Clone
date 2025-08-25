import express from "express";
import jwt from "jsonwebtoken";
import sql from "../Lib/Utils/db";

const authUserRouter = express.Router();
