import Container from '@/components/Container';
import { Title } from '@/components/text';
import React from 'react'

const SigleBlogpPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return (
    <div>
      <Container>
          <Title>Single Blog Page</Title>
          <p>{slug}</p>
      </Container>
    </div>
  )
}

export default SigleBlogpPage
