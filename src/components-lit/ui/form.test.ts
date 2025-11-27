import { describe, it, expect, afterEach } from 'vitest';
import {
  GraphFormItem,
  GraphFormLabel,
  GraphFormControl,
  GraphFormDescription,
  GraphFormMessage,
} from './form';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphFormItem', () => {
  let item: GraphFormItem;

  afterEach(() => {
    item?.remove();
  });

  it('should render form item', async () => {
    item = new GraphFormItem();
    document.body.appendChild(item);
    await item.updateComplete;

    const slot = shadowQuery(item, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should render children content', async () => {
    item = new GraphFormItem();
    const label = document.createElement('div');
    label.textContent = 'Form field';
    item.appendChild(label);

    document.body.appendChild(item);
    await item.updateComplete;

    expect(item.children.length).toBe(1);
  });
});

describe('GraphFormLabel', () => {
  let label: GraphFormLabel;

  afterEach(() => {
    label?.remove();
  });

  it('should render with default state', async () => {
    label = new GraphFormLabel();
    label.textContent = 'Username';
    document.body.appendChild(label);
    await label.updateComplete;

    expect(label.error).toBe(false);
    const labelEl = shadowQuery(label, 'label');
    expect(labelEl).toBeTruthy();
  });

  it('should render with error state', async () => {
    label = new GraphFormLabel();
    label.error = true;
    label.textContent = 'Username';
    document.body.appendChild(label);
    await label.updateComplete;

    expect(label.error).toBe(true);
    expect(label.hasAttribute('error')).toBe(true);
  });

  it('should set for attribute', async () => {
    label = new GraphFormLabel();
    label.for = 'username-input';
    label.textContent = 'Username';
    document.body.appendChild(label);
    await label.updateComplete;

    const labelEl = shadowQuery(label, 'label') as HTMLLabelElement;
    expect(labelEl.htmlFor).toBe('username-input');
  });

  it('should toggle error state', async () => {
    label = new GraphFormLabel();
    document.body.appendChild(label);
    await label.updateComplete;

    expect(label.error).toBe(false);

    label.error = true;
    await label.updateComplete;

    expect(label.error).toBe(true);
    expect(label.hasAttribute('error')).toBe(true);
  });
});

describe('GraphFormControl', () => {
  let control: GraphFormControl;

  afterEach(() => {
    control?.remove();
  });

  it('should render form control', async () => {
    control = new GraphFormControl();
    document.body.appendChild(control);
    await control.updateComplete;

    const slot = shadowQuery(control, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should render with invalid state', async () => {
    control = new GraphFormControl();
    control.invalid = true;
    document.body.appendChild(control);
    await control.updateComplete;

    expect(control.invalid).toBe(true);
    expect(control.hasAttribute('invalid')).toBe(true);
  });

  it('should set describedby attribute', async () => {
    control = new GraphFormControl();
    control.describedby = 'field-description';
    document.body.appendChild(control);
    await control.updateComplete;

    expect(control.describedby).toBe('field-description');
  });

  it('should render slotted input element', async () => {
    control = new GraphFormControl();
    const input = document.createElement('input');
    input.type = 'text';
    control.appendChild(input);

    document.body.appendChild(control);
    await control.updateComplete;

    expect(control.children.length).toBe(1);
    expect(control.children[0]).toBe(input);
  });
});

describe('GraphFormDescription', () => {
  let description: GraphFormDescription;

  afterEach(() => {
    description?.remove();
  });

  it('should render description', async () => {
    description = new GraphFormDescription();
    description.textContent = 'Enter your username';
    document.body.appendChild(description);
    await description.updateComplete;

    const slot = shadowQuery(description, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should display description text', async () => {
    description = new GraphFormDescription();
    const text = document.createTextNode('This is a helper text');
    description.appendChild(text);

    document.body.appendChild(description);
    await description.updateComplete;

    expect(description.textContent).toBe('This is a helper text');
  });
});

describe('GraphFormMessage', () => {
  let message: GraphFormMessage;

  afterEach(() => {
    message?.remove();
  });

  it('should render message', async () => {
    message = new GraphFormMessage();
    message.textContent = 'This field is required';
    document.body.appendChild(message);
    await message.updateComplete;

    const slot = shadowQuery(message, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should display error message', async () => {
    message = new GraphFormMessage();
    const text = document.createTextNode('Invalid email address');
    message.appendChild(text);

    document.body.appendChild(message);
    await message.updateComplete;

    expect(message.textContent).toBe('Invalid email address');
  });

  it('should be hidden when empty', async () => {
    message = new GraphFormMessage();
    document.body.appendChild(message);
    await message.updateComplete;

    // Component should be empty
    expect(message.textContent).toBe('');
  });
});

describe('Form Components - Integration', () => {
  let item: GraphFormItem;
  let label: GraphFormLabel;
  let control: GraphFormControl;
  let description: GraphFormDescription;
  let message: GraphFormMessage;

  afterEach(() => {
    item?.remove();
  });

  it('should work together as a complete form field', async () => {
    item = new GraphFormItem();
    label = new GraphFormLabel();
    label.textContent = 'Email';
    label.for = 'email';

    control = new GraphFormControl();
    const input = document.createElement('input');
    input.id = 'email';
    input.type = 'email';
    control.appendChild(input);

    description = new GraphFormDescription();
    description.textContent = 'Enter your email address';

    message = new GraphFormMessage();

    item.appendChild(label);
    item.appendChild(control);
    item.appendChild(description);
    item.appendChild(message);

    document.body.appendChild(item);

    await item.updateComplete;
    await label.updateComplete;
    await control.updateComplete;
    await description.updateComplete;
    await message.updateComplete;

    expect(item.children.length).toBe(4);
  });

  it('should display error state', async () => {
    item = new GraphFormItem();
    label = new GraphFormLabel();
    label.error = true;
    label.textContent = 'Email';

    control = new GraphFormControl();
    control.invalid = true;

    message = new GraphFormMessage();
    message.textContent = 'Email is required';

    item.appendChild(label);
    item.appendChild(control);
    item.appendChild(message);

    document.body.appendChild(item);

    await item.updateComplete;
    await label.updateComplete;
    await control.updateComplete;
    await message.updateComplete;

    expect(label.error).toBe(true);
    expect(control.invalid).toBe(true);
    expect(message.textContent).toBe('Email is required');
  });
});
