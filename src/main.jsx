import ReactDOM from 'react-dom/client'
import { LazyMotion } from 'framer-motion'
import App from '@/App.jsx'
import '@/index.css'
import './i18n';

// Load framer-motion's animation features lazily (domAnimation covers every
// feature this site uses — animate/inView/exit/gestures; the app uses no
// drag or layout animations). The motion features no longer block first paint.
const loadFeatures = () => import('./features').then((res) => res.default);

ReactDOM.createRoot(document.getElementById('root')).render(
    <LazyMotion features={loadFeatures}>
        <App />
    </LazyMotion>
)
