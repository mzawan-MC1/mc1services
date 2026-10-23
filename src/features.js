import { domAnimation } from 'framer-motion';

// Loaded on demand by LazyMotion (see main.jsx) so framer-motion's animation
// features stay out of the first-paint bundle. domAnimation covers every
// feature this site uses: animate, inView, exit, hover/tap gestures, scroll.
export default domAnimation;
