import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphInputOTP,
  GraphInputOTPGroup,
  GraphInputOTPSlot,
  GraphInputOTPSeparator,
} from './input-otp';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphInputOTP', () => {
  let inputOTP: GraphInputOTP;

  afterEach(() => {
    inputOTP?.remove();
  });

  it('should render with default maxLength of 6', async () => {
    inputOTP = new GraphInputOTP();
    document.body.appendChild(inputOTP);
    await inputOTP.updateComplete;

    expect(inputOTP.maxLength).toBe(6);
    expect(inputOTP.value).toBe('');
  });

  it('should set value', async () => {
    inputOTP = new GraphInputOTP();
    document.body.appendChild(inputOTP);
    await inputOTP.updateComplete;

    inputOTP.setValue('123456');
    await inputOTP.updateComplete;

    expect(inputOTP.value).toBe('123456');
  });

  it('should limit value to maxLength', async () => {
    inputOTP = new GraphInputOTP();
    inputOTP.maxLength = 4;
    document.body.appendChild(inputOTP);
    await inputOTP.updateComplete;

    inputOTP.setValue('123456789');
    await inputOTP.updateComplete;

    expect(inputOTP.value).toBe('1234');
  });

  it('should dispatch input-otp-change event', async () => {
    inputOTP = new GraphInputOTP();
    document.body.appendChild(inputOTP);
    await inputOTP.updateComplete;

    const handleChange = vi.fn();
    inputOTP.addEventListener('input-otp-change', handleChange);

    inputOTP.setValue('123');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle disabled state', async () => {
    inputOTP = new GraphInputOTP();
    inputOTP.disabled = true;
    document.body.appendChild(inputOTP);
    await inputOTP.updateComplete;

    expect(inputOTP.disabled).toBe(true);
    expect(inputOTP.hasAttribute('disabled')).toBe(true);
  });

  it('should support custom maxLength', async () => {
    inputOTP = new GraphInputOTP();
    inputOTP.maxLength = 4;
    document.body.appendChild(inputOTP);
    await inputOTP.updateComplete;

    expect(inputOTP.maxLength).toBe(4);
  });
});

describe('GraphInputOTPGroup', () => {
  let group: GraphInputOTPGroup;

  afterEach(() => {
    group?.remove();
  });

  it('should render group', async () => {
    group = new GraphInputOTPGroup();
    document.body.appendChild(group);
    await group.updateComplete;

    const slot = shadowQuery(group, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphInputOTPSlot', () => {
  let slot: GraphInputOTPSlot;

  afterEach(() => {
    slot?.remove();
  });

  it('should render with index', async () => {
    slot = new GraphInputOTPSlot();
    slot.index = 0;
    document.body.appendChild(slot);
    await slot.updateComplete;

    expect(slot.index).toBe(0);
    expect(slot.active).toBe(false);
    expect(slot.char).toBe('');
  });

  it('should render character', async () => {
    slot = new GraphInputOTPSlot();
    slot.index = 0;
    slot.char = '5';
    document.body.appendChild(slot);
    await slot.updateComplete;

    const span = shadowQuery(slot, 'span');
    expect(span?.textContent).toBe('5');
  });

  it('should show caret when active and no char', async () => {
    slot = new GraphInputOTPSlot();
    slot.index = 0;
    slot.active = true;
    document.body.appendChild(slot);
    await slot.updateComplete;

    const caret = shadowQuery(slot, '.caret');
    expect(caret).toBeTruthy();
  });

  it('should not show caret when has char', async () => {
    slot = new GraphInputOTPSlot();
    slot.index = 0;
    slot.active = true;
    slot.char = '3';
    document.body.appendChild(slot);
    await slot.updateComplete;

    const caret = shadowQuery(slot, '.caret');
    expect(caret).toBeFalsy();
  });

  it('should handle invalid state', async () => {
    slot = new GraphInputOTPSlot();
    slot.index = 0;
    slot.invalid = true;
    document.body.appendChild(slot);
    await slot.updateComplete;

    expect(slot.invalid).toBe(true);
    expect(slot.hasAttribute('invalid')).toBe(true);
  });

  it('should handle active state', async () => {
    slot = new GraphInputOTPSlot();
    slot.index = 0;
    slot.active = true;
    document.body.appendChild(slot);
    await slot.updateComplete;

    expect(slot.active).toBe(true);
    expect(slot.hasAttribute('active')).toBe(true);
  });
});

describe('GraphInputOTPSeparator', () => {
  let separator: GraphInputOTPSeparator;

  afterEach(() => {
    separator?.remove();
  });

  it('should render separator with icon', async () => {
    separator = new GraphInputOTPSeparator();
    document.body.appendChild(separator);
    await separator.updateComplete;

    const svg = shadowQuery(separator, 'svg');
    expect(svg).toBeTruthy();
  });
});

describe('GraphInputOTP - Integration', () => {
  let inputOTP: GraphInputOTP;
  let group1: GraphInputOTPGroup;
  let group2: GraphInputOTPGroup;
  let separator: GraphInputOTPSeparator;
  let slots: GraphInputOTPSlot[];

  afterEach(() => {
    inputOTP?.remove();
  });

  it('should work as a complete OTP input', async () => {
    inputOTP = new GraphInputOTP();
    inputOTP.maxLength = 6;

    group1 = new GraphInputOTPGroup();
    group2 = new GraphInputOTPGroup();
    separator = new GraphInputOTPSeparator();

    slots = [];
    for (let i = 0; i < 6; i++) {
      const slot = new GraphInputOTPSlot();
      slot.index = i;
      slots.push(slot);

      if (i < 3) {
        group1.appendChild(slot);
      } else {
        group2.appendChild(slot);
      }
    }

    inputOTP.appendChild(group1);
    inputOTP.appendChild(separator);
    inputOTP.appendChild(group2);

    document.body.appendChild(inputOTP);

    await inputOTP.updateComplete;
    await group1.updateComplete;
    await group2.updateComplete;
    await Promise.all(slots.map((s) => s.updateComplete));

    expect(inputOTP.maxLength).toBe(6);
    expect(slots.length).toBe(6);

    // Set value
    inputOTP.setValue('123456');
    await inputOTP.updateComplete;

    expect(inputOTP.value).toBe('123456');
  });

  it('should handle partial value', async () => {
    inputOTP = new GraphInputOTP();
    inputOTP.maxLength = 6;

    group1 = new GraphInputOTPGroup();

    slots = [];
    for (let i = 0; i < 6; i++) {
      const slot = new GraphInputOTPSlot();
      slot.index = i;
      slots.push(slot);
      group1.appendChild(slot);
    }

    inputOTP.appendChild(group1);
    document.body.appendChild(inputOTP);

    await inputOTP.updateComplete;

    inputOTP.setValue('123');
    await inputOTP.updateComplete;

    expect(inputOTP.value).toBe('123');
  });
});
