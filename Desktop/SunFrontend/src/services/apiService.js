import axios from 'axios';

export const apiService = {
  async getCancerData1() {
    try {
      const response = await axios.get('https://l5dj349pzf.execute-api.us-east-1.amazonaws.com/readcancerdata');
      return response.data;
    } catch (error) {
      console.error('Error fetching first cancer data:', error);
      throw error;
    }
  },

  async getCancerData2() {
    try {
      const response = await axios.get('https://l5dj349pzf.execute-api.us-east-1.amazonaws.com/readcancerdata2');
      return response.data;
    } catch (error) {
      console.error('Error fetching second cancer data:', error);
      throw error;
    }
  }
};