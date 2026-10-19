import ReactDOM from 'react-dom/client';

import App from './App';

// 다크 테마 기준
document.documentElement.classList.add('dark');

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
