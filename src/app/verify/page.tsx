
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Loader2, XCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { AppHeader } from '@/components/app-header';

type VerificationStatus = 'verifying' | 'valid' | 'invalid' | 'error';

interface VerificationResult {
    status: VerificationStatus;
    userName?: string;
    examName?: string;
    date?: string;
    message: string;
}

function VerificationContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [result, setResult] = useState<VerificationResult>({ status: 'verifying', message: 'Verifying certificate...' });

    useEffect(() => {
        const verifyCertificate = async () => {
            if (!id) {
                setResult({ status: 'error', message: 'No certificate ID provided.' });
                return;
            }

            try {
                const parts = id.split('-');
                if (parts.length < 3) {
                     setResult({ status: 'invalid', message: 'This certificate ID is not in a valid format.' });
                     return;
                }
                
                const [userId, ...rest] = parts;
                const timestamp = rest.pop();
                const setId = rest.join('-');

                if (!userId || !setId || !timestamp) {
                    setResult({ status: 'invalid', message: 'This certificate ID is malformed.' });
                    return;
                }

                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    setResult({ status: 'invalid', message: 'The user associated with this certificate could not be found.' });
                    return;
                }

                const userData = userDoc.data() as UserProfile;
                const performanceRecord = userData.performance?.[setId];

                if (performanceRecord && performanceRecord.certificateId === id) {
                    const exam = ALL_CHALLENGE_SETS.find(e => e.id === setId);
                    setResult({
                        status: 'valid',
                        userName: userData.name,
                        examName: exam?.name,
                        date: new Date(parseInt(timestamp)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        message: 'This certificate is valid and has been successfully verified.',
                    });
                } else {
                    setResult({ status: 'invalid', message: 'This certificate is not valid or could not be found in our records.' });
                }

            } catch (err) {
                console.error("Verification error:", err);
                setResult({ status: 'error', message: 'An error occurred during verification. Please try again later.' });
            }
        };

        verifyCertificate();
    }, [id]);

    const renderIcon = () => {
        switch (result.status) {
            case 'verifying':
                return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
            case 'valid':
                return <BadgeCheck className="h-16 w-16 text-green-500" />;
            case 'invalid':
                return <XCircle className="h-16 w-16 text-destructive" />;
            case 'error':
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
                            {result.status === 'verifying' && 'Verifying...'}
                        </CardTitle>
                        <CardDescription>{result.message}</CardDescription>
                    </CardHeader>
                    {result.status === 'valid' && (
                        <CardContent className="space-y-4">
                            <div className="text-left bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">This certificate was awarded to:</p>
                                <p className="text-xl font-bold text-primary">{result.userName}</p>
                            </div>
                             <div className="text-left bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">For successfully completing the:</p>
                                <p className="font-semibold text-lg">{result.examName}</p>
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


export default function VerifyPage() {
    return (
        <Suspense>
            <VerificationContent />
        </Suspense>
    )
}
