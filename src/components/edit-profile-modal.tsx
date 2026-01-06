
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateUserProfile } from "@/app/actions/update-user-profile";
import { Checkbox } from "./ui/checkbox";

interface EditProfileModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const availableKeys = ['Home', 'End', 'PageUp', 'PageDown', 'Insert', 'F-Keys (F1-F12)'];

export function EditProfileModal({ isOpen, onOpenChange }: EditProfileModalProps) {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [missingKeys, setMissingKeys] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setMissingKeys(userProfile.missingKeys || []);
        }
    }, [userProfile, isOpen]);

    const handleCheckboxChange = (key: string, checked: boolean) => {
        setMissingKeys(prev => 
            checked ? [...prev, key] : prev.filter(k => k !== key)
        );
    };

    const handleSave = async () => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        if (!name.trim()) {
            toast({ title: "Error", description: "Name cannot be empty.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({ uid: user.uid, name, missingKeys });
            toast({ title: "Success", description: "Your profile has been updated." });
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={userProfile?.email || ''}
                            className="col-span-3"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Missing Keys
                        </Label>
                        <div className="col-span-3 space-y-2">
                            {availableKeys.map(key => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`key-${key}`}
                                        checked={missingKeys.includes(key)}
                                        onCheckedChange={(checked) => handleCheckboxChange(key, !!checked)}
                                    />
                                    <Label htmlFor={`key-${key}`} className="font-normal">{key}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
