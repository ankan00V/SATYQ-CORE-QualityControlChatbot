import React from 'react';

// Minimal compatibility shim so imports like './components/Sidebar' always resolve during build.
// This exports a lightweight placeholder Sidebar component. The real Sidebar implementation lives at ../Sidebar.tsx

export const Sidebar = (props) => React.createElement('div', Object.assign({}, props), null);
export default Sidebar;
