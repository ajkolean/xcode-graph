import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LitSelect,
  LitSelectContent,
  LitSelectGroup,
  LitSelectItem,
  LitSelectLabel,
  LitSelectSeparator,
  LitSelectTrigger,
  LitSelectValue,
} from '../components-lit/wrappers/Select';

const meta: Meta = {
  title: 'Components/Select',
  parameters: {
    chromatic: { delay: 1500 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Select"
      reactComponent={
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="grape">Grape</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectContent>
        </Select>
      }
      litComponent={
        <LitSelect>
          <LitSelectTrigger className="w-48">
            <LitSelectValue placeholder="Select a fruit" />
          </LitSelectTrigger>
          <LitSelectContent>
            <LitSelectItem value="apple">Apple</LitSelectItem>
            <LitSelectItem value="banana">Banana</LitSelectItem>
            <LitSelectItem value="orange">Orange</LitSelectItem>
            <LitSelectItem value="grape">Grape</LitSelectItem>
            <LitSelectItem value="pineapple">Pineapple</LitSelectItem>
          </LitSelectContent>
        </LitSelect>
      }
    />
  ),
};

export const WithGroups: Story = {
  render: () => (
    <ParityComparison
      componentName="Select - With Groups"
      reactComponent={
        <Select>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
              <SelectItem value="spinach">Spinach</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      }
      litComponent={
        <LitSelect>
          <LitSelectTrigger className="w-56">
            <LitSelectValue placeholder="Select an option" />
          </LitSelectTrigger>
          <LitSelectContent>
            <LitSelectGroup>
              <LitSelectLabel>Fruits</LitSelectLabel>
              <LitSelectItem value="apple">Apple</LitSelectItem>
              <LitSelectItem value="banana">Banana</LitSelectItem>
              <LitSelectItem value="orange">Orange</LitSelectItem>
            </LitSelectGroup>
            <LitSelectSeparator />
            <LitSelectGroup>
              <LitSelectLabel>Vegetables</LitSelectLabel>
              <LitSelectItem value="carrot">Carrot</LitSelectItem>
              <LitSelectItem value="broccoli">Broccoli</LitSelectItem>
              <LitSelectItem value="spinach">Spinach</LitSelectItem>
            </LitSelectGroup>
          </LitSelectContent>
        </LitSelect>
      }
    />
  ),
};

export const SmallSize: Story = {
  render: () => (
    <ParityComparison
      componentName="Select - Small Size"
      reactComponent={
        <Select>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">Extra Small</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      }
      litComponent={
        <LitSelect>
          <LitSelectTrigger size="sm" className="w-40">
            <LitSelectValue placeholder="Select" />
          </LitSelectTrigger>
          <LitSelectContent>
            <LitSelectItem value="xs">Extra Small</LitSelectItem>
            <LitSelectItem value="sm">Small</LitSelectItem>
            <LitSelectItem value="md">Medium</LitSelectItem>
            <LitSelectItem value="lg">Large</LitSelectItem>
            <LitSelectItem value="xl">Extra Large</LitSelectItem>
          </LitSelectContent>
        </LitSelect>
      }
    />
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <ParityComparison
      componentName="Select - With Disabled Items"
      reactComponent={
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Red</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="blue" disabled>
              Blue (Sold Out)
            </SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
            <SelectItem value="purple" disabled>
              Purple (Sold Out)
            </SelectItem>
          </SelectContent>
        </Select>
      }
      litComponent={
        <LitSelect>
          <LitSelectTrigger className="w-48">
            <LitSelectValue placeholder="Select a color" />
          </LitSelectTrigger>
          <LitSelectContent>
            <LitSelectItem value="red">Red</LitSelectItem>
            <LitSelectItem value="green">Green</LitSelectItem>
            <LitSelectItem value="blue" disabled>
              Blue (Sold Out)
            </LitSelectItem>
            <LitSelectItem value="yellow">Yellow</LitSelectItem>
            <LitSelectItem value="purple" disabled>
              Purple (Sold Out)
            </LitSelectItem>
          </LitSelectContent>
        </LitSelect>
      }
    />
  ),
};

export const LongList: Story = {
  render: () => (
    <ParityComparison
      componentName="Select - Long List"
      reactComponent={
        <Select>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="utc">UTC - Coordinated Universal Time</SelectItem>
            <SelectItem value="est">EST - Eastern Standard Time</SelectItem>
            <SelectItem value="cst">CST - Central Standard Time</SelectItem>
            <SelectItem value="mst">MST - Mountain Standard Time</SelectItem>
            <SelectItem value="pst">PST - Pacific Standard Time</SelectItem>
            <SelectItem value="akst">AKST - Alaska Standard Time</SelectItem>
            <SelectItem value="hst">HST - Hawaii Standard Time</SelectItem>
            <SelectItem value="gmt">GMT - Greenwich Mean Time</SelectItem>
            <SelectItem value="cet">CET - Central European Time</SelectItem>
            <SelectItem value="eet">EET - Eastern European Time</SelectItem>
            <SelectItem value="ist">IST - India Standard Time</SelectItem>
            <SelectItem value="jst">JST - Japan Standard Time</SelectItem>
          </SelectContent>
        </Select>
      }
      litComponent={
        <LitSelect>
          <LitSelectTrigger className="w-64">
            <LitSelectValue placeholder="Select a timezone" />
          </LitSelectTrigger>
          <LitSelectContent>
            <LitSelectItem value="utc">UTC - Coordinated Universal Time</LitSelectItem>
            <LitSelectItem value="est">EST - Eastern Standard Time</LitSelectItem>
            <LitSelectItem value="cst">CST - Central Standard Time</LitSelectItem>
            <LitSelectItem value="mst">MST - Mountain Standard Time</LitSelectItem>
            <LitSelectItem value="pst">PST - Pacific Standard Time</LitSelectItem>
            <LitSelectItem value="akst">AKST - Alaska Standard Time</LitSelectItem>
            <LitSelectItem value="hst">HST - Hawaii Standard Time</LitSelectItem>
            <LitSelectItem value="gmt">GMT - Greenwich Mean Time</LitSelectItem>
            <LitSelectItem value="cet">CET - Central European Time</LitSelectItem>
            <LitSelectItem value="eet">EET - Eastern European Time</LitSelectItem>
            <LitSelectItem value="ist">IST - India Standard Time</LitSelectItem>
            <LitSelectItem value="jst">JST - Japan Standard Time</LitSelectItem>
          </LitSelectContent>
        </LitSelect>
      }
    />
  ),
};
