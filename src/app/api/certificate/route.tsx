
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { CertificateTemplate } from '@/components/certificate-template';

import { z } from 'zod';

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
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { name, examName, date } = validation.data;

    // By being a .tsx file, this route can now correctly handle JSX
    const pdfBuffer = await renderToBuffer(
      <CertificateTemplate
        name={name}
        examName={examName}
        date={date}
      />
    );

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="excel_ninja_certificate.pdf"',
      },
    });

  } catch (error) {
    console.error('Failed to generate PDF:', error);

    return NextResponse.json(
      { error: 'Failed to generate PDF certificate.' },
      { status: 500 }
    );
  }
}
