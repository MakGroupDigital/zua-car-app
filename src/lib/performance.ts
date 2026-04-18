// Performance utilities for Nzila

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);

    // Preload critical images
    const logoImg = new Image();
    logoImg.src = '/Nzilalogo.png';
  }
};

// Lazy load non-critical resources
export const lazyLoadResources = () => {
  if (typeof window !== 'undefined') {
    // Lazy load Firebase SDK
    import('firebase/app').then(() => {
      console.log('Firebase SDK loaded');
    });
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Web Vitals reporting
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log('Web Vital:', metric);
  }
};