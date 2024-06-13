import React, { useState, useEffect, useLayoutEffect } from 'react'
import { RouterProvider } from 'react-router-dom';
import { GlobalStateProvider } from './data/GlobalStateContext.tsx';
import router from './router';
import "./app.css"
// import VideoChat from './page/commpont/VideoChat/VideoChat.jsx';
// import ReactDOM from 'react-dom';

function App() {
  // 如果账户已连接，显示应用功能
  return (
    <GlobalStateProvider>
      <div className="App" >
        <RouterProvider router={router} />
      </div>
    </GlobalStateProvider>

  );
}

export default App

