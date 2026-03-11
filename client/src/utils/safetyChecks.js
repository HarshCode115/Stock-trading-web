// Safety utilities to prevent runtime errors

export const safeDestructure = (obj, defaultValue = {}) => {
  return obj || defaultValue;
};

export const safeArrayAccess = (arr, index = 0) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [];
  }
  return arr[index] !== undefined ? arr : [];
};

export const safePropertyAccess = (obj, property, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  return obj[property] !== undefined ? obj[property] : defaultValue;
};

export const safeApiResponse = (response) => {
  if (!response) {
    console.error('Invalid API response: response is null or undefined');
    return null;
  }
  if (!response.data) {
    console.error('Invalid API response: response.data is missing');
    return null;
  }
  return response.data;
};

export const safeAsyncCall = async (asyncFn, errorMessage = 'Async operation failed') => {
  try {
    const result = await asyncFn();
    return result;
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
};
