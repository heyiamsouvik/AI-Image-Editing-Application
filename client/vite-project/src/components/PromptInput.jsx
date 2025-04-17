import React from 'react';

function PromptInput({ prompt, onPromptChange, onSubmit, isDisabled }) {
  const handleChange = (e) => {
    onPromptChange(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="prompt-container">
      <form onSubmit={handleSubmit}>
        <textarea
          className="prompt-input"
          value={prompt}
          onChange={handleChange}
          placeholder="Describe how you want to edit the image (e.g., 'Make the background a beach scene', 'Add a hat to the person', etc.)"
          rows={4}
        />
        <button 
          type="submit" 
          className="generate-button" 
          disabled={isDisabled}
        >
          Generate Edited Image
        </button>
      </form>
    </div>
  );
}

export default PromptInput;