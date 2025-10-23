import React, { useEffect, useState } from 'react';
import { Card, Text, Flex, Spinner } from '@sanity/ui';
import { useClient } from 'sanity';
import {
  TOTAL_REVENUE_QUERY,
  TOTAL_PRODUCT_COUNT_QUERY,
  TOTAL_BLOG_COUNT_QUERY,
} from '../queries/query';

interface StatWidgetProps {
  title: string;
  query: string;
  formatter?: (value: any) => string;
}

const StatWidget: React.FC<StatWidgetProps> = ({ title, query, formatter }) => {
  const client = useClient({ apiVersion: '2023-08-01' });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await client.fetch(query);
        setData(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query, client]);

  if (loading) {
    return (
      <Card padding={4} shadow={1} radius={2} tone="primary">
        <Flex justify="center" align="center" direction="column" gap={2}>
          <Spinner />
          <Text size={1}>Loading {title}...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding={4} shadow={1} radius={2} tone="critical">
        <Text size={1}>Error loading {title}: {error.message}</Text>
      </Card>
    );
  }

  const displayValue = formatter ? formatter(data) : data;

  return (
    <Card padding={4} shadow={1} radius={2} tone="positive">
      <Text size={2} weight="semibold">
        {title}
      </Text>
      <Text size={4} weight="bold">
        {displayValue}
      </Text>
    </Card>
  );
};

export const TotalRevenueWidget: React.FC = () => (
  <StatWidget
    title="Total Revenue"
    query={TOTAL_REVENUE_QUERY.query}
    formatter={(value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`}
  />
);

export const TotalProductCountWidget: React.FC = () => (
  <StatWidget
    title="Total Products"
    query={TOTAL_PRODUCT_COUNT_QUERY.query}
  />
);

export const TotalBlogCountWidget: React.FC = () => (
  <StatWidget
    title="Total Blog Posts"
    query={TOTAL_BLOG_COUNT_QUERY.query}
  />
);
