// src/directives/keyboardNavigation.js

export const vKeyboardNavigation = {
    mounted(el, binding) {
      const options = binding.value || {};
      const defaultSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const selector = options.selector || defaultSelector;
  
      el.handleKeyDown = (event) => {
        const focusableElements = Array.from(el.querySelectorAll(selector));
        let currentIndex = focusableElements.indexOf(document.activeElement);
  
        switch (event.key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            event.preventDefault();
            currentIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
          case 'ArrowDown':
          case 'ArrowRight':
            event.preventDefault();
            currentIndex = (currentIndex + 1) % focusableElements.length;
            break;
          case 'Enter':
            if (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'A') {
              document.activeElement.click();
            }
            return;
          case 'Tab':
            // 允许默认的Tab行为
            return;
        }
  
        focusableElements[currentIndex].focus();
      };
  
      el.addEventListener('keydown', el.handleKeyDown);
    },
    unmounted(el) {
      el.removeEventListener('keydown', el.handleKeyDown);
    }
  };