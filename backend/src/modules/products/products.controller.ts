import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as productsService from './products.service';
import { uploadProductPhoto } from '../../storage/productPhotoStorage';

export const listProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await productsService.listProducts(req.query as never);
  res.status(200).json(result);
});

export const getProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const product = await productsService.getProductById(req.params.id);
  res.status(200).json(product);
});

export const listMyProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const products = await productsService.listMyProducts(req.user.id);
  res.status(200).json(products);
});

export const createProductHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  productsService.assertCanOwnProducts(req.user.role);
  const product = await productsService.createProduct(req.user.id, req.body);
  res.status(201).json(product);
});

export const updateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const product = await productsService.updateProduct(req.user.id, req.params.id, req.body);
  res.status(200).json(product);
});

export const deleteProductHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await productsService.deleteProduct(req.user.id, req.params.id);
  res.status(204).send();
});

export const publishProductHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const product = await productsService.setProductPublished(req.user.id, req.params.id, true, req);
  res.status(200).json(product);
});

export const unpublishProductHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const product = await productsService.setProductPublished(req.user.id, req.params.id, false, req);
  res.status(200).json(product);
});

export const addProductPhotoHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const photo = await productsService.addProductPhoto(req.user.id, req.params.id, req.body.url);
  res.status(201).json(photo);
});

export const removeProductPhotoHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await productsService.removeProductPhoto(req.user.id, req.params.id, req.params.photoId);
  res.status(204).send();
});

export const listProductsForAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await productsService.listProductsForAdmin(req.query as never);
  res.status(200).json(result);
});

export const moderateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const product = await productsService.moderateProduct(req.user.id, req.params.id, req.body, req);
  res.status(200).json(product);
});

export const uploadProductPhotoHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  if (!req.file) throw ApiError.badRequest('Ficheiro de imagem em falta (campo "file")');

  const url = await uploadProductPhoto({
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    ownerId: req.user.id,
  });
  const photo = await productsService.addProductPhoto(req.user.id, req.params.id, url);
  res.status(201).json(photo);
});
