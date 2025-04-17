import React from 'react';

function EditedImage({ originalImage, editedImageUrl, isLoading }) {
  if (isLoading) {
    return (
      <div className="results-container loading">
        <div className="spinner"></div>
        <p>Generating your image...</p>
      </div>
    );
  }

  if (!originalImage) {
    return null;
  }

  if (originalImage && !editedImageUrl) {
    return (
      <div className="results-container">
        <div className="results-placeholder">
          <p>Your edited image will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-comparison">
        <div className="image-container">
          <h3>Original</h3>
          <img 
            src={URL.createObjectURL(originalImage)} 
            alt="Original" 
            className="result-image" 
          />
        </div>
        <div className="image-container">
          <h3>Edited</h3>
          <img 
            src={editedImageUrl} 
            alt="Edited" 
            className="result-image" 
          />
          <a 
            href={editedImageUrl} 
            download="edited-image.jpg"
            className="download-button"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

export default EditedImage;