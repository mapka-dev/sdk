export type WithId<T extends { id: string }> = T & { id: string };
