import BASE_URL from "../config/baseUrl";

export const schoolService = {
  getAllSchools: async () => {
    try {
      const response = await fetch(`${BASE_URL}/schools`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Error Response:", errorText);
        throw new Error(`Server Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Schools Data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching schools:", error);
      
      // Return empty array instead of throwing for better UX
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  },

  // Add timeout to other methods
  createSchool: async (schoolData) => {
    try {
      const response = await fetch(`${BASE_URL}/schools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(schoolData),
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create school: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error creating school:", error);
      throw error;
    }
  },
  
  


  updateSchool: async (id, schoolData) => {
    try {
      const response = await fetch(`${BASE_URL}/schools/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schoolData),
      });
      if (!response.ok) throw new Error("Failed to update school");
      return await response.json();
    } catch (error) {
      console.error("Error updating school:", error);
      throw error;
    }
  },

  deleteSchool: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/schools/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete school");
      return await response.json();
    } catch (error) {
      console.error("Error deleting school:", error);
      throw error;
    }
  },

  searchSchools: async (filters) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${BASE_URL}/schools/search?${queryParams}`);
      if (!response.ok) throw new Error("Failed to search schools");
      return await response.json();
    } catch (error) {
      console.error("Error searching schools:", error);
      throw error;
    }
  },
};