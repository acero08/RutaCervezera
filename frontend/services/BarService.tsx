import axios, { AxiosResponse } from "axios";
import { HandleLoginError } from "../helpers/ErrorHandler";

export default class ApiService {
    private static instance: ApiService;
    private api = "http://localhost:3000/api";

    private constructor() {}

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
        ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    // Saca la informacion de un bar por su nombre
    async getBarByName(name: string): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get(`${this.api}/bars/search?name=${encodeURIComponent(name)}`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // Saca la informacion de todos los bares 
    async getAllBars(): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get(`${this.api}/bars`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // Permite actualizar la informacion de un bar
    async updateBar (id:string, barData: any): Promise<any>{
        try {
            const { data }: AxiosResponse = await axios.put(`${this.api}/bars/${id}`, barData);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // Permite borrar un bar 
    async deleteBar (id:string): Promise<any>{
        try {
            const { data }: AxiosResponse = await axios.delete(`${this.api}/bars/${id}`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // Jala los detalles del bar
    async barDetails(id: string): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get(`${this.api}/bars/${id}`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // Jala el menu del bar
    async barMenu(id: string): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get(`${this.api}/bars/${id}/menu`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // Jala bebidas alcoholicas del bar 

    async alcoholicDrinks(id: string): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get(`${this.api}/bars/${id}/alcoholic-drinks`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // Jala la comida del bar 
    async foodBar (id:string): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get (`${this.api}/bars/${id}/food`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    //Jala la bebida del bar 
    async drinkBar (id:string): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get (`${this.api}/bars/${id}/drinks`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
    }

    // jala la bebida por id
    async getMenuItemById(itemId: string): Promise<any> {
        try {
            const { data }: AxiosResponse = await axios.get(`${this.api}/menu/${itemId}`);
            return data;
        } catch (error) {
            HandleLoginError(error);
            throw error;
        }
        }

    // jala los favoritos de un usuario
    async getUserFavorites(userId: string): Promise<any[]> {
        const { data }: AxiosResponse = await axios.get(`${this.api}/users/${userId}/favorites`);
        return data.data;
    }

    // deja hacerle favorito a un bar
    async toggleFavorite(userId: string, barId: string): Promise<any> {
        const { data }: AxiosResponse = await axios.post(`${this.api}/users/${userId}/favorites/${barId}`);
        return data;
     }
}
    // Jala los reviews pero aun no se bn como funciona el endpoint de esta madre
    // async barReviews(id: string): Promise<any> {
    //     try {
    //         const { data }: AxiosResponse = await axios.get(`${this.api}/bars/${id}/reviews`);
    //         return data;
    //     } catch (error) {
    //         HandleLoginError(error);
    //         throw error;
    //     }
    // }

