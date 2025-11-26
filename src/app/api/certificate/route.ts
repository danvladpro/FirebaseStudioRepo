
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { CertificateTemplate } from '@/components/certificate-template';
import { z } from 'zod';
import React from 'react';

const CertificateRequestSchema = z.object({
  name: z.string(),
  examName: z.string(),
  date: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CertificateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, examName, date } = validation.data;

    // Use React.createElement to avoid JSX parsing issues in a .ts file
    const pdfStream = await renderToStream(
      React.createElement(CertificateTemplate, { name, examName, date })
    );

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="excel_ninja_certificate.pdf"`);
    
    // Type assertion to bridge ReadableStream and ReadableStream<any>
    const stream: ReadableStream<any> = pdfStream as any;

    return new Response(stream, { headers });

  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF certificate.' }, { status: 500 });
  }
}
