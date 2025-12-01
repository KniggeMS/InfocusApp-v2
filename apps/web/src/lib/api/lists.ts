import axios from 'axios';
import { apiClient as api } from './client';

export interface CustomList {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        items: number;
    };
    items?: CustomListEntry[];
}

export interface CustomListEntry {
    id: string;
    listId: string;
    mediaItemId: string;
    addedAt: string;
    mediaItem: any; // Using any for now to avoid circular dependency or complex type import
}

export const listsApi = {
    getLists: async (): Promise<CustomList[]> => {
        const response = await api.get('/lists');
        return response.data;
    },

    createList: async (data: { name: string; description?: string; isPublic?: boolean }): Promise<CustomList> => {
        const response = await api.post('/lists', data);
        return response.data;
    },

    getList: async (id: string): Promise<CustomList> => {
        const response = await api.get(`/lists/${id}`);
        return response.data;
    },

    deleteList: async (id: string): Promise<void> => {
        await api.delete(`/lists/${id}`);
    },

    addItem: async (listId: string, mediaItemId: string): Promise<CustomListEntry> => {
        const response = await api.post(`/lists/${listId}/items`, { mediaItemId });
        return response.data;
    },

    removeItem: async (listId: string, mediaItemId: string): Promise<void> => {
        await api.delete(`/lists/${listId}/items/${mediaItemId}`);
    },
};
