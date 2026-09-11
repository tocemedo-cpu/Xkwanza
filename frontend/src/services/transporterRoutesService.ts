import { apiClient } from '../api/client';
import { AddRouteStopPayload, CreateRoutePayload, Route, RouteStop, UpdateRoutePayload, UpdateRouteStopPayload } from '../types/routes';

export async function createRoute(payload: CreateRoutePayload): Promise<Route> {
  const { data } = await apiClient.post<Route>('/transporter-routes', payload);
  return data;
}

export async function fetchMyRoutes(): Promise<Route[]> {
  const { data } = await apiClient.get<Route[]>('/transporter-routes');
  return data;
}

export async function fetchRoute(routeId: string): Promise<Route> {
  const { data } = await apiClient.get<Route>(`/transporter-routes/${routeId}`);
  return data;
}

export async function updateRoute(routeId: string, payload: UpdateRoutePayload): Promise<Route> {
  const { data } = await apiClient.patch<Route>(`/transporter-routes/${routeId}`, payload);
  return data;
}

export async function deleteRoute(routeId: string): Promise<void> {
  await apiClient.delete(`/transporter-routes/${routeId}`);
}

export async function addRouteStop(routeId: string, payload: AddRouteStopPayload): Promise<RouteStop> {
  const { data } = await apiClient.post<RouteStop>(`/transporter-routes/${routeId}/stops`, payload);
  return data;
}

export async function updateRouteStop(
  routeId: string,
  stopId: string,
  payload: UpdateRouteStopPayload,
): Promise<RouteStop> {
  const { data } = await apiClient.patch<RouteStop>(`/transporter-routes/${routeId}/stops/${stopId}`, payload);
  return data;
}

export async function removeRouteStop(routeId: string, stopId: string): Promise<void> {
  await apiClient.delete(`/transporter-routes/${routeId}/stops/${stopId}`);
}
