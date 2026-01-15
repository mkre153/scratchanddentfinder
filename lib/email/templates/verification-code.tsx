/**
 * Verification Code Email Template
 *
 * Sent when a user submits a store and needs to verify their email.
 * Contains a 6-digit code that expires in 10 minutes.
 */

import * as React from 'react'

interface VerificationCodeEmailProps {
  code: string
  businessName: string
}

export function VerificationCodeEmail({ code, businessName }: VerificationCodeEmailProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Scratch & Dent Finder</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>Verify your email</h2>

        <p style={styles.text}>
          You&apos;re submitting <strong>{businessName}</strong> to our directory.
          Enter this code to complete your submission:
        </p>

        <div style={styles.codeContainer}>
          <span style={styles.code}>{code}</span>
        </div>

        <p style={styles.expiry}>
          This code expires in 10 minutes.
        </p>

        <p style={styles.textSmall}>
          If you didn&apos;t request this, you can safely ignore this email.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Scratch & Dent Finder - Find discount appliance stores near you
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1d4ed8',
    padding: '24px',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    margin: 0,
  },
  content: {
    padding: '32px 24px',
    textAlign: 'center' as const,
  },
  heading: {
    color: '#111827',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: '16px',
  },
  text: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '24px',
  },
  codeContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '16px',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: '36px',
    fontWeight: 'bold' as const,
    letterSpacing: '8px',
    color: '#1d4ed8',
  },
  expiry: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '24px',
  },
  textSmall: {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '20px',
  },
  footer: {
    backgroundColor: '#f3f4f6',
    padding: '24px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#6b7280',
    fontSize: '12px',
    margin: 0,
  },
} as const
