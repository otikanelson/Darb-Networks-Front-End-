const IMGBB_API_KEY = 'YOUR_FREE_IMGBB_API_KEY';

export const uploadImageToImgBB = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('key', IMGBB_API_KEY);
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return {
        url: result.data.url,
        display_url: result.data.display_url,
        thumbnail: result.data.thumb.url,
        delete_url: result.data.delete_url
      };
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};