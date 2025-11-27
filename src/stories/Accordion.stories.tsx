import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import * as React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';
import {
  LitAccordion,
  LitAccordionItem,
  LitAccordionTrigger,
  LitAccordionContent,
} from '../components-lit/wrappers/Accordion';
import { ParityComparison } from './components/ParityComparison';
import { waitForLitElements } from "./utils/storybook-helpers";

const meta = {
  title: 'Parity/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default accordion with multiple items
 */
export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Accordion"
      reactComponent={
        <Accordion type="single" collapsible style={{ width: '400px' }}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that matches the other components aesthetic.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
              Yes. It's animated by default, but you can disable it if you prefer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      }
      litComponent={
        <LitAccordion type="single" style={{ width: '400px' }}>
          <LitAccordionItem value="item-1">
            <LitAccordionTrigger>Is it accessible?</LitAccordionTrigger>
            <LitAccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </LitAccordionContent>
          </LitAccordionItem>
          <LitAccordionItem value="item-2">
            <LitAccordionTrigger>Is it styled?</LitAccordionTrigger>
            <LitAccordionContent>
              Yes. It comes with default styles that matches the other components aesthetic.
            </LitAccordionContent>
          </LitAccordionItem>
          <LitAccordionItem value="item-3">
            <LitAccordionTrigger>Is it animated?</LitAccordionTrigger>
            <LitAccordionContent>
              Yes. It's animated by default, but you can disable it if you prefer.
            </LitAccordionContent>
          </LitAccordionItem>
        </LitAccordion>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForLitElements(canvasElement);
    const canvas = within(canvasElement);

    // Find all accordion triggers
    const triggers = canvas.getAllByRole('button');
    expect(triggers.length).toBeGreaterThanOrEqual(3);

    // Click the first trigger to expand
    await userEvent.click(triggers[0]);
  },
};

/**
 * Single item accordion
 */
export const SingleItem: Story = {
  render: () => (
    <ParityComparison
      componentName="Accordion (single)"
      reactComponent={
        <Accordion type="single" collapsible style={{ width: '400px' }}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Can I use this in my project?</AccordionTrigger>
            <AccordionContent>
              Yes. Free to use for personal and commercial projects. No attribution required.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      }
      litComponent={
        <LitAccordion type="single" style={{ width: '400px' }}>
          <LitAccordionItem value="item-1">
            <LitAccordionTrigger>Can I use this in my project?</LitAccordionTrigger>
            <LitAccordionContent>
              Yes. Free to use for personal and commercial projects. No attribution required.
            </LitAccordionContent>
          </LitAccordionItem>
        </LitAccordion>
      }
    />
  ),
};
