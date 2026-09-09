import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as reviewsService from './reviews.service';

export const createReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const review = await reviewsService.createReview(req.user.id, req.body, req);
  res.status(201).json(review);
});

export const listMyReviewsForOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const reviews = await reviewsService.listMyReviewsForOrder(req.user.id, req.params.orderId);
  res.status(200).json(reviews);
});

export const listProductReviewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewsService.listProductReviews(req.params.productId, req.query as never);
  res.status(200).json(result);
});
