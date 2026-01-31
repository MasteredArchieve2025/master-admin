import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://master-backend-18ik.onrender.com/api';

const uploadService = {
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file); // must match multer key

      const response = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
          // ❌ DO NOT SET Content-Type
          headers: {
            Accept: 'application/json',
          },
          timeout: 60000,
        }
      );

      if (response.data?.success) {
        return response.data.data.url;
      }

      throw new Error(response.data?.message || 'Upload failed');
    } catch (error) {
      console.error("UPLOAD ERROR:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
        'Image upload failed'
      );
    }
  }
};

export default uploadService;
