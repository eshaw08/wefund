import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './FormPage3.css';
import icon from '../../assets/icon.png';

const FormPage3 = () => {
  const [imageData, setImageData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadExistingImage = async () => {
      const campaignId = localStorage.getItem('campaignId');
      if (!campaignId) return;

      try {
        const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
        if (campaignDoc.exists() && campaignDoc.data().coverPhoto) {
          setPreviewUrl(campaignDoc.data().coverPhoto);
          setImageData(campaignDoc.data().coverPhoto);
        }
      } catch (error) {
        console.error('Error loading existing image:', error);
      }
    };

    loadExistingImage();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file.');
      }

      if (file.size > 2 * 1024 * 1024) { // Reduced to 2MB due to Firestore limitations
        throw new Error('File size should be less than 2MB.');
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewUrl(base64String);
        setImageData(base64String);
        setIsProcessing(false);
      };

      reader.onerror = () => {
        setErrorMessage('Failed to read file. Please try again.');
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setErrorMessage(error.message || 'Failed to process image. Please try again.');
      setPreviewUrl(null);
      setImageData(null);
      setIsProcessing(false);
    }
  };

  const handleContinue = async () => {
    if (isProcessing) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('You must be logged in to create a campaign.');
      }

      const campaignId = localStorage.getItem('campaignId');
      if (!campaignId) {
        throw new Error('Campaign not found.');
      }

      const campaignRef = doc(db, 'campaigns', campaignId);
      const campaignDoc = await getDoc(campaignRef);

      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found.');
      }

      setIsProcessing(true);

      await updateDoc(campaignRef, {
        coverPhoto: imageData,
        updatedAt: new Date().toISOString(),
        userId: userId // Ensure userId is set for security rules
      });

      navigate('/form4');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='form-page'>
      <div className='left-section'>
        <div className='text-content'>
          <img src={icon} alt='WeFund Logo' className='form-logo' />
          <h1>Add a cover photo or video</h1>
          <p>Using a bright and clear photo helps people connect to your fundraiser right away.</p>
        </div>
      </div>
      <div className='right-section'>
        <div className='upload-box'>
          <input 
            type='file' 
            accept='image/*' 
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt='Preview' 
              className='preview-image'
            />
          )}
          {errorMessage && (
            <div className='error-message'>
              {errorMessage}
            </div>
          )}
        </div>
        <button 
          className='continue-button' 
          onClick={handleContinue} 
          disabled={isProcessing || (!imageData && !previewUrl)}
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default FormPage3;