import ReactDOM from 'react-dom/client'
import { LazyMotion, domAnimation } from 'framer-motion'
import App from '@/App.jsx'
import '@/index.css'
import './i18n';

// Load framer-motion's animation features lazily (domAnimation covers every
// feature this site uses — animate/inView/exit/gestures; the app uses no
// drag or layout animations). The motion runtime no longer blocks first paint.
ReactDOM.createRoot(document.getElementById('root')).render(
    <LazyMotion features={domAnimation}>
        <App />
    </LazyMotion>
)
