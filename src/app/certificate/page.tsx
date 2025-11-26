
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

// Define styles for the certificate component
const styles = {
  page: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    border: '10px solid #4A90E2',
    width: '29.7cm',
    height: '21cm',
    display: 'flex',
    flexDirection: 'column' as 'column',
    color: '#333',
    boxSizing: 'border-box' as 'border-box',
    position: 'relative' as 'relative',
  },
  content: {
    margin: 'auto',
    textAlign: 'center' as 'center',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '50px',
    height: '50px',
    marginBottom: '20px',
  },
  headerText: {
    fontSize: '32px',
    fontWeight: 'bold' as 'bold',
    color: '#333333',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '20px',
    color: '#555555',
    marginBottom: '20px',
  },
  name: {
    fontSize: '48px',
    fontWeight: 'bold' as 'bold',
    color: '#4A90E2',
    borderBottom: '2px solid #F5A623',
    paddingBottom: '8px',
    marginBottom: '30px',
  },
  bodyText: {
    fontSize: '16px',
    color: '#333333',
    width: '80%',
    lineHeight: 1.6,
    marginBottom: '40px',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: '20px'
  },
  signatureContainer: {
    alignItems: 'center' as 'center',
  },
  signatureLine: {
    width: '200px',
    height: '2px',
    backgroundColor: '#333333',
    marginTop: '4px',
    marginBottom: '4px',
  },
  signatureTitle: {
    fontSize: '12px',
    color: '#555555',
  },
  dateContainer: {
     alignItems: 'center' as 'center',
  },
  dateText: {
      fontSize: '14px',
      fontWeight: 'bold' as 'bold',
  },
   seal: {
    width: '80px',
    height: '80px',
    position: 'absolute' as 'absolute',
    right: '60px',
    bottom: '60px',
  },
};

function CertificateContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || 'Valued User';
    const examName = searchParams.get('examName') || 'Excel Skills';
    const date = searchParams.get('date') || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
             <div className="print-controls mb-4 print:hidden flex items-center justify-center flex-col gap-4">
                <h2 className="text-lg font-semibold">Certificate Preview</h2>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print or Save as PDF
                </Button>
            </div>
            <div style={styles.page}>
                <div style={styles.content}>
                     <img
                      style={styles.logo}
                      src="https://firebasestorage.googleapis.com/v0/b/ai-app-builder-001.appspot.com/o/public%2Ficon.png?alt=media"
                      alt="Excel Ninja Logo"
                    />
                    <h1 style={styles.headerText}>Certificate of Achievement</h1>
                    <p style={styles.subtitle}>This is to certify that</p>
                    <h2 style={styles.name}>{name}</h2>
                    <p style={styles.bodyText}>
                        has successfully completed and demonstrated proficiency in the {examName}.
                        This certification recognizes their mastery of essential Excel shortcuts and workflows.
                    </p>
                </div>
                 <img
                    style={styles.seal}
                    src="https://firebasestorage.googleapis.com/v0/b/ai-app-builder-001.appspot.com/o/public%2Fseal.png?alt=media"
                    alt="Official Seal"
                />
                <div style={styles.footer}>
                    <div style={styles.signatureContainer}>
                        <div style={styles.signatureLine} />
                        <p style={styles.signatureTitle}>The Excel Ninja Team</p>
                    </div>
                    <div style={styles.dateContainer}>
                         <p style={styles.dateText}>{date}</p>
                         <div style={styles.signatureLine} />
                        <p style={styles.signatureTitle}>Date of Completion</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CertificatePage() {
    return (
        <Suspense>
            <CertificateContent />
        </Suspense>
    )
}
