
import { adminDb } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, XCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { notFound } from 'next/navigation';

type VerificationStatus = 'valid' | 'invalid' | 'error';

interface VerificationResult {
    status: VerificationStatus;
    userName?: string;
    date?: string;
    message: string;
}

async function verifyCertificate(id: string): Promise<VerificationResult> {
    if (!id) {
        return { status: 'error', message: 'No certificate ID provided.' };
    }

    try {
        const parts = id.split('-');
        if (parts.length < 3 || parts[1] !== 'mastery') {
            return { status: 'invalid', message: 'This certificate ID is not in a valid format.' };
        }
        
        const userId = parts[0];
        const timestamp = parts[parts.length - 1];

        if (!userId || !timestamp) {
            return { status: 'invalid', message: 'This certificate ID is malformed.' };
        }

        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return { status: 'invalid', message: 'The user associated with this certificate could not be found.' };
        }

        const userData = userDoc.data() as UserProfile;
        
        if (userData.masteryCertificateId === id) {
            return {
                status: 'valid',
                userName: userData.name,
                date: new Date(parseInt(timestamp)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                message: 'This Certificate of Mastery is valid and has been successfully verified.',
            };
        } else {
            return { status: 'invalid', message: 'This certificate is not valid or could not be found in our records.' };
        }

    } catch (err) {
        console.error("Verification error:", err);
        return { status: 'error', message: 'An error occurred during verification. Please try again later.' };
    }
}


export default async function VerifyPage({ searchParams }: { searchParams: { id: string } }) {
    const { id } = searchParams;

    if (!id) {
        notFound();
    }

    const result = await verifyCertificate(id);

    const renderIcon = () => {
        switch (result.status) {
            case 'valid':
                return <BadgeCheck className="h-16 w-16 text-green-500" />;
            case 'invalid':
                return <XCircle className="h-16 w-16 text-destructive" />;
            case 'error':
            default:
                return <ShieldAlert className="h-16 w-16 text-yellow-500" />;
        }
    };
    
    const getCardBorder = () => {
         switch (result.status) {
            case 'valid':
                return "border-green-500";
            case 'invalid':
                return "border-destructive";
            case 'error':
                return "border-yellow-500";
            default:
              return "";
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center p-4 mt-16">
                 <Card className={`w-full max-w-lg text-center ${getCardBorder()}`}>
                    <CardHeader className="items-center">
                        {renderIcon()}
                        <CardTitle className="mt-4 text-3xl">
                            {result.status === 'valid' && 'Certificate Verified'}
                            {result.status === 'invalid' && 'Verification Failed'}
                            {result.status === 'error' && 'Verification Error'}
                        </CardTitle>
                        <CardDescription>{result.message}</CardDescription>
                    </CardHeader>
                    {result.status === 'valid' && (
                        <CardContent className="space-y-4">
                            <div className="text-left bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">This Certificate of Mastery was awarded to:</p>
                                <p className="text-xl font-bold text-primary">{result.userName}</p>
                            </div>
                             <div className="text-left bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">On:</p>
                                <p className="font-semibold text-lg">{result.date}</p>
                            </div>
                        </CardContent>
                    )}
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/dashboard">Return to Dashboard</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
