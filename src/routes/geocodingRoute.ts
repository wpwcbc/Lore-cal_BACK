// geocodingRoute.ts

import express from 'express';
import { reverseGeocoding } from '../controllers/geocodingController';
// Contollers

const geocodingRouter = express.Router();

geocodingRouter //
    .get('/reverse', reverseGeocoding);

export { geocodingRouter };
