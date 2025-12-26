
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer, Award, Medal, Trophy } from 'lucide-react';
import Image from 'next/image';

const styles = {
  page: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    border: '10px solid #3F51B5', // Primary Color
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
    color: '#3F51B5', // Primary Color
    borderBottom: '2px solid #FFAB40', // Accent Color
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
  examsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: '30px',
  },
  examItem: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center' as 'center',
    color: '#059669',
  },
  examText: {
    marginTop: '8px',
    fontSize: '14px',
    fontWeight: 'bold' as 'bold',
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
  certificateId: {
    position: 'absolute' as 'absolute',
    bottom: '10px',
    left: '40px',
    fontSize: '10px',
    color: '#999999',
  }
};

function CertificateContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || 'Valued User';
    const date = searchParams.get('date') || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certificateId = searchParams.get('certId');

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
             <div className="print-controls mb-4 print:hidden flex items-center justify-center flex-col gap-4">
                <h2 className="text-lg font-semibold">Certificate Preview</h2>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print or Save as PDF
                </Button>
            </div>
            <div style={styles.page} id="certificate">
                <div style={styles.content}>
                     <Image
                      style={styles.logo}
                      src="/logo.svg"
                      alt="Excel Ninja Logo"
                      width={50}
                      height={50}
                    />
                    <h1 style={styles.headerText}>Certificate of Mastery</h1>
                    <p style={styles.subtitle}>This is to certify that</p>
                    <h2 style={styles.name}>{name}</h2>
                    <p style={styles.bodyText}>
                        has successfully passed all certification exams and demonstrated true mastery of essential Excel shortcuts and workflows.
                    </p>
                     <div style={styles.examsContainer}>
                        <div style={styles.examItem}>
                            <Award size={40} />
                            <span style={styles.examText}>Basic Exam</span>
                        </div>
                        <div style={styles.examItem}>
                            <Medal size={40} />
                            <span style={styles.examText}>Intermediate Exam</span>
                        </div>
                        <div style={styles.examItem}>
                            <Trophy size={40} />
                            <span style={styles.examText}>Advanced Exam</span>
                        </div>
                    </div>
                </div>
                 <Image
                    style={styles.seal}
                    src="/seal.svg"
                    alt="Official Seal"
                    width={80}
                    height={80}
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
                {certificateId && (
                  <div style={styles.certificateId}>
                    Verify at: excel-ninja.app/verify?id={certificateId} <br/>
                    Certificate ID: {certificateId}
                  </div>
                )}
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
