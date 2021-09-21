import { useEffect } from 'react';

export default function useOnKeyDown(key, callback, deps) {
  useEffect(() => {
    const handleKeydown = (ev) => {
      if (ev.code === key) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, deps); // eslint-disable-line
}
