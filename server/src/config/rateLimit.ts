import { rateLimit } from 'express-rate-limit'

export const applimiter = rateLimit({
	windowMs: 30 * 60 * 1000, 
	limit: 100, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	
})

export const authlimiter = rateLimit({
	windowMs: 30 * 60 * 1000, 
	limit: 30, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	
})