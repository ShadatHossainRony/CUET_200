import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function DonationStatus() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [transactionDetails, setTransactionDetails] = useState<any>(null);

    const transactionId = searchParams.get("transactionId");
    const campaignId = searchParams.get("campaignId");

    useEffect(() => {
        if (!transactionId) {
            setStatus("failed");
            return;
        }

        // Poll for transaction status
        const checkStatus = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8004/payment/status/${transactionId}`
                );
                const data = await response.json();

                if (data.success && data.transaction) {
                    setTransactionDetails(data.transaction);
                    if (data.transaction.status === "completed") {
                        setStatus("success");
                    } else if (data.transaction.status === "failed") {
                        setStatus("failed");
                    } else {
                        // Still pending, check again
                        setTimeout(checkStatus, 2000);
                    }
                }
            } catch (error) {
                console.error("Error checking status:", error);
                setStatus("failed");
            }
        };

        checkStatus();
    }, [transactionId]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-2xl">
                    {status === "loading" && (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
                                <h2 className="text-2xl font-bold mb-3">Processing Your Donation</h2>
                                <p className="text-muted-foreground">
                                    Please wait while we confirm your payment...
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {status === "success" && (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold mb-3">Thank You for Your Donation!</h2>
                                <p className="text-muted-foreground mb-6">
                                    Your generous contribution has been successfully processed.
                                </p>

                                {transactionDetails && (
                                    <div className="bg-muted rounded-lg p-6 mb-6 text-left">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Transaction ID</p>
                                                <p className="font-mono text-sm">{transactionDetails.transactionId}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Amount</p>
                                                <p className="font-bold text-lg">
                                                    ${transactionDetails.amount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 justify-center">
                                    {campaignId && (
                                        <Button asChild variant="default">
                                            <Link to={`/campaigns/${campaignId}`}>Back to Campaign</Link>
                                        </Button>
                                    )}
                                    <Button asChild variant="outline">
                                        <Link to="/campaigns">Browse More Campaigns</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {status === "failed" && (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
                                <h2 className="text-2xl font-bold mb-3">Donation Failed</h2>
                                <p className="text-muted-foreground mb-6">
                                    We couldn't process your donation. Please try again or contact support.
                                </p>

                                {transactionDetails?.failureReason && (
                                    <div className="bg-destructive/10 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-destructive">
                                            Reason: {transactionDetails.failureReason}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 justify-center">
                                    {campaignId && (
                                        <Button asChild variant="default">
                                            <Link to={`/campaigns/${campaignId}`}>Try Again</Link>
                                        </Button>
                                    )}
                                    <Button asChild variant="outline">
                                        <Link to="/campaigns">Browse Campaigns</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
