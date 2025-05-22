import axios, { AxiosResponse } from "axios";
import { HandleLoginError } from "../helpers/ErrorHandler";

export default class EventService {
  private static instance: EventService;
  private api = "http://localhost:3000/api";

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

    // Obtener eventos por rango: 'today', 'week' o 'month'
  async getEvents(range: "today" | "week" | "month"): Promise<any[]> {
    try {
      const { data }: AxiosResponse = await axios.get(`${this.api}/events?range=${range}`);
      return data;
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  async getEventsByBar(barId: string, range: "today" | "week" | "month" | "all" = "all"): Promise<any[]> {
    try {
      const { data }: AxiosResponse = await axios.get(`${this.api}/bars/${barId}/events?range=${range}`);
      return data;
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }
}
