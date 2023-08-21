import React from 'react';
import { useParams } from 'react-router-dom';

function StationPage() {
  const { id } = useParams();

  // Fetch the detailed station info using the 'id' parameter and display it

  return (
    <div>
      {/* Display detailed station info */}
      {/* You can fetch the necessary data using the 'id' parameter */}
    </div>
  );
}

export default StationPage;
