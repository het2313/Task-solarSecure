export const API_URL = 'http://54.79.244.220:8080/solar-crm/lead/save';
export const HEADERS = {
  'Content-Type': 'application/json',
  'X-USERNAME': 'Website_Lead',
  'X-PASSWORD': 'Meg@830r'
};

export const submitForm = async (data: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
  