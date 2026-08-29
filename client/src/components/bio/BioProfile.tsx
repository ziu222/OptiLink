import React from 'react';
import type { IBioPage } from '../../types/bio';
import './bio.css';

interface BioProfileProps {
  bioData: IBioPage;
}

export const BioProfile: React.FC<BioProfileProps> = ({ bioData }) => {
  return (
    <div className="bio-profile">
      <div className="avatar-wrapper">
        <img 
          src={bioData.avatarUrl || 'https://via.placeholder.com/150'} 
          alt={bioData.username} 
          className="avatar" 
        />
        {bioData.themeConfig.profile.avatarDecorationUrl && (
          <img 
            src={bioData.themeConfig.profile.avatarDecorationUrl} 
            alt="decoration" 
            className="avatar-decoration" 
          />
        )}
      </div>
      <h1 className="bio-title">{bioData.title || `@${bioData.username}`}</h1>
      {bioData.title && <p className="bio-username">@{bioData.username}</p>}
      {bioData.bio && <p className="bio-description">{bioData.bio}</p>}
      
      <div className="social-links">
        {bioData.socialLinks?.facebook && <a href={bioData.socialLinks.facebook} target="_blank" rel="noreferrer"><i className="icon-facebook" /> FB</a>}
        {bioData.socialLinks?.instagram && <a href={bioData.socialLinks.instagram} target="_blank" rel="noreferrer"><i className="icon-instagram" /> IG</a>}
        {bioData.socialLinks?.tiktok && <a href={bioData.socialLinks.tiktok} target="_blank" rel="noreferrer"><i className="icon-tiktok" /> TT</a>}
        {/* We can use lucide-react icons here instead later */}
      </div>
    </div>
  );
};
