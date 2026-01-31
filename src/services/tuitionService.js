import BASE_URL from "../config/baseUrl";

export const tuitionService = {
  getAllTuitions: async () => {
    try {
      const response = await fetch(`${BASE_URL}/tuitions`);
      if (!response.ok) throw new Error("Failed to fetch tuitions");
      return await response.json();
    } catch (error) {
      console.error("Error fetching tuitions:", error);
      throw error;
    }
  },

  getTuitionById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/tuitions/${id}`);
      if (!response.ok) throw new Error("Failed to fetch tuition");
      return await response.json();
    } catch (error) {
      console.error("Error fetching tuition:", error);
      throw error;
    }
  },

  createTuition: async (tuitionData) => {
    try {
      const response = await fetch(`${BASE_URL}/tuitions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tuitionData),
      });
      if (!response.ok) throw new Error("Failed to create tuition");
      return await response.json();
    } catch (error) {
      console.error("Error creating tuition:", error);
      throw error;
    }
  },

  updateTuition: async (id, tuitionData) => {
    try {
      const response = await fetch(`${BASE_URL}/tuitions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tuitionData),
      });
      if (!response.ok) throw new Error("Failed to update tuition");
      return await response.json();
    } catch (error) {
      console.error("Error updating tuition:", error);
      throw error;
    }
  },

  deleteTuition: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/tuitions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tuition");
      return await response.json();
    } catch (error) {
      console.error("Error deleting tuition:", error);
      throw error;
    }
  },

  searchTuitions: async (filters) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${BASE_URL}/tuitions/search?${queryParams}`);
      if (!response.ok) throw new Error("Failed to search tuitions");
      return await response.json();
    } catch (error) {
      console.error("Error searching tuitions:", error);
      throw error;
    }
  },
};