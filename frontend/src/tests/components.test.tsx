import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, ReportStatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { REPORT_STATUSES } from '@/constants/reports';

describe('Common Components', () => {
  it('renders Badge with default and custom variants', () => {
    render(<Badge variant="active">Active Status</Badge>);
    expect(screen.getByText('Active Status')).toBeInTheDocument();
  });

  it('renders ReportStatusBadge accurately', () => {
    render(<ReportStatusBadge status={REPORT_STATUSES.APPROVED} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders Button with variants and handles loading state', () => {
    render(<Button isLoading>Click Me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
