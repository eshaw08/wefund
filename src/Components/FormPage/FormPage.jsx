import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import './FormPage.css';
import icon from '../../assets/icon.png';

const FormPage = () => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    country: 'United States',
    zipCode: '',
    fundraisingReason: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? null : tag);
    setFormData({ ...formData, fundraisingReason: tag });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.country || !formData.zipCode || !formData.fundraisingReason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError('You must be logged in to create a campaign.');
        return;
      }

      // Get the logged-in user's display name
      const user = auth.currentUser;
      const creatorName = user.displayName || 'Anonymous Organizer';

      // Add the form data to Firestore
      const docRef = await addDoc(collection(db, "campaigns"), {
        ...formData,
        userId: userId,
        creatorName: creatorName, // Add creatorName
        createdAt: new Date(),
        status: 'draft'
      });
      
      // Save the campaign ID to localStorage
      localStorage.setItem('campaignId', docRef.id);
      
      console.log("Campaign saved with ID: ", docRef.id);
      navigate('/form1');
    } catch (error) {
      console.error('Error saving campaign: ', error);
      setError('There was an error creating your campaign. Please try again.');
    }
  };

  return (
    <div className="form-page">
      <div className="left-section">
        <img src={icon} alt="WeFund Logo" className="form-logo" />
        <div className="text-content">
          <h1>Let's begin your fundraising journey</h1>
          <p>We're here to guide you every step of the way.</p>
        </div>
      </div>
      <div className="right-section">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Where will the funds go?</label>
            <select 
              name="country" 
              onChange={handleInputChange}
              value={formData.country}
              required
            >
              <option value="United States">United States</option>
              <option value="India">India</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              name="zipCode"
              placeholder="Zip code"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>What best describes why you're fundraising?</label>
            <div className="tags">
              {['Animals', 'Business', 'Community', 'Competitions', 'Creative', 'Education', 'Emergencies', 'Environment', 'Events', 'Faith', 'Family', 'Funerals & Memorials', 'Medical', 'Monthly Bills', 'Newlyweds', 'Sports', 'Travel', 'Ukraine Relief', 'Volunteer', 'Wishes', 'Other'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag ${selectedTag === tag ? 'selected' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="form-submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPage;