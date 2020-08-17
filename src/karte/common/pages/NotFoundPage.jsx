import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';

export default function NotFoundPage() {
  return (
    <Page>
      <Navbar title="Not found" backLink="Back"/>
      <Block strong>
        <p>Sorry</p>
        <p>Requested content not found.</p>
      </Block>
    </Page>
  );
}