import { getCertificateBySubmissionId } from '@/lib/actions/certificates';
import { getCertificateConfig, getTierDisplayName } from '@/lib/certificates/certificate-config';
import { CheckCircle, XCircle, Award, Calendar, User, FileText, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

interface VerifyPageProps {
    params: {
        id: string;
    };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const { id } = params;
    const certificate = await getCertificateBySubmissionId(id);

    // If certificate not found or invalid
    if (!certificate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        Certificate Not Found
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        This certificate could not be verified. It may have been revoked, or the ID is invalid.
                    </p>
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                        Certificate ID: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{id}</code>
                    </div>
                </div>
            </div>
        );
    }

    const config = getCertificateConfig(certificate.category);
    const tierName = getTierDisplayName(certificate.tier);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Verified Badge */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-6 py-3 rounded-full">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                            Certificate Verified
                        </span>
                    </div>
                </div>

                {/* Certificate Details Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Header with Category Color */}
                    <div
                        className="h-32 relative flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.secondary} 100%)`
                        }}
                    >
                        <div className="text-center text-white">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Award className="w-8 h-8" />
                                <h1 className="text-3xl font-bold">{tierName}</h1>
                            </div>
                            <p className="text-sm uppercase tracking-wider opacity-90">
                                {certificate.category}
                            </p>
                        </div>
                    </div>

                    {/* Certificate Information */}
                    <div className="p-8">
                        {/* Certificate Number */}
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Shield className="w-5 h-5" />
                                <span className="font-medium">Certificate No:</span>
                            </div>
                            <code className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                                {certificate.certificateNo}
                            </code>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-6">
                            {/* Recipient */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Awarded to</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {certificate.recipient}
                                    </p>
                                </div>
                            </div>

                            {/* Achievement */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">For achievement in</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {certificate.title}
                                    </p>
                                </div>
                            </div>

                            {/* Date & Points */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Issued on</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {new Date(certificate.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Points</p>
                                    <div
                                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-bold text-lg"
                                        style={{ backgroundColor: config.colors.accent }}
                                    >
                                        {certificate.points}
                                    </div>
                                </div>
                            </div>

                            {/* Issuer */}
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-600 dark:text-slate-400">Issued by</p>
                                <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                                    {certificate.issuer}
                                </p>
                            </div>
                        </div>

                        {/* Authenticity Notice */}
                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                This certificate has been verified as authentic and was issued through the official platform.
                                <br />
                                <span className="text-xs">Verified on {new Date().toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-8">
                    <a
                        href="/"
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Return to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
