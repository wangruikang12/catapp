import { createBrowserRouter } from 'react-router-dom';
import LongPage from '../page/loning';
import HomePage from '../page/home';
// 假设你有一个函数可以根据用户权限生成路由配置
function generateRoutes() {
  // 根据用户权限或其他条件生成路由配置
  const routes = [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/loning',
      element: <LongPage />,
    },
    // 更多路由配置...
    //errorElement
    {
      path: '*',
      element: <div>404 Not Found</div>,
    },
  ];
  return routes;
}

// 使用 createBrowserRouter 创建路由器
const router = createBrowserRouter(generateRoutes());



export default router;
