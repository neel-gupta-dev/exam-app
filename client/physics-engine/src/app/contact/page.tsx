import React from 'react';
import { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Get in touch with the VAYL Physics Lab team for support, feedback, or collaboration.",
};

export default function ContactPage() {
  return <ContactContent />;
}
