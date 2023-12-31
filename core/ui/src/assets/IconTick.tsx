import React from 'react';

interface IconTickProps {
  fill?: string;
}

export const IconTick: React.FC<IconTickProps> = ({ fill = '#05944F' }) => {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 0C8.94009 0 0 8.94009 0 20C0 31.0599 8.94009 40 20 40C31.0599 40 40 31.0599 40 20C40 8.94009 31.0599 0 20 0ZM29.6774 15.8525L17.8341 27.6498C17.4654 28.0184 17.0046 28.2028 16.5438 28.2028C16.0829 28.2028 15.576 28.0184 15.2535 27.6498L9.40092 21.8433C8.66359 21.106 8.66359 19.9539 9.40092 19.2166C10.1382 18.4793 11.2903 18.4793 12.0276 19.2166L16.5438 23.7327L27.0507 13.2258C27.788 12.4885 28.9401 12.4885 29.6774 13.2258C30.3687 13.9631 30.3687 15.1613 29.6774 15.8525Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconTick;
