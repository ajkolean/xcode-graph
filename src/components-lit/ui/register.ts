// Explicitly import all Lit components to trigger their side-effects (customElements.define)
import './badge';
import './skeleton';
import './separator';
import './card';
import './button';
import './input';
import './label';
import './textarea';
import './checkbox';
import './switch';
import './slider';
import './radio-group';
import './progress';
import './toggle';
import './tabs';
import './accordion';

export function registerLitComponents() {
  // This function exists solely to force the bundler to include this file
  // and execute the side-effect imports above.
  console.log('Lit components registered');
}