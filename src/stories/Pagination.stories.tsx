import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import {
  LitPagination,
  LitPaginationContent,
  LitPaginationEllipsis,
  LitPaginationItem,
  LitPaginationLink,
  LitPaginationNext,
  LitPaginationPrevious,
} from '../components-lit/wrappers/Pagination';

const meta: Meta = {
  title: 'Components/Pagination',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Pagination"
      reactComponent={
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      }
      litComponent={
        <LitPagination>
          <LitPaginationContent>
            <LitPaginationItem>
              <LitPaginationPrevious href="#" />
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">1</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#" active>
                2
              </LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">3</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationNext href="#" />
            </LitPaginationItem>
          </LitPaginationContent>
        </LitPagination>
      }
    />
  ),
};

export const WithEllipsis: Story = {
  render: () => (
    <ParityComparison
      componentName="Pagination - With Ellipsis"
      reactComponent={
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                5
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      }
      litComponent={
        <LitPagination>
          <LitPaginationContent>
            <LitPaginationItem>
              <LitPaginationPrevious href="#" />
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">1</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationEllipsis />
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#" active>
                5
              </LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationEllipsis />
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">10</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationNext href="#" />
            </LitPaginationItem>
          </LitPaginationContent>
        </LitPagination>
      }
    />
  ),
};

export const FirstPage: Story = {
  render: () => (
    <ParityComparison
      componentName="Pagination - First Page"
      reactComponent={
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      }
      litComponent={
        <LitPagination>
          <LitPaginationContent>
            <LitPaginationItem>
              <LitPaginationPrevious href="#" />
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#" active>
                1
              </LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">2</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">3</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationNext href="#" />
            </LitPaginationItem>
          </LitPaginationContent>
        </LitPagination>
      }
    />
  ),
};

export const LastPage: Story = {
  render: () => (
    <ParityComparison
      componentName="Pagination - Last Page"
      reactComponent={
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">8</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">9</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                10
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      }
      litComponent={
        <LitPagination>
          <LitPaginationContent>
            <LitPaginationItem>
              <LitPaginationPrevious href="#" />
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">8</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#">9</LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationLink href="#" active>
                10
              </LitPaginationLink>
            </LitPaginationItem>
            <LitPaginationItem>
              <LitPaginationNext href="#" />
            </LitPaginationItem>
          </LitPaginationContent>
        </LitPagination>
      }
    />
  ),
};
