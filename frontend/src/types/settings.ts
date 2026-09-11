export interface PlatformSetting {
  key: string;
  value: string;
  updatedAt: string;
  updatedBy: { id: string; name: string } | null;
}
