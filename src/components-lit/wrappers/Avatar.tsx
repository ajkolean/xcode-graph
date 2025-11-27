import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphAvatar } from '../ui/avatar';
import '../ui/avatar';

const LitAvatarElement = createComponent({
  tagName: 'graph-avatar',
  elementClass: GraphAvatar,
  react: React,
});

export interface LitAvatarProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'default' | 'lg' | 'xl';
}

export function LitAvatar({ size = 'default', children, ...props }: LitAvatarProps) {
  return (
    <LitAvatarElement size={size} {...props}>
      {children}
    </LitAvatarElement>
  );
}

export interface LitAvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function LitAvatarImage({ src, alt, ...props }: LitAvatarImageProps) {
  const [imageError, setImageError] = React.useState(false);

  const handleError = () => {
    setImageError(true);
  };

  if (imageError) {
    return null;
  }

  return (
    <img
      slot="image"
      data-slot="avatar-image"
      src={src}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}

export interface LitAvatarFallbackProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAvatarFallback({ children, ...props }: LitAvatarFallbackProps) {
  return (
    <div slot="fallback" data-slot="avatar-fallback" {...props}>
      {children}
    </div>
  );
}
