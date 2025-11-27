import { describe, it, expect, afterEach } from 'vitest';
import { GraphAvatar } from './avatar';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphAvatar', () => {
  let avatar: GraphAvatar;

  afterEach(() => {
    avatar?.remove();
  });

  it('should render with default size', async () => {
    avatar = new GraphAvatar();
    document.body.appendChild(avatar);
    await avatar.updateComplete;

    expect(avatar.size).toBe('default');
    expect(avatar.getAttribute('size')).toBe('default');
  });

  it('should render with small size', async () => {
    avatar = new GraphAvatar();
    avatar.size = 'sm';
    document.body.appendChild(avatar);
    await avatar.updateComplete;

    expect(avatar.size).toBe('sm');
    expect(avatar.getAttribute('size')).toBe('sm');
  });

  it('should render with large size', async () => {
    avatar = new GraphAvatar();
    avatar.size = 'lg';
    document.body.appendChild(avatar);
    await avatar.updateComplete;

    expect(avatar.size).toBe('lg');
    expect(avatar.getAttribute('size')).toBe('lg');
  });

  it('should render with extra large size', async () => {
    avatar = new GraphAvatar();
    avatar.size = 'xl';
    document.body.appendChild(avatar);
    await avatar.updateComplete;

    expect(avatar.size).toBe('xl');
    expect(avatar.getAttribute('size')).toBe('xl');
  });

  it('should render image slot', async () => {
    avatar = new GraphAvatar();

    const img = document.createElement('img');
    img.setAttribute('slot', 'image');
    img.src = 'test.jpg';
    avatar.appendChild(img);

    document.body.appendChild(avatar);
    await avatar.updateComplete;

    const imageSlot = shadowQuery(avatar, 'slot[name="image"]');
    expect(imageSlot).toBeTruthy();
  });

  it('should render fallback slot', async () => {
    avatar = new GraphAvatar();

    const fallback = document.createElement('div');
    fallback.setAttribute('slot', 'fallback');
    fallback.textContent = 'AB';
    avatar.appendChild(fallback);

    document.body.appendChild(avatar);
    await avatar.updateComplete;

    const fallbackSlot = shadowQuery(avatar, 'slot[name="fallback"]');
    expect(fallbackSlot).toBeTruthy();
  });

  it('should render both image and fallback slots', async () => {
    avatar = new GraphAvatar();

    const img = document.createElement('img');
    img.setAttribute('slot', 'image');
    img.src = 'test.jpg';
    avatar.appendChild(img);

    const fallback = document.createElement('div');
    fallback.setAttribute('slot', 'fallback');
    fallback.textContent = 'AB';
    avatar.appendChild(fallback);

    document.body.appendChild(avatar);
    await avatar.updateComplete;

    const imageSlot = shadowQuery(avatar, 'slot[name="image"]');
    const fallbackSlot = shadowQuery(avatar, 'slot[name="fallback"]');

    expect(imageSlot).toBeTruthy();
    expect(fallbackSlot).toBeTruthy();
  });

  it('should update size dynamically', async () => {
    avatar = new GraphAvatar();
    avatar.size = 'default';
    document.body.appendChild(avatar);
    await avatar.updateComplete;

    expect(avatar.size).toBe('default');

    avatar.size = 'lg';
    await avatar.updateComplete;

    expect(avatar.size).toBe('lg');
    expect(avatar.getAttribute('size')).toBe('lg');
  });

  it('should have correct slot structure', async () => {
    avatar = new GraphAvatar();
    document.body.appendChild(avatar);
    await avatar.updateComplete;

    const imageSlot = shadowQuery(avatar, 'slot[name="image"]');
    const fallbackSlot = shadowQuery(avatar, 'slot[name="fallback"]');
    const defaultSlot = shadowQuery(avatar, 'slot:not([name])');

    expect(imageSlot).toBeTruthy();
    expect(fallbackSlot).toBeTruthy();
    expect(defaultSlot).toBeTruthy();
  });
});
