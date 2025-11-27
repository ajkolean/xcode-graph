// Explicitly import all Lit components to trigger their side-effects (customElements.define)
import './accordion';
import './alert';
import './aspect-ratio';
import './avatar';
import './badge';
import './breadcrumb';
import './button';
import './card';
import './checkbox';
import './collapsible';
import './input';
import './label';
import './progress';
import './radio-group';
import './separator';
import './skeleton';
import './slider';
import './switch';
import './tabs';
import './textarea';
import './toggle';
import './tooltip';

export function registerLitComponents() {
  // This function exists solely to force the bundler to include this file
  // and execute the side-effect imports above.
  console.log('Lit components registered');
}
