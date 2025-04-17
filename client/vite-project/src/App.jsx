import React, { useState } from 'react';
import Header from './components/Header';

import ImageUploader from './components/Imageuploader';
import PromptInput from './components/PromptInput';
import EditedImage from './components/EditedImage';
import './index.css';
function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (image) => {
    setUploadedImage(image);
    setEditedImageUrl(null); // Reset edited image when new image is uploaded
    setError(null);
  };

  const handlePromptChange = (newPrompt) => {
    setPrompt(newPrompt);
  };

  const handleSubmit = async () => {
    if (!uploadedImage || !prompt.trim()) {
      setError('Please upload an image and provide a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('prompt', prompt);

      const response = await fetch('http://localhost:5000/api/edit-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate edited image');
      }

      const data = await response.json();
      setEditedImageUrl(data.editedImageUrl);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="upload-section">
          <ImageUploader onImageUpload={handleImageUpload} />
          <PromptInput 
            prompt={prompt} 
            onPromptChange={handlePromptChange} 
            onSubmit={handleSubmit} 
            isDisabled={!uploadedImage || isLoading} 
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <EditedImage 
          originalImage={uploadedImage} 
          editedImageUrl={editedImageUrl} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
}

export default App;