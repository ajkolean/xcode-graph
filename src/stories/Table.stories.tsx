import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../components/ui/table';
import {
  LitTable,
  LitTableHeader,
  LitTableBody,
  LitTableFooter,
  LitTableHead,
  LitTableRow,
  LitTableCell,
  LitTableCaption,
} from '../components-lit/wrappers/Table';

const meta: Meta = {
  title: 'Components/Table',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

const invoices = [
  { invoice: 'INV001', paymentStatus: 'Paid', totalAmount: '$250.00', paymentMethod: 'Credit Card' },
  { invoice: 'INV002', paymentStatus: 'Pending', totalAmount: '$150.00', paymentMethod: 'PayPal' },
  { invoice: 'INV003', paymentStatus: 'Unpaid', totalAmount: '$350.00', paymentMethod: 'Bank Transfer' },
  { invoice: 'INV004', paymentStatus: 'Paid', totalAmount: '$450.00', paymentMethod: 'Credit Card' },
  { invoice: 'INV005', paymentStatus: 'Paid', totalAmount: '$550.00', paymentMethod: 'PayPal' },
];

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Table"
      reactComponent={
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell>{invoice.paymentStatus}</TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell className="text-right">{invoice.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
      litComponent={
        <LitTable>
          <LitTableCaption>A list of your recent invoices.</LitTableCaption>
          <LitTableHeader>
            <LitTableRow>
              <LitTableHead>Invoice</LitTableHead>
              <LitTableHead>Status</LitTableHead>
              <LitTableHead>Method</LitTableHead>
              <LitTableHead className="text-right">Amount</LitTableHead>
            </LitTableRow>
          </LitTableHeader>
          <LitTableBody>
            {invoices.map((invoice) => (
              <LitTableRow key={invoice.invoice}>
                <LitTableCell className="font-medium">{invoice.invoice}</LitTableCell>
                <LitTableCell>{invoice.paymentStatus}</LitTableCell>
                <LitTableCell>{invoice.paymentMethod}</LitTableCell>
                <LitTableCell className="text-right">{invoice.totalAmount}</LitTableCell>
              </LitTableRow>
            ))}
          </LitTableBody>
        </LitTable>
      }
    />
  ),
};

export const WithFooter: Story = {
  render: () => (
    <ParityComparison
      componentName="Table - With Footer"
      reactComponent={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Item A</TableCell>
              <TableCell>5</TableCell>
              <TableCell className="text-right">$100.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Item B</TableCell>
              <TableCell>3</TableCell>
              <TableCell className="text-right">$75.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Item C</TableCell>
              <TableCell>2</TableCell>
              <TableCell className="text-right">$50.00</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">$225.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      }
      litComponent={
        <LitTable>
          <LitTableHeader>
            <LitTableRow>
              <LitTableHead>Product</LitTableHead>
              <LitTableHead>Quantity</LitTableHead>
              <LitTableHead className="text-right">Price</LitTableHead>
            </LitTableRow>
          </LitTableHeader>
          <LitTableBody>
            <LitTableRow>
              <LitTableCell>Item A</LitTableCell>
              <LitTableCell>5</LitTableCell>
              <LitTableCell className="text-right">$100.00</LitTableCell>
            </LitTableRow>
            <LitTableRow>
              <LitTableCell>Item B</LitTableCell>
              <LitTableCell>3</LitTableCell>
              <LitTableCell className="text-right">$75.00</LitTableCell>
            </LitTableRow>
            <LitTableRow>
              <LitTableCell>Item C</LitTableCell>
              <LitTableCell>2</LitTableCell>
              <LitTableCell className="text-right">$50.00</LitTableCell>
            </LitTableRow>
          </LitTableBody>
          <LitTableFooter>
            <LitTableRow>
              <LitTableCell colSpan={2}>Total</LitTableCell>
              <LitTableCell className="text-right">$225.00</LitTableCell>
            </LitTableRow>
          </LitTableFooter>
        </LitTable>
      }
    />
  ),
};

export const Simple: Story = {
  render: () => (
    <ParityComparison
      componentName="Table - Simple"
      reactComponent={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      }
      litComponent={
        <LitTable>
          <LitTableHeader>
            <LitTableRow>
              <LitTableHead>Name</LitTableHead>
              <LitTableHead>Email</LitTableHead>
              <LitTableHead>Role</LitTableHead>
            </LitTableRow>
          </LitTableHeader>
          <LitTableBody>
            <LitTableRow>
              <LitTableCell>John Doe</LitTableCell>
              <LitTableCell>john@example.com</LitTableCell>
              <LitTableCell>Admin</LitTableCell>
            </LitTableRow>
            <LitTableRow>
              <LitTableCell>Jane Smith</LitTableCell>
              <LitTableCell>jane@example.com</LitTableCell>
              <LitTableCell>User</LitTableCell>
            </LitTableRow>
          </LitTableBody>
        </LitTable>
      }
    />
  ),
};

export const WithSelectedRow: Story = {
  render: () => (
    <ParityComparison
      componentName="Table - With Selected Row"
      reactComponent={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>Project Alpha</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow data-state="selected">
              <TableCell>2</TableCell>
              <TableCell>Project Beta</TableCell>
              <TableCell>In Progress</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3</TableCell>
              <TableCell>Project Gamma</TableCell>
              <TableCell>Completed</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      }
      litComponent={
        <LitTable>
          <LitTableHeader>
            <LitTableRow>
              <LitTableHead>ID</LitTableHead>
              <LitTableHead>Name</LitTableHead>
              <LitTableHead>Status</LitTableHead>
            </LitTableRow>
          </LitTableHeader>
          <LitTableBody>
            <LitTableRow>
              <LitTableCell>1</LitTableCell>
              <LitTableCell>Project Alpha</LitTableCell>
              <LitTableCell>Active</LitTableCell>
            </LitTableRow>
            <LitTableRow selected>
              <LitTableCell>2</LitTableCell>
              <LitTableCell>Project Beta</LitTableCell>
              <LitTableCell>In Progress</LitTableCell>
            </LitTableRow>
            <LitTableRow>
              <LitTableCell>3</LitTableCell>
              <LitTableCell>Project Gamma</LitTableCell>
              <LitTableCell>Completed</LitTableCell>
            </LitTableRow>
          </LitTableBody>
        </LitTable>
      }
    />
  ),
};
