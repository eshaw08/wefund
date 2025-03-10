import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CampaignProvider } from './context/CampaignContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
import SignIn from './Components/SignIn/SignIn';
import SignIn2 from './Components/SignIn2/SignIn2';
import SignUp from './Components/SignUp/SignUp';
import FormPage from './Components/FormPage/FormPage';
import FormPage1 from './Components/FormPage1/FormPage1';
import FormPage2 from './Components/FormPage2/FormPage2';
import FormPage3 from './Components/FormPage3/FormPage3';
import FormPage4 from './Components/FormPage4/FormPage4';
import FormPage5 from './Components/FormPage5/FormPage5';
import MainForm from './Components/MainForm/MainForm';
import FundraiserPreview from './Components/FundraiserPreview/FundraiserPreview';
import LaunchPage from './Components/LaunchPage/LaunchPage';
import CampaignDiscovery from './Components/CampaignDiscovery/CampaignDiscovery';
import MyFundraisers from './Components/MyFundraisers/MyFundraisers';
import ManagePage from './Components/MyFundraisers/ManagePage/ManagePage';
import DonatePage from './Components/DonatePage/DonatePage';
import ThankYou from './Components/ThankYou/ThankYou';
import AllCampaigns from './Components/AllCampaigns/AllCampaigns';

// Import the new components
import AboutUs from './Components/AboutUs/AboutUs';
import TestimonialSlider from './Components/TestimonialSlider/TestimonialSlider';
import ContactUs from './Components/ContactUs/ContactUs';
import Footer from './Components/Footer/Footer';

const App = () => {
  const [formData, setFormData] = useState({
    photo: null,
    title: '',
    goal: '',
    category: '',
    location: '',
    story: '',
    organizer: 'Esha Worlikar',
  });

  return (
    <AuthProvider>
      <CampaignProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Hero />
                  <div id="campaigns-section">
                    <CampaignDiscovery />
                  </div>
                  {/* Add the new components below CampaignDiscovery */}
                  <AboutUs />
                  <TestimonialSlider />
                  <ContactUs />
                  <Footer />
                </>
              }
            />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signin2" element={<SignIn2 />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Form Steps */}
            <Route path="/form" element={<FormPage formData={formData} setFormData={setFormData} />} />
            <Route path="/form1" element={<FormPage1 formData={formData} setFormData={setFormData} />} />
            <Route path="/form2" element={<FormPage2 formData={formData} setFormData={setFormData} />} />
            <Route path="/form3" element={<FormPage3 formData={formData} setFormData={setFormData} />} />
            <Route path="/form4" element={<FormPage4 formData={formData} setFormData={setFormData} />} />
            <Route path="/form5" element={<FormPage5 formData={formData} setFormData={setFormData} />} />

            {/* Review & Preview */}
            <Route path="/review" element={<MainForm />} />
            <Route
              path="/preview"
              element={
                <FundraiserPreview
                  onClose={() => navigate('/')}
                  campaignData={formData}
                  isStandalone={true}
                />
              }
            />
            <Route path="/donate" element={<DonatePage />} />

            <Route path="/launch" element={<LaunchPage />} />

            <Route path="/your-campaigns" element={<MyFundraisers />} />
            <Route path="/manage/:campaignId" element={<ManagePage />} />

            {/* Thank You Page */}
            <Route path="/thank-you" element={<ThankYou />} />

            {/* All Campaigns Page */}
            <Route path="/all-campaigns" element={<AllCampaigns />} />

            {/* Redirect all unknown routes to Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </CampaignProvider>
    </AuthProvider>
  );
};

export default App;